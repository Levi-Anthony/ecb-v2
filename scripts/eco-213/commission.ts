import {createHash,randomUUID} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';
import {MODEL,EMBEDDING_MODEL,EMBEDDING_PROMPT,EMBEDDING_SCHEMA,instructions,schemas} from '../../server/circulation/profile.js';
export const LEGACY_IDS=[
 'b6420c79-34f7-494e-8f25-18bc7d92a63a','779f84ef-f3a4-4c61-b712-a6ed78f80e83','6d686eb0-619a-48b4-8b30-fb72a71e2082',
 '9cb62145-7042-491a-bdf1-8f2c406447ac','aab4816f-4445-438b-82fb-06157287c2e4','7fc2aae6-0e17-4565-a40e-2722d69591ca',
 '8bf88173-1582-41b2-8d70-9853657b8164','cc356b5a-40b0-44f2-ad0a-1910957723f3',
];
const SOURCE_FILES=['server.ts','server/circulation/profile.ts','server/circulation/tools.ts','server/circulation/worker.ts',
 'package.json','package-lock.json',
 'api/circulation/run.ts','sql/migrations/20260930155729_eco213_circulation_native.sql',
 'sql/migrations/20260930155734_eco213_circulation_execution.sql','sql/migrations/20260930165122_eco213_circulation_scheduler.sql'];
const sha=(text:string)=>createHash('sha256').update(text).digest('hex');
const quote=(text:string)=>"'"+text.replace(/'/g,"''")+"'";
const json=(v:unknown)=>quote(JSON.stringify(v))+'::jsonb';
const array=(v:string[],type='text')=>'ARRAY['+v.map(quote).join(',')+']::'+type+'[]';
const uuid=z.string().uuid(),digest=z.string().regex(/^[0-9a-f]{64}$/);
const configSchema=z.strictObject({
 authority_basis:z.string().min(1),qualified_commit:digest.or(z.string().regex(/^[0-9a-f]{40}$/)),code_digest:digest,
 launch_artifact_id:uuid,requirements_artifact_id:uuid,frozen_export_artifact_id:uuid,
 actors:z.array(z.string().regex(/^[a-zA-Z0-9._:-]{1,80}$/)).min(1),worker:z.string().regex(/^[a-zA-Z0-9._:-]{1,80}$/),
 worker_key_sha256:digest.optional(),vault_secret_id:uuid.optional(),
 worker_url:z.string().regex(/^https:\/\/[a-zA-Z0-9.-]+\/api\/circulation\/run$/).optional(),
 qualification:z.record(z.string(),z.unknown()),issued_at:z.string().datetime(),
});
export function makeCommission(input:unknown,exported:{origin:string;frozen_at:string;export_basis:unknown;rows:Record<string,unknown>[]}){
 const c=configSchema.parse(input);const expected=new Set(LEGACY_IDS);
 const corpus_operations=Object.fromEntries(LEGACY_IDS.map(id=>[id,randomUUID()]));
 if(exported.origin!=='legacy:lqbrzoicorehwidkdhoi'||exported.rows.length!==8)throw new Error('frozen_cohort_mismatch');
 const items=exported.rows.map(row=>{
  if(!expected.delete(String(row.id))||!['id','content','original_content','metadata','source_id','status','created_at','updated_at'].every(k=>k in row)
   ||typeof row.content!=='string'||!(typeof row.original_content==='string'||row.original_content===null))throw new Error('frozen_envelope_mismatch');
  return {id:String(row.id),digest:sha(JSON.stringify(row)),operation_id:corpus_operations[String(row.id)]};
 });if(expected.size)throw new Error('frozen_cohort_missing');
 const issued=new Date(c.issued_at),expires=new Date(issued.getTime()+48*60*60*1000);
 if(!Number.isFinite(issued.getTime()))throw new Error('time_basis_invalid');
 const ids=Object.fromEntries(['remit','revision','capture_work','corpus_work','corpus','differentiate','reinspect','assess','compose','embed'].map(k=>[k,randomUUID()]));
 const manifest={schema:'eco213-frozen-manifest-v1',items,export_artifact_id:c.frozen_export_artifact_id,export_basis:exported.export_basis};
 const manifestBytes=JSON.stringify(manifest);const manifestId=randomUUID();
 const sql:string[]=['begin;'];
 sql.push(`insert into public.text_artifacts(id,content) values('${manifestId}',${quote(manifestBytes)});`);
 sql.push(`insert into ecb_circulation.service_remits(id,label,authority_basis) values('${ids.remit}','ECO-213 initial bounded qualification',${quote(c.authority_basis)});`);
 sql.push(`insert into ecb_circulation.remit_revisions(id,remit_id,authority_basis,allowed_actors,allowed_sources,allowed_legacy_ids,allowed_effects,issued_at,expires_at,max_requests,max_input,max_output,max_usd)
 values('${ids.revision}','${ids.remit}',${quote(c.authority_basis)},${array([...new Set([...c.actors,c.worker])])},
 ${array(['native:capture','native:launch','native:requirements','legacy:lqbrzoicorehwidkdhoi'])},${array(LEGACY_IDS,'uuid')},
 ${array(['capture','process','execute','assimilate','preserve_output','reconcile','observe'])},${quote(issued.toISOString())},${quote(expires.toISOString())},100,16000,4000,2);`);
 sql.push(`insert into ecb_circulation.remit_heads(remit_id,revision_id,enabled) values('${ids.remit}','${ids.revision}',false);`);
 for(const kind of ['differentiate','reinspect','assess','compose','embed'] as const){
  const stage=kind==='embed'?null:kind;
  const configuration=kind==='differentiate'||kind==='reinspect'?{assessment_mechanism_id:ids.assess,embedding_mechanism_id:ids.embed}
   :kind==='assess'?{composition_mechanism_id:ids.compose}:kind==='compose'?{embedding_mechanism_id:ids.embed}:{};
  const prompt=stage?instructions[stage]:EMBEDDING_PROMPT;
  const schema=stage?z.toJSONSchema(schemas[stage]):EMBEDDING_SCHEMA;
  sql.push(`insert into ecb_circulation.mechanism_editions(id,kind,code_digest,prompt_digest,schema_digest,model,config,qualification)
   values('${ids[kind]}',${quote(kind)},${quote(c.code_digest)},${quote(sha(prompt))},${quote(sha(JSON.stringify(schema)))},
   ${quote(stage?MODEL:EMBEDDING_MODEL)},${json(configuration)},${json(c.qualification)});`);
 }
 for(const [name,frame,question,use]of [
 ['capture_work','fresh UTF-8 captures','What did the source actually report, and what remains unknown?','trusted capture and revisitable source account'],
 ['corpus_work','frozen eight-envelope edition','What constituent, relation and destination obligations does this bounded corpus disclose?','progressive assimilation and explicit reinspection'],
 ]){
  sql.push(`insert into ecb_circulation.work_accounts(id,focal_id,remit_revision_id,point_of_view,noticed_contrast,boundary,orientation,frame,question,intended_use,process_coordinate,return_route,created_by)
  values('${ids[name]}','${c.launch_artifact_id}','${ids.revision}','bounded circulation participant','raw custody versus recoverable situated use',
  'initial released cohort; no authority widening','trusted capture, cold participation and corpus assimilation',${quote(frame)},${quote(question)},${quote(use)},
  '{"issue":"ECO-213","phase":"Move","enclosing":"ECO-207"}','ECO-213 launch and evidence receipt',${quote(c.actors[0])});`);
  for(const [artifact,role]of [[c.launch_artifact_id,'launch source; historical exclusions superseded'],[c.requirements_artifact_id,'integrated governing requirements'],
   ...(name==='corpus_work'?[[c.frozen_export_artifact_id,'exact frozen source package; preservation is not semantic qualification']]:[])])
   sql.push(`insert into ecb_circulation.work_parts(work_id,constituent_id,role) values('${ids[name]}','${artifact}',${quote(role)});`);
 }
 sql.push(`insert into ecb_circulation.corpus_editions(id,manifest_carrier_id,digest,origin,expected_count,frozen_at,export_basis)
 values('${ids.corpus}','${manifestId}',${quote(sha(manifestBytes))},'legacy:lqbrzoicorehwidkdhoi',8,${quote(exported.frozen_at)},${json(exported.export_basis)});`);
 if(c.worker_key_sha256)sql.push(`insert into ecb_circulation.execution_credentials(worker,key_digest,remit_revision_id,enabled)
 values(${quote(c.worker)},decode(${quote(c.worker_key_sha256)},'hex'),'${ids.revision}',false);`);
 if(c.vault_secret_id&&c.worker_url)sql.push(`insert into ecb_circulation.scheduler_binding(remit_revision_id,worker_url,vault_secret_id,enabled,installed_runtime_basis)
 values('${ids.revision}',${quote(c.worker_url)},'${c.vault_secret_id}',false,${json({commit:c.qualified_commit,code_digest:c.code_digest,status:'requires_hosted_proof'})});`);
 sql.push('commit;');
 return {target:'vezxivrvhakclxuvxzso',status:'DORMANT PLAN; not installed or activated',ids,manifest,sql:sql.join('\n'),
  corpus_operations,
  host_bindings:{ECB_CIRCULATION_ENABLED:'false',ECB_CIRCULATION_DEFAULT_WORK_ID:ids.capture_work,ECB_CIRCULATION_DEFAULT_MECHANISM_ID:ids.differentiate,
   ECB_CIRCULATION_CODE_DIGEST:c.code_digest},
  missing_custody:[...(!c.worker_key_sha256?['worker credential hash']:[]),...(!c.vault_secret_id?['Vault secret identity']:[]),
   ...(!c.worker_url?['verified exact hosted worker URL']:[]),'target-local circulation provider credential; never a legacy secret read'],
  activation_boundary:'exact candidate + target-local credentials + preinstallation snapshot + scoped initial-use commission; activation is a separate recorded transaction',
  corpus_recipe:'Each complete exported row is passed unchanged to assimilate_corpus with JSON.stringify(row), its SHA256, corpus_work/corpus/differentiate IDs and a retained operation UUID.'};
}
export async function sourceManifest(){
 const entries=await Promise.all(SOURCE_FILES.sort().map(async path=>({path,digest:sha(await readFile(path,'utf8'))})));
 return {entries,code_digest:sha(JSON.stringify(entries))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [configPath,exportPath,outputPath]=process.argv.slice(2);if(!configPath||!exportPath||!outputPath)throw new Error('usage: commission.ts CONFIG_JSON FROZEN_EXPORT_JSON PLAN_JSON');
 const manifest=await sourceManifest();const input=JSON.parse(await readFile(configPath,'utf8'));
 const plan=makeCommission({...input,code_digest:manifest.code_digest},JSON.parse(await readFile(exportPath,'utf8')));
 await writeFile(outputPath,JSON.stringify({...plan,source_manifest:manifest},null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({plan_path:outputPath,status:plan.status,target:plan.target})); // No credentials or private corpus.
}
