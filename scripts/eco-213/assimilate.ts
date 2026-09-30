import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {z} from 'zod';
import {LEGACY_IDS,type makeCommission} from './commission.js';

type Plan=ReturnType<typeof makeCommission>;
type FrozenExport={origin:string;rows:Record<string,unknown>[]};
type Call=(name:string,args:Record<string,unknown>)=>Promise<any>;
const sha=(text:string)=>createHash('sha256').update(text).digest('hex');
const uuid=z.string().uuid();

// Prepare every request before dispatch: a later mismatch must not leave a partially
// imported, unexamined cohort. Operation IDs belong to the preserved commission plan.
export function corpusRequests(plan:Plan,exported:FrozenExport){
 if(plan.target!=='vezxivrvhakclxuvxzso'||exported.origin!=='legacy:lqbrzoicorehwidkdhoi'
  ||exported.rows.length!==8||plan.manifest.items.length!==8)throw new Error('frozen_cohort_mismatch');
 const expected=new Set(LEGACY_IDS);
 const requests=exported.rows.map(envelope=>{
  const legacyId=String(envelope.id);const bytes=JSON.stringify(envelope);const digest=sha(bytes);
  if(!expected.delete(legacyId)||!plan.manifest.items.some(item=>item.id===legacyId&&item.digest===digest
   &&item.operation_id===plan.corpus_operations?.[legacyId]))throw new Error('frozen_manifest_mismatch');
  return {operation_id:uuid.parse(plan.corpus_operations?.[legacyId]),work_id:uuid.parse(plan.ids.corpus_work),
   mechanism_id:uuid.parse(plan.ids.differentiate),corpus_id:uuid.parse(plan.ids.corpus),envelope,envelope_bytes:bytes,envelope_digest:digest};
 });
 if(expected.size||new Set(requests.map(x=>x.operation_id)).size!==8)throw new Error('corpus_operation_identity_conflict');
 return requests;
}
export async function assimilate(plan:Plan,exported:FrozenExport,call:Call){
 const requests=corpusRequests(plan,exported);
 const recovered=await call('recover_work',{work_id:plan.ids.corpus_work});
 const work=recovered.work?.find((w:any)=>w.id===plan.ids.corpus_work);
 const remit=recovered.remits?.find((r:any)=>r.id===plan.ids.revision);
 const mechanism=recovered.mechanisms?.find((m:any)=>m.id===plan.ids.differentiate);
 if(recovered.contract_version!=='eco213-v1'||work?.remit_revision_id!==plan.ids.revision
  ||mechanism?.kind!=='differentiate'||mechanism.code_digest!==plan.host_bindings.ECB_CIRCULATION_CODE_DIGEST)throw new Error('corpus_current_basis_mismatch');
 if(!remit?.enabled||remit.expired||!(Date.parse(remit.expires_at)>Date.now())
  ||!remit.allowed_effects?.includes('assimilate')||!remit.allowed_sources?.includes(exported.origin)
  ||LEGACY_IDS.some(id=>!remit.allowed_legacy_ids?.includes(id)))throw new Error('corpus_remit_inactive_or_out_of_scope');
 const results=[];
 for(const request of requests){
  try{
   const result=await call('assimilate_corpus',request);
   if(result.processing!=='admitted'||!result.source_occurrence_id||!result.activity_id)throw new Error('corpus_admission_unverified');
   results.push({legacy_id:request.envelope.id,operation_id:request.operation_id,status:'admitted',receipt:result});
  }catch{
   // A transport failure may follow a commit. Preserve its operation/request for
   // recovery and exact replay, never allocate a fresh operation or regenerate.
   results.push({legacy_id:request.envelope.id,operation_id:request.operation_id,status:'OUTCOME_UNKNOWN',
    recovery:'inspect_processing; retry only this preserved exact request'});
   return {status:'PARTIAL',results,remaining:requests.slice(results.length).map(x=>String(x.envelope.id)),semantic_qualification:'NOT_ESTABLISHED'};
  }
 }
 return {status:'SOURCE_ADMISSION_COMPLETE',results,remaining:[],semantic_qualification:'NOT_ESTABLISHED',
  next:'inspect_processing; qualify differentiation, activation, relations and composition separately'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [planPath,exportPath,reportPath]=process.argv.slice(2);
 if(!planPath||!exportPath||!reportPath)throw new Error('usage: assimilate.ts PLAN_JSON FROZEN_EXPORT_JSON PRIVATE_REPORT_JSON');
 const endpoint=process.env.ECB_CIRCULATION_MCP_URL,bearer=process.env.ECB_CIRCULATION_PARTICIPANT_BEARER;
 if(!endpoint?.startsWith('https://')||!bearer)throw new Error('scoped_ordinary_endpoint_or_credential_unavailable');
 const plan=JSON.parse(await readFile(planPath,'utf8')),exported=JSON.parse(await readFile(exportPath,'utf8'));
 corpusRequests(plan,exported);
 const client=new Client({name:'eco213-frozen-corpus-participant',version:'1'},{versionNegotiation:{mode:{pin:'2026-07-28'}}});
 const transport=new StreamableHTTPClientTransport(new URL(endpoint),{requestInit:{headers:{authorization:`Bearer ${bearer}`}}});
 try{
  await client.connect(transport);
  const result=await assimilate(plan,exported,async(name,args)=>{
   const r=await client.callTool({name,arguments:args});
   if(r.isError)throw new Error('ordinary_operation_failed');
   const block=(r.content as {type:string;text?:string}[]).find(x=>x.type==='text');
   if(!block?.text)throw new Error('ordinary_receipt_missing');
   return JSON.parse(block.text);
  });
  await writeFile(reportPath,JSON.stringify(result,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:result.status,admitted:result.results.filter(x=>x.status==='admitted').length,
   semantic_qualification:result.semantic_qualification,report_path:reportPath}));
 }finally{await client.close();}
}
