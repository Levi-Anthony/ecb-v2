STATUS: HOSTED VERIFIER READY — LIVE M1 HUMAN CUSTODY PENDING
DISPOSITION: VERIFIED READINESS CHECKPOINT; NOT M1 COMPLETION
DATE: 2026-09-09

# Hosted verifier and human entrance restored

The remaining 503 was caused by a credential handoff defect, not missing CA trust.
Vercel's HUMAN_DATABASE_URL metadata still had identical createdAt/updatedAt
1788948662009 after helper runs that reported deployment. Inspection of installed
Vercel CLI 59.11.7 showed that env update without --yes can prompt, cancel, and
return exit code zero. The helper hid the output and mistook this for a completed
update. Vercel consequently retained a superseded verifier password.

Source `ea8fb780be740cb244037cb998b428cfb7b0a2b1` adds --yes and --sensitive to
credential publication and requires an explicit Added/Updated acknowledgement,
rejecting cancellation/action-required output. Fourteen affected Node 24 tests
passed, including a zero-exit cancellation regression. The private retained
verifier password was reused, not rotated. No installer URI/PAT was read or stored
by the runtime repair. A fresh connection through the actual runtime initializer
passed strict TLS and restricted-role qualification. Vercel acknowledged the
update; metadata updatedAt advanced to 1788975908197, type remained sensitive,
and the target remained production.

## Verified deployment

- Branch: reconcile/build-6-tested-move.
- Runtime source: ea8fb780be740cb244037cb998b428cfb7b0a2b1.
- Deployment: dpl_8AGdzh16q2djd93mtubNpt38W5HF, production READY.
- Project: ecb-human / prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4.
- Team: team_wueYGTZ3nxHz1WhMg8UE9gSy.
- Canonical alias: https://ecos.effortlessconnection.com.
- /health: 200 with exact service=ecb-human and
  governance_activation=not_implied_by_service_health.
- / and /intervene: 200, byte-identical to the retained function-only entrance HTML.
- /webauthn.js: 200.
- Certificate and hostname verification remain enabled with the retained Supabase CA.

Independent canonical read after deployment: scopes=0, credentials=0, sessions=0,
decisions=0, transitions=0. No canonical commission, binding or M2 occurred.

## Next custody step

Use the current clean /private/tmp/ecb-build6-live-bind checkout and the full
live-bind.mjs helper under Node 24 with the existing local NODE_EXTRA_CA_CERTS
setting. Privately supply the valid installer URI. The helper reuses the retained
verifier credential and now requires an acknowledged Vercel update. After health
and entrance verification it presents the actual OPEN package and native protected
binding gates. Do not expose secret inputs or recovery contents.

After M1 completes, independently verify binding non-null, exactly one genesis
decision, current_transition null, transitions zero, exact credential count,
private recovery permissions, consumed setup capability, restricted runtime
inventory and correct hosted identity. Persist the final M1 receipt/checkout.
Do not prepare or execute M2. This readiness checkpoint does not claim M1 completion.
