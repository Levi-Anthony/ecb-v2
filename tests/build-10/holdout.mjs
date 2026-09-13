// Authored after checker-freeze.json. No checker change is permitted in response.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {make,deliver,assess,close,save,semanticReached,admin,sha} from './support.mjs';
const freeze=JSON.parse(readFileSync('docs/build-receipts/evidence/build-10/checker-freeze.json','utf8'));
const results=[];
try{
 assert.equal(admin('destination','select ecb10.method_digest();'),freeze.method_digest);
 for(const [name,mutate,want] of [
  ['positive-population-permutation',p=>({...p,proposition:{...p.proposition,population:[...p.proposition.population].reverse()},expressions:[p.proposition]}),'SUPPORTED_FOR_Q1'],
  ['appended-typed-threshold-widening',p=>({...p,expressions:[...p.expressions,{...p.proposition,threshold:101}]}),'REJECTED_FOR_Q1']]){
  const f=await make({mutate}),x=await deliver(f),r=await assess(f,x.d);semanticReached(r);
  assert.equal(r.result.outcome,want,JSON.stringify(r.result));
  if(want==='REJECTED_FOR_Q1'){
   assert(r.result.findings.some(v=>v.component==='expression'&&v.state==='FAIL'));
   assert(r.result.findings.some(v=>v.component==='consequence'&&v.state==='PASS'));
  }
  results.push({name,state:'PASS',expected:want,preconditions:'complete valid export/integrity/provenance; correct unchanged main proposition; all-expression surface reached',card:r.c});
 }
 assert.equal(admin('destination','select ecb10.method_digest();'),freeze.method_digest);
 for(const [path,digest] of Object.entries(freeze.files))assert.equal(sha(readFileSync(path)),digest);
 console.log('POST-FREEZE HOLDOUT PASS; checker unchanged.');
}finally{save('holdout.json',{freeze:freeze.method_digest,state:results.length===2?'PASS':'FAIL_OR_INCONCLUSIVE',independence:'Post-freeze and untuned; same worker, no claim of independent specification authorship',cases:results});await close();}
