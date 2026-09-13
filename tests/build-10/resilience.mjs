import assert from 'node:assert/strict';
import {fork,execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {make,deliver,assess,begin,close,save,uuid,receiver,caller,observer,inspect,checks,admin,cfg,db,resolverConfig} from './support.mjs';
import {resolve} from '../../server/build-10/resolve.mjs';
const results=[];const record=(p,name,data)=>{results.push({p,name,state:'PASS',...data});console.log(`PASS P${p} ${name}`);};
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8'}).trim();
let sourceStopped=false,revoked=false;
try{
 const f=await make();f.bytes=[...f.bytes];
 for(const stage of ['admission','partial','complete','check','terminal','uncommitted-terminal']){
  const child=fork('tests/build-10/fault-worker.mjs',[],{env:{...process.env,ECB10_FAULT_INPUT:JSON.stringify({base:f,stage})},stdio:['ignore','pipe','pipe','ipc']});
  let stderr='';child.stderr.on('data',x=>stderr+=x);
  const msg=await new Promise((res,rej)=>{child.once('message',res);child.once('exit',code=>rej(Error(`fault worker exited ${code}: ${stderr}`)));child.once('error',rej);});
  const exited=new Promise(r=>child.once('exit',r));child.kill('SIGKILL');await exited;
  // SQL query blocks behind an uncommitted publication lock until backend rollback finishes.
  if(msg.a) admin('destination',`select pg_advisory_xact_lock(hashtextextended('${msg.a}',10));`);
  const card=await inspect(msg.d),copy=card.records.filter(x=>x.role==='b10_copy'),terms=checks(card);
  assert.equal(copy.length,['complete','check','terminal','uncommitted-terminal'].includes(stage)?1:0);
  assert.equal(terms.length,stage==='terminal'?1:0);
  if(stage==='partial')assert(card.records.some(x=>x.content.kind==='partial'));
  if(stage==='check'||stage==='uncommitted-terminal')assert(card.records.some(x=>x.id===msg.a));
  record('10',`SIGKILL-after-${stage}`,{fault:msg,card});
  if(stage==='complete'||stage==='terminal'){
   await receiver`select ecb10.report_sender(${msg.d}::uuid,${uuid()}::uuid,'UNKNOWN')`;
   admin('destination','revoke execute on function ecb10.inspect_delivery(uuid) from ecb10_observer;');revoked=true;
   await assert.rejects(()=>inspect(msg.d),/permission denied/);
   admin('destination','grant execute on function ecb10.inspect_delivery(uuid) to ecb10_observer;');revoked=false;
   const observed=await inspect(msg.d);assert(observed.records.some(x=>x.role==='b10_copy'));
   const cp=(await receiver`select ecb10.complete(${msg.d}::uuid,${receiver.json(f.frame)},${Buffer.from(f.bytes)}) x`)[0].x;assert.equal(cp,copy[0].id);
   if(stage==='terminal')assert.equal((await caller`select ecb10.finish_check(${msg.a}::uuid) x`)[0].x,terms[0].id);
   record('11',`lost-${stage}-ack`,{senderObservedAck:false,observationInitiallyDenied:true,copyReplaySame:true,card:observed});
  }
 }
 const good=await deliver(f),gr=await assess(f,good.d);assert.equal(gr.result.outcome,'SUPPORTED_FOR_Q1');
 const bad=await make({mutate:p=>({...p,expressions:['execution permitted']})}),bx=await deliver(bad),br=await assess(bad,bx.d);assert.equal(br.result.outcome,'REJECTED_FOR_Q1');
 // Capability loss does not destroy historical result; restore exact function signature afterward.
 admin('destination','alter function ecb10.semantic(jsonb,jsonb,jsonb) rename to semantic_unavailable;');
 try{const a=await begin(f,good.d);const t=(await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x;const card=await inspect(good.d);assert.equal(checks(card).find(x=>x.id===t).content.outcome,'INCOMPLETE');assert(card.records.some(x=>x.id===gr.t));record('13','checker-capability-loss',{card});}
 finally{admin('destination','alter function ecb10.semantic_unavailable(jsonb,jsonb,jsonb) rename to semantic;');}
 // Resolve at source snapshot, then actual source stop: that check may finish historically.
 const a=await begin(f,good.d);await caller`select ecb10.observe_integrity(${a}::uuid)`;await resolve(a,resolverConfig);
 docker('stop',cfg.source.container);sourceStopped=true;
 const t=(await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x;let card=await inspect(good.d);assert.equal(checks(card).find(x=>x.id===t).content.outcome,'SUPPORTED_FOR_Q1');
 const fresh=await assess(f,good.d);assert.equal(fresh.result.outcome,'INCOMPLETE');record('13','snapshot-then-source-stop-new-check',{historicalAssessment:t,card:fresh.c});
 // Close initiating DB sessions; restart D, then cold entry has D credentials only.
 await close();docker('restart',cfg.destination.container);
 const cp='/private/tmp/ecb10-cold-destination.json';writeFileSync(cp,JSON.stringify(cfg.destination.users.observer),{mode:0o600});
 for(const [name,d,want] of [['positive',good.d,'SUPPORTED_FOR_Q1'],['negative',bx.d,'REJECTED_FOR_Q1']]){
  const raw=execFileSync(process.execPath,['server/build-10/recover.mjs',d],{env:{PATH:process.env.PATH,HOME:process.env.HOME,ECB10_DESTINATION_CONFIG:cp},encoding:'utf8'});const c=JSON.parse(raw);
  assert(c.records.some(x=>x.role==='b10_copy'&&x.content.body));assert(c.records.some(x=>x.role==='b10_basis'&&x.content.kind==='question'));assert(c.records.some(x=>x.role==='b10_assessment'&&x.content.outcome===want));assert(c.nonclaims.includes('No standing'));
  record('12',`cold-${name}`,{sourceStopped:true,destinationRestarted:true,initiatorSessionsClosed:true,onlyDestinationCredential:true,card:c});
 }
}finally{if(revoked)admin('destination','grant execute on function ecb10.inspect_delivery(uuid) to ecb10_observer;');if(sourceStopped)docker('start',cfg.source.container);save('resilience.json',results);await close();}
