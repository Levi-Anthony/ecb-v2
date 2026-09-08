import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

const $ = (id) => document.getElementById(id);
const status = $('status');
let activeScope = '';
let csrf = '';
let registeredRefs = [];

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (csrf && options.method && options.method !== 'GET') headers.set('x-ecb-csrf', csrf);
  const response = await fetch(`/api${path}`, { ...options, headers, credentials: 'same-origin' });
  const data = await response.json().catch(() => ({ error: 'invalid_response' }));
  if (!response.ok) throw new Error(data.error || `http_${response.status}`);
  if (data.csrf) csrf = data.csrf;
  return data;
}

function randomUUID() {
  return crypto.randomUUID();
}

async function refresh() {
  if (!activeScope) return;
  const data = await api(`/state?scope=${encodeURIComponent(activeScope)}`);
  $('state').textContent = JSON.stringify(data, null, 2);
  $('governance').hidden = false;
  status.textContent = 'Authenticated human session.';
  if (data.current_transition_id) $('expected-transition').value = data.current_transition_id;
}

$('login').addEventListener('click', async () => {
  try {
    activeScope = $('scope').value.trim();
    const options = await api('/auth/options', {
      method: 'POST', body: JSON.stringify({ scopeId: activeScope }),
    });
    const response = await startAuthentication({ optionsJSON: options.publicKey });
    await api('/auth/verify', {
      method: 'POST', body: JSON.stringify({ scopeId: activeScope, response }),
    });
    await refresh();
  } catch (error) {
    status.textContent = `Sign-in failed: ${error.message}`;
  }
});

$('setup-open').addEventListener('click', async () => {
  try {
    const data = await api('/setup/open', {
      method: 'POST',
      body: JSON.stringify({ setupId: $('setup-id').value.trim(), token: $('setup-token').value }),
    });
    $('setup-token').value = '';
    $('setup-output').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    $('setup-output').textContent = `Setup failed: ${error.message}`;
  }
});

$('register').addEventListener('click', async () => {
  try {
    const options = await api('/setup/register/options', { method: 'POST', body: '{}' });
    const response = await startRegistration({ optionsJSON: options.publicKey });
    const result = await api('/setup/register/verify', {
      method: 'POST', body: JSON.stringify({ response }),
    });
    if (result.credential_ref && !registeredRefs.includes(result.credential_ref)) registeredRefs.push(result.credential_ref);
    $('credential-refs').value = registeredRefs.join(',');
    $('setup-output').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('setup-output').textContent = `Registration failed: ${error.message}`;
  }
});

$('setup-refresh').addEventListener('click', async () => {
  try {
    const result = await api('/setup/status');
    if (Array.isArray(result.candidates)) {
      registeredRefs = result.candidates.map((item) => item.credential_ref).filter(Boolean);
      $('credential-refs').value = registeredRefs.join(',');
    }
    $('setup-output').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('setup-output').textContent = `Inspection failed: ${error.message}`;
  }
});

$('setup-bind').addEventListener('click', async () => {
  try {
    const refs = $('credential-refs').value.split(',').map((v) => v.trim()).filter(Boolean);
    const result = await api('/setup/bind', {
      method: 'POST',
      body: JSON.stringify({
        credentialRefs: refs,
        sourceRef: $('setup-source').value.trim(),
        requestId: randomUUID(),
      }),
    });
    $('setup-output').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('setup-output').textContent = `Binding failed: ${error.message}`;
  }
});

$('refresh').addEventListener('click', () => refresh().catch((error) => {
  status.textContent = `Refresh failed: ${error.message}`;
}));

$('retain').addEventListener('click', async () => {
  try {
    const result = await api('/policies', {
      method: 'POST',
      body: JSON.stringify({
        scopeId: activeScope,
        payload: $('candidate').value,
        sourceRef: $('candidate-source').value.trim(),
      }),
    });
    $('candidate-result').textContent = JSON.stringify(result, null, 2);
    if (result.subject_id) $('target-subject').value = result.subject_id;
  } catch (error) {
    $('candidate-result').textContent = `Retention failed: ${error.message}`;
  }
});

async function decide(action) {
  const result = await api('/decision', {
    method: 'POST',
    body: JSON.stringify({
      scopeId: activeScope,
      action,
      targetSubjectId: $('target-subject').value.trim(),
      expectedCurrentTransitionId: $('expected-transition').value.trim(),
      explanation: $('explanation').value,
      requestId: randomUUID(),
    }),
  });
  $('candidate-result').textContent = JSON.stringify(result, null, 2);
  await refresh();
}
$('accept').addEventListener('click', () => decide('accept').catch((error) => {
  $('candidate-result').textContent = `Decision failed: ${error.message}`;
}));
$('decline').addEventListener('click', () => decide('decline').catch((error) => {
  $('candidate-result').textContent = `Decision failed: ${error.message}`;
}));

$('withdraw').addEventListener('click', async () => {
  try {
    const result = await api('/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        scopeId: activeScope,
        decisionId: $('withdraw-decision').value.trim(),
        requestId: randomUUID(),
      }),
    });
    $('candidate-result').textContent = JSON.stringify(result, null, 2);
    await refresh();
  } catch (error) {
    $('candidate-result').textContent = `Withdrawal failed: ${error.message}`;
  }
});

$('recover').addEventListener('click', async () => {
  try {
    const requestId = $('recover-request').value.trim();
    const result = await api(`/recover?scope=${encodeURIComponent(activeScope)}&request=${encodeURIComponent(requestId)}`);
    $('recovery-result').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    $('recovery-result').textContent = `Recovery failed: ${error.message}`;
  }
});

$('logout').addEventListener('click', async () => {
  try {
    await api('/logout', { method: 'POST', body: '{}' });
  } finally {
    csrf = '';
    $('governance').hidden = true;
    status.textContent = 'Logged out.';
  }
});
