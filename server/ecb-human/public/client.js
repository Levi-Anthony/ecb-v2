"use strict";
const el = (id) => document.getElementById(id);
let csrf, state, reviewed, binding;
const requestedScope = new URLSearchParams(location.search).get("scope");
if (
  requestedScope &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedScope)
) {
  el("scope").value = requestedScope;
  history.replaceState(null, "", location.pathname);
}
const digest = async (text) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    ),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
const scope = () => el("scope").value.trim();
async function api(path, data = {}) {
  const r = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-ECB-CSRF": csrf } : {}),
    },
    body: JSON.stringify({ scope: scope(), ...data }),
  });
  const result = await r.json();
  if (!r.ok) {
    throw new Error(
      `${result.error}${
        result.outcome === "unknown"
          ? " — outcome unknown; refresh state before another action"
          : ""
      }`,
    );
  }
  return result;
}
function show(data) {
  state = data;
  el("state").textContent = JSON.stringify(data, null, 2);
  el("summary").textContent = data.scope.current_transition
    ? "Governance is active. The current transition is " +
      data.scope.current_transition
    : data.scope.binding
    ? "Credentials are bound. Governance activation is pending."
    : "Setup is pending. Registered credentials are inactive.";
  if (data.session) {
    el("expiry").textContent = `Session expires by ${
      new Date(data.session.absolute_expires).toLocaleString()
    }; inactivity expiry ${
      new Date(data.session.idle_expires).toLocaleString()
    }.`;
  }
}
async function refresh() {
  const r = await fetch("/api/view?scope=" + encodeURIComponent(scope()), {
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  csrf = data.csrf;
  show(data);
}
const actions = {
  login: async () => {
    const a = await api("authentication/options");
    const response = await SimpleWebAuthnBrowser.startAuthentication({
      optionsJSON: a.options,
    });
    const r = await api("authentication/verify", {
      ceremony: a.ceremony,
      response,
    });
    csrf = r.csrf;
    await refresh();
    return "Signed in. No policy decision was made.";
  },
  refresh: async () => {
    await refresh();
    return "Current state recovered.";
  },
  logout: async () => {
    await api("logout");
    csrf = undefined;
    state = undefined;
    el("state").textContent = "";
    return "Signed out. Existing authorizations remain recorded.";
  },
  "setup-view": async () => {
    show(await api("setup/view", { setup_secret: el("setup").value }));
    return "Protected setup loaded.";
  },
  register: async () => {
    const setup_secret = el("setup").value;
    const a = await api("registration/options", { setup_secret });
    const response = await SimpleWebAuthnBrowser.startRegistration({
      optionsJSON: a.options,
    });
    await api("registration/verify", {
      ceremony: a.ceremony,
      response,
      setup_secret,
    });
    show(await api("setup/view", { setup_secret }));
    return "Passkey registered. It remains inactive until binding.";
  },
  "binding-review": async () => {
    const result = await api("setup/digest", {
      setup_secret: el("setup").value,
    });
    binding = { scope: scope(), ...result };
    el("binding").textContent = JSON.stringify(binding, null, 2);
    el("bind").hidden = false;
    return "Review the exact credential set and scope.";
  },
  bind: async () => {
    if (!binding || binding.scope !== scope()) {
      throw new Error("Review binding again.");
    }
    const result = await api("setup/bind", {
      setup_secret: el("setup").value,
      credential_set_digest: binding.digest,
      request_id: crypto.randomUUID(),
    });
    el("binding").textContent = JSON.stringify(result, null, 2);
    el("setup").value = "";
    el("bind").hidden = true;
    return "Exact credentials and scope bound. Activation is pending; sign in to inspect it.";
  },
  review: async () => {
    await refresh();
    reviewed = {
      scope: scope(),
      policy_bytes: el("policy").value,
      policy_digest: await digest(el("policy").value),
      predecessor: state.scope.current_transition,
      explanation: el("explanation").value,
      request_id: crypto.randomUUID(),
    };
    el("review-text").textContent = JSON.stringify(reviewed, null, 2);
    el("reviewed").hidden = false;
    return "Review these exact bytes and predecessor before deciding.";
  },
  accept: async () => decide("accept"),
  decline: async () => decide("decline"),
  withdraw: async () => {
    const result = await api("withdraw", {
      decision: el("decision").value.trim(),
      request_id: crypto.randomUUID(),
    });
    await refresh();
    return result.already_completed
      ? "Execution already completed; its history is retained."
      : "Your pending authorization was withdrawn.";
  },
};
async function decide(action) {
  if (!reviewed || reviewed.scope !== scope()) {
    throw new Error("Review the decision first.");
  }
  await api(action, reviewed);
  el("reviewed").hidden = true;
  reviewed = undefined;
  await refresh();
  return action === "accept"
    ? "Exact policy authorized. Execution can use the committed decision."
    : "Policy declined. No execution grant created.";
}
for (const [id, action] of Object.entries(actions)) {
  el(id).addEventListener("click", async () => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.forEach((b) => b.disabled = true);
    try {
      el("message").textContent = await action();
    } catch (e) {
      el("message").textContent = e.message;
    } finally {
      buttons.forEach((b) => b.disabled = false);
    }
  });
}
for (const id of ["policy", "explanation", "scope"]) {
  el(id).addEventListener("input", () => {
    reviewed = undefined;
    el("reviewed").hidden = true;
  });
}
