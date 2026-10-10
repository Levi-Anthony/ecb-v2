import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import app from '../../server.ts';
import { executeWorkflow,workflowCommandSchema } from '../../server/workflow-governance.ts';

const key='workflow-test-credential';
const reader='workflow-reader-credential';
process.env.ECB_BRAIN_KEY_SHA256=createHash('sha256').update(key).digest('hex');
process.env.ECB_ORDINARY_DB_KEY='local-database-key';
process.env.ECB_MCP_CAPABILITY_GRANTS=JSON.stringify([{key_sha256:createHash('sha256').update(reader).digest('hex'),client_id:'reader',capabilities:['recover']}]);
const cid='cc20f4fa-712a-4fc3-978a-5f536e040f30';
const operation='739e5a4d-aac7-434e-a03b-0fe8ab7475c7';
const command={action:'advance',cycle_id:cid,operation_id:operation,expected_version:3};

test('actor and arbitrary fields cannot enter the typed command',async()=>{
  assert.equal(workflowCommandSchema.safeParse({...command,actor:'principal'}).success,false);
  assert.equal(workflowCommandSchema.safeParse({...command,expected_version:undefined}).success,false);
  await assert.rejects(executeWorkflow(command,'',{inspect:async()=>null,command:async()=>{throw new Error('must not dispatch');}}),/workflow_actor_missing/);
});
test('human HTTP and agent MCP use the same native controller and authentication-derived actor',async()=>{
  const old=globalThis.fetch; const calls:Array<{name:string;body:any}>=[];
  globalThis.fetch=async(url,init)=>{
    calls.push({name:String(url).split('/').pop()!,body:JSON.parse(String(init?.body))});
    return Response.json({cycle:{id:cid,version:4},debt:[{requirement:'actual use'}],zero_balance:false});
  };
  const request=(method:string,token=key,body?:unknown)=>app.request('http://localhost/workflow',{method,
    headers:{host:'localhost',authorization:`Bearer ${token}`,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const client=new Client({name:'workflow-integration',version:'1.0.0'});
  const transport=new StreamableHTTPClientTransport(new URL('http://localhost/mcp'),{fetch:async(url,init)=>app.fetch(new Request(url,{...init,
    headers:{...Object.fromEntries(new Headers(init?.headers)),host:'localhost',authorization:`Bearer ${key}`}}))});
  try{
    assert.equal((await request('POST',reader,command)).status,403);
    assert.equal((await request('GET','invalid')).status,401);
    assert.equal(calls.length,0);
    assert.equal((await request('POST',key,{...command,actor:'spoof'})).status,400);
    assert.equal(calls.length,0);
    assert.equal((await request('POST',key,command)).status,200);
    await client.connect(transport);
    const catalog=(await client.listTools()).tools;
    assert.equal(catalog.find(x=>x.name==='workflow_inspect')?.annotations?.readOnlyHint,true);
    assert.equal(catalog.find(x=>x.name==='workflow_command')?.annotations?.idempotentHint,true);
    const r=await client.callTool({name:'workflow_command',arguments:{command}});
    assert.equal(r.isError,undefined);
    assert.deepEqual(calls[0],calls[1]);
    assert.equal(calls[0].body.p_actor,'ordinary-compatibility');
    assert.equal(calls[0].body.p_payload.operation_id,operation);
    assert.equal((await request('GET',reader)).status,200);
    assert.equal(calls.at(-1)?.name,'ecb_workflow_inspect');
  }finally{await client.close();globalThis.fetch=old;}
});
test('an unavailable or conflicting database preserves visible debt rather than returning success',async()=>{
  const old=globalThis.fetch;
  globalThis.fetch=async()=>Response.json({message:'workflow_version_conflict'},{status:400});
  try{
    const r=await app.request('http://localhost/workflow',{method:'POST',headers:{host:'localhost',authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(command)});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'workflow_version_conflict');
  }finally{globalThis.fetch=old;}
});
