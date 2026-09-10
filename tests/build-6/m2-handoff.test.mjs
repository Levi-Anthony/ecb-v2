import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { activate, expected, retainedRequest, validateCompletion } from '../../server/ecb-human/m2-activate.mjs';
import { installerUri, executorUri, childEnvironment } from '../../server/ecb-human/m2-custody.mjs';
const sha = x => createHash('sha256').update(x).digest('hex');
// In-memory fixtures only. These public IDs never authorize or contact canonical SQL.
const files = ['008-build-6-p0-candidate.json','008-build-6-accepted-remit.txt','008-build-6-move-release.md'];
const payloads = await Promise.all(files.map(x => readFile(new URL('../../docs/build-shape/' + x, import.meta.url),'utf8')));
function fixture() {
  const scope = { id: expected.scope, h:'4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d',
    binding:'7446baff-13a8-4f68-a0c3-8445933575b8', p0:'p0',remit:'remit',root_basis:'basis',
    current_transition:null,origin:'https://ecos.effortlessconnection.com',rp_id:'ecos.effortlessconnection.com' };
  const subjects = ['policy','remit','external_basis'].map((kind,i) =>
    ({ id:['p0','remit','basis'][i],kind,payload:payloads[i],digest:sha(payloads[i]) }));
  const d = { id:expected.decision,scope:scope.id,h:scope.h,operation:'genesis',policy:'p0',basis:'basis',predecessor:null };
  const transition = { id:'synthetic-transition',scope:scope.id,decision:d.id,request_id:expected.request_id,
    policy:'p0',h:scope.h,remit:scope.remit,binding:scope.binding,predecessor:null,
    executor:'ecb_governance_executor',obligations:['activate_exact_p0','designate_initial_h_and_remit','exhaust_bootstrap'] };
  const view = { scope, subjects, decisions:[d], transitions:[] };
  const result = { outcome:'committed',transition };
  const commit = () => { view.scope.current_transition=transition.id;view.transitions=[transition];return result; };
  return {view,result,commit};
}
test('retained public request remains byte-pinned', async () => assert.deepEqual(await retainedRequest(),expected));
test('pending genesis recovers before effect and reconstructs afterwards', async () => {
  const f=fixture(), calls=[];
  const receipt=await activate(async (action,request) => {
    calls.push(action);assert.deepEqual(request,expected);
    if(action==='inspect') return f.view;
    if(action==='execute') return f.commit();
    return f.view.transitions.length ? f.result : {outcome:'not_committed',scope_locked:true,current_transition:null};
  }, expected);
  assert.equal(receipt.M2,'PASS');
  assert.deepEqual(calls,['recover','inspect','execute','recover','inspect']);
});
test('committed recovery never issues another effect',async()=>{
  const f=fixture();f.commit();const calls=[];
  const receipt=await activate(async action=>{calls.push(action);return action==='recover'?f.result:f.view;},expected);
  assert.equal(receipt.M2,'PASS');assert.deepEqual(calls,['recover','inspect']);
});
test('unknown, unlocked, changed pointer or altered basis never reaches execution',async()=>{
  for(const mutation of ['unknown','unlocked','pointer','p0','h','withdrawn']){
    const f=fixture();let effects=0;
    let recovery={outcome:'not_committed',scope_locked:true,current_transition:null};
    if(mutation==='unknown') recovery.outcome='unknown';
    if(mutation==='unlocked') recovery.scope_locked=false;
    if(mutation==='pointer') f.view.scope.current_transition='other';
    if(mutation==='p0') f.view.subjects[0].payload+=' ';
    if(mutation==='h') f.view.scope.h='other';
    if(mutation==='withdrawn') f.view.decisions.push({operation:'withdraw',target:expected.decision});
    await assert.rejects(activate(async action=>{if(action==='execute')effects++;return action==='inspect'?f.view:recovery;},expected));
    assert.equal(effects,0,mutation);
  }
});
test('lost execution acknowledgement stops; next invocation recovers the same result',async()=>{
  const f=fixture();let effects=0;
  const call=async action=>{
    if(action==='inspect')return f.view;
    if(action==='execute'){effects++;f.commit();throw new Error('synthetic lost acknowledgement');}
    return f.view.transitions.length?f.result:{outcome:'not_committed',scope_locked:true,current_transition:null};
  };
  await assert.rejects(activate(call,expected),/lost acknowledgement/);
  assert.equal((await activate(call,expected)).M2,'PASS');assert.equal(effects,1);
});
test('completion rejects wrong executor, obligations, history and request identity',()=>{
  for(const mutation of ['executor','obligations','history','request']){
    const f=fixture();f.commit();
    if(mutation==='executor')f.result.transition.executor='postgres';
    if(mutation==='obligations')f.result.transition.obligations.reverse();
    if(mutation==='history')f.view.transitions.push({...f.result.transition,id:'other'});
    if(mutation==='request')f.result.transition.request_id='other';
    assert.throws(()=>validateCompletion(f.result,f.view),/mismatch/);
  }
});
test('installer target is canonical and restricted child receives no installer JIT or ambient secrets',()=>{
  const raw='postgres://postgres.vezxivrvhakclxuvxzso:SYNTHETIC@aws-0-us-west-1.pooler.supabase.com:5432/postgres?jit=true';
  const admin=installerUri(raw), executor=executorUri(admin,'synthetic-executor');
  const u=new URL(executor);
  assert.equal(u.username,'ecb_governance_executor.vezxivrvhakclxuvxzso');
  assert.equal(u.port,'6543');assert.equal(u.search,'');
  assert.deepEqual(Object.keys(childEnvironment(executor)).sort(),['EXECUTOR_DATABASE_URL','PATH']);
  assert(!JSON.stringify(childEnvironment(executor)).includes('SYNTHETIC'));
  for(const bad of [raw.replace('postgres.vezxivrvhakclxuvxzso','postgres.other'),raw.replace(':5432',':6543'),raw.replace('postgres://','https://'),raw+'&options=x',raw.replace('.pooler.supabase.com','.pooler.supabase.com.attacker')])
    assert.throws(()=>installerUri(bad));
});

test('native terminal prompt does not echo typed synthetic secret',async()=>{
  const {spawnSync}=await import('node:child_process');
  const code=String.raw`
import os, pty, select, sys, time
pid, fd = pty.fork()
if pid == 0:
    os.execv(sys.argv[1], [sys.argv[1], '--input-type=module', '-e', sys.argv[2]])
data=b''
sent=False
end=time.time()+8
try:
    while time.time()<end:
        ready,_,_=select.select([fd],[],[],0.1)
        if ready:
            try: chunk=os.read(fd,4096)
            except OSError: break
            if not chunk: break
            data+=chunk
            if b'(hidden): ' in data and not sent:
                time.sleep(0.1)
                os.write(fd,b'SYNTHETIC_PRIVATE_SENTINEL\n')
                sent=True
        if b'PROMPT_LENGTH=26' in data: break
finally:
    os.close(fd)
    try: os.kill(pid,15)
    except ProcessLookupError: pass
    os.waitpid(pid,0)
print(data.decode(errors='replace'))
`;
  const moduleUrl=new URL('../../server/ecb-human/m2-custody.mjs',import.meta.url).href;
  const script=`const {secretPrompt}=await import(${JSON.stringify(moduleUrl)}); const value=await secretPrompt(); console.log('PROMPT_LENGTH='+value.length);`;
  const run=spawnSync('python3',['-c',code,process.execPath,script],{encoding:'utf8',timeout:12000});
  assert.equal(run.status,0,run.stderr);
  assert.match(run.stdout,/PROMPT_LENGTH=26/);
  assert.doesNotMatch(run.stdout,/SYNTHETIC_PRIVATE_SENTINEL/);
});
