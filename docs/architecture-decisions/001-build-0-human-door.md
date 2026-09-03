STATUS: PROPOSED
DISPOSITION: DECISION_RECORD

# ADR-001 — Supabase Edge Function as the BUILD 0 human door

## CONTEXT

BUILD 0 needs one remotely reachable, stateless MCP endpoint for `capture_thought`, `search`, and `fetch` against the canonical Supabase project `ecb-v2-brain` (`vezxivrvhakclxuvxzso`). The endpoint must preserve one brain, keep database privilege server-side, reject unauthorized access explicitly, and support Golden Trace 01 from two fresh client contexts.

Current evidence favors a single-platform path:

- canonical persistence is already provisioned on Supabase;
- OB1 demonstrates Streamable HTTP MCP on a Supabase Edge Function;
- the installed Codex CLI accepts a Streamable HTTP MCP URL and reads its bearer token from a named environment variable;
- Supabase Edge Functions provide built-in `gte-small` inference, producing normalized 384-dimensional embeddings without an external model API;
- Vercel AI Gateway is presently blocked by an unapproved billing prerequisite.

The built-in model is English-only and truncates inputs after 512 tokens. Those limits fit the frozen English Golden Trace and the intended atomic-thought seam, but they are not generalized ECB guarantees.

## LOCAL DECISION

Propose the following bounded BUILD 0 designation:

1. Use **Codex** as the first required human-door client.
2. Deploy exactly one **Supabase Edge Function** as the current MCP endpoint.
3. Use stateless Streamable HTTP and expose only `capture_thought`, `search`, and `fetch`.
4. Require `Authorization: Bearer <technical-key>` on every request. Codex reads the key from a local environment variable; the server compares it against a Supabase function secret. Do not accept credentials in query strings.
5. Use Supabase's built-in `gte-small` model for capture and query embeddings, with mean pooling and normalization; freeze the vector dimension at 384 only after a live verification call.
6. Keep the Supabase service-role credential inside the function environment. It must never be returned to or configured in the MCP client.
7. Keep Vercel AI Gateway and a Vercel payment-card change outside BUILD 0.

This is a technical access boundary only. Possession of the bearer key does not create governance standing, warrant, authorship, or authority.

## WHY REQUIRED NOW

The first migration must freeze the embedding dimension, and the first runtime file must target one deployment environment and one client-compatible authentication shape. Implementing before those choices are closed would silently select architecture and violate AP-09 and AP-11.

## ALTERNATIVES CONSIDERED

### Vercel Fluid Function

Retains full Node.js compatibility and GitHub-native deployment, but adds a second operational control plane around the canonical Supabase store. Its strongest BUILD 0 benefit is compatibility insurance, not a currently observed requirement. Defer it unless the Supabase/Codex experiment fails.

### ChatGPT as the first client

ChatGPT supports remote MCP apps, including write tools on eligible workspace plans, but setup and authentication capabilities depend on the user's plan and workspace role. It remains a later compatibility target; it is not needed to prove Golden Trace first.

### OAuth instead of a shared bearer key

OAuth is the stronger multi-user direction but adds authorization-server, refresh-token, and client-registration machinery that BUILD 0 does not need. Revisit when the door serves more than one bounded operator or a target client cannot safely inject a bearer token.

### External embedding provider

OpenAI embeddings through Vercel AI Gateway preserve OB1's 1536-dimensional model precedent but currently require a billing change. Direct provider credentials would add another secret and service. Neither is justified while Supabase can execute the required embedding behavior inside the selected boundary.

## INVARIANTS AFFECTED

- **one persistent brain** — the Edge Function reads and writes only the canonical Supabase project;
- **atomic evidence first** — embedding completes before the canonical thought insert;
- **semantic retrieval remains fundamental** — capture and query share one frozen normalized model space;
- **local interfaces do not become separate brains** — Codex is a client, not a store;
- **evidence ≠ assertion** and **thought ≠ promoted object** — bearer access permits evidence operations only;
- **explicit failure behavior** — authorization, embedding, persistence, search, and not-found failures remain distinguishable.

## STANDING / AUTHORITY

The Build Contract delegates selection of the physical substrate and human door through AP-09 and AP-11. This ADR is **PROPOSED** because the repository does not supply authority to choose the first human client or accept a shared technical key on the human's behalf.

Acceptance requires the human to confirm this exact bundle:

- Codex is the first required client;
- a shared bearer key is acceptable for BUILD 0;
- no Vercel payment-card change is in scope for BUILD 0.

## REVERSIBILITY

The Edge Function, its technical key, and the client registration can be rotated or removed without moving or rewriting canonical thought records. The migration will preserve `embedding_model`, so a later model change is explicit; existing vectors would require deliberate re-embedding rather than silent reinterpretation.

## REOPENING CONDITION

Reopen this decision if any of the following is observed during the minimum experiment or Golden Trace 01:

- Codex cannot reliably discover or invoke all three tools over the deployed Streamable HTTP endpoint;
- bearer-token injection or explicit unauthorized rejection fails in the actual client path;
- the MCP SDK or required database client is incompatible with the Supabase Edge Runtime;
- native `gte-small` inference does not produce a stable normalized 384-value vector in the deployed runtime;
- the frozen trace cannot complete within current Edge Function resource limits;
- BUILD 0 evidence requires non-English or greater-than-512-token semantic fidelity;
- a second human operator or client requires per-user authorization rather than one bounded technical key.

If reopened, test Vercel Fluid Functions first as the compatibility fallback. Do not deploy both doors as co-equal current endpoints.

## SOURCES

- [Supabase: Deploy MCP servers](https://supabase.com/docs/guides/ai-tools/byo-mcp)
- [Supabase: Running AI models](https://supabase.com/docs/guides/functions/ai-models)
- [Supabase: Generate embeddings](https://supabase.com/docs/guides/ai/quickstarts/generate-text-embeddings)
- [OpenAI: Developer mode and MCP apps in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)
