STATUS: ACCEPTED 2026-09-03
DISPOSITION: DECISION_RECORD

# ADR-002 — BUILD 0 physical substrate

## CONTEXT

ADR-001 selected the first client, deployment host, technical access shape, and native embedding route. A live deployed probe then verified the model output required to freeze the first persistent schema.

## LOCAL DECISION

BUILD 0 uses:

- Supabase project `ecb-v2-brain` (`vezxivrvhakclxuvxzso`) as the one canonical store;
- Supabase Postgres 17 with the project-default pgvector extension;
- one `public.thoughts` table containing durable UUID identity, non-empty content, non-empty source, timezone-aware capture time, a non-null `vector(384)`, and the exact embedding model identity;
- Supabase Edge Functions as the one remote runtime;
- native `gte-small` inference with mean pooling and normalization for both capture and search;
- Codex Streamable HTTP MCP with a bearer token held outside the repository;
- service-role-only table and similarity-function access, with RLS enabled and no client policies.

The migration does not pin an extension version because current Supabase behavior installs the project default and ignores explicit version clauses.

## WHY REQUIRED NOW

The vector dimension, database integration, runtime, and privilege boundary must be fixed before the first migration and MCP implementation can be judged by Golden Trace 01.

## ALTERNATIVES CONSIDERED

- The disconnected Neon resource remains preserved evidence, not an active store.
- Vercel Fluid Functions remain the first runtime fallback if the accepted Supabase door meets an ADR-001 reopening condition.
- External embedding APIs remain deferred because native inference passed the live probe without another credential, billable route, or control plane.
- A vector index is omitted until data volume or measured query behavior earns it.

## INVARIANTS AFFECTED

- one persistent brain;
- atomic evidence first;
- semantic retrieval remains fundamental;
- evidence ≠ assertion;
- thought ≠ promoted object;
- capability ≠ warrant or authorization.

## STANDING / AUTHORITY

Licensed by the BUILD 0 physical activation gate, the human's 2026-09-03 acceptance of ADR-001's exact bundle, and the live verification receipt recorded there.

## REVERSIBILITY

The Edge Function and technical key can be rotated or replaced without moving canonical records. Changing the embedding model or dimension requires an explicit migration and deliberate re-embedding; existing vectors may not be silently reinterpreted.

## REOPENING CONDITION

Reopen if Golden Trace 01 cannot pass with one complete-row insert and exact vector scan, if the accepted Edge runtime meets an ADR-001 reopening condition, or if measured data volume earns a vector index. Do not add a second store or door as a fallback.
