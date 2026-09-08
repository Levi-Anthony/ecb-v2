# BUILD 6 protected governance installer

This is installation-custody tooling, not an ordinary agent tool and not the human governance service.

It performs the released pre-genesis setup only:

1. retain the exact external basis, accepted remit and exact accepted P0 as immutable subjects;
2. create one non-operative governance scope;
3. commission one short-lived setup grant for `ecos.effortlessconnection.com`;
4. generate the enrollment capability locally;
5. write that capability to a new mode-0600 file without printing the token.

It does **not** register a passkey, bind H, create the M2 transition, execute genesis, issue a succession decision, or reopen bootstrap.

Required environment:

- `ECB_INSTALLER_DATABASE_URL` — an explicitly commissioned installation-custody connection that can invoke the three bounded `installer_*` functions. It must not be the verifier or executor runtime login.

Example shape:

```sh
node index.mjs \
  --basis-file ./external-basis.txt \
  --remit-file ./accepted-remit.txt \
  --p0-file ../../docs/build-shape/008-build-6-p0-candidate.json \
  --credential-count 1 \
  --expires-minutes 30 \
  --output /private/path/build6-setup.json
```

The output file contains the secret enrollment capability. Do not commit it, paste it into chat, include it in a URL, or make it available to the ordinary operating model. The program prints only non-secret setup metadata and retained-subject receipts.

The exact P0 bytes are rejected unless their SHA-256 is `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.
