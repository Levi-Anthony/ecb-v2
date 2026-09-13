import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {randomUUID as uuid,createHash} from 'node:crypto';
import * as F from '../build-5b/fixtures.ts';
const container='ecb10-destination-pg17',database='build10_composition_'+Date.now();
const sql=(s,db=database)=>execFileSync('docker',['exec','-i',container,'psql','-X','-qAt','-U','custodian','-d',db,'-v','ON_ERROR_STOP=1'],{input:s,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const lit=s=>`'${s.replaceAll("'","''")}'`;
const json=q=>JSON.parse(sql(q));
const controls=[];const record=(name,data)=>{controls.push({name,state:'PASS',...data});console.log(`PASS P17 ${name}`);};
const inventory=()=>json(`select coalesce(jsonb_agg(jsonb_build_object('signature',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text) order by p.oid::regprocedure::text),'[]') from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','ecb_governance','ecb7','ecb8','ecb9') and p.prokind='f'`);
const standing=()=>json(`select jsonb_build_object('claims',(select jsonb_agg(to_jsonb(c) order by id) from public.claims c),'events',(select jsonb_agg(to_jsonb(t) order by id) from public.claim_standing_transitions t),'scopes',(select jsonb_agg(to_jsonb(s) order by id) from ecb7.scopes s))`);
const checkB5=()=>{
 const receipts=[];
 for(const [op,target,want] of [[F.OP1_ID,F.A2_ID,'PASS'],[F.OP2_ID,F.A_BAD_ID,'FAIL']]){
  const a=uuid(),r=uuid();sql(`set role service_role; insert into public.artifacts(id,artifact_role,context_id,target_id) values('${a}','check_attempt','${op}','${target}');`);
  sql(`set role service_role; insert into public.artifacts(id,artifact_role,context_id) values('${r}','transformation_receipt','${a}');`);
  const result=json(`select payload_text::jsonb from public.artifacts where id='${r}'`);assert.equal(result.result,want);receipts.push(result);
 }return receipts;
};
try{
 assert.equal(sql(`select count(*) from pg_database where datname='${database}'`,'postgres'),'0','fresh composition DB only');
 sql(`create database ${database} owner postgres;`,'postgres');
 const script=readFileSync('tests/build-6/ci-reconstruct-build5b.sh','utf8');
 const pattern=/<<'SQL'\n([\s\S]*?)\nSQL|^apply (sql\/[^\n]+)|^psql [^\n]*?-f (tests\/[^\n]+)/gm;
 for(const m of script.matchAll(pattern)){
  if(m[1]!==undefined){let s=m[1];s=s.replace(/create role [^;]+;/g,'');sql(s);}
  else sql('set role postgres;'+readFileSync(m[2]??m[3],'utf8'));
 }
 sql(`set role service_role; insert into public.artifacts(id,artifact_role,context_id,payload_text) values('${F.A1_ID}','source_representation','${F.TR1}',${lit(F.A1_TEXT)});
 insert into public.artifacts(id,artifact_role,context_id) values('${F.OP1_ID}','transformation_request','${F.A1_ID}');
 insert into public.artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values('${F.A2_ID}','transformed_representation','${F.OP1_ID}',${lit(F.A2_TEXT)},true);
 insert into public.artifacts(id,artifact_role,context_id) values('${F.OP2_ID}','transformation_request','${F.A1_ID}');
 insert into public.artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values('${F.A_BAD_ID}','transformed_representation','${F.OP2_ID}',${lit(F.A_BAD_TEXT)},true);`);
 const before5=checkB5();
 for(const f of ['20260907234712_build_6_governance_bootstrap.sql','20260910090000_build_7_local_master_key.sql','20260911130000_build_8_action_envelope.sql','20260911140000_build_8_lifecycle.sql','20260912160000_build_9_recursive_inquiry.sql']){const source=readFileSync('sql/migrations/'+f,'utf8').replace(/^create role ([a-z0-9_]+)[^;]+;/gm,(statement,role)=>sql(`select 1 from pg_roles where rolname='${role}'`)?'':statement);sql('begin;'+source+'commit;');}
 const before=inventory(),standingBefore=standing();
 const b10=readFileSync('sql/migrations/20260913070000_build_10_semantic_transfer.sql','utf8').replace(/^create role ecb10_[^;]+;/gm,'');
 sql('begin;'+b10+'commit;');
 assert.deepEqual(inventory(),before);record('predecessor-definition-owner-ACL-preserved',{count:before.length});
 const after5=checkB5();record('BUILD5B-positive-negative',{before:before5,after:after5});
 const c=uuid(),q=uuid(),d=uuid();sql(`set role ecb10_owner; insert into public.referents(id) values('${c}'); select ecb10.retain('b10_basis','${c}','{"kind":"question"}','${q}'); select ecb10.retain('b10_delivery','${q}','{"request":"${uuid()}","frame":{}}','${d}');`);
 for(const [name,query] of [
  ['B5B-input-role',`set role service_role; insert into public.artifacts(artifact_role,context_id) values('transformation_request','${d}');`],
  ['B7-candidate-role',`set role ecb7_evaluator; select ecb7.attempt('${uuid()}','${d}');`],
  ['B8-envelope-role',`set role ecb8_owner; select ecb8.doc('${d}','b8_envelope');`],
  ['B9-inquiry-role',`set role ecb9_owner; select ecb9.doc('${d}','b9_inquiry');`],
  ['old-role-cannot-publish-B10',`set role service_role; insert into public.artifacts(id,artifact_role,context_id,payload_text) values('${uuid()}','b10_assessment','${d}','{"outcome":"SUPPORTED_FOR_Q1","findings":[]}');`]]){
  let error;try{sql(query);}catch(e){error=String(e.stderr);}assert(error,name);record(name,{error});
 }
 const r=json(`set role ecb9_owner; select ecb9.compare('{"language":"required_paths/v1","required_paths":[["evidence"]]}','{"evidence":[1]}');`);assert.equal(r.outcome,'PASS');
 const bad=json(`set role ecb9_owner; select ecb9.compare('{"language":"required_paths/v1","required_paths":[["evidence"]]}','{}');`);assert.notEqual(bad.outcome,'PASS');record('B9-finite-comparator-preserved',{positive:r,negative:bad});
 assert.deepEqual(standing(),standingBefore);record('no-standing-designation-effect',{snapshot:standingBefore});
 const rls=json(`select jsonb_build_object('rls',relrowsecurity,'b10_tables',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='ecb10' and c.relkind='r')) from pg_class where oid='public.artifacts'::regclass`);assert(rls.rls);assert.equal(rls.b10_tables,0);record('existing-RLS-no-packet-table',rls);
}catch(e){controls.push({state:'FAIL_OR_INCONCLUSIVE',error:e.message,detail:String(e.stderr??'')});throw e;}
finally{writeFileSync('docs/build-receipts/evidence/build-10/composition.json',JSON.stringify({p:'17',database,controls,limits:'Exact shared seams and B5B bounded checker regressions; no re-proving B7/8/9 complete capabilities.'},null,2)+'\n');}
