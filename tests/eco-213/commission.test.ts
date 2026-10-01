import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {makeCommission,LEGACY_IDS,sourceManifest} from '../../scripts/eco-213/commission.js';
test('commission binds exact eight envelopes and real mechanism digests while remaining dormant',async()=>{
 const manifest=await sourceManifest();assert.match(manifest.code_digest,/^[0-9a-f]{64}$/);
 const c={authority_basis:'CONSTRUCTED renderer fixture only',qualified_commit:'0'.repeat(40),code_digest:manifest.code_digest,
  launch_artifact_id:randomUUID(),requirements_artifact_id:randomUUID(),frozen_export_artifact_id:randomUUID(),actors:['constructed-cold'],
  worker:'constructed-worker',qualification:{status:'CONSTRUCTED'},issued_at:'2026-09-30T16:00:00.000Z'};
 const exported={origin:'legacy:lqbrzoicorehwidkdhoi',frozen_at:c.issued_at,export_basis:{status:'CONSTRUCTED'},
  rows:LEGACY_IDS.map(id=>({id,content:'CONSTRUCTED carrier',original_content:null,metadata:{},source_id:null,status:'fixture',created_at:c.issued_at,updated_at:c.issued_at}))};
 const p=makeCommission(c,exported);assert.equal(p.manifest.items.length,8);assert.equal(p.host_bindings.ECB_CIRCULATION_ENABLED,'false');
 assert.ok(p.sql.includes('100,16000,4000,2'));assert.ok(p.sql.includes('false'));assert.ok(!p.sql.includes('vault.decrypted_secrets'));
 assert.ok(p.missing_custody.includes('worker credential hash'));
 assert.throws(()=>makeCommission(c,{...exported,rows:exported.rows.slice(1)}),/cohort/);
 assert.throws(()=>makeCommission(c,{...exported,rows:exported.rows.map((r,i)=>i===0?{...r,id:randomUUID()}:r)}),/envelope/);
});
