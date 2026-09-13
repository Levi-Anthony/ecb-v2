import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {connect} from '../../server/build-10/client.mjs';
import {resolve} from '../../server/build-10/resolve.mjs';
export const cfg=JSON.parse(readFileSync('/private/tmp/ecb10-local.json','utf8'));
export const uuid=randomUUID;
export const sha=x=>createHash('sha256').update(x).digest('hex');
const all=[];
export async function db(side,role){const c=connect(cfg[side].users[role],role); all.push(c.db); await c.ready; return c.db;}
export const S=await db('source','fixture'),D=await db('destination','fixture');
export const sender=await db('source','sender'),receiver=await db('destination','receiver'),caller=await db('destination','caller'),observer=await db('destination','observer');
export const resolverConfig={source:cfg.source.users.resolver,destination:cfg.destination.users.resolver};
export const close=()=>Promise.all(all.map(d=>d.end()));
export function admin(side,sql){return execFileSync('docker',['exec','-i',cfg[side].container,'psql','-X','-qAt','-U','custodian','-d',cfg[side].database,'-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8'}).trim();}
export const save=(name,data)=>{mkdirSync('docs/build-receipts/evidence/build-10',{recursive:true});writeFileSync(`docs/build-receipts/evidence/build-10/${name}`,JSON.stringify(data,null,2)+'\n');};
export const fixture=async(db,c,j,i=uuid())=>(await db`select ecb10.fixture(${c}::uuid,${db.json(j)},${i}::uuid) x`)[0].x;
export const scope=async db=>(await db`select ecb10.scope() x`)[0].x;
export const inspect=async d=>(await observer`select ecb10.inspect_delivery(${d}::uuid) x`)[0].x;
export const checks=c=>c.records.filter(x=>x.role==='b10_assessment');
export const findings=c=>checks(c).at(-1).content.findings;
export async function make({value=100, mutate=x=>x, frameMutate=x=>x, bindingMutate=x=>x, bytes=null, basisMutate=x=>x}={}){
 const f={scope:await scope(S),dscope:await scope(D),namespace:uuid(),focal:uuid(),revision:uuid(),report:uuid(),projection:uuid(),contract:uuid()};
 f.binding=bindingMutate({focal:f.focal,revision:f.revision,report:f.report,report_version:'B2',projection:f.projection,projection_version:'1',contract:f.contract,contract_version:'1'});
 f.population=[uuid(),uuid()];
 f.criterion={quantifier:'all',operator:'le',threshold:100,unit:'ms',context:'warm-start/single-request'};
 f.limits=['historical','synthetic','no cold-start','no retry','no concurrent-load','no production','no present-performance','no warranty','no action'];
 f.manifest=[{role:'criterion',kind:'criterion',id:uuid(),version:'1',selector:'rule'},
  {role:'W1',kind:'value',id:f.population[0],version:'1',selector:'value'},
  {role:'W2',kind:'value',id:f.population[1],version:'1',selector:'value'},
  {role:'selector',kind:'selector',id:uuid(),version:'1',selector:'population'},
  {role:'unit_context',kind:'unit_context',id:uuid(),version:'1',selector:'context'}];
 for(const m of f.manifest){let v={kind:m.kind,version:m.version};
  if(m.role==='criterion') v.rule=f.criterion;
  if(m.role==='W1'||m.role==='W2') Object.assign(v,{value:m.role==='W1'?80:value,unit:'ms',context:f.criterion.context});
  if(m.role==='selector') v.population=f.population;
  if(m.role==='unit_context') Object.assign(v,{unit:'ms',context:f.criterion.context});
  await fixture(S,f.scope,basisMutate(v),m.id);
 }
 await fixture(S,f.scope,{kind:'report',version:f.binding.report_version,binding:f.binding,manifest:f.manifest,limits:f.limits},f.report);
 f.body=mutate({language:'b10-comparison-json/v1',...f.binding,manifest:f.manifest,proposition:{...f.criterion,population:f.population,asserted_result:true},expressions:['each declared observation met the threshold'],limits:f.limits,encoding:'UTF-8',integrity:'SHA-256'});
 f.bytes=bytes??Buffer.from(JSON.stringify(f.body)); f.p=uuid();
 f.frame=frameMutate({namespace:f.namespace,source_artifact:f.p,projection:f.projection,projection_version:'1',length:f.bytes.length});
 const ex=(await S`select ecb10.export(${f.scope}::uuid,${f.p}::uuid,${S.json(f.frame)},${f.bytes},${S.json(f.binding)}) x`)[0].x; f.export=ex.export;
 f.method=(await D`select ecb10.seal(${f.dscope}::uuid) x`)[0].x;
 f.question={kind:'question',version:'Q1/v1',namespace:f.namespace,binding:f.binding,manifest:f.manifest,population:f.population,criterion:f.criterion,limits:f.limits,export:f.export,method:f.method,question:`Does this actual received projection support the historical note that the two declared warm-start single-request observations for the exact revision in ${f.binding.report_version} each met 100 ms?`,use:'historical note only',resolver:'ecb10 exact source-read-only resolver/v1'};
 f.q=await fixture(D,f.dscope,f.question); return f;
}
export async function deliver(f,{request=uuid(),bytes=null,partial=false,frame=f.frame}={}){
 // Read selected raw body through source sender interface, not fixture memory.
 const exported=(await sender`select ecb10.read_export(${f.p}::uuid) x`)[0].x;
 const body=bytes??Buffer.from(exported.body,'base64');
 const d=(await receiver`select ecb10.admit(${f.q}::uuid,${request}::uuid,${receiver.json(frame)},null) x`)[0].x;
 if(partial) await receiver`select ecb10.observe_partial(${d}::uuid,${body.subarray(0,8)})`;
 const cp=(await receiver`select ecb10.complete(${d}::uuid,${receiver.json(frame)},${body}) x`)[0].x;
 return {d,cp,request,body};
}
export async function begin(f,d,request=uuid(),method=f.method){return (await caller`select ecb10.begin_check(${d}::uuid,${request}::uuid,${method}::uuid) x`)[0].x;}
export async function assess(f,d,{method=f.method}={}){
 const a=await begin(f,d,uuid(),method);
 await caller`select ecb10.observe_integrity(${a}::uuid)`;
 await resolve(a,resolverConfig);
 const t=(await caller`select ecb10.finish_check(${a}::uuid) x`)[0].x;
 const c=await inspect(d);return {a,t,c,result:checks(c).find(x=>x.id===t)?.content};
}
export function semanticReached(r){for(const key of ['encoding','integrity_observation','origin','provenance']) assert(r.result.findings.some(x=>x.component===key&&x.state==='PASS'),`precondition ${key}: ${JSON.stringify(r.result)}`);}
