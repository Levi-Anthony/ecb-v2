import assert from 'node:assert/strict';
import {make,deliver,assess,close,save,semanticReached} from './support.mjs';
const results=[];
try {
 for(const [name,opts,want,component] of [
 ['positive',{},'SUPPORTED_FOR_Q1','consequence'],
 ['average',{mutate:p=>({...p,proposition:{...p.proposition,quantifier:'average'}})},'REJECTED_FOR_Q1','preservation:quantifier'],
 ['scope',{mutate:p=>({...p,proposition:{...p.proposition,context:'production'}})},'REJECTED_FOR_Q1','preservation:context'],
 ['population',{mutate:p=>({...p,proposition:{...p.proposition,population:p.proposition.population.slice(0,1)}})},'REJECTED_FOR_Q1','population'],
 ['false120',{value:120},'REJECTED_FOR_Q1','consequence'],
 ['contradiction',{mutate:p=>({...p,expressions:['not every declared observation met the threshold']})},'REJECTED_FOR_Q1','expression'],
 ['permission',{mutate:p=>({...p,expressions:['execution permitted']})},'REJECTED_FOR_Q1','expression'],
 ['unknown',{mutate:p=>({...p,language:'unknown/v1'})},'INDETERMINATE','language']]){
  const f=await make(opts),x=await deliver(f,{partial:true}),r=await assess(f,x.d);
  semanticReached(r);assert.equal(r.result.outcome,want,JSON.stringify(r.result));
  assert(r.result.findings.some(z=>z.component===component&&z.state===(want==='SUPPORTED_FOR_Q1'?'PASS':want==='INDETERMINATE'?'UNKNOWN':'FAIL')));
  results.push({name,status:'PASS',preconditions:'complete receipt, encoding, origin, digest and export provenance reached',delivery:x.d,assessment:r.t,expected:want,card:r.c});
  console.log(`PASS ${name}`);
 }
}finally{save('primary.json',results);await close();}
