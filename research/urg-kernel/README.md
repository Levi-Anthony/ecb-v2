# URG Level + Quadrant Formal Kernel

**Current artifact:** Level + Quadrant Formal Contract v1.0  
**Owning issue:** ECO-221  
**Standing:** Register-B Shape contract under bounded Move qualification. Not a constitutional invariant amendment and not runtime enforcement.

Files:

- [Level-Quadrant-Formal-Contract-v1.0.md](./Level-Quadrant-Formal-Contract-v1.0.md) — semantic/formal contract frozen by ECO-221 Shape.
- [level-quadrant-fixtures-v1.0.json](./level-quadrant-fixtures-v1.0.json) — stipulated qualification fixtures and negative controls.
- [check_level_quadrant_contract.py](./check_level_quadrant_contract.py) — bounded structural checker over declared fields.

The checker does not infer what a referent or boundary really is. It does not classify natural language. It tests only the mechanically declared portion of the contract.

Upstream navigation: [ECO-220 invariant lattice](../formal-semantics/ECO-220-Invariant-Lattice-Index-v1.0.md).

Constitutional constraints: [docs/invariants.md](../../docs/invariants.md).


## Four Directional Pressures — ECO-222

**Current artifact:** [Directional-Pressures-Formal-Contract-v1.0.md](./Directional-Pressures-Formal-Contract-v1.0.md)

Qualification artifacts:
- [directional-pressure-fixtures-v1.0.json](./directional-pressure-fixtures-v1.0.json)
- [check_directional_pressure_contract.py](./check_directional_pressure_contract.py)

Standing: Register-B Shape contract under bounded Move qualification. The four directions are formalized as four partial, multi-label directional predicates with paired-but-nonexclusive structure. No universal scalar magnitude is assumed. Transcendence does not auto-promote Level standing; Direction does not determine Quadrant. A material nonfit returns `DIRECTION_UNCOVERED` rather than being force-fit.

## Current frontier after ECO-222

ECO-222 is CLOSED / PASS across Sense→Shape→Move→Metabolize. Level, Quadrant, and the four Directional Pressures now have installed Register-B formal contracts. The next dependency-aware URG axis frontier is **State**: define determinate/actualized configuration under declared scope while preserving distinction from observation, representation, Direction, boundary revision, Stage, and ECO-191 engagement-state bookkeeping.


## URG State — ECO-224

**Current artifact:** [State-Formal-Contract-v1.0.md](./State-Formal-Contract-v1.0.md)

Qualification artifacts:
- [state-fixtures-v1.0.json](./state-fixtures-v1.0.json)
- [check_state_contract.py](./check_state_contract.py)

Standing: Register-B Shape contract under bounded Move qualification. State is a basis-indexed claim about the actualized configuration of R, not observation, evidence, representation, transition, Direction, Stage, Level, or the ECO-191 engagement tuple. Cross-basis/frame comparison requires explicit crosswalks.
