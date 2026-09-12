import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import postgres from '../build-7/node_modules/postgres/src/index.js';
export const uuid=randomUUID;
export const sha=s=>createHash('sha256').update(s).digest('hex');
export const connect=(user='b9_parent')=>postgres(`postgres://${user}@127.0.0.1:55442/build9`,{max:1,prepare:false,onnotice:()=>{}});
export const admin=connect('postgres'), parent=connect(), child=connect('b9_child'), observer=connect('b9_observer'),writer=connect('b9_writer');
export const close=()=>Promise.all([admin,parent,child,observer,writer].map(db=>db.end()));
export const save=(name,data)=>{mkdirSync('docs/build-receipts/evidence/build-9',{recursive:true});writeFileSync(`docs/build-receipts/evidence/build-9/${name}`,JSON.stringify(data,null,2)+'\n');};
export const source=async(id,db=observer)=>(await db`select ecb9.read_source(${id}::uuid) x`)[0].x;
export const inspect=async(f,db=observer)=>(await db`select ecb9.inspect(${typeof f==='string'?f:f.p}::uuid) x`)[0].x;
export const head=async f=>(await inspect(f)).boundary;
export const ref=async()=>(await admin`insert into public.referents(id) values(${uuid()}::uuid) returning id`)[0].id;
export const fixture=async(f,j)=>(await admin`select ecb9.fixture(${f.scope}::uuid,${admin.json({synthetic:true,...j})}) id`)[0].id;
export const binding=async f=>(await inspect(f)).dependency.binding;
export async function open(f,opts={}){const db=opts.db??parent;return(await db`select ecb9.open_child(${f.p}::uuid,${db.json(opts.binding??await binding(f))},${opts.pred===undefined?await head(f):opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function publish(f,opts={}){const db=opts.db??child,card=await inspect(f);return(await db`select ecb9.publish(${f.p}::uuid,${opts.attempt??card.child.attempt}::uuid,${db.json(opts.binding??card.dependency.binding)},${opts.submission==null?null:db.json(opts.submission)},${opts.pred===undefined?card.boundary:opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function returned(f,q,opts={}){const db=opts.db??parent;return(await db`select ecb9.return_result(${f.p}::uuid,${q}::uuid,${db.json(opts.binding??await binding(f))},${opts.pred===undefined?await head(f):opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function reenter(f,opts={}){const db=opts.db??parent,card=opts.card??await inspect(f);return(await db`select ecb9.reenter(${f.p}::uuid,${db.json(opts.observations??card.observations)},${opts.pred===undefined?card.boundary:opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function observe(f,slot,version,complete=true,opts={}){const db=opts.db??writer;return(await db`select ecb9.observe(${f.p}::uuid,${slot},${version}::uuid,${complete},${opts.pred===undefined?await head(f):opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function retry(f,opts={}){const db=opts.db??parent;return(await db`select ecb9.retry_attempt(${f.p}::uuid,${opts.pred===undefined?await head(f):opts.pred}::uuid,${opts.request??uuid()}::uuid) x`)[0].x;}
export async function run(f){const o=await open(f);assert.equal(o.opened,true,JSON.stringify(o));const q=await publish(f);await returned(f,q.judgment);const r=await reenter(f);return{o,q,r,card:await inspect(f)};}
export async function make(options={}){
 const f={scope:await ref(),subjects:{}};
 const b7=await admin`select ecb7.fixture('b7_contract',${f.scope}::uuid,${admin.json({synthetic:true,limits:'scope lock only; no BUILD 7 selection'})}) id`;
 await admin`insert into ecb7.scopes(id,focal,contract,synthetic) values(${f.scope}::uuid,${f.scope}::uuid,${b7[0].id}::uuid,true)`;
 for(const k of ['governance','applicability','method','criteria','witnesses','source'])f.subjects[k]=await ref();
 f.source=await fixture(f,{kind:'source',subject:f.subjects.source,path:'docs/invariants.md',version:'authorized main@2ea989d1a5be083d41b9f83908a7d3a191d5b5ed',bytes:readFileSync('docs/invariants.md','utf8'),standing:'retained real governing source; synthetic specimen does not amend/designate it'});
 // Comparison contract supplied independently from interpreter outputs. These
 // witnesses exercise the actual G1 required-evidence/provenance rule family.
 f.question='May this exact retained inquiry judgment be relied upon for the next bounded inspection step under the bound governance basis, or must reliance be requalified/reoriented/held?';
 f.childQuestion='Does the bound evidence comparator discriminate the declared missing-evidence and missing-method violations from correspondence?';
 f.g={kind:'governance',subject:f.subjects.governance,language:'required_paths/v1',required_paths:[['evidence'],['criteria'],['method'],['findings']],source:f.source};
 if(options.insensitive)f.g.required_paths=[['criteria'],['findings']];
 if(options.extraRule)f.g.required_paths.push(['unsupported_field']);
 f.versions={}; f.versions.governance=await fixture(f,f.g);
 f.versions.applicability=await fixture(f,{kind:'applicability',subject:f.subjects.applicability,applicable:options.applicable??true,remit:'synthetic inspection only; no action, designation or amendment'});
 const definition=(await admin`select pg_get_functiondef('ecb9.compare(jsonb,jsonb)'::regprocedure) d`)[0].d;
 f.versions.method=await fixture(f,{kind:'method',subject:f.subjects.method,definition:options.opaque?'unavailable':definition,digest:sha(definition),configuration:'required_paths/v1; nonempty exact JSON paths'});
 f.ct={kind:'criteria',subject:f.subjects.criteria,source:f.source,scope:f.scope,proposition:f.childQuestion,cases:[{id:'correspondence',expected:'PASS'},{id:'missing_evidence',expected:'FAIL'},{id:'missing_method',expected:'FAIL'}],branches:{PASS:'permit bounded reliance if all parent conditions hold',FAIL:options.failRoute??'framing defeated; corrective inquiry'}};
 f.versions.criteria=await fixture(f,f.ct);
 const good={evidence:[f.source],criteria:f.versions.criteria,method:f.versions.method,findings:[{obligation:'declared bounded correspondence',witness:f.source}]};
 const noEvidence={...good};delete noEvidence.evidence;const noMethod={...good};delete noMethod.method;
 f.w={kind:'witnesses',subject:f.subjects.witnesses,proposition:f.childQuestion,scope:f.scope,inputs:{correspondence:good,missing_evidence:noEvidence,missing_method:noMethod}};
 if(options.missingWitness)delete f.w.inputs.missing_method;
 f.versions.witnesses=await fixture(f,f.w);
 f.decision=(await admin`insert into public.claims(proposition,scope) values(${f.question},${f.scope}) returning id`)[0].id;
 f.dependencies={};
 for(const [k,version] of Object.entries(f.versions)){
  const claim=(await admin`insert into public.claims(scope,claim_kind,subject_referent_id,predicate,object_referent_id) values(${f.scope},'relation',${f.decision}::uuid,'depends_on',${f.subjects[k]}::uuid) returning id`)[0].id;
  f.dependencies[k]={claim,component:f.subjects[k],version};
 }
 f.c={synthetic:true,scope:f.scope,depth:0,focal:f.subjects.governance,question:f.question,discriminator:'proof sensitivity with independently applicable parent basis',step:'inspect the next retained judgment under the bound evidence rules',decision_claim:f.decision,dependencies:f.dependencies,unresolved:'governance',child_question:f.childQuestion,remit:'synthetic inspection only; no action, designation or amendment',stopping_rule:'Stop at bounded witness discrimination; unavailable indispensable deeper dependency stays HOLD/QF.',question_forward:{question:'Which exact retained evidence, method, or independent applicability observation discharges this blocker?',discriminator:'named witness discriminates correspondence/violation; exact declared writer history is complete',route:'supply source under fixture custody; successor inquiry for changed basis; independently reenter',restart:'exact source restored or new bound inquiry/version established'},source_standing:'Real invariant retained as source; Claims unassessed; fixture-only supplied semantic meanings and remit.',observation_rule:'Complete serialized history of declared synthetic source writers, exact versions; wall time audit-only; no external source continuity inferred.',resolution:options.resolution??'child witness examination',path_available:options.pathAvailable??true};
 f.p=(await admin`select ecb9.bind(${f.scope}::uuid,${admin.json(f.c)}) id`)[0].id;
 return f;
}
