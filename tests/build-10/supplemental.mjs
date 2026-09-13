import assert from 'node:assert/strict';
import {make,deliver,assess,begin,close,save,uuid,receiver,caller,observer,sender,inspect,checks,admin,D,fixture,semanticReached} from './support.mjs';
const results=[];const record=(p,name,data)=>{results.push({p,name,state:'PASS',...data});console.log(`PASS P${p} ${name}`);};
const withholding=id=>admin('source',`alter policy b10_source_basis_read on public.artifacts using(artifact_role='b10_basis' and payload_text::jsonb->>'kind' not in ('question','method') ${id?`and id<>'${id}'`:''});`);
try{
 for(const kind of ['report','evidence','export']){
  const f=await make(),x=await deliver(f);withholding(kind==='report'?f.report:kind==='evidence'?f.population[0]:f.export);
  try{const r=await assess(f,x.d);assert.equal(r.result.outcome,'INCOMPLETE');assert.equal(checks(r.c).length,1);record('13',`${kind}-loss-before-first-assessment`,{card:r.c});}finally{withholding();}
 }
 // Two properly bound report versions, arrival B3 then B2; neither newest nor clock governs.
 const b3=await make({bindingMutate:b=>({...b,report_version:'B3'})}),x3=await deliver(b3),r3=await assess(b3,x3.d);semanticReached(r3);assert.equal(r3.result.outcome,'SUPPORTED_FOR_Q1');
 const b2=await make(),x2=await deliver(b2),r2=await assess(b2,x2.d);semanticReached(r2);assert.equal(r2.result.outcome,'SUPPORTED_FOR_Q1');
 const oldUnderNew={...b2,q:b3.q,method:b3.method};const xr=await deliver(oldUnderNew),rr=await assess(oldUnderNew,xr.d);assert.equal(rr.result.outcome,'REJECTED_FOR_Q1');
 await receiver`select ecb10.report_sender(${x2.d}::uuid,${uuid()}::uuid,'D_OBSERVED')`;
 await receiver`select ecb10.report_sender(${x3.d}::uuid,${uuid()}::uuid,'UNKNOWN')`;
 assert.equal((await inspect(x2.d)).records.find(x=>x.id===r2.t).content.outcome,'SUPPORTED_FOR_Q1');
 record('16','valid-B3-before-B2-reverse-observations-old-replay',{b3:r3.c,b2:await inspect(x2.d),replay:rr.c});
 // Exact request cannot rebind no-copy check after completion.
 const pd=(await receiver`select ecb10.admit(${b2.q}::uuid,${uuid()}::uuid,${receiver.json(b2.frame)},null) x`)[0].x,request=uuid();
 const a=await begin(b2,pd,request);
 assert.equal((await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x,null);
 await receiver`select ecb10.complete(${pd}::uuid,${receiver.json(b2.frame)},${x2.body})`;
 await assert.rejects(()=>begin(b2,pd,request),/check_conflict/);
 record('08','no-copy-attempt-cannot-acquire-later-copy',{card:await inspect(pd)});
 // Source sender cannot read independent basis or write resolver observations.
 await assert.rejects(()=>sender`select payload_text from public.artifacts where id=${b2.report}::uuid`,/permission denied/);
 await assert.rejects(()=>caller`select ecb10.record_resolution(${a}::uuid,${caller.json({check:a,records:{},missing:[]})})`,/permission denied/);
 await assert.rejects(()=>observer`select ecb10.read_artifact(${pd}::uuid,${b3.q}::uuid)`,/not_reachable/);
 record('07','source-basis-and-resolver-custody',{sourceReport:b2.report,check:a,denied:['sender basis SELECT','caller resolver publication','unreachable question recovery']});
 // Correctly exported malformed byte/JSON negatives are retained, not lost in parsing.
 for(const [name,bytes] of [['invalid-UTF8',Buffer.from([255,0])],['duplicate-key',Buffer.from('{"language":"b10-comparison-json/v1","language":"other"}')]]){
  const f=await make({bytes}),x=await deliver(f),r=await assess(f,x.d);assert.equal(r.result.outcome,'REJECTED_FOR_Q1');assert(r.result.findings.some(z=>z.component==='encoding'&&z.state==='FAIL'));
  assert.equal(r.c.records.find(z=>z.id===x.cp).content.body,bytes.toString('base64'));record('01',`retained-${name}`,{note:'integrity negative, not semantic P02/P03 evidence',card:r.c});
 }
 // Genuine simultaneous competing contents (one local copy, one conflict).
 const nd=(await receiver`select ecb10.admit(${b2.q}::uuid,${uuid()}::uuid,${receiver.json(b2.frame)},null) x`)[0].x;
 const {db}=await import('./support.mjs');const c1=await db('destination','receiver'),c2=await db('destination','receiver');const changed=Buffer.from(x2.body);changed[changed.length-2]^=1;
 const outcomes=await Promise.allSettled([c1`select ecb10.complete(${nd}::uuid,${c1.json(b2.frame)},${x2.body}) x`,c2`select ecb10.complete(${nd}::uuid,${c2.json(b2.frame)},${changed}) x`]);
 assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(outcomes.filter(x=>x.status==='rejected'&&x.reason.message.includes('copy_conflict')).length,1);
 record('14','simultaneous-differing-content',{card:await inspect(nd),results:outcomes.map(x=>x.status==='fulfilled'?{status:x.status,id:x.value[0].x}:{status:x.status,error:x.reason.message})});
}finally{withholding();save('supplemental.json',results);await close();}
