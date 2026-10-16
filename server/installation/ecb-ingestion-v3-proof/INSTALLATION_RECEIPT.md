# Installation Receipt — ecb-ingestion-v3-proof

Status: INSTALLED / EXPERIMENTAL STANDING

Installed substrate: Supabase Edge Functions
Supabase project: lqbrzoicorehwidkdhoi
Function: ecb-ingestion-v3-proof
Installed version: 7
Function deployment hash (ezbr_sha256): 78bd4b3960333a6ba55ebeef3a4baeddade22eb4856d88c7ce5123e556e6ea28

Canonical source commit: 121d1d203fc3030b0194a57cc4bb3d688136827c
Canonical proof source: server/installation/ecb-ingestion-v3-proof/proof.ts
Canonical grammar source: server/installation/ecb-ingestion-v3-proof/grammar-runtime-v0.1.json
Canonical request profile: server/installation/ecb-ingestion-v3-proof/request-profile-v3.json

Source projections: the package-local grammar/profile files are deployment projections of the corresponding grammar/profile definitions already qualified by the Register B workflow. They are materialized into the runtime package so runtime operation does not depend on GitHub availability.

Installed runtime property: grammar and request profile are materialized into the function deployment package. The function does not fetch either asset from GitHub at invocation time.

Operational standing: active; GET fixed-case proof endpoint; no canonical database writes; semantic_standing=UNASSESSED; canonical_effect=NONE.

Verification state:
- Deployment existence: established by Supabase deployment response.
- Installed identity: established by function name/version and deployment hash.
- Source correspondence: established by canonical source commit and source paths above.
- Runtime GitHub independence: established by source inspection of the installed proof package; no runtime GitHub fetch remains.
- Semantic qualification: NOT YET ESTABLISHED for this installed version. The next evidence Move is to execute the fixed Jennifer fixtures against version 7 and retain the raw responses.

This receipt records the installed state; it does not claim semantic qualification or canonical promotion.
