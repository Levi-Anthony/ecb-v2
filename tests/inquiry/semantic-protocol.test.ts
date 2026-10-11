import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runBrainInquiry, type BrainInquiryPorts } from '../../server/orchestration-brain.ts';
import { digest, type ExactEvidence, type InquiryRequest } from '../../server/orchestration.ts';

const focal='00000000-0000-4000-8000-000000000081';
const sourceId='00000000-0000-4000-8000-000000000082';
const runId='00000000-0000-4000-8000-000000000083';
const proofId='00000000-0000-4000-8000-000000000084';
const verifier='fixture:native-verification';
const boundary='fixture:protocol-boundary';
const request: InquiryRequest={query:'Which actual native protocol distinctions govern this execution?',
 intended_use:'qualify a bounded protocol LL disclosure', return_route:'ECO-202', actor_ref:'fixture:host-actor',
 context:{referent_id:focal,boundary_ref:boundary,governing_orientation_ref:'fixture:purpose',
 mapper_ref:'fixture:mapper',frame_ref:'fixture:domain-frame',access_ref:'fixture:method'}};
function account(id:string, value:unknown):ExactEvidence {
 const content=JSON.stringify(value); return {referent_id:id,content,digest:digest(content),
   source_refs:[verifier],custody_ref:'fixture:custody:'+id,currentness:'CURRENT',
   original_basis:null,stored_standing:null};
}
const spec=account(sourceId,{contract:'ecos:domain-protocol:v1',edition:'p:1',boundary_ref:boundary,
 transitions:[{from:'idle',action:'start',to:'running',decision:'ALLOW'},
   {from:'idle',action:'commit_without_input',decision:'DENY'}]});
const occurrence='fixture:actual-occurrence';
const run=account(runId,{contract:'ecos:domain-protocol-execution:v1',
 protocol_edition:'p:1',protocol_ref:sourceId,protocol_digest:spec.digest,
 focal_referent_id:focal,boundary_ref:boundary,occurrence_ref:occurrence,
 from:'idle',action:'start',to:'running',decision:'ALLOW'});
const nativeProof=account(proofId,{contract:'ecos:native-protocol-verification:v1',standing:'VERIFIED',
 ll_discriminator:'the admitted transition differs from denied commit without input',
 verifier_ref:verifier,protocol_ref:sourceId,protocol_digest:spec.digest,
 execution_ref:runId,execution_digest:run.digest,occurrence_ref:occurrence,
 focal_referent_id:focal,boundary_ref:boundary});
type Variant='positive'|'no-port'|'no-pair'|'mapper-only'|'coupling-only'|'stale'|'changed-proof';
function ports(variant:Variant):BrainInquiryPorts {
 const specUsed=variant==='mapper-only'?account(sourceId,{model:'physicist description'}):spec;
 const runUsed=variant==='coupling-only'?account(runId,{interaction:'atom coupling'}):run;
 const accounts=new Map([specUsed,runUsed,nativeProof].map(a=>[a.referent_id,a]));
 const base:BrainInquiryPorts={
   async embed(){return Array(384).fill(0.01);},
   async searchThoughts(){return {results:[],coverage:{semantic_query_available:true}};},
   async fetchThought(){return null;},
   async dispatch(op){if(op==='search_structure')return {results:[],coverage:{semantic_query_available:true}};
     if(op==='traverse_structure')return {referent_id:focal};
     return {};}
 };
 if(variant==='no-port')return base;
 base.semanticProtocol={
   async selectPair(){return variant==='no-pair'?null:{protocol:specUsed,execution:runUsed};},
   async recoverCurrent(id){const found=accounts.get(id);if(!found)return null;
     return variant==='stale'&&id===proofId?{...found,currentness:'STALE'}:found;},
   async verifyNative(){return {verifier_ref:verifier,
     verification_receipt:variant==='changed-proof'?account(proofId,{...JSON.parse(nativeProof.content),protocol_digest:'wrong'}):nativeProof,
     protocol_ref:sourceId,protocol_digest:specUsed.digest,
     execution_ref:runId,execution_digest:runUsed.digest,
     occurrence_ref:occurrence,focal_referent_id:focal,boundary_ref:boundary};}
 };
 return base;
}
test('native-verified triple-account protocol LL is examined; other disclosure obligations remain',async()=>{
 const r=await runBrainInquiry(request,ports('positive'),'fixture:host-actor');
 assert.equal(r.disposition,'HOLD');
 assert.equal(r.quadrant_coverage.LL.status,'EXAMINED');
 const projection=JSON.parse(r.projection.content);
 assert.equal(projection.disclosure_accounts.length,3);
 assert(projection.disclosure_accounts.some((e:ExactEvidence)=>e.referent_id===sourceId));
 assert(projection.disclosure_accounts.some((e:ExactEvidence)=>e.referent_id===proofId));
 assert(r.questions_forward.some(q=>q.unresolved_ref==='quadrant:UL'));
});
for(const variant of ['no-port','no-pair','mapper-only','coupling-only','stale','changed-proof'] as const)
 test('fails closed and preserves LL unknown: '+variant,async()=>{
 const r=await runBrainInquiry(request,ports(variant),'fixture:host-actor');
 assert.equal(r.disposition,'HOLD');
 assert.equal(r.quadrant_coverage.LL.status,'UNEXAMINED');
 assert(r.questions_forward.length>0);
 assert.equal(r.admitted_relation_count,0);
});
