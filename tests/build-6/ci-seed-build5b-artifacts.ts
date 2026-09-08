import postgres from "postgres";
import * as F from "../build-5b/fixtures.ts";

const db = postgres("postgres://postgres@127.0.0.1:55439/build6", {
  max: 1,
  prepare: false,
  connection: { search_path: "public,extensions" },
  onnotice: () => {},
});

const expected = [
  F.A1_ID,
  F.OP1_ID,
  F.A2_ID,
  F.CHECK1_ID,
  F.RC1_ID,
  F.OP2_ID,
  F.A_BAD_ID,
  F.CHECK2_ID,
  F.RC2_ID,
].sort();

try {
  const [{ count: before }] =
    await db`select count(*)::int as count from public.artifacts`;
  if (before !== 0) throw new Error(`expected empty BUILD 5B Artifact stage, found ${before}`);

  await db.begin(async (tx) => {
    await tx.unsafe("set local role service_role");
    await tx`insert into public.artifacts(id,artifact_role,context_id,payload_text) values (${F.A1_ID},'source_representation',${F.TR1},${F.A1_TEXT})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id) values (${F.OP1_ID},'transformation_request',${F.A1_ID})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values (${F.A2_ID},'transformed_representation',${F.OP1_ID},${F.A2_TEXT},true)`;
    await tx`insert into public.artifacts(id,artifact_role,context_id,target_id) values (${F.CHECK1_ID},'check_attempt',${F.OP1_ID},${F.A2_ID})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id) values (${F.OP2_ID},'transformation_request',${F.A1_ID})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values (${F.A_BAD_ID},'transformed_representation',${F.OP2_ID},${F.A_BAD_TEXT},true)`;
    await tx`insert into public.artifacts(id,artifact_role,context_id,target_id) values (${F.CHECK2_ID},'check_attempt',${F.OP2_ID},${F.A_BAD_ID})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id) values (${F.RC1_ID},'transformation_receipt',${F.CHECK1_ID})`;
    await tx`insert into public.artifacts(id,artifact_role,context_id) values (${F.RC2_ID},'transformation_receipt',${F.CHECK2_ID})`;
    await tx.unsafe("reset role");
  });

  const rows = await db`
    select id::text as id, artifact_role
    from public.artifacts
    order by id::text
  `;
  const actual = rows.map((row) => row.id).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`BUILD 5B Artifact IDs drifted: ${JSON.stringify(actual)}`);
  }
  if (rows.length !== 9) throw new Error(`expected 9 BUILD 5B Artifacts, found ${rows.length}`);

  const [{ count: referents }] = await db`
    select count(*)::int as count
    from public.referents r
    where r.id = any(${expected}::uuid[])
  `;
  if (referents !== 9) throw new Error(`expected 9 Artifact Referents, found ${referents}`);

  const [{ digest: a1Digest }] = await db`
    select encode(payload_digest,'hex') as digest
    from public.artifacts where id=${F.A1_ID}::uuid
  `;
  const [{ digest: a2Digest }] = await db`
    select encode(payload_digest,'hex') as digest
    from public.artifacts where id=${F.A2_ID}::uuid
  `;
  if (!a1Digest || !a2Digest) throw new Error("expected frozen payload digests");

  console.log(JSON.stringify({
    result: "PASS",
    stage: "accepted_build5b_artifacts_9",
    count: rows.length,
    referents,
    ids: actual,
    a1_payload_digest: a1Digest,
    a2_payload_digest: a2Digest,
  }, null, 2));
} finally {
  await db.end();
}
