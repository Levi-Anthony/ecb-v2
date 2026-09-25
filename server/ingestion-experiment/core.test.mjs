import test from 'node:test';import assert from 'node:assert/strict';
import {digest,makeHandler,checkAnnotation} from './core.mjs';
const token='unit-test-only-not-deployed';const raw='Jennifer wanted me to call her back.';
const good={elements:[{handle:'situation',description:'Reported callback desire',excerpt:'wanted me to call her back',basis:'reported',question:'What was sought?',relevance_test:'Purpose changes whether a callback is needed.'}]};
const profile={system:'test grammar',request:{model:'openai/gpt-4o-mini',max_tokens:2200}};
async function handler(fetcher,extra={}){return makeHandler({apiKey:'unit-test-provider-key',capabilityHash:await digest(token),expiresAt:200,profile,fetcher,now:()=>100,...extra});}
const req=(body={text:raw,source:'test'},bearer=token)=>new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer '+bearer},body:JSON.stringify(body)});
test('unauthorized rejected before provider call',async()=>{let called=false;const h=await handler(()=>{called=true;});assert.equal((await h(req({},'wrong'))).status,401);assert.equal(called,false);});
test('expired capability rejected',async()=>{const h=await handler(()=>{}, {expiresAt:99});assert.equal((await h(req())).status,410);});
test('missing key explicit, no fallback',async()=>{const h=await handler(()=>{}, {apiKey:undefined});assert.equal((await h(req())).status,503);});
test('caller cannot inject system or model',async()=>{const h=await handler(()=>{throw Error('must not run');});assert.equal((await h(req({text:raw,source:'test',model:'other'}))).status,400);});
test('oversized input rejected',async()=>{const h=await handler(()=>{});assert.equal((await h(req({text:'x'.repeat(17000),source:'test'}))).status,400);});
test('one fixed provider call, exact raw, no promotion',async()=>{let calls=0;const h=await handler(async(url,opts)=>{calls++;assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');const p=JSON.parse(opts.body);assert.equal(p.max_tokens,2200);assert.equal(JSON.parse(p.messages[1].content).raw,raw);return Response.json({model:'test-model',choices:[{finish_reason:'stop',message:{content:JSON.stringify(good)}}]});});const r=await h(req());assert.equal(r.status,200);const d=await r.json();assert.equal(d.input.text,raw);assert.equal(d.canonical_effect,'NONE');assert.equal(d.semantic_standing,'UNASSESSED');assert.equal(calls,1);});
test('provider failure is sanitized and not retried',async()=>{let calls=0;const h=await handler(async()=>{calls++;return new Response('unit-test-provider-key',{status:401});});const r=await h(req());assert.equal(r.status,502);assert.ok(!(await r.text()).includes('unit-test-provider-key'));assert.equal(calls,1);});
test('truncated generation rejected',async()=>{const h=await handler(async()=>Response.json({choices:[{finish_reason:'length'}]}));assert.equal((await h(req())).status,502);});
test('invented span rejected',()=>{const x=structuredClone(good);x.elements[0].excerpt='Mary';assert.deepEqual(checkAnnotation(raw,x),['excerpt_not_in_source']);});
test('grounded false description exposes semantic limit',()=>{const x=structuredClone(good);x.elements[0].description='Jennifer is Mary’s sister';assert.deepEqual(checkAnnotation(raw,x),[]);});
