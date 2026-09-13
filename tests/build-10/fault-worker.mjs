// Driver-only cut points. IPC goes to the fault controller, never a sender ACK record.
import {cfg} from './worker-config.mjs';
import {connect} from '../../server/build-10/client.mjs';
import {resolve} from '../../server/build-10/resolve.mjs';
const {base:f,stage,delivery}=JSON.parse(process.env.ECB10_FAULT_INPUT);
const R=connect(cfg.destination.users.receiver,'receiver'),C=connect(cfg.destination.users.caller,'caller');await R.ready;await C.ready;
const d=delivery??(await R.db`select ecb10.admit(${f.q}::uuid,${crypto.randomUUID()}::uuid,${R.db.json(f.frame)},null) x`)[0].x;
let a;
if(stage==='partial') await R.db`select ecb10.observe_partial(${d}::uuid,${Buffer.from(f.bytes).subarray(0,8)})`;
if(['complete','check','terminal','uncommitted-terminal'].includes(stage)) await R.db`select ecb10.complete(${d}::uuid,${R.db.json(f.frame)},${Buffer.from(f.bytes)})`;
if(['check','terminal','uncommitted-terminal'].includes(stage)) a=(await C.db`select ecb10.begin_check(${d}::uuid,${crypto.randomUUID()}::uuid,${f.method}::uuid) x`)[0].x;
if(['terminal','uncommitted-terminal'].includes(stage)){
 await C.db`select ecb10.observe_integrity(${a}::uuid)`;await resolve(a,{source:cfg.source.users.resolver,destination:cfg.destination.users.resolver});
 if(stage==='uncommitted-terminal'){
  await C.db.begin(async tx=>{await tx`select ecb10.finish_check(${a}::uuid)`;process.send({d,a,stage,committed:false});await new Promise(()=>{});});
 }else await C.db`select ecb10.finish_check(${a}::uuid)`;
}
process.send({d,a,stage,committed:true});await new Promise(()=>{});
