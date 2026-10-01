# Greenfield main consolidation and dormant host receipt

30 September 2026, America/Phoenix; 1 October UTC. **Current disposition: MAIN CONSOLIDATED / HOST READY AND DORMANT / PROJECT-LOCAL CUSTODY NEXT.**

ECO-213 is recursive semantic circulation's closed implementation Move. ECO-214 owns scoped hosted binding and the twelve first-use obligations. MCP means Model Context Protocol; CI means continuous integration. The Principal's “Go” released the recorded [Greenfield continuation](2026-09-30-Greenfield-Bootstrap-Disposition.md): coherent main installation, dormant enduring host, scoped custody, verification, then bounded first use and repair forward. There is no incumbent ECOS/circulation installation to protect.

## Consolidation and repair

[PR #102](https://github.com/Levi-Anthony/ecb-v2/pull/102) merged candidate `7618c93292bd00da9ac01a89700c93693011f683` into main at `8422a206d415c0392eb1605a00304cad19285e04`. All six exact-head CI workflows passed. Donor `94e291174f48bf2c3648f75be9df5dd7a332639f` ancestry was verified; candidate and merge trees were identical; all twelve source files matched the preserved `2323e7d9…` manifest.

The first Ready production deployment exposed an actual host defect. Vercel treated the worker's default function as a Node (request,response) handler, ignored the returned Web Response, and timed out GET after 90 seconds. POST failed because Node headers do not implement headers.get(). This was host evidence, not provider or semantic failure.

[PR #103](https://github.com/Levi-Anthony/ecb-v2/pull/103) repaired the adapter with an explicit Web fetch export, matching the existing ordinary adapters, and added a regression control for method/authentication/dormant rejection with zero dispatch. Source `b3c4947a332c3cd63df50dd27e51e592350ed66d` merged at `393e3646353e64c233529faf305608975a8b016a`. All three applicable exact-head workflows passed, including [native circulation qualification](https://github.com/Levi-Anthony/ecb-v2/actions/runs/36821587247). Local circulation typecheck, 29 circulation controls and 11 ordinary MCP controls passed. The CI compiled receipt exactly matches the repaired source manifest.

## Current exact installation

| Binding | Exact referent |
| --- | --- |
| Qualified runtime source | `b3c4947a332c3cd63df50dd27e51e592350ed66d` |
| Main runtime merge | `393e3646353e64c233529faf305608975a8b016a` |
| Compiled source digest | `c9a949005c0cbd0bb19205059dbc0cbe0de4fe7af8f4ccca585cf3291bdf47f6` |
| Ready Vercel production deployment | `dpl_C2Ew5u9pxj6GCPRzepMoieMKwATk` |
| Immutable deployment URL | https://ecb-v2-1ech1zez5-levi-anthonys-projects.vercel.app |
| Stable service / MCP / worker | https://ecb-v2-eight.vercel.app/api ; /api/mcp ; /api/circulation/run |
| Vercel project | `prj_oevToBKwqj7yHjyQCHs5zevegWCM` (ecb-v2) |
| Canonical Supabase brain | `vezxivrvhakclxuvxzso` |
| Prepared native receipt | `bf04ea22-c44f-41b3-9c8b-03ba23f0a09b` |
| Immutable receipt digest | `a242ec87a6f772ad2a8851257fd47783e92b79ca738e9c0e87e7e0e66660cee7` |
| Explicit receipt predecessor | `064c6aba-2d08-464a-866a-c98c53142788` |
| Capture work / corpus work | `261b8039-4f53-40ed-adc3-8f13b6d96af1` / `83984cde-d6f2-40f9-8144-eb8b4a4c35bb` |
| Default differentiate mechanism | `ae6c736e-3922-4beb-b6c5-5ef66215187e` |
| Worker / remit revision | `eco213-worker-v1` / `56cee722-0e87-43a1-8b8e-bc39e0c26e0d` |
| Exact existing worker Vault identity | `d0a822da-7659-477f-99dc-cbfe2c0ba6b5`; `eco213-worker-56cee722-0e87-43a1-8b8e-bc39e0c26e0d` |

Five qualified mechanism editions and one prepared receipt were appended, with explicit predecessor relations and updated cross-mechanism references. Both existing work accounts structurally bind the new receipt. Every prior edition, source, corpus and operation identity remains preserved. No schema migration was reapplied. These custody writes grant no activation or standing.

## Observed dormant host controls

At 05:53:55 UTC, Vercel runtime logs attribute these stable-alias requests to the repaired deployment above:

| Request | Observed result |
| --- | --- |
| GET /api | 200; correct brain and exactly six ordinary tools; circulation tools absent |
| POST /api/mcp, no bearer | 401 |
| GET /api/circulation/run | 405 |
| POST worker, no bearer | 401 |
| POST worker, deliberately invalid bearer | 401 |

Native readback at 05:53:07 UTC: eight source occurrences; zero activities, attempts, outcomes, spend reservations or queue messages; zero enabled remits, workers or schedulers. No live provider call was made. Exact configured-worker rejection while disabled remains **NOT RUN on the host**; its constructed local control passes. Ordinary authenticated compatibility/participant use remains **NOT RUN on the host**. The twelve complete initial-use obligations remain open; preliminary route controls do not satisfy them.

## Custody and next execution

The connected Vercel tooling can inspect deployments/logs but exposes no project environment setter. Local runtime custody contains no Vercel token, worker key or provider key. This is the actual human handoff, not another approval requirement.

Open the ecb-v2 project's Production environment-variable editor. Bind the existing scoped worker secret directly from its exact Vault identity and the target-local OpenRouter provider credential; never paste either into chat. Use Secret type (or the UI's sensitive setting) for credentials. Bind these nonsecret values as Config:

| Name | Production value |
| --- | --- |
| ECB_CIRCULATION_ENABLED | `false` |
| ECB_CIRCULATION_CODE_DIGEST | `c9a949005c0cbd0bb19205059dbc0cbe0de4fe7af8f4ccca585cf3291bdf47f6` |
| ECB_CIRCULATION_DEFAULT_WORK_ID | `261b8039-4f53-40ed-adc3-8f13b6d96af1` |
| ECB_CIRCULATION_DEFAULT_MECHANISM_ID | `ae6c736e-3922-4beb-b6c5-5ef66215187e` |

ECB_CIRCULATION_WORKER_KEY uses the existing scoped worker key; do not rotate it merely to launch. ECB_CIRCULATION_OPENROUTER_KEY is an OpenRouter inference credential, not a provider administration key. Ordinary scoped grants/authentication remain separately bound and tested. After configuration, create a fresh deployment of the same source edition, verify configured-worker fail-closed behavior and ordinary authenticated use, predeclare the ECO-217 first-use cohort, then activate only the bounded remit/worker required by ECO-214. Keep scheduler disabled until its independently verified wake step.

Original expiry remains **2 October 2026 18:12:43 UTC / 11:12:43 America/Phoenix**. Ceilings remain 100 requests, 16,000 input / 4,000 output tokens per request, USD 2 reserved spend. No renewal, budget reset, broader corpus or standing follows from this receipt. Disable and preserve after the cohort; ambiguous outcomes retain their operation identity and require inspection. ECO-214's qualification status must remain open even if PR merge automation marks it Done.

Use the [active launch packet](https://linear.app/ecos-ops/document/eco-214-bounded-hosted-use-launch-packet-after-eco-216-eco-217-2026-09-52021db8b7bc) for the twelve result slots and surviving execution envelope.
