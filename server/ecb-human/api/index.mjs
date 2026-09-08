import { randomBytes, timingSafeEqual } from 'node:crypto';
import pg from 'pg';

// SimpleWebAuthn documents this flag for Vercel/ncc environments using cbor-x.
process.env.CBOR_NATIVE_ACCELERATION_DISABLED ??= 'true';

const {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} = await import('@simplewebauthn/server');
const { decodeCredentialPublicKey } = await import('@simplewebauthn/server/helpers');

const RP_ID = 'ecos.effortlessconnection.com';
const ORIGIN = 'https://ecos.effortlessconnection.com';
const RP_NAME = 'ECOS Governance';
const SESSION_IDLE_SECONDS = 86_400;
const SESSION_ABSOLUTE_SECONDS = 604_800;

const DATABASE_URL = process.env.ECB_DATABASE_URL;
if (!DATABASE_URL) throw new Error('ECB_DATABASE_URL is required');
const parsedDatabaseUrl = new URL(DATABASE_URL);
const dbRole = decodeURIComponent(parsedDatabaseUrl.username).split('.')[0];
if (dbRole !== 'ecb_governance_verifier') {
  throw new Error('ECB_DATABASE_URL must authenticate only as ecb_governance_verifier');
}
if (process.env.ECB_RP_ID && process.env.ECB_RP_ID !== RP_ID) {
  throw new Error('ECB_RP_ID does not match the accepted BUILD 6 RP ID');
}
if (process.env.ECB_ORIGIN && process.env.ECB_ORIGIN !== ORIGIN) {
  throw new Error('ECB_ORIGIN does not match the accepted BUILD 6 origin');
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 4,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  application_name: 'ecb-human-build6',
});

const CALLS = Object.freeze({
  registrationContext:
    'select ecb_governance.registration_context($1::uuid,$2::text) as result',
  beginRegistration:
    'select ecb_governance.begin_registration($1::uuid,$2::text,$3::text,$4::text,$5::timestamptz,$6::uuid) as result',
  completeRegistration:
    'select ecb_governance.complete_registration($1::uuid,$2::text,$3::text,$4::text,$5::bytea,$6::integer,$7::bigint,$8::text[],$9::text,$10::boolean,$11::boolean,$12::text,$13::boolean,$14::boolean,$15::uuid) as result',
  consumeFailure:
    'select ecb_governance.consume_ceremony_failure($1::uuid,$2::text,$3::text,$4::text) as result',
  bindInitial:
    'select ecb_governance.bind_initial_instance($1::uuid,$2::text,$3::uuid[],$4::text,$5::uuid,$6::uuid,$7::uuid) as result',
  authContext:
    'select ecb_governance.authentication_context($1::uuid) as result',
  beginAuthentication:
    'select ecb_governance.begin_authentication($1::uuid,$2::text,$3::text,$4::timestamptz,$5::uuid) as result',
  authCredential:
    'select ecb_governance.authentication_credential($1::uuid,$2::text) as result',
  completeAuthentication:
    'select ecb_governance.complete_authentication($1::uuid,$2::text,$3::text,$4::text,$5::bytea,$6::bigint,$7::text,$8::boolean,$9::boolean,$10::text,$11::boolean,$12::boolean,$13::text,$14::text,$15::integer,$16::integer,$17::uuid) as result',
  humanScope:
    'select ecb_governance.human_scope($1::text,$2::uuid) as result',
  retainPolicy:
    'select ecb_governance.retain_candidate_policy($1::text,$2::text,$3::uuid) as result',
  decision:
    'select ecb_governance.record_human_decision($1::text,$2::text,$3::text,$4::uuid,$5::text,$6::uuid,$7::uuid,$8::uuid,$9::text,$10::uuid) as result',
  withdraw:
    'select ecb_governance.withdraw_human_decision($1::text,$2::text,$3::text,$4::uuid,$5::uuid,$6::uuid,$7::uuid) as result',
  logout:
    'select ecb_governance.logout_session($1::text,$2::text,$3::text) as result',
  recover:
    'select ecb_governance.recover_request($1::uuid,$2::uuid) as result',
});

async function dbCall(sql, values) {
  const result = await pool.query(sql, values);
  return result.rows[0]?.result;
}

function b64url(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseCookies(req) {
  const cookies = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try { cookies[key] = decodeURIComponent(value); } catch { cookies[key] = value; }
  }
  return cookies;
}

function appendCookie(res, value) {
  const current = res.getHeader('Set-Cookie');
  if (!current) res.setHeader('Set-Cookie', [value]);
  else res.setHeader('Set-Cookie', [...(Array.isArray(current) ? current : [current]), value]);
}

function cookie(name, value, { httpOnly = true, maxAge } = {}) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'Secure',
    'SameSite=Lax',
  ];
  if (httpOnly) attrs.push('HttpOnly');
  if (maxAge !== undefined) attrs.push(`Max-Age=${maxAge}`);
  return attrs.join('; ');
}

function clearCookie(res, name, httpOnly = true) {
  appendCookie(res, cookie(name, '', { httpOnly, maxAge: 0 }));
}

function encodeState(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeState(value) {
  if (!value) throw publicError('missing_browser_state', 401);
  try { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')); }
  catch { throw publicError('invalid_browser_state', 401); }
}

function publicError(code, status = 400) {
  const error = new Error(code);
  error.publicCode = code;
  error.status = status;
  return error;
}

function requireOrigin(req) {
  if (req.headers.origin !== ORIGIN) throw publicError('origin_rejected', 403);
}

function constantEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function sessionMaterial(req, { requireCsrf = false } = {}) {
  const cookies = parseCookies(req);
  const session = cookies['__Host-ecb-session'];
  if (!session) throw publicError('session_required', 401);
  let csrf;
  if (requireCsrf) {
    csrf = cookies['__Host-ecb-csrf'];
    const header = req.headers['x-ecb-csrf'];
    if (!csrf || !constantEqual(csrf, Array.isArray(header) ? header[0] : header)) {
      throw publicError('csrf_rejected', 403);
    }
  }
  return { session, csrf };
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { throw publicError('invalid_json'); }
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 1_000_000) throw publicError('request_too_large', 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw publicError('invalid_json'); }
}

function routeFrom(req) {
  const url = new URL(req.url, ORIGIN);
  return `/${url.searchParams.get('route') || ''}`.replace(/\/+$/, '') || '/';
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.end(JSON.stringify(body));
}

function parseClientData(response, expectedType) {
  const encoded = response?.response?.clientDataJSON;
  if (typeof encoded !== 'string') throw publicError('webauthn_response_invalid');
  let clientData;
  try { clientData = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')); }
  catch { throw publicError('webauthn_response_invalid'); }
  if (clientData.type !== expectedType) throw publicError('webauthn_type_rejected');
  if (clientData.crossOrigin === true || clientData.topOrigin !== undefined) {
    throw publicError('webauthn_cross_origin_rejected', 403);
  }
  return clientData;
}

function setupCookies(req) {
  const cookies = parseCookies(req);
  const setupId = cookies['__Host-ecb-setup-id'];
  const token = cookies['__Host-ecb-setup'];
  if (!isUuid(setupId) || !token) throw publicError('setup_capability_required', 401);
  return { setupId, token };
}

function preauth(req, purpose) {
  const state = decodeState(parseCookies(req)['__Host-ecb-preauth']);
  if (!isUuid(state.id) || typeof state.secret !== 'string' || state.purpose !== purpose) {
    throw publicError('invalid_browser_state', 401);
  }
  return state;
}

async function consumeFailure(state, code, response) {
  try {
    await dbCall(CALLS.consumeFailure, [state.id, state.secret, code, response ? JSON.stringify(response) : '']);
  } catch { /* preserve the original public failure */ }
}

async function handleSetupOpen(req, res) {
  requireOrigin(req);
  const body = await readJson(req);
  if (!isUuid(body.setupId) || typeof body.token !== 'string' || !body.token) {
    throw publicError('setup_input_invalid');
  }
  const context = await dbCall(CALLS.registrationContext, [body.setupId, body.token]);
  appendCookie(res, cookie('__Host-ecb-setup-id', setupId, { maxAge: 600 }));
  appendCookie(res, cookie('__Host-ecb-setup', token, { maxAge: 600 }));
  json(res, 200, { setup_id: setupId, scope_id: context.scope_id, rp_id: context.rp_id });
}

async function handleSetupStatus(req, res) {
  const { setupId, token } = setupCookies(req);
  const context = await dbCall(CALLS.registrationContext, [setupId, token]);
  json(res, 200, context);
}

async function handleRegistrationOptions(req, res) {
  requireOrigin(req);
  const { setupId, token } = setupCookies(req);
  const context = await dbCall(CALLS.registrationContext, [setupId, token]);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: 'Levi',
    userDisplayName: 'Levi',
    userID: new Uint8Array(Buffer.from(context.user_handle_hex, 'hex')),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
    supportedAlgorithmIDs: [-7, -257, -7, #€€€t°(€ô¤ì(€½¹ÍĞÁÉ•…ÕÑ¡M•É•Ğ€ôˆØÑÕÉ° ÌÈ¤ì(€½¹ÍĞ•É•µ½¹å%€ôÉåÁÑ¼¹É…¹‘½µUU% ¤ì(€½¹ÍĞ•áÁ¥É•ÍĞ€ô¹•Ü…Ñ”¡…Ñ”¹¹½Ü ¤€¬€Ô€¨€ØÁ|ÀÀÀ¤¹Ñ½%M=MÑÉ¥¹œ ¤ì(€…İ…¥Ğ‘‰…±°¡11L¹‰•¥¹I•¥ÍÑÉ…Ñ¥½¸°l(€€€Í•ÑÕÁ%°Ñ½­•¸°½ÁÑ¥½¹Ì¹¡…±±•¹”°ÁÉ•…ÕÑ¡M•É•Ğ°•áÁ¥É•ÍĞ°•É•µ½¹å%°(€t¤ì(€…ÁÁ•¹‘½½­¥”¡É•Ì°½½­¥” }}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ°•¹½‘•MÑ…Ñ”¡ì(€€€¥è•É•µ½¹å%°(€€€Í•É•ĞèÁÉ•…ÕÑ¡M•É•Ğ°(€€€¡…±±•¹”è½ÁÑ¥½¹Ì¹¡…±±•¹”°(€€€ÁÕÉÁ½Í”è€É•¥ÍÑÉ…Ñ¥½¸œ°(€€€Í½Á•%è½¹Ñ•áĞ¹Í½Á•}¥°(€ô¤°ìµ…á”è€ÌÀÀô¤¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°ìÁÕ‰±¥-•äè½ÁÑ¥½¹Ìô¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•I•¥ÍÑÉ…Ñ¥½¹Y•É¥™ä¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞÍÑ…Ñ”€ôÁÉ•…ÕÑ ¡É•Ä°€É•¥ÍÑÉ…Ñ¥½¸œ¤ì(€½¹ÍĞìÍ•ÑÕÁ%°Ñ½­•¸ô€ôÍ•ÑÕÁ½½­¥•Ì¡É•Ä¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€½¹ÍĞÉ•ÍÁ½¹Í”€ô‰½‘ä¹É•ÍÁ½¹Í”ì(€ÑÉäì(€€€Á…ÉÍ•±¥•¹Ñ…Ñ„¡É•ÍÁ½¹Í”°€İ•‰…ÕÑ¡¸¹É•…Ñ”œ¤ì(€€€½¹ÍĞ½¹Ñ•áĞ€ô…İ…¥Ğ‘‰…±°¡11L¹É•¥ÍÑÉ…Ñ¥½¹½¹Ñ•áĞ°mÍ•ÑÕÁ%°Ñ½­•¹t¤ì(€€€½¹ÍĞÙ•É¥™¥…Ñ¥½¸€ô…İ…¥ĞÙ•É¥™åI•¥ÍÑÉ…Ñ¥½¹I•ÍÁ½¹Í”¡ì(€€€€€É•ÍÁ½¹Í”°(€€€€€•áÁ•Ñ•‘¡…±±•¹”èÍÑ…Ñ”¹¡…±±•¹”°(€€€€€•áÁ•Ñ•‘=É¥¥¸è=I%%8°(€€€€€•áÁ•Ñ•‘IA%èIA}%°(€€€€€É•ÅÕ¥É•UÍ•ÉY•É¥™¥…Ñ¥½¸èÑÉÕ”°(€€€ô¤ì(€€€¥˜€ …Ù•É¥™¥…Ñ¥½¸¹Ù•É¥™¥•ñğ€…Ù•É¥™¥…Ñ¥½¸¹É•¥ÍÑÉ…Ñ¥½¹%¹™¼¤ì(€€€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È İ•‰…ÕÑ¡¹}¹½Ñ}Ù•É¥™¥•œ°€ĞÀÌ¤ì(€€€ô(€€€½¹ÍĞ¥¹™¼€ôÙ•É¥™¥…Ñ¥½¸¹É•¥ÍÑÉ…Ñ¥½¹%¹™¼ì(€€€½¹ÍĞÉ•‘•¹Ñ¥…±%€ô¥¹™¼¹É•‘•¹Ñ¥…°¹¥ì(€€€½¹ÍĞÁÕ‰±¥-•ä€ô	Õ™™•È¹™É½´¡¥¹™¼¹É•‘•¹Ñ¥…°¹ÁÕ‰±¥-•ä¤ì(€€€½¹ÍĞ…±½É¥Ñ¡´€ô‘•½‘•É•‘•¹Ñ¥…±AÕ‰±¥-•ä¡¥¹™¼¹É•‘•¹Ñ¥…°¹ÁÕ‰±¥-•ä¤¹…±œì(€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹½µÁ±•Ñ•I•¥ÍÑÉ…Ñ¥½¸°l(€€€€€ÍÑ…Ñ”¹¥°ÍÑ…Ñ”¹Í•É•Ğ°)M=8¹ÍÑÉ¥¹¥™ä¡É•ÍÁ½¹Í”¤°É•‘•¹Ñ¥…±%°ÁÕ‰±¥-•ä°…±½É¥Ñ¡´°(€€€€€¥¹™¼¹É•‘•¹Ñ¥…°¹½Õ¹Ñ•È°¥¹™¼¹É•‘•¹Ñ¥…°¹É•‘•¹Ñ¥…±•Ù¥•QåÁ”€ümt€èmt°(€€€€€¥¹™¼¹É•‘•¹Ñ¥…±•Ù¥•QåÁ”°¥¹™¼¹É•‘•¹Ñ¥…±	…­•‘UÀ°ÑÉÕ”°=I%%8°(€€€€€™…±Í”°ÑÉÕ”°ÉåÁÑ¼¹É…¹‘½µUU% ¤°(€€€t¤ì(€€€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ¤ì(€€€©Í½¸¡É•Ì°€ÈÀÀ°É•ÍÕ±Ğ¤ì(€ô…Ñ €¡•ÉÉ½È¤ì(€€€…İ…¥Ğ½¹ÍÕµ•…¥±ÕÉ”¡ÍÑ…Ñ”°•ÉÉ½È¹ÁÕ‰±¥½‘”ñğ€Ù•É¥™¥…Ñ¥½¹}™…¥±•œ°É•ÍÁ½¹Í”¤ì(€€€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ¤ì(€€€Ñ¡É½Ü•ÉÉ½È¹ÁÕ‰±¥½‘”€ü•ÉÉ½È€èÁÕ‰±¥ÉÉ½È İ•‰…ÕÑ¡¹}Ù•É¥™¥…Ñ¥½¹}™…¥±•œ°€ĞÀÌ¤ì(€ô)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•M•ÑÕÁ	¥¹¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞìÍ•ÑÕÁ%°Ñ½­•¸ô€ôÍ•ÑÕÁ½½­¥•Ì¡É•Ä¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€½¹ÍĞÉ•‘•¹Ñ¥…±%‘Ì€ôÉÉ…ä¹¥ÍÉÉ…ä¡‰½‘ä¹É•‘•¹Ñ¥…±%‘Ì¤€ü‰½‘ä¹É•‘•¹Ñ¥…±%‘Ì€èmtì(€¥˜€ …É•‘•¹Ñ¥…±%‘Ì¹±•¹Ñ ñğ€…É•‘•¹Ñ¥…±%‘Ì¹•Ù•Éä¡¥ÍUÕ¥¤ñğ€…¥ÍUÕ¥¡‰½‘ä¹É•ÅÕ•ÍÑ%¤¤ì(€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È ‰¥¹‘¥¹}¥¹ÁÕÑ}¥¹Ù…±¥œ¤ì(€ô(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹‰¥¹‘%¹¥Ñ¥…°°l(€€€Í•ÑÕÁ%°Ñ½­•¸°É•‘•¹Ñ¥…±%‘Ì°€¡Õµ…¹}Í•ÑÕÁ}½µÁ±•Ñ¥½¸œ°‰½‘ä¹É•ÅÕ•ÍÑ%°(€€€ÉåÁÑ¼¹É…¹‘½µUU% ¤°ÉåÁÑ¼¹É…¹‘½µUU% ¤°(€t¤ì(€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÍ•ÑÕÀµ¥œ¤ì(€±•…É½½¥”¡É•Ì°€}}!½ÍĞµ•ˆµÍ•ÑÕÀœ¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°É•ÍÕ±Ğ¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•ÕÑ¡=ÁÑ¥½¹Ì¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€¥˜€ …¥ÍUÕ¥¡‰½‘ä¹Í½Á•%¤¤Ñ¡É½ÜÁÕ‰±¥ÉÉ½È Í½Á•}¥¹Ù…±¥œ¤ì(€½¹ÍĞ½¹Ñ•áĞ€ô…İ…¥Ğ‘‰…±°¡11L¹…ÕÑ¡½¹Ñ•áĞ°m‰½‘ä¹Í½Á•%‘t¤ì(€½¹ÍĞ½ÁÑ¥½¹Ì€ô…İ…¥Ğ•¹•É…Ñ•ÕÑ¡•¹Ñ¥…Ñ¥½¹=ÁÑ¥½¹Ì¡ì(€€€ÉÁ%èIA}%°(€€€ÕÍ•ÉY•É¥™¥…Ñ¥½¸è€É•ÅÕ¥É•œ°(€€€…±±½İÉ•‘•¹Ñ¥…±Ìè½¹Ñ•áĞ¹É•‘•¹Ñ¥…±Ì¹µ…À ¡É•‘•¹Ñ¥…°¤€ôø€¡ì(€€€€€¥èÉ•‘•¹Ñ¥…°¹É•‘•¹Ñ¥…±}¥°(€€€€€ÑÉ…¹ÍÁ½ÉÑÌèÉ•‘•¹Ñ¥…°¹ÑÉ…¹ÍÁ½ÉÑÌñğmt°(€€€ô¤¤°(€ô¤ì(€½¹ÍĞÁÉ•…ÕÑ¡M•É•Ğ€ôˆØÑÕÉ° ÌÈ¤ì(€½¹ÍĞ•É•µ½¹å%€ôÉåÁÑ¼¹É…¹‘½µUU% ¤ì(€½¹ÍĞ•áÁ¥É•ÍĞ€ô¹•Ü…Ñ”¡…Ñ”¹¹½Ü ¤€¬€Ô€¨€ØÁ|ÀÀÀ¤¹Ñ½%M=MÑÉ¥¹œ ¤ì(€…İ…¥Ğ‘‰…±°¡11L¹‰•¥¹ÕÑ¡•¹Ñ¥…Ñ¥½¸°l(€€€‰½‘ä¹Í½Á•%°½ÁÑ¥½¹Ì¹¡…±±•¹”°ÁÉ•…ÕÑ¡M•É•Ğ°•áÁ¥É•ÍĞ°•É•µ½¹å%°(€t¤ì(€…ÁÁ•¹‘½½­¥”¡É•Ì°½½­¥” }}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ°•¹½‘•MÑ…Ñ”¡ì(€€€¥è•É•µ½¹å%°(€€€Í•É•ĞèÁÉ•…ÕÑ¡M•É•Ğ°(€€€¡…±±•¹”è½ÁÑ¥½¹Ì¹¡…±±•¹”°(€€€ÁÕÉÁ½Í”è€…ÕÑ¡•¹Ñ¥…Ñ¥½¸œ°(€€€Í½Á•%è‰½‘ä¹Í½Á•%°(€ô¤°ìµ…á”è€ÌÀÀô¤¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°ìÁÕ‰±¥-•äè½ÁÑ¥½¹Ìô¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•ÕÑ¡Y•É¥™ä¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞÍÑ…Ñ”€ôÁÉ•…ÕÑ ¡É•Ä°€…ÕÑ¡•¹Ñ¥…Ñ¥½¸œ¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€¥˜€ …¥ÍUÕ¥¡‰½‘ä¹Í½Á•%¤ñğ‰½‘ä¹Í½Á•%€„ôôÍÑ…Ñ”¹Í½Á•%¤ì(€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È ‰É½İÍ•É}ÍÑ…Ñ•}Í½Á•}µ¥Íµ…Ñ œ°€ĞÀÌ¤ì(€ô(€½¹ÍĞÉ•ÍÁ½¹Í”€ô‰½‘ä¹É•ÍÁ½¹Í”ì(€ÑÉäì(€€€Á…ÉÍ•±¥•¹Ñ…Ñ„¡É•ÍÁ½¹Í”°€İ•‰…ÕÑ¡¸¹•Ğœ¤ì(€€€¥˜€¡ÑåÁ•½˜É•ÍÁ½¹Í”ü¹¥€„ôô€ÍÑÉ¥¹œœ¤Ñ¡É½ÜÁÕ‰±¥ÉÉ½È İ•‰…ÕÑ¡¹}É•ÍÁ½¹Í•}¥¹Ù…±¥œ¤ì(€€€½¹ÍĞÍÑ½É•€ô…İ…¥Ğ‘‰…±°¡11L¹…ÕÑ¡É•‘•¹Ñ¥…°°m‰½‘ä¹Í½Á•%°É•ÍÁ½¹Í”¹¥‘t¤ì(€€€½¹ÍĞÙ•É¥™¥…Ñ¥½¸€ô…İ…¥ĞÙ•É¥™åÕÑ¡•¹Ñ¥…Ñ¥½¹I•ÍÁ½¹Í”¡ì(€€€€€É•ÍÁ½¹Í”°(€€€€€•áÁ•Ñ•‘¡…±±•¹”èÍÑ…Ñ”¹¡…±±•¹”°(€€€€€•áÁ•Ñ•‘=É¥¥¸è=I%%8°(€€€€€•áÁ•Ñ•‘IA%èIA}%°(€€€€€É•ÅÕ¥É•UÍ•ÉY•É¥™¥…Ñ¥½¸èÑÉÕ”°(€€€€€É•‘•¹Ñ¥…°èì(€€€€€€€¥èÍÑ½É•¹¥°(€€€€€€€ÁÕ‰±¥-•äè¹•ÜU¥¹ĞáÉÉ…ä¡	Õ™™•È¹™É½´¡ÍÑ½É•¹ÁÕ‰±¥}­•å}¡•à°€¡•àœ¤¤°(€€€€€€€½Õ¹Ñ•Èè9Õµ‰•È¡ÍÑ½É•¹½Õ¹Ñ•È¤°(€€€€€€€ÑÉ…¹ÍÁ½ÉÑÌèÍÑ½É•¹ÑÉ…¹ÍÁ½ÉÑÌñğmt°(€€€€€ô°(€€€ô¤ì(€€€¥˜€ …Ù•É¥™¥…Ñ¥½¸¹Ù•É¥™¥•ñğ€…Ù•É¥™¥…Ñ¥½¸¹…ÕÑ¡•¹Ñ¥…Ñ¥½¹%¹™¼¤ì(€€€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È İ•‰…ÕÑ¡¹}¹½Ñ}Ù•É¥™¥•œ°€ĞÀÌ¤ì(€€€ô(€€€½¹ÍĞ¥¹™¼€ôÙ•É¥™¥…Ñ¥½¸¹…ÕÑ¡•¹Ñ¥…Ñ¥½¹%¹™¼ì(€€€½¹ÍĞÕÍ•É!…¹‘±”€ôÉ•ÍÁ½¹Í”ü¹É•ÍÁ½¹Í”ü¹ÕÍ•É!…¹‘±”(€€€€€€ü	Õ™™•È¹™É½´¡É•ÍÁ½¹Í”¹É•ÍÁ½¹Í”¹ÕÍ•É!…¹‘±”°€‰…Í”ØÑÕÉ°œ¤€è¹Õ±°ì(€€€½¹ÍĞÍ•ÍÍ¥½¹M•É•Ğ€ôˆØÑÕÉ° Ğà¤ì(€€€½¹ÍĞÍÉ™Q½­•¸€ôˆØÑÕÉ° ÌÈ¤ì(€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹½µÁ±•Ñ•ÕÑ¡•¹Ñ¥…Ñ¥½¸°l(€€€€€ÍÑ…Ñ”¹¥°(€€€€€ÍÑ…Ñ”¹Í•É•Ğ°(€€€€€)M=8¹ÍÑÉ¥¹¥™ä¡É•ÍÁ½¹Í”¤°(€€€€€É•ÍÁ½¹Í”¹¥°(€€€€€ÕÍ•É!…¹‘±”°(€€€€€¥¹™¼¹¹•İ½Õ¹Ñ•È°(€€€€€¥¹™¼¹É•‘•¹Ñ¥…±•Ù¥•QåÁ”ñğÍÑ½É•¹‘•Ù¥•}ÑåÁ”°(€€€€€¥¹™¼¹É•‘•¹Ñ¥…±	…­•‘UÀ€üüÍÑ½É•¹‰…­•‘}ÕÀ°(€€€€€ÑÉÕ”°(€€€€€=I%%8°(€€€€€™…±Í”°(€€€€€ÑÉÕ”°(€€€€€Í•ÍÍ¥½¹M•É•Ğ°(€€€€€ÍÉ™Q½­•¸°(€€€€€MMM%=9}%1}M=9L°(€€€€€MMM%=9}	M=1UQ}M=9L°(€€€€€ÉåÁÑ¼¹É…¹‘½µUU% ¤°(€€€t¤ì(€€€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ¤ì(€€€…ÁÁ•¹‘½½­¥”¡É•Ì°½½­¥” }}!½ÍĞµ•ˆµÍ•ÍÍ¥½¸œ°Í•ÍÍ¥½¹M•É•Ğ°ìµ…á”èMMM%=9}	M=1UQ}M=9Lô¤¤ì(€€€…ÁÁ•¹‘½½­¥”¡É•Ì°½½­¥” }}!½ÍĞµ•ˆµÍÉ˜œ°ÍÉ™Q½­•¸°ì¡ÑÑÁ=¹±äè™…±Í”°µ…á”èMMM%=9}	M=1UQ}M=9Lô¤¤ì(€€€©Í½¸¡É•Ì°€ÈÀÀ°ì€¸¸¹É•ÍÕ±Ğ°ÍÉ˜èÍÉ™Q½­•¸ô¤ì(€ô…Ñ €¡•ÉÉ½È¤ì(€€€…İ…¥Ğ½¹ÍÕµ•…¥±ÕÉ”¡ÍÑ…Ñ”°•ÉÉ½È¹ÁÕ‰±¥½‘”ñğ€Ù•É¥™¥…Ñ¥½¹}™…¥±•œ°É•ÍÁ½¹Í”¤ì(€€€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ¤ì(€€€Ñ¡É½Ü•ÉÉ½È¹ÁÕ‰±¥½‘”€ü•ÉÉ½È€èÁÕ‰±¥ÉÉ½È İ•‰…ÕÑ¡¹}Ù•É¥™¥…Ñ¥½¹}™…¥±•œ°€ĞÀÌ¤ì(€ô)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•MÑ…Ñ”¡É•Ä°É•Ì¤ì(€½¹ÍĞÕÉ°€ô¹•ÜUI0¡É•Ä¹ÕÉ°°=I%%8¤ì(€½¹ÍĞÍ½Á•%€ôÕÉ°¹Í•…É¡A…É…µÌ¹•Ğ Í½Á”œ¤ì(€¥˜€ …¥ÍUÕ¥¡Í½Á•%¤¤Ñ¡É½ÜÁÕ‰±¥ÉÉ½È Í½Á•}¥¹Ù…±¥œ¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä¤ì(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹¡Õµ…¹M½Á”°mÍ•ÍÍ¥½¸°Í½Á•%‘t¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°É•ÍÕ±Ğ¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•I•Ñ…¥¹A½±¥ä¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸°ÍÉ˜ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä°ìÉ•ÅÕ¥É•ÍÉ˜èÑÉÕ”ô¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€¥˜€ …¥ÍUÕ¥¡‰½‘ä¹Í½Á•%¤ñğÑåÁ•½˜‰½‘ä¹Á…å±½…€„ôô€ÍÑÉ¥¹œœ(€€€€€ñğÑåÁ•½˜‰½‘ä¹Í½ÕÉ•I•˜€„ôô€ÍÑÉ¥¹œœñğ€…‰½‘ä¹Í½ÕÉ•I•˜¹ÑÉ¥´ ¤¤ì(€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È Á½±¥å}¥¹ÁÕÑ}¥¹Ù…±¥œ¤ì(€ô(€€¼¼Y…±¥‘…Ñ”Ñ¡”¡Õµ…¸Í•ÍÍ¥½¸‰•™½É”É•Ñ…¥¹¥¹œ„…¹‘¥‘…Ñ”¸I•Ñ•¹Ñ¥½¸¥ÑÍ•±˜½¹™•ÉÌ¹¼…ÕÑ¡½É¥Ñä¸(€…İ…¥Ğ‘‰…±°¡11L¹¡Õµ…¹M½Á”°mÍ•ÍÍ¥½¸°‰½‘ä¹Í½Á•%‘t¤ì(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹É•Ñ…¥¹A½±¥ä°m‰½‘ä¹Á…å±½…°‰½‘ä¹Í½ÕÉ•I•˜¹ÑÉ¥´ ¤°ÉåÁÑ¼¹É…¹‘½µUU% ¥t¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°ì€¸¸¹É•ÍÕ±Ğ°ÍÉ˜ô¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±••¥Í¥½¸¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸°ÍÉ˜ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä°ìÉ•ÅÕ¥É•ÍÉ˜èÑÉÕ”ô¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€¥˜€ …¥ÍUÕ¥¡‰½‘ä¹Í½Á•%¤ñğ€…l…•ÁĞœ°€‘•±¥¹”t¹¥¹±Õ‘•Ì¡‰½‘ä¹…Ñ¥½¸¤(€€€€€ñğ€…¥ÍUÕ¥¡‰½‘ä¹Ñ…É•ÑMÕ‰©•Ñ%¤ñğ€…¥ÍUÕ¥¡‰½‘ä¹•áÁ•Ñ•‘ÕÉÉ•¹ÑQÉ…¹Í¥Ñ¥½¹%¤(€€€€€ñğ€…¥ÍUÕ¥¡‰½‘ä¹É•ÅÕ•ÍÑ%¤¤ì(€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È ‘•¥Í¥½¹}¥¹ÁÕÑ}¥¹Ù…±¥œ¤ì(€ô(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹‘•¥Í¥½¸°l(€€€Í•ÍÍ¥½¸°(€€€ÍÉ˜°(€€€=I%%8°(€€€‰½‘ä¹Í½Á•%°(€€€‰½‘ä¹…Ñ¥½¸°(€€€‰½‘ä¹Ñ…É•ÑMÕ‰©•Ñ%°(€€€‰½‘ä¹•áÁ•Ñ•‘ÕÉÉ•¹ÑQÉ…¹Í¥Ñ¥½¹%°(€€€‰½‘ä¹É•ÅÕ•ÍÑ%°(€€€ÑåÁ•½˜‰½‘ä¹•áÁ±…¹…Ñ¥½¸€ôôô€ÍÑÉ¥¹œœ€ü‰½‘ä¹•áÁ±…¹…Ñ¥½¸€è¹Õ±°°(€€€ÉåÁÑ¼¹É…¹‘½µUU% ¤°(€t¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°ì€¸¸¹É•ÍÕ±Ğ°ÍÉ˜ô¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•]¥Ñ¡‘É…Ü¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸°ÍÉ˜ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä°ìÉ•ÅÕ¥É•ÍÉ˜èÑÉÕ”ô¤ì(€½¹ÍĞ‰½‘ä€ô…İ…¥ĞÉ•…‘)Í½¸¡É•Ä¤ì(€¥˜€ …¥ÍUÕ¥¡‰½‘ä¹Í½Á•%¤ñğ€…¥ÍUÕ¥¡‰½‘ä¹‘•¥Í¥½¹%¤ñğ€…¥ÍUÕ¥¡‰½‘ä¹É•ÅÕ•ÍÑ%¤¤ì(€€€Ñ¡É½ÜÁÕ‰±¥ÉÉ½È İ¥Ñ¡‘É…İ…±}¥¹ÁÕÑ}¥¹Ù…±¥œ¤ì(€ô(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹İ¥Ñ¡‘É…Ü°l(€€€Í•ÍÍ¥½¸°ÍÉ˜°=I%%8°‰½‘ä¹Í½Á•%°‰½‘ä¹‘•¥Í¥½¹%°‰½‘ä¹É•ÅÕ•ÍÑ%°ÉåÁÑ¼¹É…¹‘½µUU% ¤°(€t¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°ì€¸¸¹É•ÍÕ±Ğ°ÍÉ˜ô¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•1½½ÕĞ¡É•Ä°É•Ì¤ì(€É•ÅÕ¥É•=É¥¥¸¡É•Ä¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸°ÍÉ˜ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä°ìÉ•ÅÕ¥É•ÍÉ˜èÑÉÕ”ô¤ì(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹±½½ÕĞ°mÍ•ÍÍ¥½¸°ÍÉ˜°=I%%9t¤ì(€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÍ•ÍÍ¥½¸œ¤ì(€±•…É½½­¥”¡É•Ì°€}}!½ÍĞµ•ˆµÍÉ˜œ°™…±Í”¤ì(€±•…É½½¥”¡É•Ì°€}}!½ÍĞµ•ˆµÁÉ•…ÕÑ œ¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°É•ÍÕ±Ğ¤ì)ô()…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•I•½Ù•È¡É•Ä°É•Ì¤ì(€½¹ÍĞÕÉ°€ô¹•ÜUI0¡É•Ä¹ÕÉ°°=I%%8¤ì(€½¹ÍĞÍ½Á•%€ôÕÉ°¹Í•…É¡A…É…µÌ¹•Ğ Í½Á”œ¤ì(€½¹ÍĞÉ•ÅÕ•ÍÑ%€ôÕÉ°¹Í•…É¡A…É…µÌ¹•Ğ É•ÅÕ•ÍĞœ¤ì(€¥˜€ …¥ÍUÕ¥¡Í½Á•%¤ñğ€…¥ÍUÕ¥¡É•ÅÕ•ÍÑ%¤¤Ñ¡É½ÜÁÕ‰±¥ÉÉ½È É•½Ù•Éå}¥¹ÁÕÑ}¥¹Ù…±¥œ¤ì(€½¹ÍĞìÍ•ÍÍ¥½¸ô€ôÍ•ÍÍ¥½¹5…Ñ•É¥…°¡É•Ä¤ì(€…İ…¥Ğ‘‰…±°¡11L¹¡Õµ…¹M½Á”°mÍ•ÍÍ¥½¸°Í½Á•%‘t¤ì(€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğ‘‰…±°¡11L¹É•½Ù•È°mÍ½Á•%°É•ÅÕ•ÍÑ%‘t¤ì(€©Í½¸¡É•Ì°€ÈÀÀ°É•ÍÕ±Ğ¤ì)ô()½¹ÍĞI=UQL€ô=‰©•Ğ¹™É••é”¡ì(€€A=MP€½Í•ÑÕÀ½½Á•¸œè¡…¹‘±•M•ÑÕÁ=Á•¸°(€€P€½Í•ÑÕÀ½ÍÑ…ÑÕÌœè¡…¹‘±•M•ÑÕÁMÑ…ÑÕÌ°(€€A=MP€½Í•ÑÕÀ½É•¥ÍÑ•È½½ÁÑ¥½¹Ìœè¡…¹‘±•I•¥ÍÑÉ…Ñ¥½¹=ÁÑ¥½¹Ì°(€€A=MP€½Í•ÑÕÀ½É•¥ÍÑ•È½Ù•É¥™äœè¡…¹‘±•I•¥ÍÑÉ…Ñ¥½¹Y•É¥™ä°(€€A=MP€½Í•ÑÕÀ½‰¥¹œè¡…¹‘±•M•ÑÕÁ	¥¹°(€€A=MP€½…ÕÑ ½½ÁÑ¥½¹Ìœè¡…¹‘±•ÕÑ¡=ÁÑ¥½¹Ì°(€€A=MP€½…ÕÑ ½Ù•É¥™äœè¡…¹‘±•ÕÑ¡Y•É¥™ä°(€€P€½ÍÑ…Ñ”œè¡…¹‘±•MÑ…Ñ”°(€€A=MP€½Á½±¥¥•Ìœè¡…¹‘±•I•Ñ…¥¹A½±¥ä°(€€A=MP€½‘•¥Í¥½¸œè¡…¹‘±••¥Í¥½¸°(€€A=MP€½İ¥Ñ¡‘É…Üœè¡…¹‘±•]¥Ñ¡‘É…Ü°(€€A=MP€½±½½ÕĞœè¡…¹‘±•1½½ÕĞ°(€€P€½É•½Ù•Èœè¡…¹‘±•I•½Ù•È°)ô¤ì()•áÁ½ÉĞ‘•™…Õ±Ğ…Íå¹Œ™Õ¹Ñ¥½¸¡…¹‘±•È¡É•Ä°É•Ì¤ì(€ÑÉäì(€€€½¹ÍĞÉ½ÕÑ”€ôÉ½ÕÑ•É½´¡É•Ä¤ì(€€€¥˜€¡É½ÕÑ”€ôôô€œ½¡•…±Ñ œ€˜˜É•Ä¹µ•Ñ¡½€ôôô€Pœ¤ì(€€€€€½¹ÍĞÕÉÉ•¹Ğ€ô…İ…¥ĞÁ½½°¹ÅÕ•Éä Í•±•ĞÕÉÉ•¹Ñ}ÕÍ•È…ÌÉ½±”°ÕÉÉ•¹Ñ}Í•ÑÑ¥¹œ¡pÍ•ÉÙ•É}Ù•ÉÍ¥½¹pœ¤…ÌÁ½ÍÑÉ•Í}Ù•ÉÍ¥½¸œ¤ì(€€€€€½¹ÍĞÉ½±”€ôÕÉÉ•¹Ğ¹É½İÍlÁtü¹É½±”ì(€€€€€¥˜€¡É½±”€„ôô€•‰}½Ù•É¹…¹•}Ù•É¥™¥•Èœ¤Ñ¡É½ÜÁÕ‰±¥ÉÉ½È ‘…Ñ…‰…Í•}É½±•}É•©•Ñ•œ°€ÔÀÌ¤ì(€€€€€É•ÑÕÉ¸©Í½¸¡É•Ì°€ÈÀÀ°ìÍÑ…ÑÕÌè€½¬œ°É½±”°ÉÁ}¥èIA}%°½É¥¥¸è=I%%8ô¤ì(€€€ô(€€€½¹ÍĞ™¸€ôI=UQMm€‘íÉ•Ä¹µ•Ñ¡½‘ô€‘íÉ½ÕÑ•õtì(€€€¥˜€ …™¸¤É•ÑÕÉ¸©Í½¸¡É•Ì°€ĞÀĞ°ì•ÉÉ½Èè€¹½Ñ}™½Õ¹œô¤ì(€€€…İ…¥Ğ™¸¡É•Ä°É•Ì¤ì(€ô…Ñ €¡•ÉÉ½È¤ì(€€€½¹ÍĞÍÑ…ÑÕÌ€ô9Õµ‰•È¡•ÉÉ½È¹ÍÑ…ÑÕÌ¤ñğ€¡•ÉÉ½È¹½‘”€ôôô€œÈÌÔÀÔœ€ü€ĞÀä€è€ĞÀÀ¤ì(€€€½¹ÍĞ½‘”€ô•ÉÉ½È¹ÁÕ‰±¥½‘”ñğ€¡•ÉÉ½È¹½‘”€ü‘…Ñ…‰…Í•|‘í•ÉÉ½È¹½‘•õ€€è€É•ÅÕ•ÍÑ}™…¥±•œ¤ì(€€€©Í½¸¡É•Ì°ÍÑ…ÑÕÌ°ì•ÉÉ½Èè½‘”ô¤ì(€ô)ô