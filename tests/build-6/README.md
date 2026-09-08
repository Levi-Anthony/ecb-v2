# BUILD 6 disposable qualification

From the repository root, with Node 24, Docker and the retained
`ecb5b-qualified-pg17` container available:

```sh
npm ci --ignore-scripts --prefix server/ecb-human
bash tests/build-6/setup.sh
node tests/build-6/qualify.mjs
```

For an intentional fresh rerun, `bash tests/build-6/setup.sh --reset` replaces only
`build6` in the dedicated `ecb6-qualified-pg17` container at localhost port 55439.
It never changes the predecessor container or canonical store. Previous raw output
should be retained when it informs a failure investigation.

`qualify.mjs` applies the exact current migration first in a forced rollback, checks
absence of schema/roles and unchanged predecessor rows, then installs migration and
ledger in one transaction. It runs the HTTP/SQL suite and compares predecessor rows
again. `evidence/receipt.json` pins migration bytes, package/runtime versions and
limits. `evidence/qualification.txt` is the raw last-run output.

The signed ES256 authenticator in `fixture.mjs` is explicitly synthetic. The real
SimpleWebAuthn verifier checks its CBOR registration and ECDSA assertions; this is
not a stub returning verified=true. It proves no physical iPhone/Mac interaction
or human identity. Test sessions exist only in the named local database.

PostgreSQL blocking is observed through `pg_blocking_pids`, not inferred from sleep.
A deliberately destroyed HTTP response demonstrates committed login with a lost
cookie; replay cannot retrieve that cookie or create a second session. Corrupt
current-pointer recovery is rejected. Negative controls accompany the covered
policy, identity, privilege, commitment and replay checks.

The [progress record](../../docs/build-receipts/008-build-6-progress.md) lists the
released observations still unrun. A passing local suite is not canonical activation,
full deployment qualification or BUILD 6 closure.
