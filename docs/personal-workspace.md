# Current personal-workspace reconciliation — 16 October 2026

Standing: reviewed source candidate on existing PR #109; no deployment or actual Principal-use qualification for these repairs. Governing product commission is the 13-Oct source recovered through native `get_current_commission`; autonomous continuation is BRAIN `b1890f5d-01eb-41a9-b351-0da330e3b14c`. Ongoing useful personal operation governs this bounded repair: capture → qualified context → authorized service effect → verification → resumption.

## Current candidate

Use the existing `/api/personal` first-party session and Principal enrollment boundary. This branch integrates current main and withdraws the parallel `/app`/`workspace` credential-cookie implementation from its proposed merge. The original candidate source/history remains recoverable at `38f4f31e384de08db603b51188b832a1c06d3ad1`; no deployed account, credential or data was removed. Do not merge the historical identity implementation over the released personal door.

The candidate repairs two existing source defects:

- An unresolved raw capture's exact serialized POST and stable operation UUID are roundtrip-preserved in tab session storage **before** dispatch. Reload restores a pending operation for explicit review/consent, never automatic capture. Edits/new occurrences cannot replace unresolved work. Unavailable/corrupt/changed storage fails before sending, and only a matching verified operation/Thought receipt clears it. Storage contains note text, no credentials; it can be lost on tab closure/browser loss/clearing and is readable by same-origin scripts. This is a bounded interruption recovery mechanism, not durable backup or cross-device continuity.
- Personal work projection preserves native `scope_decisions`, `open_children`, `obligations`, `routed_proposals`, `events`, `zero_balance`, next action and observer health instead of dropping them under invented field names. Authenticated `action=load&cycle_id=UUID` reads the same guarded root/child records, validates/canonicalizes the UUID and rejects mismatched returned identity. The UI displays required child work, opens its exact cycle, returns to containing work, discloses proof/next action and labels retained snapshots after failed refresh. Later responses from an older selection cannot replace a newer selection. Composition remains local view state and is cleared on cycle changes.

Capture verification now checks returned operation identity, valid Thought identity and exact independent readback identity/content/source. No workflow commands, lifecycle transitions, native result payment, reference Artifact saving, schema migration or new authentication is exposed. PR #109's Thought→Artifact save/readback/reopen remains a separately scoped candidate to selectively consume through this existing personal identity after current reentry/inspection repair qualifies.

## Verification and next receiving effect

Run `npm run test:personal` and `npm run typecheck:personal`, then affected existing OAuth/session, MCP and workflow regressions. The personal suite executes the complete embedded browser script with DOM/storage/network fixtures across reload, 401/session recovery, uncertain responses, malformed/mismatched receipts and root/child navigation. Fixtures are mechanical verification, not hosted browser/Principal success. A distinct same-platform reviewer receipt accompanies the candidate.

This branch suppresses its automatic Vercel Git deployment. Preserve the existing production suppression. After applicable exact-head source integration/release authority, verify deployment/source equality and the authenticated browser using its existing session. Actual acceptance: uncertain capture reload retains exact UUID/request, requires review and resumes verified custody; child/root navigation and proof match current native snapshots without changing controller state. Preserve known session/provider lifecycle and native debt. If release/physical observation is unavailable, retain the reviewable package and continue safe independent work. No repeat email/enrollment or speculative settings action is due.

Managed Edge inspection remains separate PR #108 `e0d87c1`: live source/grants and actual managed-client root/child inspection are still pending, despite current-commission recovery and green CI. Current native version/debt/observer cannot be inferred from fixtures or historical 22-entry receipts. No acceptance proposal is submitted here.

---

## Historical PR #109 candidate — superseded as an integration instruction

The following text records the original `38f4f31` candidate. Its `/app` session/auth implementation and Artifact-save feature are historical source evidence; the current merge candidate above does not expose them.

# Personal workspace: Greenfield reference journey

Standing: implemented product slice under the current product commission; not whole-system or actual Principal-use acceptance.

`/app` is the mobile-first personal workspace in the existing ecb-v2 Node/Hono service. It reads current source-bound commission context and the native workflow account, including required child work. It captures exact note text, asks for explicit review, saves an immutable reference in Greenfield, verifies native readback and reopens from record-ID links. The real service action is Greenfield reference preservation; email, calendar and other service execution are not implemented by this slice. Native workflow transitions remain on their existing commissioned path.

The existing ECB access credential unlocks a one-hour AES-256-GCM encrypted, HttpOnly, Secure, SameSite=Strict session. A domain-separated key is derived from the existing server-only ordinary runtime secret. Every API request decrypts the credential server-side and checks the current authentication/grant policy. No credential or session token is stored in browser storage or a URL. Existing recover and preserve capabilities are checked independently. This does not enroll an email user or alter credential settings. Users with a recover-only credential can view existing work but cannot save.

The UI sends same-origin JSON with a required custom header. Bodies are byte-bounded before parsing, operations use strict schemas, the page uses a nonce CSP/no-store headers, and private records are rendered through textContent. Notes are attributed to the authenticated client identity. Reopening a reference checks its subject, original Thought, exact content and SHA-256; retrieval does not grant factual standing.

A pending save keeps its original operation UUID and payload in sessionStorage until verified. This is tab-scoped retry material, which can contain the submitted note, not credential storage. Reload recovers the pending action; successful verification or explicit Lock clears it. After an unknown outcome, retry the exact action. The native database owns operation replay/conflict handling. Completed references resume from an immutable Artifact ID, with fresh native source checks. Closing a tab before a pending operation is verified can discard retry material; keep it open until its outcome is recovered.

Lock clears the browser cookie, pending requests and visible note. The encrypted session has a fixed one-hour lifetime; copied cookies remain replayable until expiry, while revoking the underlying credential invalidates them on the next check. No cross-device logout or session-management account feature is claimed.

The new route uses the existing guarded `ecb11_capture_thought`, `eco140_fetch_thought`, `ecb12_create_artifact`, `ecb12_fetch_artifact` and `ecb_workflow_inspect` RPCs. Capture is raw custody only; this route invokes no semantic worker, provider, embedding repair or workflow command. No schema changes, service-role runtime credential, BUILD 6 activation or Ground Path release is part of the change.

Verification: `npm run test:workspace` and `npm run typecheck:workspace`, plus existing MCP/workflow ingress regressions. Test fixtures cover lost acknowledgement, exact bytes, explicit confirmation, current credential revocation, forged cookies, foreign origins, reader-write rejection and source/subject mismatch. Actual native browser use and hosted deployment must be recorded separately from fixtures. The registered viable-system account retains its existing debt; this document does not pay it.
