import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {make,assess,close,save,uuid,cfg,admin,inspect,checks,semanticReached} from './support.mjs';
import {send} from '../../server/build-10/send.mjs';
const config={source:cfg.source.users.sender,destination:cfg.destination.users.sender};
const results=[];
try{
 const f=await make(),request=uuid();const x=await send({representation:f.p,question:f.q,request},config);assert.equal(x.observation,'ACK_OBSERVED');assert.equal(checks(await inspect(x.delivery)).length,0);
 const r=await assess(f,x.delivery);semanticReached(r);assert.equal(r.result.outcome,'SUPPORTED_FOR_Q1');
 const replay=await send({representation:f.p,question:f.q,request},config);assert.equal(replay.delivery,x.delivery);assert.equal(replay.copy,x.copy);
 const sourceObservations=JSON.parse(admin('source',`select jsonb_agg(payload_text::jsonb order by id) from public.artifacts where context_id='${f.p}' and artifact_role='b10_observation';`));
 assert(sourceObservations.every(v=>v.request===request&&v.question===f.q&&v.destination.endsWith('/build10_destination')));
 assert(sourceObservations.some(v=>v.delivery===x.delivery&&v.reported_status==='ACK_OBSERVED'));
 results.push({p:'01/08',state:'PASS',mechanism:'server/build-10/send.mjs + actual received SQL checker',sourceObservations,card:r.c});
 // Real destination unavailability: source persists the exact attempted request as UNKNOWN.
 execFileSync('docker',['stop',cfg.destination.container]);
 try{
  const unavailableRequest=uuid();const u=await send({representation:f.p,question:f.q,request:unavailableRequest},config);assert.equal(u.observation,'UNKNOWN');assert.equal(u.delivery,null);
  const retained=JSON.parse(admin('source',`select jsonb_agg(payload_text::jsonb) from public.artifacts where context_id='${f.p}' and payload_text::jsonb->>'request'='${unavailableRequest}';`));
  assert(retained.some(v=>v.reported_status==='UNKNOWN'&&v.question===f.q));results.push({p:'11',state:'PASS',mechanism:'real destination stop',result:u,sourceObservations:retained});
 }finally{execFileSync('docker',['start',cfg.destination.container]);}
 console.log('PASS P01/P08 runnable sender + semantic transfer; P11 real destination unavailability');
}finally{save('transport.json',results);await close();}
