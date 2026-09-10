import assert from "node:assert/strict";
import { admin, close, producer, save, uuid } from "./support.mjs";
const ids = {
  a: "8777e33d-7555-40aa-92f9-d5107395c0c7",
  op: "ba27d938-c586-4c09-ac31-9c67a2d0b5e0",
  out: "95b5db1d-cb79-439b-ae93-0bdaef5cfda2",
  badOp: "f64d508d-df25-47c8-8d6d-e26a6dc9a906",
  bad: "9c322dda-54b8-4838-bdf1-2df471f0f992",
};
const observations = [];
try {
  for (
    const [op, target, want] of [[ids.op, ids.out, "PASS"], [
      ids.badOp,
      ids.bad,
      "FAIL",
    ]]
  ) {
    const attempt = uuid();
    await producer`insert into public.artifacts(id,artifact_role,context_id,target_id) values(${attempt}::uuid,'check_attempt',${op}::uuid,${target}::uuid)`;
    const [r] =
      await producer`insert into public.artifacts(id,artifact_role,context_id) values(${uuid()}::uuid,'transformation_receipt',${attempt}::uuid) returning payload_text`;
    const receipt = JSON.parse(r.payload_text);
    assert.equal(receipt.result, want);
    observations.push(receipt);
  }
  const [b6] =
    await admin`select (select count(*)::int from ecb_governance.scopes) scopes,(select count(*)::int from ecb_governance.transitions) transitions,(select count(*)::int from ecb_governance.decisions) decisions`;
  assert.deepEqual(b6, { scopes: 0, transitions: 0, decisions: 0 });
  const [r] =
    await admin`select encode(public.thought_revision_digest('19a949ea-a8fc-4250-a386-fa64e5530180'),'hex') digest`;
  assert.equal(
    r.digest,
    "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
  );
  await assert.rejects(
    producer`select ecb_governance.executor('recover','{}'::jsonb)`,
    /permission denied/,
  );
  const [checks] = await admin`select
 (select count(*)::int from public.artifacts a left join public.referents r on r.id=a.id where r.id is null) missing_artifact_referents,
 (select count(*)::int from public.claims c left join public.referents r on r.id=c.id where r.id is null) missing_claim_referents,
 (select count(*)::int from public.claims where epistemic_standing<>'unassessed' and id<>'0f89e778-b16e-4840-9129-a2aa3eb6f697') new_standing_promotions`;
  assert.deepEqual(checks, {
    missing_artifact_referents: 0,
    missing_claim_referents: 0,
    new_standing_promotions: 0,
  });
  save("regression.json", {
    artifact_checks: observations,
    build6: b6,
    identity_and_standing: checks,
    thought_revision: r.digest,
  });
  console.log(
    "PASS: unchanged BUILD 5B method accepts its positive and rejects its defective output; BUILD 2 identities, BUILD 3 evidence and BUILD 6 separation preserved.",
  );
} finally {
  await close();
}
