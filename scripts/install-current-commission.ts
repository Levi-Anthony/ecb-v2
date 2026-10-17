/** Explicit operator-only release. No automatic deployment, SQL or credential discovery. */
import { readFile } from 'node:fs/promises';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { z } from 'zod';
import { commissionProjectionSchema, installCommissionProjection } from '../server/current-commission.js';

const bundleSchema=z.strictObject({status:z.literal('PREPARED_NOT_INSTALLED'),projection:commissionProjectionSchema,
  operations:z.strictObject({capture:z.string().uuid(),artifact:z.string().uuid(),transition:z.string().uuid()}),release_requirement:z.string(),
  update:z.strictObject({anchorId:z.string().uuid(),expectedRevisionId:z.string().uuid()}).optional()});
if(process.argv[2]!=='--apply' || !process.argv[3]) throw new Error('Explicit --apply <reviewed-payload.json> and separate release authorization are required.');
const url=new URL(process.env.ECB_COMMISSION_RELEASE_URL ?? '');
if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || url.pathname!=='/api/mcp')
  throw new Error('Use the explicitly authorized HTTPS ordinary MCP endpoint; bearer credentials only in headers.');
const token=process.env.ECB_COMMISSION_RELEASE_TOKEN;
if(!token) throw new Error('Supply an existing authorized recovery/preservation/transition credential through the environment.');
const bundle=bundleSchema.parse(JSON.parse(await readFile(process.argv[3],'utf8')));
const client=new Client({name:'ecos-commission-release-operator',version:'1.0.0'});
async function call(name:string,args:Record<string,unknown>):Promise<any> {
  const result=await client.callTool({name,arguments:args});
  if(result.isError) throw new Error(`commission_release_${name}_failed`);
  return JSON.parse((result.content as Array<{type:string;text?:string}>).find(c=>c.type==='text')?.text ?? 'null');
}
try {
  await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{headers:{authorization:`Bearer ${token}`}}}));
  const current=await installCommissionProjection(bundle.projection,bundle.operations,{
    fetchThought:id=>call('fetch',{id}),fetchArtifact:id=>call('fetch_artifact',{id}),
    capture:input=>call('capture_thought',{operation_id:input.operationId,content:input.content,source:input.source,processing_mode:input.processingMode}),
    createArtifact:input=>call('create_artifact',{operation_id:input.operationId,content:input.content}),
    setDisposition:input=>call('set_thought_disposition',{operation_id:input.operationId,thought_id:input.thoughtId,
      expected_revision_id:input.expectedRevisionId,disposition:input.disposition,projection_artifact_id:input.projectionArtifactId,projection_kind:input.projectionKind}),
  },bundle.update);
  console.log(JSON.stringify({status:'NATIVE_BINDING_VERIFIED_CONSUMER_ACCEPTANCE_PENDING',anchor_id:current.anchor_id,revision_id:current.revision_id,
    projection_artifact_id:current.projection_artifact_id,source:current.source,
    next:'Under release authorization, set nonsecret ECB_CURRENT_COMMISSION_THOUGHT_ID to this anchor, publish through permitted controls, then qualify a fresh worker.'},null,2));
} finally {await client.close();}
