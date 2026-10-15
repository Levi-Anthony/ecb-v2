import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { createWorkspaceHandler, type WorkspacePorts } from '../../server/personal-workspace.ts';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
function fixture() {
  const notes = new Map<string,any>(), artifacts = new Map<string,any>(), operations = new Map<string,any>();
  const calls: string[] = []; let enabled = true, failReadback = false;
  const ports: WorkspacePorts = {
    sessionSecret: () => 'private-session-test-secret',
    authenticate: async r => {
      const token = r.headers.get('authorization')?.slice(7);
      return enabled && ['owner-key','reader-key','other-key'].includes(token||'') ? { token:token!,clientId:token==='other-key'?'other':'owner',scopes:token==='reader-key'?['ecb:recover']:['ecb:recover','ecb:preserve'] } : null;
    },
    commission: async () => { calls.push('commission'); return {source:{edition:'test'},summary:'Decisions',next_action:'Next work'}; },
    work: async () => { calls.push('work'); return {cycles:[{cycle:{id:id(1),outcome:'Current work',phase:1,version:8},debt:[{requirement:'Unpaid obligation'}]}]}; },
    capture: async input => {
      calls.push('capture'); const previous=operations.get(input.operationId);
      if(previous) { assert.deepEqual(previous.input,input); return previous.output; }
      const note={id:id(10),content:input.content,source:input.source,captured_at:'2026-10-15T00:00:00Z'};
      notes.set(note.id,note); operations.set(input.operationId,{input,output:note}); return note;
    },
    fetchThought: async id => { calls.push('fetchThought'); return notes.get(id)||null; },
    createArtifact: async input => {
      calls.push('createArtifact');const previous=operations.get(input.operationId);
      if(previous) { assert.deepEqual(previous.input,input); return previous.output; }
      const artifact={id:id(20),content:input.content};artifacts.set(artifact.id,artifact);operations.set(input.operationId,{input,output:artifact});return artifact;
    },
    fetchArtifact: async id => { calls.push('fetchArtifact'); return failReadback?null:artifacts.get(id)||null; },
  };
  const handle=createWorkspaceHandler(ports);
  async function request(action:string,body?:any,cookie='',origin='https://app.example') {
    const suffix=action.includes('&')?action:action;
    return handle(new Request('https://app.example/workspace?action='+suffix,{method:body?'POST':'GET',headers:{cookie,origin,'content-type':'application/json','x-ecos-request':'workspace'},...(body?{body:JSON.stringify(body)}:{})}));
  }
  async function login(token='owner-key') {const r=await request('login',{credential:token});assert.equal(r.status,200);const set=r.headers.get('set-cookie')!;assert.match(set,/HttpOnly; Secure; SameSite=Strict/);assert.ok(!set.includes(token));return set.split(';')[0];}
  return {handle,request,login,notes,artifacts,calls,set enabled(v:boolean){enabled=v;},set failReadback(v:boolean){failReadback=v;}};
}
test('complete capture, recover, authorize, save, verify and resume with native records',async()=>{
  const f=fixture(),cookie=await f.login();
  assert.equal((await f.request('context',undefined,cookie)).status,200);
  const body={operation_id:id(100),content:'  Preserve these exact words.\nA next step.  '};
  const captured=await (await f.request('capture',body,cookie)).json();
  assert.equal(captured.note.content,body.content);assert.equal(captured.verified,true);
  assert.equal((await f.request('reference',{operation_id:id(101),thought_id:captured.note.id,source_sha256:captured.sha256,confirmed:false},cookie)).status,400);
  assert.equal(f.artifacts.size,0);
  const save={operation_id:id(101),thought_id:captured.note.id,source_sha256:captured.sha256,confirmed:true};
  const saved=await (await f.request('reference',save,cookie)).json();assert.equal(saved.verified,true);
  const reopened=await (await f.request('reference&id='+saved.artifact_id,undefined,cookie)).json();
  assert.equal(reopened.note.content,body.content);assert.equal(reopened.sha256,sha(body.content));assert.equal(reopened.verified,true);
  assert.equal(f.notes.size,1);assert.equal(f.artifacts.size,1);
});
test('lost acknowledgement recovers identical capture and reference without duplicate native effects',async()=>{
  const f=fixture(),cookie=await f.login(),body={operation_id:id(100),content:'One occurrence'};
  const first=await (await f.request('capture',body,cookie)).json();
  assert.deepEqual(await (await f.request('capture',body,cookie)).json(),first);
  const save={operation_id:id(101),thought_id:first.note.id,source_sha256:first.sha256,confirmed:true};
  f.failReadback=true;assert.equal((await f.request('reference',save,cookie)).status,409);assert.equal(f.artifacts.size,1);
  f.failReadback=false;const retry=await (await f.request('reference',save,cookie)).json();assert.equal(retry.verified,true);assert.equal(f.artifacts.size,1);
});
test('unauthenticated, forged cookie, foreign origin and reader writes fail before native effects',async()=>{
  const f=fixture();assert.equal((await f.request('context')).status,401);
  assert.equal((await f.request('context',undefined,'__Host-ecos_workspace=forged')).status,401);
  assert.equal((await f.request('login',{credential:'owner-key'},'','https://evil.example')).status,403);
  const cookie=await f.login('reader-key');assert.equal((await f.request('capture',{operation_id:id(9),content:'no'},cookie)).status,403);
  assert.deepEqual(f.calls,[]);
});
test('current credential revocation invalidates an existing encrypted session',async()=>{
  const f=fixture(),cookie=await f.login();f.enabled=false;assert.equal((await f.request('context',undefined,cookie)).status,401);assert.deepEqual(f.calls,[]);
});
test('source tampering and another credential subject cannot create or reopen a reference',async()=>{
  const f=fixture(),cookie=await f.login(),note=await (await f.request('capture',{operation_id:id(100),content:'Exact source'},cookie)).json();
  const save={operation_id:id(101),thought_id:note.note.id,source_sha256:note.sha256,confirmed:true};
  const saved=await (await f.request('reference',save,cookie)).json();
  const other=await f.login('other-key');assert.equal((await f.request('reference&id='+saved.artifact_id,undefined,other)).status,404);
  f.notes.get(note.note.id).content='Changed source';assert.equal((await f.request('reference',{...save,operation_id:id(102)},cookie)).status,409);
  assert.equal((await f.request('reference&id='+saved.artifact_id,undefined,cookie)).status,409);
});
test('private shell uses CSP, no-store, bounded input and explicit confirmation',async()=>{
  const f=fixture(),r=await f.handle(new Request('https://app.example/app'));
  assert.equal(r.headers.get('cache-control'),'no-store');assert.match(r.headers.get('content-security-policy')!,/frame-ancestors 'none'/);
  const html=await r.text();new Function(html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)![1]);assert.match(html,/viewport/);assert.match(html,/I have reviewed/);assert.ok(!html.includes('private-session-test-secret'));
  const cookie=await f.login();assert.equal((await f.request('capture',{operation_id:id(1),content:'x'.repeat(100000)},cookie)).status,413);
});

test('expired and duplicate session cookies do not recover private records',async()=>{
  const f=fixture(),cookie=await f.login(),now=Date.now;
  try {Date.now=()=>now()+3600001;assert.equal((await f.request('context',undefined,cookie)).status,401);}
  finally {Date.now=now;}
  assert.equal((await f.request('context',undefined,cookie+'; '+cookie)).status,401);
  assert.deepEqual(f.calls,[]);
});
