STATUS: BUILD 6 M2 METABOLIZED — BOOTSTRAP EXECUTION LEARNINGS CLOSED
DISPOSITION: EVIDENCE / LEARNING RECORD
DATE: 2026-09-09 America/Phoenix
AUTHORITY: Levi instruction after independently verified M2 completion: "Metabolize then open Sense for the next action"

# BUILD 6 M2 — Metabolize

The focal episode is the live transition from a bound but inactive BUILD 6 scope to one operative P0/H governance state with bootstrap exhausted. The controlling execution evidence is `021-build-6-m2-complete.md`. This pass does not create another effect, change P0/H/remit, alter executor privileges, accept P1, or close BUILD 6.

## Expected versus observed

| Obligation | Observation and disposition |
|---|---|
| Consume exactly one prior committed genesis grant | One transition was created from the exact retained decision/request; exact retry cold-recovered the same result. COMPLETE. |
| Activate exact P0, designate H/remit, exhaust bootstrap atomically | The sole transition carries those three obligations in order and is the scope current pointer. COMPLETE. |
| Preserve authority/custody separation | Human installer custody provisioned only the restricted executor; executor could not issue human decisions or write governance tables directly. OBSERVED. |
| Treat unknown outcome as recovery problem, not permission for another effect | The first live attempt stopped before database contact; canonical reconstruction established zero effects before retry. The successful run then cold-recovered before claiming PASS. OBSERVED. |
| Keep secrets outside chat, hosted runtime and Git | Installer URI and executor credential were not emitted. The private executor record remained local and was subsequently hidden from Git status through the checkout-local exclude. COMPLETE after local hygiene repair. |
| Keep hosted human service independent of M2 executor custody | Production `ecb-human` remained READY and healthy; M2 helpers stayed excluded from Vercel uploads. OBSERVED. |

## What reality changed in our understanding

The architecture's authority distinctions survived contact with reality. A committed decision, a technical credential, an execution attempt, an acknowledgement, and an independently reconstructed transition remained separate facts. The strongest confirmation was not the happy-path PASS but the failed first attempt: because the system retained exact request identity and required reconstruction before retry, a local input failure did not become a second-grant ambiguity.

The live run also exposed avoidable operator friction that the mechanism tests did not capture. The separately delivered `.command` launcher was not present on the Mac, while the repo-native `m2-custody.mjs` already supplied the complete bounded behavior. The machine's default Node was 20 while the helper was qualified for Node 24. The private recovery file became visible as an untracked Git file until a worktree-aware local exclude was added. None of these invalidated M2, but all consumed human attention at exactly the seam intended to be low-friction.

The Supabase JIT Session-pooler syntax mismatch provided a second implementation lesson: a strict boundary can be correct in purpose and still reject the provider's current canonical representation. The narrow repair preserved strict target validation while admitting the documented form. Boundary strictness therefore has to distinguish semantic restriction from accidental syntax fossilization.

## Durable learning — bounded promotion

No new architectural primitive, invariant, ADR, state class, or universal recovery mechanism is earned by this episode. The core structural lessons were already present in the BUILD 6 design and are strengthened by live evidence rather than newly invented here: exact request identity, recovery before retry, independent reconstruction, prior-commit authority, and custody not equaling mandate.

Carry the following as implementation guidance for later human-gated seams unless stronger evidence promotes them further:

1. Prefer one discoverable repo-native entry command over an externally delivered wrapper when both execute the same qualified behavior.
2. Check required local runtime/tool versions before the human reaches the authority or secret-entry gate; remediation should not be discovered mid-ceremony.
3. Establish secret-file exclusion or an outside-worktree custody location before creating retained private material, not after Git reports it.
4. Human-facing input rejection should identify the structural reason without exposing the input or database internals.
5. Do not merge operator-convenience diagnostics or local rescue edits merely because they helped during recovery; they remain evidence until independently justified and qualified.

These are operational carry-forwards, not permission to refactor completed M2. The earlier local input-diagnostic edits remain preserved outside the accepted branch and gain no authority from this Metabolize pass.

## FCA reflection at this episode's scope

Freedom increased because the live route could recover from missing wrappers, a runtime mismatch and an initial parser defect without reopening M1 or manufacturing a new governance grant. Control held because every authority-bearing effect remained pinned to exact prior state and a restricted executor. Awareness improved because canonical reconstruction, cold recovery and explicit secret-hygiene checks exposed the difference between successful governance state and merely successful local tooling.

This is an episode-level reflection, not a numerical FCA assessment or a new governance rule.

## Close Metabolize → open next Sense

M2 is learned and closed. Do not reopen it for cleanup or polish. The next released BUILD 6 behavior is ordinary succession, but the release package explicitly leaves the first P1 as a proposed specimen until an exact human decision is made. The correct continuation is therefore a new Sense pass over the next bounded action, not an automatic P1 acceptance prompt.

Sense must determine the minimum preparation and human gate needed to exercise one lawful ordinary succession under operative P0/H, including how the exact candidate is fixed, how the human reviews it through the protected session, how a committed decision is executed without widening credential custody, and what evidence is sufficient before BUILD 6 can be considered for closure.
