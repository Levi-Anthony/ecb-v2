# Installation Receipt — ecb-ingestion-v3-proof

Status: INSTALLED / EXPERIMENTAL STANDING

Installed substrate: Supabase Edge Functions
Supabase project: lqbrzoicorehwidkdhoi
Function: ecb-ingestion-v3-proof
Installed version: 6
Function deployment hash (ezbr_sha256): 7cb3c28dcd3059264fbdeb4162616a863fc6b6584f714a5dbd5b2a38fcb39af5

Canonical source commit: e28ac522d51c9f6a2bafff4e6457cd7f0b55c5a5
Canonical proof source: server/installation/ecb-ingestion-v3-proof/proof.ts
Canonical grammar source: server/ingestion-experiment/grammar-runtime-v0.1.json
Canonical request profile: server/ingestion-experiment/request-profile-v3.json

Installed runtime property: grammar and request profile are materialized into the function deployment package. The function does not fetch either asset from GitHub at invocation time.

Operational standing: active; GET fixed-case proof endpoint; no canonical database writes; semantic_standing=UNASSESSED; canonical_effect=NONE.

Verification state:
- Deployment existence: established by Supabase deployment response.
- Installed identity: established by function name/version and deployment hash.
- Source correspondence: established by canonical source commit and source paths above.
- Runtime GitHub independence: established by source inspection of the installed proof package; no runtime GitHub fetch remains.
- Semantic qualification: NOT YET ESTABLISHED for this installed version. The next evidence Move is to execute the fixed Jennifer fixtures against version 6 and retain the raw responses.

This receipt records the installed state; it does not claim semantic qualification or canonical promotion.
