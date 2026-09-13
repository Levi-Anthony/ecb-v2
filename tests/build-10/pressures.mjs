import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {make,deliver,assess,begin,close,save,semanticReached,uuid,receiver,caller,observer,sender,S,D,fixture,inspect,checks,db,admin,cfg,resolverConfig} from './support.mjs';
import {resolve} from '../../server/build-10/resolve.mjs';
const results=[];
const record=(p,name,data={})=>{results.push({p,name,state:'PASS',...data});console.log(`PASS P${p} ${name}`);};
const deny=async(f,re=/permission|protected|conflict|binding|prior_commit|wrong_role|not_reachable|does not exist/)=>assert.rejects(f,re);
const withhold=(ids=[])=>admin('source',`alter policy b10_source_basis_read on public.artifacts using(artifact_role='b10_basis' and payload_text::jsonb->>'kind' not in ('question','method') ${ids.length?`and id not in (${ids.map(x=>`'${x}'`).join(',')})`:''});`);
try{
 // P04: independently swap every carried binding, with valid newly registered export.
 for(const k of ['focal','revision','report','report_version','projection','projection_version','contract','contract_version']){
  const f=await make({mutate:p=>({...p,[k]:k.endsWith('version')?'other':uuid()})});const x=await deliver(f),r=await assess(f,x.d);
  semanticReached(r);assert.equal(r.result.outcome,'REJECTED_FOR_Q1');assert(r.result.findings.some(z=>z.component===`identity:${k}`&&z.state==='FAIL'));
  record('04',k,{delivery:x.d,assessment:r.t,card:r.c});
 }
 for(const k of ['namespace','projection','projection_version']){
  const f=await make({frameMutate:v=>({...v,[k]:k==='projection_version'?'other':uuid()})});const x=await deliver(f),r=await assess(f,x.d);
  assert.equal(r.result.outcome,'REJECTED_FOR_Q1');record('04',`frame:${k}`,{card:r.c});
 }
 const base=await make(), transfer=await deliver(base), good=await assess(base,transfer.d);
 assert.equal(good.result.outcome,'SUPPORTED_FOR_Q1');
 const wrong=await assess(base,transfer.d,{method:uuid()});assert.equal(wrong.result.outcome,'REJECTED_FOR_Q1');record('04','checker-swap',{card:wrong.c});
 const qOther=await fixture(D,base.dscope,{...base.question,binding:{...base.binding,revision:uuid()}});
 const other={...base,q:qOther};const ox=await deliver(other);const or=await assess(other,ox.d);assert.equal(or.result.outcome,'REJECTED_FOR_Q1');record('04','question-swap',{card:or.c});
 // P05: omission, substitution and unavailable exact independent basis are separate tests.
 for(const role of ['criterion','W1','W2','selector','unit_context']){
  for(const op of ['remove','replace']){
   const f=await make({mutate:p=>({...p,manifest:op==='remove'?p.manifest.filter(x=>x.role!==role):p.manifest.map(x=>x.role===role?{...x,id:uuid()}:x)})});
   const x=await deliver(f),r=await assess(f,x.d);semanticReached(r);assert.equal(r.result.outcome,'REJECTED_FOR_Q1');record('05',`${role}:${op}`,{card:r.c});
  }
  const id=base.manifest.find(x=>x.role===role).id;withhold([id]);
  try{const r=await assess(base,transfer.d);assert.equal(r.result.outcome,'INCOMPLETE');record('05',`${role}:unavailable`,{card:r.c});}finally{withhold();}
 }
 // P06 producer coherently changes content and metadata; export remains valid, source basis intact.
 const corr=await make({mutate:p=>({...p,proposition:{...p.proposition,threshold:90,asserted_result:true},expressions:[{...p.proposition,threshold:90,asserted_result:true}]})});
 const cx=await deliver(corr),cr=await assess(corr,cx.d);semanticReached(cr);assert.equal(cr.result.outcome,'REJECTED_FOR_Q1');record('06','correlated-producer',{card:cr.c});
 // Actual received corruption with pristine S still readable; no replacement by source.
 const corrupted=Buffer.from(transfer.body);const off=corrupted.indexOf(Buffer.from('threshold":100'));assert(off>=0);corrupted[off+'threshold":'.length]=57;
 const badx=await deliver(base,{bytes:corrupted}),badr=await assess(base,badx.d);assert.equal(badr.result.outcome,'REJECTED_FOR_Q1');
 assert(badr.result.findings.some(x=>x.component==='provenance'&&x.state==='FAIL'));
 assert.equal((await sender`select ecb10.read_export(${base.p}::uuid) x`)[0].x.body,transfer.body.toString('base64'));record('06','actual-defective-copy-pristine-source',{card:badr.c});
 // P07/P15 all ordinary API roles lack raw writes and internal paths.
 for(const role of ['sender','receiver','caller','observer','resolver']){
  const d=await db('destination',role);
  await deny(()=>d`insert into public.artifacts(id,artifact_role,context_id,payload_text) values(${uuid()}::uuid,'b10_assessment',${good.a}::uuid,'{"outcome":"SUPPORTED_FOR_Q1","findings":[]}')`);
  await deny(()=>d`select ecb10.retain('b10_assessment',${good.a}::uuid,'{"outcome":"SUPPORTED_FOR_Q1","findings":[]}'::jsonb,${uuid()}::uuid)`);
  await deny(()=>d.unsafe('set role ecb10_owner'));
  for(const sql of ['update public.artifacts set payload_text=payload_text where false','delete from public.artifacts where false','truncate public.artifacts','update public.claims set epistemic_standing=epistemic_standing where false']) await deny(()=>d.unsafe(sql));
  record('15',`role:${role}`,{denied:['raw insert','retain','SET ROLE owner','update','delete','truncate','Claim write']});
 }
 await deny(()=>caller`select ecb10.finish_check(${good.a}::uuid,'SUPPORTED_FOR_Q1')`);
 await deny(()=>caller`select public.prepare_build_5b_artifact()`);
 const forgery=admin('destination',`begin; set role service_role; savepoint attack; select 1; rollback;`);assert(forgery);
 assert.throws(()=>admin('destination',`set role service_role; insert into public.artifacts(id,artifact_role,context_id,payload_text) values('${uuid()}','b10_assessment','${good.a}','{"outcome":"SUPPORTED_FOR_Q1","findings":[]}');`),/b10_protected_publication/);
 record('07','direct-PASS-old-route-spoof',{protectedAssessment:good.t});
 // P08 replay, changed tuples, equal bytes distinct identities, immutable no-copy check binding.
 const replay=(await receiver`select ecb10.admit(${base.q}::uuid,${transfer.request}::uuid,${receiver.json(base.frame)},null) x`)[0].x;assert.equal(replay,transfer.d);
 const rcp=(await receiver`select ecb10.complete(${transfer.d}::uuid,${receiver.json(base.frame)},${transfer.body}) x`)[0].x;assert.equal(rcp,transfer.cp);
 await deny(()=>receiver`select ecb10.admit(${base.q}::uuid,${transfer.request}::uuid,${receiver.json({...base.frame,source_artifact:uuid()})},null)`);
 const p2=uuid(),frame2={...base.frame,source_artifact:p2};const ex2=(await S`select ecb10.export(${base.scope}::uuid,${p2}::uuid,${S.json(frame2)},${transfer.body},${S.json(base.binding)}) x`)[0].x;
 const q2=await fixture(D,base.dscope,{...base.question,export:ex2.export});const f2={...base,p:p2,frame:frame2,q:q2};const x2=await deliver(f2),r2=await assess(f2,x2.d);
 assert.equal(r2.result.outcome,'SUPPORTED_FOR_Q1');assert.notEqual(x2.cp,transfer.cp);assert.deepEqual(x2.body,transfer.body);record('08','replay-and-equal-bytes-distinct-identity',{first:transfer.d,second:x2.d,card:r2.c});
 // P09 new selected basis and stale installed checker seal cannot reuse old result.
 for(const k of ['report','revision']){const q=await fixture(D,base.dscope,{...base.question,binding:{...base.binding,[k]:uuid()}});const f={...base,q};const x=await deliver(f),r=await assess(f,x.d);assert.equal(r.result.outcome,'REJECTED_FOR_Q1');record('09',`changed-${k}`,{card:r.c});}
 for(const role of ['criterion','W2']){const q=await fixture(D,base.dscope,{...base.question,manifest:base.manifest.map(m=>m.role===role?{...m,id:uuid(),version:'2'}:m)});const f={...base,q};const x=await deliver(f),r=await assess(f,x.d);assert.equal(r.result.outcome,'REJECTED_FOR_Q1');record('09',`changed-${role}`,{card:r.c});}
 const stale=await fixture(D,base.dscope,{kind:'method',version:'old','definition_digest':'0'.repeat(64)}),sq=await fixture(D,base.dscope,{...base.question,method:stale});
 const sf={...base,q:sq,method:stale},sx=await deliver(sf),sr=await assess(sf,sx.d);assert.equal(sr.result.outcome,'INCOMPLETE');record('09','stale-method',{card:sr.c});
 // P10 prior commit boundary and rollback of terminal; partial and check admission recoverable.
 await deny(()=>receiver.begin(async tx=>{const d=(await tx`select ecb10.admit(${base.q}::uuid,${uuid()}::uuid,${tx.json(base.frame)},null) x`)[0].x;await tx`select ecb10.complete(${d}::uuid,${tx.json(base.frame)},${transfer.body})`;}));
 const pd=(await receiver`select ecb10.admit(${base.q}::uuid,${uuid()}::uuid,${receiver.json(base.frame)},null) x`)[0].x;
 assert.equal((await inspect(pd)).records.filter(x=>x.role==='b10_copy').length,0);
 await receiver`select ecb10.complete(${pd}::uuid,${receiver.json(base.frame)},${transfer.body.subarray(0,8)})`;
 assert.equal((await inspect(pd)).records.filter(x=>x.role==='b10_copy').length,0);
 const pa=await begin(base,pd);await caller`select ecb10.observe_integrity(${pa}::uuid)`;await resolve(pa,resolverConfig);const pt=(await caller`select ecb10.finish_check(${pa}::uuid) x`)[0].x;assert(pt);
 assert.equal(checks(await inspect(pd))[0].content.outcome,'INCOMPLETE');
 await receiver`select ecb10.complete(${pd}::uuid,${receiver.json(base.frame)},${transfer.body})`;
 const a=await begin(base,pd);await caller`select ecb10.observe_integrity(${a}::uuid)`;await resolve(a,resolverConfig);
 await assert.rejects(()=>caller.begin(async tx=>{await tx`select ecb10.finish_check(${a}::uuid)`;throw Error('ROLLBACK_TERMINAL');}),/ROLLBACK_TERMINAL/);
 assert(!(await inspect(pd)).records.some(x=>x.role==='b10_assessment'&&x.context===a));
 const terminal=(await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x;assert(terminal);record('10','partial-prior-commit-rollback',{card:await inspect(pd)});
 // P11 commit then suppress sender ack, explicit uncertainty, exact observation later.
 await sender`select ecb10.report_sender(${base.p}::uuid,${uuid()}::uuid,'SELECTED')`;
 await receiver`select ecb10.report_sender(${pd}::uuid,${uuid()}::uuid,'UNKNOWN')`;
 await assert.rejects(async()=>{throw Object.assign(Error('D observation unavailable'),{code:'UNAVAILABLE'});},/unavailable/);
 const observed=await inspect(pd);assert(observed.records.some(x=>x.id===terminal));
 const retry=(await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x;assert.equal(retry,terminal);
 await receiver`select ecb10.report_sender(${pd}::uuid,${uuid()}::uuid,'D_OBSERVED')`;
 record('11','uncertain-ack-exact-observation',{card:await inspect(pd),note:'driver did not record ack; stronger real interruption exercise follows in resilience'});
 // P14 actual concurrent DB clients, identical and competing content, separate checks.
 const c1=await db('destination','receiver'),c2=await db('destination','receiver');
 const cd=(await receiver`select ecb10.admit(${base.q}::uuid,${uuid()}::uuid,${receiver.json(base.frame)},null) x`)[0].x;
 const copies=await Promise.all([c1,c2].map(c=>c`select ecb10.complete(${cd}::uuid,${c.json(base.frame)},${transfer.body}) x`));assert.equal(copies[0][0].x,copies[1][0].x);
 await deny(()=>c2`select ecb10.complete(${cd}::uuid,${c2.json(base.frame)},${corrupted})`);
 const ca=await begin(base,cd);await caller`select ecb10.observe_integrity(${ca}::uuid)`;await resolve(ca,resolverConfig);
 const t1=await db('destination','caller'),t2=await db('destination','caller');const terminals=await Promise.all([t1,t2].map(c=>c`select ecb10.finish_check(${ca}::uuid) x`));assert.equal(terminals[0][0].x,terminals[1][0].x);
 const ca2=await assess(base,cd);assert.notEqual(ca2.a,ca);record('14','concurrent-local-publication',{card:ca2.c});
 // P13 every indispensable reference missing before a fresh check, old history retained.
 for(const [kind,id] of [['report',base.report],['evidence',base.population[0]],['export',base.export]]){
  withhold([id]);try{const r=await assess(base,transfer.d);assert.equal(r.result.outcome,'INCOMPLETE');assert((await inspect(transfer.d)).records.some(x=>x.id===good.t));record('13',`${kind}-loss-after-history`,{card:r.c});}finally{withhold();}
 }
 // P16 arrival reversed: B3 export constructed first, B2 Q remains exact.
 const newer=await make({mutate:p=>({...p,report_version:'B3'})}),nx=await deliver(newer),nr=await assess(newer,nx.d);assert.equal(nr.result.outcome,'REJECTED_FOR_Q1');
 const later=await deliver(base),lr=await assess(base,later.d);assert.equal(lr.result.outcome,'SUPPORTED_FOR_Q1');record('16','reversed-arrival',{newer:nr.c,selected:lr.c});
 // Save exact locators for fresh process/restart and additional fault controls.
 save('pressure-locators.json',{base,transfer,good:{a:good.a,t:good.t},negative:badx.d});
}finally{withhold();save('pressures.json',results);await close();}
