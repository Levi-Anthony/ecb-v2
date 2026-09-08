STATUS: PASS — DISPOSABLE PG17 MECHANISM QUALIFICATION ONLY
DISPOSITION: QUALIFICATION_EVIDENCE / NON-AUTHORITATIVE
DATE: 2026-09-08 UTC
BUILD: BUILD 6 — Governance Bootstrap

# BUILD 6 disposable PostgreSQL 17 qualification

This record preserves the completed disposable qualification observation authorized by `docs/build-shape/008-build-6-move-release.md`. It does not activate governance, designate a live credential, authorize deployment, close BUILD 6, or open BUILD 7.

## Exact run

- GitHub Actions workflow: `BUILD 6 disposable PG17 qualification`
- workflow run: `34186534470`
- job: `101935896034`
- qualification PR: `#12`, closed without merge
- BUILD 6 base under test: `ad371c853e6f3945c9862ced55799522b8ba0732`
- trigger-only child: `e2edc97b22a836eafc261836f71efcac3d3f67d4`
- GitHub synthetic PR merge ref executed by Actions: `cebd2ed4b7d9b53fdea53780365857f156058b2c`
- PostgreSQL: `17.10`
- pgvector: `0.8.2`
- result: `PASS_WITH_REQUIRED_LIVE_OBSERVATIONS_UNRUN`
- tests: `11 passed / 0 failed`
- uploaded evidence artifact: `10040691977`
- uploaded artifact ZIP SHA-256: `8630344618466a3cb6d6b99b8091bebcf7cc3fe8902cb84a590d3590ad1134eb`

The qualification runner refused the canonical project reference and required `BUILD6_DISPOSABLE=YES`. No canonical `ecb-v2-brain` mutation occurred.

## Exact committed BUILD 6 migration set exercised

The final run performed no runtime migration normalization or rewrite. It reconstructed the accepted BUILD 0→5B predecessor, then applied the committed ordered BUILD 6 migration set:

| Order | Migration | SHA-256 |
|---|---|---|
| 1 | `20260908013000_build_6_governance_bootstrap.sql` | `e2010025a6de85842c25b740ec2e0af6e15db801e8cc8da67b0f92780bd91bc6` |
| 2 | `20260908013100_build_6_setup_recovery_surface.sql` | `fd2ec228b8367012ae76a2473eaab3d1d74191949d6b0e1a26a135e40e3e0f6b` |
| 3 | `20260908013200_build_6_decision_result_surface.sql` | `508947e591eccb2e1c34177eab5579a8e78dc348e04e62a6cfce8b92c0b62c09` |
| 4 | `20260908013300_build_6_native_extension_usage.sql` | `32259de1d65201e5655cf6ff3dd316cf8d9314052306c17d780c8890870d094b` |
| 5 | `20260908013400_build_6_referent_registry_integration.sql` | `890b89082701213daa575c194147deaf8d187b01584f0b258e27dda53e561924` |
| 6 | `20260908013500_build_6_registration_result_ambiguity.sql` | `70f2a658a625beb36f7a86dd216e8369a53876de6ef44b3b908a6c130f7e3f5e` |

Qualification plumbing was also hashed in the receipt:

- `tests/build-6/ci-pg17-prepare.sh`: `5d4f01ba519b3f9a9aa03664dea23d4bbdfe2923a1857f5baa4b5d7ae047f948`
- `tests/build-6/ci-pg17-install-candidate.sh`: `d9c446d1a427fc97f632260e5ff003ee741e13631eb81d5306bb2537b6151bc3`

## Passing discrimination

All eleven executable PG17 tests passed:

1. accepted predecessor and exact privilege surface;
2. exact policy decoder accepts P0/P1 profile and rejects normalization traps;
3. interrupted setup exposes inert candidate Referent IDs without designating H;
4. same top-level transaction cannot bind genesis decision and consume it, while a prior commit can;
5. genesis retry/idempotency and recovery distinguish prior success, request conflict and scope-locked absence;
6. P0 permits exact P1 without explanation, P1 then requires explanation, and stale predecessor rejects;
7. withdrawal prevents a pending authorization from executing;
8. logout blocks new human admissions without revoking a previously committed grant;
9. a fresh client reconstructs operative basis without conversation state;
10. a real scope lock serializes withdrawal behind execution and rollback lets withdrawal win;
11. a real scope lock serializes withdrawal behind execution and committed execution wins truthfully.

The receipt also reports PASS for exact P0 bytes, exact committed bootstrap bytes, no runtime migration rewrite, required governance surface, human-service static custody boundary, executor human-exclusion boundary, installer secret custody, canonical-target refusal, and the PG17 governance suite.

## Still unrun

The qualification receipt deliberately leaves these observations unresolved:

- physical iPhone passkey ceremony;
- physical Mac passkey ceremony;
- real backup or second-authenticator loss coverage;
- qualified HTTPS deployment at `ecos.effortlessconnection.com`;
- ordinary operating-agent actual tool and credential exclusion;
- canonical M2 activation;
- canonical restart reconstruction;
- first human P1 decision;
- human Metabolize and BUILD 6 closure.

These are not implied by the disposable PASS.

## Packaging boundary

The executable installation evidence now points to an exact committed six-file ordered migration set. The original base migration has been replaced by the exact normalized bytes that passed the earlier disposable candidate run, eliminating runtime-generated migration bytes. The narrow correction files remain separate to preserve construction provenance.

This record does **not** silently disposition whether final canonical installation must be collapsed to one migration file. If that packaging question remains material at the live-installation freeze, it must be resolved there without changing the already-qualified semantics invisibly.

## Boundary after this observation

Disposable qualification is complete. Qualified deployment/enrollment is the next staged effect in the released plan, but it is not authorized by this evidence record itself. Canonical mutation, live H binding, M2, P1, Metabolize and BUILD 7 remain untouched.
