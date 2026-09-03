STATUS: SHAPING

DISPOSITION: PROJECTION

ROLE: Decision surface for BUILD 0 remote MCP deployment

AUTHORITY: None independently; closure requires an ADR

# Human-Door Deployment Shape

## Decision to make

Choose one current remote MCP endpoint through which a human, using an AI client, can call BUILD 0's `capture_thought`, `search`, and `fetch` tools against the canonical Supabase brain.

This chooses the door, not the brain.

The Supabase Postgres record remains canonical under either candidate. A deployment host may not introduce another thought store, vector store, or authoritative cache.

## Candidate A — Supabase Edge Function

### Evidence

- OB1 demonstrates this path in functioning MCP code.
- Supabase documents direct MCP deployment on Edge Functions with the MCP TypeScript SDK or `mcp-lite`.
- Hosted functions receive project URL and server-only secret material in their environment.
- Current free-plan limits include 256 MB memory, 150 seconds wall-clock duration, and 2 seconds CPU time per request.

### Advantages

- smallest operational boundary around the canonical store;
- database and function lifecycle remain in one project;
- no cross-platform database-secret synchronization;
- strongest continuity with demonstrated OB1 behavior.

### Pressures

- Deno/Edge-runtime compatibility must be verified for the chosen MCP and embedding clients;
- the CPU limit may constrain future local processing, though BUILD 0 is predominantly network I/O;
- MCP technical access control must be implemented at the server boundary rather than assumed from hosting.

## Candidate B — Vercel Fluid Function

### Evidence

- Vercel Functions provide the regular Node.js runtime and Streamable HTTP responses without requiring an Edge runtime.
- The GitHub repository is already connected to the `ecb-v2` Vercel project.
- Vercel deployment identity can authenticate platform services, subject to account prerequisites.

### Advantages

- full Node.js compatibility with the MCP SDK and supporting libraries;
- GitHub-native preview and production deployment flow;
- longer default function duration and broader runtime package support;
- straightforward local and deployed behavior parity for Node code.

### Pressures

- Supabase server credentials cross a platform boundary and must be synchronized into Vercel secrets;
- two operational control planes must be observed and debugged;
- AI Gateway currently requires a Vercel billing prerequisite that has not been authorized;
- choosing Vercel merely because the repo is linked would confuse convenience with architectural evidence.

## Excluded for BUILD 0 — dual deployment

Do not deploy both candidates as co-equal doors.

Two current endpoints would broaden the security, observation, failure, and acceptance surfaces before one is proven. A later compatibility proxy may be considered only when a real client cannot use the selected door.

## Decision criteria

Evaluate in this order:

1. **Golden Trace reachability** — the first required AI client can discover and call all three tools across fresh contexts.
2. **Single-brain preservation** — every call reaches the same canonical Supabase record with no fallback store.
3. **Technical access control** — unauthorized requests fail explicitly; server secrets never enter a client-visible surface.
4. **Transport compatibility** — Streamable HTTP behavior works with the selected client without reconnect loops or hidden conversational state.
5. **Failure observability** — embedding, database, authorization, and fetch-not-found failures are distinguishable in logs and responses.
6. **Operational minimum** — deployment, secret rotation, local testing, and rollback introduce the fewest moving parts for BUILD 0.
7. **Reopening clarity** — the ADR names the concrete client/runtime failure that would justify moving the door.

Cost, novelty, and theoretical portability do not outrank the first six criteria.

## Minimum decision experiment

Do not build two full implementations.

For each still-credible candidate, prove only:

- MCP initialization and tool discovery from the first required AI client;
- one authenticated no-op/health request;
- access to the same Supabase project without exposing a secret;
- explicit rejection of an unauthorized request;
- usable request and error logs.

Then select one candidate and implement Golden Trace 01 only there.

## Current prior

Supabase Edge Function is the evidence-leading candidate because OB1 has already demonstrated it and it minimizes the distance to the canonical store.

This is not designation. Vercel should win if the actual first-client handshake, MCP library compatibility, or function constraints make the Supabase door unable to pass BUILD 0 cleanly.

## Human inputs required before closure

- Which AI client is the first human door: ChatGPT, Codex, Claude, or another named client?
- Is a shared technical access key acceptable for BUILD 0, explicitly without treating it as governance warrant?
- Is adding a Vercel payment card in scope if Vercel AI Gateway becomes part of the selected route?

## Closure route

1. Provision Supabase.
2. Name the first required AI client.
3. Resolve the three human inputs above.
4. Run only the minimum decision experiment needed to discriminate.
5. Create a human-door ADR selecting one current endpoint and its reopening condition.
6. Update `/BUILD_CHECKOUT.md`.

## Sources

- [Supabase: Deploy MCP servers](https://supabase.com/docs/guides/ai-tools/byo-mcp)
- [Supabase: MCP server with mcp-lite](https://supabase.com/docs/guides/functions/examples/mcp-server-mcp-lite)
- [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits)
- [Supabase Edge Function environment variables](https://supabase.com/docs/guides/functions/secrets)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Vercel Functions](https://vercel.com/docs/functions)
