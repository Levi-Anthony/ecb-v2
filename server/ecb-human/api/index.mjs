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
  if (!isUuid(state.id) || typeof state.secret !== 'string' || typeof state.challenge !== 'string'
      || state.purpose !== purpose) {
    throw publicError('invalid_browser_state', 401);
  }
  return state;
}

async function consumeFailure(state, reason, response) {
  if (!state) return;
  try {
    await dbCall(CALLS.consumeFailure, [state.id, state.secret, reason, response ? JSON.stringify(response) : null]);
  } catch {
    // A failed attempt to record a failure never licenses retry or success.
  }
}

async function handleSetupOpen(req, res) {
  requireOrigin(req);
  const body = await readJson(req);
  if (!isUuid(body.setupId) || typeof body.token !== 'string' || body.token.length < 32) {
    throw publicError('setup_input_invalid');
  }
  const context = await dbCall(CALLS.registrationContext, [body.setupId, body.token]);
  appendCookie(res, cookie('__Host-ecb-setup-id', body.setupId, { maxAge: 7200 }));
  appendCookie(res, cookie('__Host-ecb-setup', body.token, { maxAge: 7200 }));
  json(res, 200, { status: 'setup_open', ...context });
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
  if (context.remaining <= 0) throw publicError('credential_count_satisfied', 409);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: Buffer.from(context.user_handle_hex, 'hex'),
    userName: 'Levi',
    userDisplayName: 'Levi',
    attestationType: 'none',
    timeout: 120_000,
    supportedAlgorithmIDs: [-7, -257],
    excludeCredentials: (context.exclude_credentials || []).map((item) => ({
      id: item.id,
      transports: item.transports || [],
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
  });
  const nonce = b64url();
  const preauthSecret = `${nonce}.${options.challenge}`;
  const ceremonyId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  await dbCall(CALLS.beginRegistration, [
    setupId, token, options.challenge, preauthSecret, expiresAt, ceremonyId,
  ]);
  appendCookie(res, cookie('__Host-ecb-preauth', encodeState({
    id: ceremonyId,
    secret: preauthSecret,
    challenge: options.challenge,
    purpose: 'registration',
    setupId,
  }), { maxAge: 300 }));
  json(res, 200, { publicKey: options });
}

async function handleRegistrationVerify(req, res) {
  requireOrigin(req);
  const { setupId } = setupCookies(req);
  const state = preauth(req, 'registration');
  if (state.setupId !== setupId) throw publicError('browser_state_scope_mismatch', 403);
  const body = await readJson(req);
  const response = body.response;
  try {
    parseClientData(response, 'webauthn.create');
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: state.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      supportedAlgorithmIDs: [-7, -257],
    });
    if (!verification.verified || !verification.registrationInfo) {
      throw publicError('webauthn_not_verified', 403);
    }
    const info = verification.registrationInfo;
    if (info.credential.id !== response.id || info.rpID !== RP_ID || info.origin !== ORIGIN || info.userVerified !== true) {
      throw publicError('webauthn_binding_rejected', 403);
    }
    const decoded = decodeCredentialPublicKey(info.credential.publicKey);
    const algorithm = decoded.get(3);
    if (typeof algorithm !== 'number' || ![-7, -257].includes(algorithm)) {
      throw publicError('webauthn_algorithm_rejected', 403);
    }
    const result = await dbCall(CALLS.completeRegistration, [
      state.id,
      state.secret,
      JSON.stringify(response),
      info.credential.id,
      Buffer.from(info.credential.publicKey),
      algorithm,
      info.credential.counter,
      info.credential.transports || response?.response?.transports || [],
      info.credentialDeviceType,
      info.credentialBackedUp,
      info.userVerified,
      info.origin,
      false,
      true,
      crypto.randomUUID(),
    ]);
    clearCookie(res, '__Host-ecb-preauth');
    json(res, 200, result);
  } catch (error) {
    await consumeFailure(state, error.publicCode || 'verification_failed', response);
    clearCookie(res, '__Host-ecb-preauth');
    throw error.publicCode ? error : publicError('webauthn_verification_failed', 403);
  }
}

async function handleSetupBind(req, res) {
  requireOrigin(req);
  const { setupId, token } = setupCookies(req);
  const body = await readJson(req);
  if (!Array.isArray(body.credentialRefs) || !body.credentialRefs.length
      || !body.credentialRefs.every(isUuid) || !isUuid(body.requestId)
      || typeof body.sourceRef !== 'string' || !body.sourceRef.trim()) {
    throw publicError('binding_input_invalid');
  }
  const result = await dbCall(CALLS.bindInitial, [
    setupId,
    token,
    body.credentialRefs,
    body.sourceRef.trim(),
    body.requestId,
    crypto.randomUUID(),
    crypto.randomUUID(),
  ]);
  clearCookie(res, '__Host-ecb-setup-id');
  clearCookie(res, '__Host-ecb-setup');
  clearCookie(res, '__Host-ecb-preauth');
  json(res, 200, result);
}

async function handleAuthOptions(req, res) {
  requireOrigin(req);
  const body = await readJson(req);
  if (!isUuid(body.scopeId)) throw publicError('scope_invalid');
  const context = await dbCall(CALLS.authContext, [body.scopeId]);
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    timeout: 120_000,
    allowCredentials: (context.allow_credentials || []).map((item) => ({
      id: item.id,
      transports: item.transports || [],
    })),
  });
  const nonce = b64url();
  const preauthSecret = `${nonce}.${options.challenge}`;
  const ceremonyId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  await dbCall(CALLS.beginAuthentication, [
    body.scopeId, options.challenge, preauthSecret, expiresAt, ceremonyId,
  ]);
  appendCookie(res, cookie('__Host-ecb-preauth', encodeState({
    id: ceremonyId,
    secret: preauthSecret,
    challenge: options.challenge,
    purpose: 'authentication',
    scopeId: body.scopeId,
  }), { maxAge: 300 }));
  json(res, 200, { publicKey: options });
}

async function handleAuthVerify(req, res) {
  requireOrigin(req);
  const state = preauth(req, 'authentication');
  const body = await readJson(req);
  if (!isUuid(body.scopeId) || body.scopeId !== state.scopeId) {
    throw publicError('browser_state_scope_mismatch', 403);
  }
  const response = body.response;
  try {
    parseClientData(response, 'webauthn.get');
    if (typeof response?.id !== 'string') throw publicError('webauthn_response_invalid');
    const stored = await dbCall(CALLS.authCredential, [body.scopeId, response.id]);
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: state.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      credential: {
        id: stored.id,
        publicKey: new Uint8Array(Buffer.from(stored.public_key_hex, 'hex')),
        counter: Number(stored.counter),
        transports: stored.transports || [],
      },
    });
    if (!verification.verified || !verification.authenticationInfo) {
      throw publicError('webauthn_not_verified', 403);
    }
    const info = verification.authenticationInfo;
    if (info.credentialID !== response.id || info.rpID !== RP_ID || info.origin !== ORIGIN || info.userVerified !== true) {
      throw publicError('webauthn_binding_rejected', 403);
    }
    const userHandle = response?.response?.userHandle
      ? Buffer.from(response.response.userHandle, 'base64url') : null;
    const sessionSecret = b64url(48);
    const csrfToken = b64url(32);
    const result = await dbCall(CALLS.completeAuthentication, [
      state.id,
      state.secret,
      JSON.stringify(response),
      response.id,
      userHandle,
      info.newCounter,
      info.credentialDeviceType || stored.device_type,
      info.credentialBackedUp ?? stored.backed_up,
      info.userVerified,
      info.origin,
      false,
      true,
      sessionSecret,
      csrfToken,
      SESSION_IDLE_SECONDS,
      SESSION_ABSOLUTE_SECONDS,
      crypto.randomUUID(),
    ]);
    clearCookie(res, '__Host-ecb-preauth');
    appendCookie(res, cookie('__Host-ecb-session', sessionSecret, { maxAge: SESSION_ABSOLUTE_SECONDS }));
    appendCookie(res, cookie('__Host-ecb-csrf', csrfToken, { httpOnly: false, maxAge: SESSION_ABSOLUTE_SECONDS }));
    json(res, 200, { ...result, csrf: csrfToken });
  } catch (error) {
    await consumeFailure(state, error.publicCode || 'verification_failed', response);
    clearCookie(res, '__Host-ecb-preauth');
    throw error.publicCode ? error : publicError('webauthn_verification_failed', 403);
  }
}

async function handleState(req, res) {
  const url = new URL(req.url, ORIGIN);
  const scopeId = url.searchParams.get('scope');
  if (!isUuid(scopeId)) throw publicError('scope_invalid');
  const { session } = sessionMaterial(req);
  const result = await dbCall(CALLS.humanScope, [session, scopeId]);
  json(res, 200, result);
}

async function handleRetainPolicy(req, res) {
  requireOrigin(req);
  const { session, csrf } = sessionMaterial(req, { requireCsrf: true });
  const body = await readJson(req);
  if (!isUuid(body.scopeId) || typeof body.payload !== 'string'
      || typeof body.sourceRef !== 'string' || !body.sourceRef.trim()) {
    throw publicError('policy_input_invalid');
  }
  // Validate the human session before retaining a candidate. Retention itself confers no authority.
  await dbCall(CALLS.humanScope, [session, body.scopeId]);
  const result = await dbCall(CALLS.retainPolicy, [body.payload, body.sourceRef.trim(), crypto.randomUUID()]);
  json(res, 200, { ...result, csrf });
}

async function handleDecision(req, res) {
  requireOrigin(req);
  const { session, csrf } = sessionMaterial(req, { requireCsrf: true });
  const body = await readJson(req);
  if (!isUuid(body.scopeId) || !['accept', 'decline'].includes(body.action)
      || !isUuid(body.targetSubjectId) || !isUuid(body.expectedCurrentTransitionId)
      || !isUuid(body.requestId)) {
    throw publicError('decision_input_invalid');
  }
  const result = await dbCall(CALLS.decision, [
    session,
    csrf,
    ORIGIN,
    body.scopeId,
    body.action,
    body.targetSubjectId,
    body.expectedCurrentTransitionId,
    body.requestId,
    typeof body.explanation === 'string' ? body.explanation : null,
    crypto.randomUUID(),
  ]);
  json(res, 200, { ...result, csrf });
}

async function handleWithdraw(req, res) {
  requireOrigin(req);
  const { session, csrf } = sessionMaterial(req, { requireCsrf: true });
  const body = await readJson(req);
  if (!isUuid(body.scopeId) || !isUuid(body.decisionId) || !isUuid(body.requestId)) {
    throw publicError('withdrawal_input_invalid');
  }
  const result = await dbCall(CALLS.withdraw, [
    session, csrf, ORIGIN, body.scopeId, body.decisionId, body.requestId, crypto.randomUUID(),
  ]);
  json(res, 200, { ...result, csrf });
}

async function handleLogout(req, res) {
  requireOrigin(req);
  const { session, csrf } = sessionMaterial(req, { requireCsrf: true });
  const result = await dbCall(CALLS.logout, [session, csrf, ORIGIN]);
  clearCookie(res, '__Host-ecb-session');
  clearCookie(res, '__Host-ecb-csrf', false);
  clearCookie(res, '__Host-ecb-preauth');
  json(res, 200, result);
}

async function handleRecover(req, res) {
  const url = new URL(req.url, ORIGIN);
  const scopeId = url.searchParams.get('scope');
  const requestId = url.searchParams.get('request');
  if (!isUuid(scopeId) || !isUuid(requestId)) throw publicError('recovery_input_invalid');
  const { session } = sessionMaterial(req);
  await dbCall(CALLS.humanScope, [session, scopeId]);
  const result = await dbCall(CALLS.recover, [scopeId, requestId]);
  json(res, 200, result);
}

const ROUTES = Object.freeze({
  'POST /setup/open': handleSetupOpen,
  'GET /setup/status': handleSetupStatus,
  'POST /setup/register/options': handleRegistrationOptions,
  'POST /setup/register/verify': handleRegistrationVerify,
  'POST /setup/bind': handleSetupBind,
  'POST /auth/options': handleAuthOptions,
  'POST /auth/verify': handleAuthVerify,
  'GET /state': handleState,
  'POST /policies': handleRetainPolicy,
  'POST /decision': handleDecision,
  'POST /withdraw': handleWithdraw,
  'POST /logout': handleLogout,
  'GET /recover': handleRecover,
});

export default async function handler(req, res) {
  try {
    const route = routeFrom(req);
    if (route === '/health' && req.method === 'GET') {
      const current = await pool.query('select current_user as role, current_setting(\'server_version\') as postgres_version');
      const role = current.rows[0]?.role;
      if (role !== 'ecb_governance_verifier') throw publicError('database_role_rejected', 503);
      return json(res, 200, { status: 'ok', role, rp_id: RP_ID, origin: ORIGIN });
    }
    const fn = ROUTES[`${req.method} ${route}`];
    if (!fn) return json(res, 404, { error: 'not_found' });
    await fn(req, res);
  } catch (error) {
    const status = Number(error.status) || (error.code === '23505' ? 409 : 400);
    const code = error.publicCode || (error.code ? `database_${error.code}` : 'request_failed');
    json(res, status, { error: code });
  }
}
