# ECO-218 / PR #114 — separate-agent adversarial review receipt

Observed and rerun: **2026-10-16T10:51:19Z**. Reviewer: **`/root/independent_auth_review`**.

## Verdict and standing

**Corrected candidate passes this bounded technical review. Recommend integration after the applicable repository checks and release authorization. This receipt does not authorize merge or deployment and does not establish mobile product acceptance.** No demonstrated blocking implementation defect remains in the final bytes listed below.

The reviewer independently recovered PR #114 at original head `04833bbe274d7e5786bc297094fa7f4c17e0ff74`, its full consent and personal handlers, relevant architecture, repository worker instructions, and ECO-218's recorded iPhone observations. The reviewer did not author or edit implementation. The reviewer authored `tests/eco-218/session-adversarial.test.ts`, supplied failing findings to the executor, inspected corrections, and executed tests separately.

This is a distinct agent evaluator using the **same platform/model environment and shared account/workspace** as the implementation executor. It is not an unrelated human audit, external organizational review, or GitHub approval. No GitHub approval was submitted by this reviewer.

## Independently reproduced baseline failures

These probes executed the exact original handler or generated inline script, using constructed provider/DOM ports and no network calls. Original source was anchored to `04833bbe274d7e5786bc297094fa7f4c17e0ff74`; TypeScript handler probes used Node's type stripping, replacing imports with explicit test ports.

1. **Delayed refresh denial erased newer credentials.** Two `/oauth/context` requests carried the same old cookie pair. One constructed `setSession` result returned a new access/refresh pair and produced HTTP 200 plus new cookies. A delayed sibling returned `{status:400, code:'refresh_token_already_used'}` and produced HTTP 401 plus `Max-Age=0`. Delivered last, that denial erased the successful pair. Probe: `/tmp/eco218-independent-session-probe.mjs`; observed `new_pair_written:true, delayed_race_erases_new_pair:true`.
2. **Personal authorization discarded rotated credentials after later outage.** Constructed `setSession` succeeded with a rotated pair, `getUser` confirmed the same user, and enrollment RPC returned an error. The exact personal handler returned HTTP 503 without `Set-Cookie`; no work port ran. Probe: `/tmp/eco218-independent-personal-probe.mjs`; observed `new_refresh_pair_dropped:true, work_ports_called:0`.
3. **Transient callback failure lost replay opportunity.** The exact consent inline script received constructed fragment credentials and a rejected session POST. It erased the fragment before acknowledgement, displayed the failure, and offered no session retry. Reload could no longer establish that callback. Probe: `/tmp/eco218-independent-callback-probe.mjs`; observed `fragment_erased:true, retry_control_present:false`.

These are demonstrated source defects, **not proof of the cause of the Principal's particular Safari session disappearance**. ECO-218's recorded earlier signed-in Safari encounter, later `signed_in:false`, and generic email error do not distinguish that cause or prove email throttling. The reviewer read those issue records; the corresponding primary screenshots were not directly inspected by this reviewer.

## Corrections independently challenged

Ordinary requests now authenticate without refresh or cookie writes; explicit recovery serializes supported same-profile browser writers and rechecks current cookies under the lock. Failed request responses do not erase a sibling's newer pair. Personal enrollment remains server enforced before work ports. Callback retry retains its credential pair in the current page's closure while removing it from the URL.

During review the evaluator also found malformed-token errors misreported as provider outages, an unlocked email-code cookie writer, a possible recursive logout lock, and masked unsupported-browser guidance. The executor corrected these. The final provider adapter matches the pinned Supabase SDK's GET authorization, POST consent, and DELETE grant endpoint shapes, uses the existing bearer, retains callback-policy checks, and avoids SDK session helpers that can implicitly refresh. Explicit logout uses the existing SDK operation without refreshing, clears local cookies, and distinguishes unconfirmed native revocation. The executor subsequently identified a terminal-rejection usability issue: permanent provider rejection offered only retry. The reviewed correction emits a typed terminal disposition without clearing cookies, rechecks current context under the browser lock before offering reauthentication, and leaves transient outages retryable. The reviewer independently tested that correction; no actual email request is initiated.

## Final independent execution

After the executor's formatting-only final normalization, this reviewer ran:

```text
npm run test:oauth
33 tests; 33 pass; 0 fail; 0 skipped

npm run test:personal
10 tests; 10 pass; 0 fail; 0 skipped
```

The 33 OAuth tests include the reviewer's **15 independently authored tests**: no ordinary-read rotation; expiry before provider/work dispatch; rejection of expired OAuth client sessions at the human door; remote subject mismatch; provider outage; malformed JWT; two simulated same-profile tabs sharing one refresh; unsupported locking without unsafe fallback; outage during lock recheck; email-code writer locking; no recursive locked logout; transient callback retry without another email request; known terminal refresh rejection without cookie erasure; post-rejection context recheck that accepts a newer sibling session and preserves transient outage standing; and both generated human surfaces exposing the existing sign-in control only on typed terminal rejection, without sending email. This reviewer also independently typechecked its test file successfully with the project's NodeNext/ES2022 options.

The reviewer read the final `session-routes.test.ts`: it additionally exercises the actual pinned SDK with fake HTTP transport, refresh and bearer binding, safe expiry bootstrap, enrollment rejection, provider consent/approve/deny/revoke without implicit refresh, logout failure reporting, cross-origin rejection, and refresh subject/client boundaries.

## Exact reviewed bytes

| File | SHA-256 |
| --- | --- |
| `server/browser-session.ts` | `da63ff50172fd8ba5cf42aa1e672e4c92b84735005f06421e0b860ca0ae21d7f` |
| `server/oauth-consent.ts` | `4c25a9f9cbb997a9f1f65a0f061cedea4e68b12d5ca7a3aa0c91647555623456` |
| `server/personal-app.ts` | `ca0d7a28dae1bf9b7155067dc5c7b67ef306c33894dff2e139d4dc7de6733b32` |
| `server/personal-app-ui.ts` | `08fac93bcc7fd8a741f16823ce2de2114c1fa9fc3e50878a2da8973e039d4e70` |
| `tests/eco-218/oauth.test.ts` | `fe1b9b398674984c85dea6dc9b23b96958b3752b02e98d1eadf07b9ee3d15667` |
| `tests/eco-218/session-adversarial.test.ts` | `3aa47ee9758e44c1d42a8b0ea7c7c482d1d6087949eaad88c1c3933ee9b6111e` |
| `tests/eco-218/session-routes.test.ts` | `71d4fe41ed8449e17f4b52ba9ae1914e2822b5be091dc782ec4f43cb29c90fca` |
| `tests/personal-app.test.ts` | `3ca3c04012350d486addced2dccb95b5a602849edbab33d716defc29f9189629` |

## Remaining dependencies and evidence limits

- No actual iPhone/Safari/WebView execution occurred. Browser tests use Node VM DOM/lock ports; no installed Playwright browser binary was available for this review episode.
- The executor reported denied hosted-provider-log access. This reviewer did not obtain hosted Auth logs, delivery diagnostics, configuration inspection, or a real provider refresh lifecycle. Email throttling remains unproven.
- Web Locks coordinate cooperative tabs of the same origin within one browser profile. Distinct Safari/WebView/profile cookie stores are separate; this repair does not transfer sessions across them.
- Callback credentials survive retry only while the current page remains alive. Page destruction/reload loses its in-memory pending callback pair; no durable credential storage was introduced.
- No deployed-source equality or production behavior is established by these tests. Real mobile continuity and the authorized work-view → capture → readback → resume acceptance remain open.

**Next executable action:** bind the corrected bytes and this receipt to PR #114, complete the applicable checks, and record the concrete integration/release decision in PR #114 and ECO-218. Merge/deployment requires its applicable authorization; no repeated Principal email authentication, enrollment, or architecture explanation is requested by this review.

Signed: **`/root/independent_auth_review` — agent technical reviewer, 2026-10-16T10:51:19Z**.
