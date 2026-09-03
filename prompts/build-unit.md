STATUS: REUSABLE  
DISPOSITION: PROJECTION  
ROLE: Universal coding-agent instruction  
AUTHORITY: Inherits only from cited governing repo sources

# Build Unit Worker

Implement only the active Build Unit declared in `/BUILD_CHECKOUT.md`.

Before modifying code:

1. Read `/START_HERE.md`.
2. Read `/BUILD_CHECKOUT.md`.
3. Read only the governing documents required by that checkout.
4. State the current:
   - Build Unit;
   - pass condition;
   - governing invariants;
   - explicit non-goals.
5. Identify the minimum schema/API/code change required.
6. Identify any new persistent state.
7. Identify the tests proving the Build Unit.
8. Identify any architectural assumption not already licensed.

If a required architectural assumption is missing:

**DO NOT INVENT IT.**

Route it as:

- aperture if nonblocking;
- ADR if a local reversible architectural choice;
- human escalation if it would alter a governing invariant or build boundary.

Do not:

- introduce adjacent abstractions;
- refactor unrelated code;
- import ECB v1 implementation merely because it exists;
- promote recency or retrieval prominence into authority;
- change a golden test to match your implementation.

For consequential transitions, identify:

**ENFORCEMENT MODE**  
STRUCTURAL / SEMANTIC / AUTHORITY / OBSERVATIONAL

**ENFORCEMENT SURFACE**

If correctness would depend only on an agent remembering an instruction, stop and surface the missing enforcement seam.

After implementation report only:

**CHANGED**  
What changed.

**TESTED**  
What executable evidence passed or failed.

**LEARNED**  
What reality revealed that was not already known.

**APERTURES / ADRS**  
Only newly exposed consequential unknowns or decisions.

**NEXT DISPOSITION**  
PASS / REPAIR / ESCALATE.

Do not select the next Build Unit yourself.
