# Atomic Thought disclosure instrument

Experimental operation `disclose_atomic_thought`, deployed as `ecb-ingestion-experiment` on existing
legacy Supabase project `lqbrzoicorehwidkdhoi`. Uses its installed OpenRouter secret and
`openai/gpt-4o-mini`. No new vendor, database mutation or modification to ordinary capture.
This is an HTTP-callable instrument, not a registered tool in the current ECB MCP inventory.

See [the results](../../research/ingestion-probe/RESULT.md) before using its annotations. HTTP 200
means source correspondence and shape passed; semantic standing remains UNASSESSED. The model
can omit subjects or attach an unsupported interpretation to a real excerpt. No returned local
handle is a provisional canonical Referent UUID.

## Bounded access and reuse

For a follow-up within existing authority, qualify the next inputs/comparison/stop, then generate
a fresh expiring capability outside the repository. This is operational commissioning, not a
requirement to ask the Principal again when the active commission already covers the run.

```sh
python server/ingestion-experiment/commission.py --capability-file /secure/path/disclosure.key
```

Deploy `index.ts`, `core.mjs`, `request-profile.json`, and ignored `commission.local.json` using
Supabase `deploy_edge_function`, project/name above, entrypoint `index.ts`, `verify_jwt=false`.
Custom bearer authentication is implemented in `core.mjs`; never deploy an unauthenticated variant.
The bearer value stays in the local 0600 file; only its hash and expiration are deployed.
Recommissioning replaces the previous accepted hash. Expiry returns 410. Do not export the existing
OpenRouter secret. Shared hosting retains its normal environment, so source non-use of database
credentials is not provider-level capability confinement.

```sh
python research/ingestion-probe/call_tool.py --wrong-key
python research/ingestion-probe/call_tool.py --case base --capability-file /secure/path/disclosure.key
```

Or POST JSON `{ "text": "...", "source": "..." }` with `Authorization: Bearer <capability>` to
`https://lqbrzoicorehwidkdhoi.supabase.co/functions/v1/ecb-ingestion-experiment`.
Never put bearer values in receipts or command-line arguments. Input limit: 8000 characters,
16 KiB encoded request body, source 500 characters. One provider request, 2200 maximum output tokens,
45-second timeout, no automatic retry or model fallback. The expiring access window is not a global
spend/request-count limiter. Choose a bounded number of calls in each commission.

Receipt files are never overwritten. Preserve raw text, source, request/input hashes, provider/model,
usage, annotation, rejection reason, and separate semantic assessment. The checked-in profile is
revision 2; the baseline is retained under `research/ingestion-probe/evidence/request-profile-v1.json`.
The response operation version 1 identifies the unchanged handler contract, not deployment revision.

## Checks

```sh
node --test server/ingestion-experiment/core.test.mjs
python -m unittest discover -s research/ingestion-probe -p 'test_*.py'
```

These qualify the instrument's local boundaries, not the extractor's general semantic reliability.
