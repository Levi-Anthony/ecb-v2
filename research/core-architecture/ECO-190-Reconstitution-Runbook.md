# ECO-190 canonical BRAIN reconstitution package

This document describes the bounded Register-B recovery of the ECO-190 coordination consumer. It is included verbatim with the accepted ECO-189/ECO-191 governing Shapes, migration chain, runtime source and package metadata in an immutable canonical BRAIN Artifact. The GitHub location is an editing mirror and provenance, not the only recovery source.

## Required custody and boundaries

Recover the active episode's realization_manifest and governing_restore constituent Artifacts and the reconstitution_manifest receipt bound to its current material-change head. Verify their identities and the receipt's referenced Artifact IDs. Parse the realization bundle profile and enumerate its files; compute and record the SHA-256 of every recovered file. Retain the original receipt, dependency histories and exact current-use epoch bindings. A newer deployment or a restored visible status does not make an older episode current.

The package must contain the accepted ECO-189 and ECO-191 Shapes, the original ECO-190 coordination SQL migration, the additive derivative-currentness repair migration, the coordination Preview route, ordinary runtime files and package metadata, and this runbook. The governing_restore Artifact states the non-secret configuration contract: canonical project, Preview environment, runtime capability name, and the fact that no production cutover is authorized. The value of ECB_ORDINARY_DB_KEY is intentionally outside semantic BRAIN custody.

## Restore sequence

1. Obtain a separately authorized PostgreSQL backup or an existing canonical BRAIN with stable identities and immutable lineage. This runbook does not grant backup, secret, deployment or cutover authority.
2. Materialize the recovered bundle files byte for byte in a controlled temporary workspace. Verify the file hashes and inspect the two SQL migrations in order. Never regenerate operation IDs or rewrite historical receipts to make them fit a new environment.
3. Restore the canonical database lineage and apply the original coordination migration followed by the derivative-currentness repair only if they are absent from that restored lineage. Do not apply either migration twice by an invented timestamp. Check the installed function definition, grants, RLS, runtime capability check and exact episode/dependency heads.
4. Rebuild the ordinary runtime and coordination Preview consumer from the recovered source and package contract. Bind ECB_ORDINARY_DB_KEY from an authorized secret channel without recording its value in BRAIN or qualification evidence.
5. Observe the new deployment's actual branch, commit, status and route. Write a typed external-reliance observation and observed consumer binding. Treat these as new dependency history, not as restoration of the former head.
6. Explicitly reconcile the episode with a new material-change receipt that preserves source history, declares continuity/transport/affected-old and destination disclosure/coverage, and binds exact live reliance and consumer identities and epochs. Then re-run current-use projection, negative controls and bounded qualification. A reconstruction alone never permits production use.

## Scope of the demonstrated probe

The Preview reconstruction probes recovery of exact source bytes, governing content, configuration contract, ordered restore procedure and their canonical receipt linkage without reading GitHub or Linear as governing-content sources. It does not itself perform a fresh database restore into a second provider, acquire a secret from BRAIN, or authorize a production alias. Those remain separate installation and recovery proofs.
