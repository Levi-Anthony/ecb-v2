import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import app from '../server.ts';
import { commissionDigest, prepareCommissionProjection, getCurrentCommission, installCommissionProjection,
  type CommissionAnchor, type CommissionInstallPorts } from '../server/current-commission.ts';
import { oauthToolDenial } from '../server/oauth.ts';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const source = await readFile(new URL('../docs/current-product-delivery-commission.md', import.meta.url), 'utf8');
const projection = prepareCommissionProjection(source, uuid(1), [uuid(2)]);
function fixture() {
  let anchor: CommissionAnchor | null = null;
  const artifacts = new Map([[uuid(1),source]]), replay = new Map<string, unknown>();
  const calls: string[] = [];
  const ports: CommissionInstallPorts = {
    async fetchArtifact(id) { calls.push('fetchArtifact'); const content=artifacts.get(id); return content===undefined ? null : {id,content}; },
    async fetchThought(id) { calls.push('fetchThought'); return anchor?.id===id ? structuredClone(anchor) : null; },
    async createArtifact(input) {
      calls.push('createArtifact');
      const previous = replay.get(input.operationId) as {artifact:{id:string;content:string}} | undefined;
      if(previous) { assert.equal(previous.artifact.content,input.content); return previous; }
      const id=uuid(10+artifacts.size); artifacts.set(id,input.content);
      const result={artifact:{id,content:input.content}}; replay.set(input.operationId,result); return result;
    },
    async capture(input) {
      calls.push('capture'); assert.equal(input.processingMode,'raw_only');
      const previous=replay.get(input.operationId) as {request:unknown;thought:{id:string}} | undefined;
      // ecb11_capture_thought and the ordinary adapter both return the CURRENT
      // head on replay, not a snapshot of the original capture disposition.
      if(previous) {
        assert.deepEqual(previous.request,input);
        assert.equal(anchor?.id,previous.thought.id);
        return {thought:previous.thought,disposition:structuredClone(anchor!.disposition)};
      }
      anchor={id:uuid(3),disposition:{revision_id:uuid(4),state:'unresolved'},projection:{artifact_id:uuid(5),kind:'HOLD',content:'not selected'}};
      const result={thought:{id:anchor.id},disposition:anchor.disposition};
      replay.set(input.operationId,{request:structuredClone(input),thought:result.thought}); return structuredClone(result);
    },
    async setDisposition(input) {
      calls.push('setDisposition');
      const previous=replay.get(input.operationId) as {request:unknown;result:{disposition:{revision_id:string}}} | undefined;
      if(previous) {
        if(JSON.stringify(previous.request)!==JSON.stringify(input)) throw new Error('ecb11_operation_conflict');
        return structuredClone(previous.result);
      }
      if(!anchor || anchor.id!==input.thoughtId || anchor.disposition.revision_id!==input.expectedRevisionId)
        throw new Error('eco138_disposition_predecessor_conflict');
      anchor={id:anchor.id,disposition:{revision_id:uuid(30+replay.size),state:input.disposition},
        projection:{artifact_id:input.projectionArtifactId,kind:input.projectionKind,content:artifacts.get(input.projectionArtifactId)!}};
      const result={disposition:anchor.disposition}; replay.set(input.operationId,{request:structuredClone(input),result:structuredClone(result)}); return result;
    },
  };
  return {ports,calls,artifacts,get anchor(){return anchor;},set anchor(value:CommissionAnchor|null){anchor=value;}};
}
const operations={capture:uuid(100),artifact:uuid(101),transition:uuid(102)};

test('native capture replay exposes the current head and transition replay binds its original predecessor', async () => {
  const f=fixture(), input={operationId:operations.capture,content:'anchor',source:'fixture',processingMode:'raw_only' as const};
  const captured=await f.ports.capture(input);
  const artifact=await f.ports.createArtifact({operationId:operations.artifact,content:JSON.stringify(projection)});
  const transition={operationId:operations.transition,thoughtId:captured.thought.id,expectedRevisionId:captured.disposition.revision_id,
    disposition:'current_commission',projectionArtifactId:artifact.artifact.id,projectionKind:'ACTION' as const};
  const installed=await f.ports.setDisposition(transition), replayed=await f.ports.capture(input);
  assert.notEqual(replayed.disposition.revision_id,captured.disposition.revision_id);
  assert.equal(replayed.disposition.revision_id,installed.disposition.revision_id);
  assert.deepEqual(await f.ports.setDisposition(transition),installed);
  await assert.rejects(f.ports.setDisposition({...transition,expectedRevisionId:replayed.disposition.revision_id}),/ecb11_operation_conflict/);
});

for(const stage of ['createArtifact','capture','setDisposition'] as const)
  test(`interrupted after ${stage} commits: retry recovers the identical install with stable identities`, async () => {
    const f=fixture();
    const interrupted:CommissionInstallPorts={...f.ports,async [stage](input:any) {
      await f.ports[stage](input); throw new Error('lost_acknowledgement');
    }};
    await assert.rejects(installCommissionProjection(projection,operations,interrupted),/lost_acknowledgement/);
    const installedHead=stage==='setDisposition' ? structuredClone(f.anchor) : null;
    const transitions=f.calls.filter(c=>c==='setDisposition').length;
    const recovered=await installCommissionProjection(projection,operations,f.ports);
    assert.deepEqual(await installCommissionProjection(projection,operations,f.ports),recovered);
    assert.equal(f.artifacts.size,2);
    assert.equal(f.calls.filter(c=>c==='setDisposition').length,stage==='setDisposition' ? transitions : 1);
    if(installedHead) assert.equal(recovered.revision_id,installedHead.disposition.revision_id);
    assert.equal(recovered.source_content,source);
  });

test('update with lost transition acknowledgement recovers without rebasing the saved predecessor', async () => {
  const f=fixture(), first=await installCommissionProjection(projection,operations,f.ports);
  const updated={...projection,next_action:'Verify the accepted connected consumer.'};
  const nextOps={capture:uuid(110),artifact:uuid(111),transition:uuid(112)};
  const update={anchorId:first.anchor_id,expectedRevisionId:first.revision_id};
  await assert.rejects(installCommissionProjection(updated,nextOps,{...f.ports,async setDisposition(input){
    await f.ports.setDisposition(input); throw new Error('lost_acknowledgement');
  }},update),/lost_acknowledgement/);
  const committed=structuredClone(f.anchor!), transitions=f.calls.filter(c=>c==='setDisposition').length;
  const recovered=await installCommissionProjection(updated,nextOps,f.ports,update);
  assert.equal(recovered.revision_id,committed.disposition.revision_id);
  assert.equal(recovered.next_action,updated.next_action);
  assert.equal(f.calls.filter(c=>c==='setDisposition').length,transitions);
});

for(const updated of [false,true]) test(`${updated ? 'update' : 'initial'} retry refuses a conflicting current head without a transition`, async () => {
  const f=fixture(), first=await installCommissionProjection(projection,operations,f.ports);
  const competing={...projection,next_action:'A separately admitted current action.'};
  const next=await installCommissionProjection(competing,{capture:uuid(110),artifact:uuid(111),transition:uuid(112)},f.ports,
    {anchorId:first.anchor_id,expectedRevisionId:first.revision_id});
  const baseline=structuredClone(f.anchor), transitions=f.calls.filter(c=>c==='setDisposition').length;
  await assert.rejects(installCommissionProjection(projection,operations,f.ports,
    updated ? {anchorId:first.anchor_id,expectedRevisionId:first.revision_id} : undefined),/predecessor_conflict/);
  assert.deepEqual(f.anchor,baseline);
  assert.equal((await getCurrentCommission(first.anchor_id,f.ports)).revision_id,next.revision_id);
  assert.equal(f.calls.filter(c=>c==='setDisposition').length,transitions);
});

for(const conflict of ['disposition','artifact','authority','summary','edition'] as const)
  test(`initial retry rejects competing ${conflict} even when the source identity is unchanged`, async () => {
    const f=fixture(), installed=await installCommissionProjection(projection,operations,f.ports);
    const changed={...projection,
      ...(conflict==='authority' ? {authority_refs:[uuid(777)]} : {}),
      ...(conflict==='summary' ? {summary:'A different projection over the same source.'} : {}),
      ...(conflict==='edition' ? {source:{...projection.source,edition:'unadmitted-edition'}} : {}),
    };
    const artifact=conflict==='disposition' ? installed.projection_artifact_id
      : (await f.ports.createArtifact({operationId:uuid(120),content:JSON.stringify(changed)})).artifact.id;
    await f.ports.setDisposition({operationId:uuid(121),thoughtId:installed.anchor_id,expectedRevisionId:installed.revision_id,
      disposition:conflict==='disposition' ? 'withdrawn' : 'current_commission',projectionArtifactId:artifact,projectionKind:'ACTION'});
    const baseline=structuredClone(f.anchor), transitions=f.calls.filter(c=>c==='setDisposition').length;
    await assert.rejects(installCommissionProjection(projection,operations,f.ports),/predecessor_conflict/);
    assert.deepEqual(f.anchor,baseline);
    assert.equal(f.calls.filter(c=>c==='setDisposition').length,transitions);
  });

for(const failure of ['source','head'] as const) test(`retry revalidates ${failure} before returning an existing installation`, async () => {
  const f=fixture(); await installCommissionProjection(projection,operations,f.ports);
  const transitions=f.calls.filter(c=>c==='setDisposition').length;
  let reads=0;
  const ports:CommissionInstallPorts={...f.ports,
    async fetchThought(id) {
      const head=await f.ports.fetchThought(id);
      if(failure==='head' && ++reads===3) head!.disposition.revision_id=uuid(999);
      return head;
    },
    async fetchArtifact(id) {
      const artifact=await f.ports.fetchArtifact(id);
      if(failure==='source' && id===projection.source.artifact_id && ++reads===2) artifact!.content+='\ntampered';
      return artifact;
    },
  };
  await assert.rejects(installCommissionProjection(projection,operations,ports),failure==='source' ? /binding_mismatch/ : /head_changed/);
  assert.equal(f.calls.filter(c=>c==='setDisposition').length,transitions);
});

test('competing transition between head check and write still loses the native predecessor compare', async () => {
  const f=fixture();
  await assert.rejects(installCommissionProjection(projection,operations,{...f.ports,async setDisposition(input) {
    await f.ports.setDisposition({...input,operationId:uuid(777),disposition:'withdrawn'});
    return f.ports.setDisposition(input);
  }}),/predecessor_conflict/);
  assert.equal(f.anchor!.disposition.state,'withdrawn');
});

test('exact governing source edition/digest and useful current product decisions are compiled', () => {
  assert.equal(Buffer.byteLength(source),12648);
  assert.equal(projection.source.sha256,'fdc59537ac59c11b1c03c8e09e467f19dac0a2781bd8275bba4ff85746b7e327');
  for(const term of ['Mobile-first','technical lead','physical hands','legacy ECB','Linear','accounts','minimality','Boot v4']) assert.ok(projection.summary.includes(term),term);
  assert.match(projection.next_action,/newly connected authorized worker/);
});

test('supported installation, identical replay, head update and stale predecessor preserve source custody', async () => {
  const f=fixture();
  const first=await installCommissionProjection(projection,operations,f.ports);
  const repeated=await installCommissionProjection(projection,operations,f.ports);
  assert.deepEqual(repeated,first); assert.equal(f.artifacts.size,2);
  const updated={...projection,next_action:'Complete the accepted connected-consumer demonstration.'};
  const next=await installCommissionProjection(updated,{capture:uuid(110),artifact:uuid(111),transition:uuid(112)},f.ports,
    {anchorId:first.anchor_id,expectedRevisionId:first.revision_id});
  assert.notEqual(next.revision_id,first.revision_id); assert.equal(next.next_action,updated.next_action);
  assert.equal((await getCurrentCommission(first.anchor_id,f.ports)).next_action,updated.next_action);
  await assert.rejects(installCommissionProjection(projection,{capture:uuid(120),artifact:uuid(121),transition:uuid(122)},f.ports,
    {anchorId:first.anchor_id,expectedRevisionId:first.revision_id}),/predecessor_conflict/);
  assert.equal(f.artifacts.get(uuid(1)),source);
});

test('unconfigured, unqualified, unavailable, tampered and changing heads never return governing content', async () => {
  const f=fixture(); await assert.rejects(getCurrentCommission(undefined,f.ports),/anchor_unconfigured/); assert.equal(f.calls.length,0);
  const ready=await installCommissionProjection(projection,operations,f.ports);
  const baseline=structuredClone(f.anchor!);
  f.anchor!.projection.kind='HOLD'; await assert.rejects(getCurrentCommission(ready.anchor_id,f.ports),/head_unqualified/);
  f.anchor=structuredClone(baseline); f.anchor!.projection.content='malformed'; await assert.rejects(getCurrentCommission(ready.anchor_id,f.ports),/projection_invalid/);
  f.anchor=structuredClone(baseline); f.artifacts.delete(uuid(1)); await assert.rejects(getCurrentCommission(ready.anchor_id,f.ports),/source_unavailable/);
  f.artifacts.set(uuid(1),source+'\nchanged'); await assert.rejects(getCurrentCommission(ready.anchor_id,f.ports),/binding_mismatch/);
  f.artifacts.set(uuid(1),source); const wrongEdition={...projection,source:{...projection.source,edition:'invented'}};
  f.anchor!.projection.content=JSON.stringify(wrongEdition); await assert.rejects(getCurrentCommission(ready.anchor_id,f.ports),/binding_mismatch/);
  f.anchor=structuredClone(baseline); let reads=0;
  await assert.rejects(getCurrentCommission(ready.anchor_id,{...f.ports,async fetchThought(id){ const a=await f.ports.fetchThought(id); if(++reads===2) a!.disposition.revision_id=uuid(999); return a; }}),/head_changed/);
  await assert.rejects(getCurrentCommission(ready.anchor_id,{...f.ports,async fetchArtifact(){throw new Error('private destination detail');}}),/source_unavailable/);
  const readsOnly=f.calls.length;
  await assert.rejects(installCommissionProjection({...projection,source:{...projection.source,sha256:commissionDigest('wrong-source')}},operations,f.ports),/binding_mismatch/);
  assert.deepEqual(f.calls.slice(readsOnly),['fetchArtifact']);
});

for(const mode of ['modern','legacy'] as const) test(`${mode} normal MCP initialization and no-argument recovery expose current source only to authorized recovery`, async () => {
  const f=fixture(), ready=await installCommissionProjection(projection,operations,f.ports);
  const previousFetch=globalThis.fetch;
  const names=['ECB_BRAIN_KEY_SHA256','ECB_ORDINARY_DB_KEY','ECB_MCP_CAPABILITY_GRANTS','ECB_CURRENT_COMMISSION_THOUGHT_ID'];
  const previous=names.map(n=>process.env[n]); const rpcCalls:string[]=[];
  process.env.ECB_BRAIN_KEY_SHA256=createHash('sha256').update('local-commission-compat').digest('hex');
  process.env.ECB_ORDINARY_DB_KEY='local-database-fixture'; process.env.ECB_CURRENT_COMMISSION_THOUGHT_ID=ready.anchor_id;
  process.env.ECB_MCP_CAPABILITY_GRANTS=JSON.stringify(['recover','preserve'].map(capability=>({client_id:capability,
    key_sha256:createHash('sha256').update(`local-${capability}`).digest('hex'),capabilities:[capability]})));
  globalThis.fetch=async(input,init)=>{
    const name=String(input).split('/').pop()!; rpcCalls.push(name); const body=JSON.parse(String(init?.body));
    if(name==='eco140_fetch_thought') { const a=await f.ports.fetchThought(body.p_id); return Response.json(a ? [{id:a.id,content:'navigation',source:'fixture',captured_at:'2026-10-14T00:00:00Z',
      representation_ready:false,disposition_revision_id:a.disposition.revision_id,disposition:a.disposition.state,
      projection_artifact_id:a.projection.artifact_id,projection_kind:a.projection.kind,projection_content:a.projection.content}] : []); }
    if(name==='ecb12_fetch_artifact') { const a=await f.ports.fetchArtifact(body.p_id); return Response.json(a?[a]:[]); }
    assert.fail(`Commission recovery attempted non-read RPC ${name}`);
  };
  async function connect(token:string) {
    const client=new Client({name:'ordinary-commission-consumer',version:'1.0.0'},mode==='modern'?{versionNegotiation:{mode:{pin:'2026-07-28'}}}:{});
    await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost/mcp'),{fetch:async(url,init)=>app.fetch(new Request(url,{...init,
      headers:{...Object.fromEntries(new Headers(init?.headers)),host:'localhost',authorization:`Bearer ${token}`}}))}));
    return client;
  }
  try {
    const client=await connect('local-recover');
    try {
      assert.match(client.getInstructions()!,/call get_current_commission/); assert.ok(client.getInstructions()!.length<512);
      assert.ok(!client.getInstructions()!.includes(source));
      const tool=(await client.listTools()).tools.find(t=>t.name==='get_current_commission')!;
      assert.equal(tool.annotations?.readOnlyHint,true); assert.deepEqual(tool.inputSchema.properties,{});
      const reply=await client.callTool({name:'get_current_commission',arguments:{}}); assert.ok(!reply.isError);
      const result=JSON.parse((reply.content as Array<{text:string}>)[0].text);
      assert.equal(result.source_content,source); assert.equal(result.revision_id,ready.revision_id);
      assert.match(result.next_action,/mobile-first/); assert.match(result.summary,/Principal/);
      assert.deepEqual(rpcCalls,['eco140_fetch_thought','ecb12_fetch_artifact','eco140_fetch_thought']);
      // A historical/current UUID supplied by a caller cannot select a different commission.
      await client.callTool({name:'get_current_commission',arguments:{id:uuid(999)}});
      assert.equal(rpcCalls.length,6);
      f.artifacts.delete(uuid(1));
      const unavailable=await client.callTool({name:'get_current_commission',arguments:{}});
      assert.equal(unavailable.isError,true);
      const failure=JSON.parse((unavailable.content as Array<{text:string}>)[0].text);
      assert.equal(failure.error,'commission_source_unavailable'); assert.ok(!JSON.stringify(failure).includes(projection.summary));
      assert.ok(!JSON.stringify(failure).includes(source));
    } finally {await client.close();}
    const before=rpcCalls.length, denied=await connect('local-preserve');
    try {
      assert.ok(!denied.getInstructions()!.includes(projection.summary));
      await assert.rejects(denied.callTool({name:'get_current_commission',arguments:{}}),/403|insufficient[_ ]scope/i);
    } finally {await denied.close();}
    assert.equal(rpcCalls.length,before);
    const unauth=await app.request('http://localhost/mcp',{method:'POST',headers:{host:'localhost','content-type':'application/json'},
      body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{}})});
    assert.equal(unauth.status,401); assert.ok(!(await unauth.text()).includes(projection.summary)); assert.equal(rpcCalls.length,before);
  } finally {
    globalThis.fetch=previousFetch; names.forEach((n,i)=>{if(previous[i]===undefined)delete process.env[n];else process.env[n]=previous[i];});
  }
});

test('OAuth recovery capability gates new tool without a fictitious step-up', async () => {
  const request=()=>new Request('https://fixture/mcp',{method:'POST',body:JSON.stringify({method:'tools/call',params:{name:'get_current_commission'}})});
  const auth={token:'fixture',clientId:'fixture',scopes:['ecb:preserve'],extra:{authentication_method:'oauth'}};
  assert.equal((await oauthToolDenial(request(),auth))?.status,403);
  assert.equal(await oauthToolDenial(request(),{...auth,scopes:['ecb:recover']}),undefined);
});
