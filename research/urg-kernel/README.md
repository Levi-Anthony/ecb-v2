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
