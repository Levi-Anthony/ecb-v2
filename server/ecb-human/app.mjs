import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

export const ORIGIN = "https://ecos.effortlessconnection.com";
export const RP_ID = "ecos.effortlessconnection.com";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
const secret = () => randomBytes(32).toString("base64url");
const cookie = (name, value, age) =>
  `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const uuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const publicErrors = new Set([
  "setup_unavailable",
  "enrollment_complete",
  "ceremony_unavailable",
  "ceremony_limit",
  "unbound_identity",
  "session_required",
  "csrf_rejected",
  "stale_predecessor",
  "wrong_digest",
  "unsupported_policy",
  "explanation_required",
  "binding_changed",
  "request_conflict",
  "governance_inactive",
  "already_withdrawn",
  "not_own_pending_decision",
  "unknown_scope",
  "credential_changed",
]);
function fail(code) {
  throw Object.assign(new Error(code), { public: true });
}
function cookies(req) {
  const result = {};
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key in result) fail("invalid_request");
    result[key] = value.join("=");
  }
  return result;
}
async function body(req) {
  if (req.headers["content-type"]?.split(";")[0] !== "application/json") {
    fail("invalid_request");
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 65536) fail("request_too_large");
    chunks.push(chunk);
  }
  const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail("invalid_request");
  }
  return data;
}
export function checkClientData(response, expectedHandle) {
  if (
    !response || response.type !== "public-key" ||
    !/^[A-Za-z0-9_-]+$/.test(response.id) || response.rawId !== response.id
  ) fail("verification_failed");
  const data = JSON.parse(
    Buffer.from(response.response.clientDataJSON, "base64url").toString("utf8"),
  );
  if (
    (data.crossOrigin !== undefined && data.crossOrigin !== false) ||
    data.topOrigin !== undefined || data.origin !== ORIGIN
  ) fail("verification_failed");
  if (
    expectedHandle !== undefined && response.response.userHandle != null &&
    response.response.userHandle !==
      Buffer.from(expectedHandle).toString("base64url")
  ) fail("verification_failed");
}
export function createApp(db) {
  const human = async (action, data) =>
    (await db`select ecb_governance.human(${action},${
      db.json(data)
    }) as result`)[0].result;
  return async (req, res) => {
    const headers = {
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy":
        "publickey-credentials-get=(self), publickey-credentials-create=(self)",
      "Strict-Transport-Security": "max-age=31536000",
    };
    const send = (status, value, type = "application/json") => {
      res.writeHead(status, { ...headers, "Content-Type": type });
      res.end(type === "application/json" ? JSON.stringify(value) : value);
    };
    try {
      const url = new URL(req.url, ORIGIN);
      if (req.method === "GET" && url.pathname === "/health") {
        return send(200, {
          service: "ecb-human",
          governance_activation: "not_implied_by_service_health",
        });
      }
      const assets = {
        "/": "public/index.html",
        "/intervene": "public/index.html",
        "/client.js": "public/client.js",
        "/style.css": "public/style.css",
        "/webauthn.js":
          "node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js",
      };
      if (req.method === "GET" && assets[url.pathname]) {
        const type = url.pathname.endsWith(".js")
          ? "application/javascript"
          : url.pathname.endsWith(".css")
          ? "text/css"
          : "text/html";
        return send(
          200,
          await readFile(
            new URL(assets[url.pathname], import.meta.url),
            "utf8",
          ),
          type,
        );
      }
      const cs = cookies(req);
      if (req.method === "GET" && url.pathname === "/api/view") {
        const scope = url.searchParams.get("scope");
        if (!uuid(scope)) fail("invalid_request");
        const result = await human("view", {
          scope,
          session_secret: cs["__Host-ecb-session"],
        });
        // Token is derived from the existing high-entropy session secret; it never reveals that secret.
        return send(200, {
          ...result,
          csrf: hash(`csrf:${cs["__Host-ecb-session"]}`),
        });
      }
      if (
        req.method !== "POST" || req.headers.origin !== ORIGIN ||
        (req.headers["sec-fetch-site"] &&
          req.headers["sec-fetch-site"] !== "same-origin")
      ) fail("origin_rejected");
      const a = await body(req);
      if (!uuid(a.scope)) fail("invalid_request");
      const scope = a.scope;
      if (url.pathname === "/api/setup/view") {
        return send(
          200,
          await human("setup_view", { scope, setup_secret: a.setup_secret }),
        );
      }
      if (url.pathname === "/api/setup/digest") {
        return send(
          200,
          await human("binding_digest", {
            scope,
            setup_secret: a.setup_secret,
          }),
        );
      }
      if (url.pathname === "/api/setup/bind") {
        if (!uuid(a.request_id)) fail("invalid_request");
        return send(
          200,
          await human("bind", {
            scope,
            setup_secret: a.setup_secret,
            credential_set_digest: a.credential_set_digest,
            request_id: a.request_id,
          }),
        );
      }
      const registration = url.pathname.startsWith("/api/registration/");
      const authentication = url.pathname.startsWith("/api/authentication/");
      if (
        (registration || authentication) && url.pathname.endsWith("/options")
      ) {
        const challenge = secret(), browser = secret();
        const data = await human(
          registration ? "registration_options" : "authentication_options",
          {
            scope,
            setup_secret: a.setup_secret,
            challenge,
            browser_hash: hash(browser),
          },
        );
        let options;
        if (registration) {
          options = await generateRegistrationOptions({
            rpName: "ECB Governance",
            rpID: RP_ID,
            userID: Buffer.from(data.user_handle),
            userName: "Designated human",
            userDisplayName: "Designated human",
            challenge: Buffer.from(challenge, "base64url"),
            attestationType: "none",
            authenticatorSelection: {
              residentKey: "required",
              userVerification: "required",
            },
            excludeCredentials: data.credentials.map((c) => ({
              id: c.credential_id,
              transports: c.transports,
            })),
          });
        } else {options = await generateAuthenticationOptions({
            rpID: RP_ID,
            challenge: Buffer.from(challenge, "base64url"),
            userVerification: "required",
            allowCredentials: data.credentials.map((c) => ({
              id: c.credential_id,
              transports: c.transports,
            })),
          });}
        headers["Set-Cookie"] = cookie("__Host-ecb-ceremony", browser, 300);
        return send(200, { ceremony: data.ceremony, options });
      }
      if (
        (registration || authentication) && url.pathname.endsWith("/verify")
      ) {
        if (!uuid(a.ceremony) || !cs["__Host-ecb-ceremony"]) {
          fail("verification_failed");
        }
        const browser_hash = hash(cs["__Host-ecb-ceremony"]);
        const data = await human("ceremony", {
          scope,
          ceremony: a.ceremony,
          browser_hash,
        });
        if (
          data.ceremony.purpose !==
            (registration ? "registration" : "authentication")
        ) fail("verification_failed");
        let result, verificationComplete = false;
        try {
          checkClientData(
            a.response,
            authentication ? data.user_handle : undefined,
          );
          if (registration) {
            const verified = await verifyRegistrationResponse({
              response: a.response,
              expectedChallenge: data.ceremony.challenge,
              expectedOrigin: ORIGIN,
              expectedRPID: RP_ID,
              requireUserVerification: true,
            });
            if (!verified.verified || !verified.registrationInfo) {
              fail("verification_failed");
            }
            const info = verified.registrationInfo;
            verificationComplete = true;
            result = await human("registration_finish", {
              scope,
              setup_secret: a.setup_secret,
              ceremony: a.ceremony,
              browser_hash,
              proof: a.response,
              credential_id: info.credential.id,
              public_key: Buffer.from(info.credential.publicKey).toString(
                "base64url",
              ),
              counter: info.credential.counter,
              transports: info.credential.transports ?? [],
              device_type: info.credentialDeviceType,
              backed_up: info.credentialBackedUp,
            });
          } else {
            const key = data.credentials.find((c) =>
              c.credential_id === a.response.id
            );
            if (!key) fail("verification_failed");
            const verified = await verifyAuthenticationResponse({
              response: a.response,
              expectedChallenge: data.ceremony.challenge,
              expectedOrigin: ORIGIN,
              expectedRPID: RP_ID,
              requireUserVerification: true,
              credential: {
                id: key.credential_id,
                publicKey: Buffer.from(key.public_key, "base64url"),
                counter: Number(key.counter),
                transports: key.transports,
              },
            });
            if (!verified.verified) fail("verification_failed");
            verificationComplete = true;
            const token = secret(), csrf = hash(`csrf:${token}`);
            result = await human("authentication_finish", {
              scope,
              ceremony: a.ceremony,
              browser_hash,
              proof: a.response,
              credential_id: key.credential_id,
              old_counter: key.counter,
              counter: verified.authenticationInfo.newCounter,
              backed_up: verified.authenticationInfo.credentialBackedUp,
              secret_hash: hash(token),
              csrf_hash: hash(csrf),
            });
            headers["Set-Cookie"] = [
              cookie("__Host-ecb-session", token, 604800),
              cookie("__Host-ecb-ceremony", "", 0),
            ];
            return send(200, { authenticated: true, csrf, session: result.id });
          }
        } catch (error) {
          if (verificationComplete) throw error;
          fail("verification_failed");
        }
        headers["Set-Cookie"] = cookie("__Host-ecb-ceremony", "", 0);
        return send(200, result);
      }
      const actions = {
        "/api/accept": "accept",
        "/api/decline": "decline",
        "/api/withdraw": "withdraw",
        "/api/logout": "logout",
      };
      const action = actions[url.pathname];
      if (!action) return send(404, { error: "not_found" });
      if (action !== "logout" && !uuid(a.request_id)) fail("invalid_request");
      const result = await human(action, {
        scope,
        session_secret: cs["__Host-ecb-session"],
        csrf: req.headers["x-ecb-csrf"],
        request_id: a.request_id,
        predecessor: a.predecessor,
        policy_bytes: a.policy_bytes,
        policy_digest: a.policy_digest,
        decision: a.decision,
        explanation: a.explanation,
      });
      if (action === "logout") {
        headers["Set-Cookie"] = cookie("__Host-ecb-session", "", 0);
      }
      return send(200, result);
    } catch (error) {
      // No SQL internals, assertions, cookies, tokens or connection details enter public errors/logs.
      const code = error.public
        ? error.message
        : publicErrors.has(error.message)
        ? error.message
        : "request_failed";
      return send(
        code === "session_required"
          ? 401
          : code === "request_failed"
          ? 503
          : 400,
        {
          error: code,
          outcome: code === "request_failed" ? "unknown" : "rejected",
        },
      );
    }
  };
}
