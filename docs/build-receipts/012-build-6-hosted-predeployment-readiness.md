STATUS: BUILD 6 MOVE IN PROGRESS — HOSTED PREDEPLOYMENT BOUNDARY VERIFIED; PROJECT-EXPLICIT OPERATOR HANDOFF REQUIRED
DISPOSITION: EVIDENCE / MOVE RECEIPT
DATE: 2026-09-07 America/Phoenix

# BUILD 6 hosted predeployment readiness

## Observation

The released hosted-deployment seam was inspected after independent PG17 and supplemental concurrency qualification passed. No hosted human-service deployment was performed by this check.

The isolated Vercel Hobby project remains:

- project: `ecb-human`
- project ID: `prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`
- team: `levi-anthonys-projects`
- team ID: `team_wueYGTZ3nxHz1WhMg8UE9gSy`
- plan: Hobby
- Node: 24.x
- Git link: none
- current deployment count: 0
- current latest deployment: none
- current project API domain list: empty

The current empty domain list conflicts with the earlier domain-setup receipt, which recorded `ecos.effortlessconnection.com` attached and verified after the Namecheap CNAME was installed. That conflict is retained as a current verification seam; the earlier DNS receipt is not silently discarded and the current snapshot is not treated as proof that DNS itself was removed.

An authenticated Vercel fetch attempt for `https://ecos.effortlessconnection.com/` could not create a usable share/fetch route. No current TLS success or new TLS failure cause is inferred from that result.

## Deployment identity finding

Repository commits on `reconcile/build-6-tested-move` automatically produced preview deployments for the Git-linked `ecb-v2` Vercel project. The isolated `ecb-human` project remained at zero deployments.

This is useful boundary evidence:

1. repository CI/commit activity does not implicitly deploy `ecb-human`;
2. `ecb-human` remains isolated from the Git-linked runtime;
3. a generic deploy action that targets only a tool-defined “current project” is not safe for this stage, because the repository root is associated with `ecb-v2`, not the intended human-service project.

The available Vercel connector in this session exposes an unparameterized `deploy_to_vercel` action. It cannot name `ecb-human` or its project ID. That action was therefore deliberately NOT invoked.

## Project-explicit inert deployment route

Current Vercel documentation supports explicit CLI project targeting using:

- `VERCEL_ORG_ID=team_wueYGTZ3nxHz1WhMg8UE9gSy`
- `VERCEL_PROJECT_ID=prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`

A guarded helper is retained at:

`server/ecb-human/deploy-inert-readiness.sh`

It must run only from an authenticated human-operated Vercel CLI context. It:

- targets the exact `ecb-human` project IDs rather than repo-root project inference;
- refuses known privileged/local runtime credential keys;
- requires operator inspection of the project environment inventory before deployment;
- supplies no database, setup, enrollment, executor, owner, service-role or signing credential;
- requires a second explicit local confirmation value after the environment inventory is inspected;
- deploys from `server/ecb-human` only.

The deployed package is intentionally inert. With no `HUMAN_DATABASE_URL`, `connectVerifier()` fails closed and the handler returns HTTP 503 JSON `{"error":"service_unavailable","outcome":"unknown"}` with no-store behavior. That state can qualify packaging, routing, TLS and security headers but is not a functioning enrollment door and creates no setup capability.

## FCA / SSMM disposition

No accepted Shape or implementation falsifier is present. The blocker is execution custody/target addressability in this particular tool session, not architecture or mechanism behavior.

Sense remains closed. No redesign is justified. The correct Move is a project-explicit operator execution followed by evidence capture. The result must then be Metabolized into this branch.

## Still closed

This receipt does not authorize or perform:

- `HUMAN_DATABASE_URL` provisioning;
- verifier connection to canonical or another hosted database;
- a setup/enrollment capability;
- Levi's passkey ceremony;
- live H/scope binding;
- canonical BUILD 6 migration;
- M2/P1;
- BUILD 6 closure;
- BUILD 7+.

## Next bounded move

From the already authenticated Vercel CLI context, execute the guarded inert-deployment helper against exact project `ecb-human`. Capture:

1. environment-variable inventory before deployment;
2. exact project/team IDs and deployment ID/URL;
3. whether `ecos.effortlessconnection.com` is attached to this exact project after deployment; if absent, inspect before changing project association or DNS;
4. HTTPS handshake/result at the accepted hostname;
5. response status/body and required security headers;
6. confirmation that no forbidden credential/environment key was introduced.

Expected runtime without a human database credential is the explicit fail-closed 503. Stop before adding a database credential or presenting any enrollment route.
