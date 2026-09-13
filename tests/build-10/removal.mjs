// P18 counterfactual fault injection at the protected controller seam, in rollback-only
// transactions. This is not a claim of resistance to a malicious database owner.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {randomUUID as uuid} from 'node:crypto';
const sql=s=>execFileSync('docker',['exec','-i','ecb10-destination-pg17','psql','-X','-qAt','-U','custodian','-d','build10_destination','-v','ON_ERROR_STOP=1'],{input:s,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const loc=JSON.parse(readFileSync('docs/build-receipts/evidence/build-10/pressure-locators.json','utf8'));
const results=[];
const duplicate=(id,newId=uuid())=>`set role ecb10_owner; select ecb10.retain(artifact_role,context_id,payload_text::jsonb,'${newId}') from public.artifacts where id='${id}'; reset role;`;
try{
 const check=loc.good.a,terminal=loc.good.t,delivery=loc.transfer.d,copy=loc.transfer.cp;
 const obs=JSON.parse(sql(`select jsonb_object_agg(payload_text::jsonb->>'kind',id) from public.artifacts where context_id='${check}' and artifact_role='b10_observation'`));
 for(const [index,id,p] of [['b10_delivery_request',delivery,'08'],['b10_copy_slot',copy,'08/14'],['b10_check_request',check,'08'],['b10_terminal_slot',terminal,'10/14'],['b10_observation_slot',obs.resolver,'09/13']]){
  let error;try{sql('begin;'+duplicate(id)+'rollback;');}catch(e){error=String(e.stderr);}assert(error?.includes('duplicate key'),`intact ${index} did not reject`);
  const output=sql(`begin; drop index public.${index}; ${duplicate(id)} rollback;`);assert(output);
  results.push({component:index,obligation:p,intact:'duplicate rejected',removed:'duplicate admitted under injected faulty internal retain call',restoration:'transaction rollback',classification:'small unique index discharges structural liability; no new packet table needed'});
 }
 let denied;try{sql(`begin; set role ecb10_owner; update public.artifacts set payload_text=payload_text where false; rollback;`);}catch(e){denied=String(e.stderr);}assert(denied?.includes('permission denied'));
 // Grant-only removal leaves predecessor immutable trigger effective.
 let immutable;try{sql(`begin; grant update(payload_text) on public.artifacts to ecb10_owner; set role ecb10_owner; update public.artifacts set payload_text=payload_text where false; rollback;`);}catch(e){immutable=String(e.stderr);}assert(immutable?.includes('immutable'));
 results.push({component:'write grant boundary',obligation:'15',removed:'predecessor immutability trigger still denies zero-row mutation',classification:'layered preservation; no redundant table-level RLS introduced'});
 // Unindexed recovery remains correct: context index is an optimization, not acceptance authority.
 const before=sql(`set role ecb10_owner; select ecb10.inspect_delivery('${delivery}');`);
 const after=sql(`begin; drop index if exists public.b10_context; set role ecb10_owner; select ecb10.inspect_delivery('${delivery}'); rollback;`);
 assert.deepEqual(JSON.parse(after),JSON.parse(before));
 results.push({component:'b10_context lookup index',obligation:'12',removed:'same exact recovery',classification:'optional performance aid, no semantic necessity established; remove from implementation'});
 const counts=JSON.parse(sql(`select jsonb_build_object('b10_tables',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='ecb10' and c.relkind='r'),'unregistered',(select count(*) from public.artifacts a left join public.referents r on r.id=a.id where a.artifact_role like 'b10_%' and r.id is null),'duplicate_terminals',(select count(*) from (select context_id from public.artifacts where artifact_role='b10_assessment' group by context_id having count(*)>1)t))`));
 assert.deepEqual(counts,{b10_tables:0,unregistered:0,duplicate_terminals:0});
 results.push({component:'complete Artifact episode',observed:counts,classification:'no residual integrity/lifecycle/transaction/reconstruction/bypass liability found in exercised finite surfaces'});
 console.log('P18 PASS: exact smaller safeguards discriminate injected defects; optional lookup index unearned.');
}finally{writeFileSync('docs/build-receipts/evidence/build-10/removal.json',JSON.stringify({p:'18',state:results.length===8?'PASS':'INCONCLUSIVE',controls:results,limits:'Finite tested composition only. Internal retain injections simulate controller defects; hostile-owner protection is not claimed. AP-05 remains open to new residual evidence.'},null,2)+'\n');}
