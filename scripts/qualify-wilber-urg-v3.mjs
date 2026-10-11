/**
 * Reproducible evidence-intake checker for the Wilber / URG v3 D&I study.
 * Checks submitted receipt coherence; it does NOT judge semantic truth,
 * independently authenticate reviewer standing, or run empirical experiments.
 * From repository root:
 *  node scripts/qualify-wilber-urg-v3.mjs --self-test
 *  node scripts/qualify-wilber-urg-v3.mjs
 *  node scripts/qualify-wilber-urg-v3.mjs --results path/to/actual-results.json
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const DEFAULT_MANIFEST='research/urg-kernel/Wilber-URG-v3-Qualification-Cases-v0.1.json';
const REQUIRED_COORDINATES={UL:['INDIVIDUAL','LEFT'],UR:['INDIVIDUAL','RIGHT'],LL:['RELATIONAL','LEFT'],LR:['RELATIONAL','RIGHT']};
const REQUIRED_PRESERVATION=['addressability','navigability','recovery','reentry','resurfacing_recontact','view_transform_integrity'];
const PRECONDITIONS=['full','minus_UL','minus_UR','minus_LL','minus_LR','rival_nonquadrant'];

function requireString(x,field){if(typeof x!=='string'||!x.trim())throw new Error(`${field} must be a nonempty string`);}
function readJson(path){return JSON.parse(readFileSync(path,'utf8'));}
function validateManifest(m){
  requireString(m.protocol_id,'protocol_id');
  assert.equal(m.source_contract,'ecos:quadrant-disclosure:v3');
  assert.match(m.label_set_standing,/PROVISIONAL/);
  assert.deepEqual(m.coordinates,REQUIRED_COORDINATES);
  assert.deepEqual(m.preservation_obligations,REQUIRED_PRESERVATION);
  assert.deepEqual(m.comparative_conditions,PRECONDITIONS);
  assert.ok(Array.isArray(m.cases)&&m.cases.length>=6);
  const seen=new Set();
  for(const c of m.cases){
    requireString(c.id,'case.id');requireString(c.focal_referent,`${c.id}.focal_referent`);
    requireString(c.discriminator,`${c.id}.discriminator`);
    requireString(c.defeater,`${c.id}.defeater`);
    requireString(c.necessary_basis,`${c.id}.necessary_basis`);
    assert.ok(!seen.has(c.id),`duplicate case ${c.id}`);seen.add(c.id);
    assert.ok(['writer','transformation','comparative'].includes(c.lane));
    assert.ok(Array.isArray(c.conditions)&&c.conditions.length>0);
    if(c.lane==='comparative')assert.deepEqual(c.conditions,PRECONDITIONS);
    else for(const cond of c.conditions)assert.ok(['READY','HOLD'].includes(c.expected_disposition[cond]));
  }
  return m.cases.flatMap(c=>c.conditions.map(condition=>({case_id:c.id,condition})));
}
function evaluate(m, report){
  const needed=validateManifest(m), expectation=new Map(needed.map(p=>[`${p.case_id}::${p.condition}`,p]));
  const summary={protocol_id:m.protocol_id,source_contract:m.source_contract,receipt_standing:'DECLARED_INPUT_NOT_SEMANTICALLY_ADJUDICATED',status:'HOLD',
    expected_trials:needed.length,received_trials:0,missing:[],conflicts:[],comparisons:[],limitations:[
      'No supplied result or passed structural check proves the account is semantically true.',
      'Assessor independence and raw evidence authenticity require external audit.',
      'This program does not mutate URG, BRAIN, or the production cycle.'
    ]};
  if(report===null){summary.missing=needed;return summary;}
  assert.equal(report.protocol_id,m.protocol_id,'wrong preregistration edition');
  assert.ok(Array.isArray(report.trials),'trials must be an array');
  const observed=new Map();
  for(const trial of report.trials){
    const key=`${trial.case_id}::${trial.condition}`;
    assert.ok(expectation.has(key),`unexpected case-condition ${key}`);
    assert.ok(!observed.has(key),`duplicated case-condition ${key}`);
    for(const field of ['run_ref','source_set_ref','producer_ref','reviewer_ref','evidence_ref']) requireString(trial[field],`${key}.${field}`);
    assert.ok(['READY','HOLD'].includes(trial.reported_disposition),`${key}: invalid reported_disposition`);
    assert.ok(Number.isInteger(trial.validated_findings)&&trial.validated_findings>=0,`${key}: validated_findings needs nonnegative integer`);
    assert.ok(Number.isInteger(trial.invalid_findings)&&trial.invalid_findings>=0,`${key}: invalid_findings needs nonnegative integer`);
    assert.equal(typeof trial.review_independent,'boolean',`${key}: review_independent required`);
    const caseDef=m.cases.find(c=>c.id===trial.case_id);
    if(caseDef.expected_disposition[trial.condition]&&caseDef.expected_disposition[trial.condition]!==trial.reported_disposition)
      summary.conflicts.push({key,kind:'EXPECTED_DISPOSITION_MISMATCH',expected:caseDef.expected_disposition[trial.condition],reported:trial.reported_disposition});
    if(caseDef.lane!=='writer'){
      const preservation=trial.preservation;
      if(!preservation||typeof preservation!=='object'||Array.isArray(preservation))
        summary.conflicts.push({key,kind:'NO_PRESERVATION_ACCOUNT'});
      else for(const inv of REQUIRED_PRESERVATION){
        const state=preservation[inv];
        if(!['PRESERVED','DISCLOSED_LOSS','FAILED','NOT_TESTED'].includes(state))
          summary.conflicts.push({key,kind:'INVALID_PRESERVATION_STATE',invariant:inv});
        else if(state==='DISCLOSED_LOSS'&&!(Array.isArray(trial.loss_refs)&&trial.loss_refs.some(x=>typeof x==='string'&&x.trim())))
          summary.conflicts.push({key,kind:'UNATTRIBUTED_DECLARED_LOSS',invariant:inv});
        else if(state==='NOT_TESTED')
          summary.conflicts.push({key,kind:'UNTESTED_REQUIRED_INVARIANT',invariant:inv});
        else if(state==='FAILED')
          summary.conflicts.push({key,kind:'PRESERVATION_FAILED',invariant:inv});
      }
    }
    observed.set(key,trial);
  }
  summary.received_trials=observed.size;
  summary.missing=needed.filter(p=>!observed.has(`${p.case_id}::${p.condition}`));
  for(const c of m.cases.filter(c=>c.lane==='comparative')){
    const runs=c.conditions.map(condition=>observed.get(`${c.id}::${condition}`));
    if(runs.some(r=>!r))continue;
    const sourceSets=new Set(runs.map(r=>r.source_set_ref));
    if(sourceSets.size!==1)summary.conflicts.push({case_id:c.id,kind:'UNEQUAL_SOURCE_SETS',sources:[...sourceSets]});
    if(runs.some(r=>!r.review_independent))summary.conflicts.push({case_id:c.id,kind:'INDEPENDENT_REVIEW_NOT_DECLARED'});
    const full=runs[0];
    summary.comparisons.push({case_id:c.id,full_validated_findings:full.validated_findings,
      caveat:'Descriptive differences from submitted adjudication claims, not inferred causal or universal advantage.',
      deltas_vs_full:runs.slice(1).map((r,i)=>({condition:c.conditions[i+1],valid_findings_delta:full.validated_findings-r.validated_findings,
        invalid_findings_delta:full.invalid_findings-r.invalid_findings}))});
  }
  summary.status=summary.conflicts.length?'CONFLICT_REQUIRES_REPAIR':summary.missing.length?'HOLD':'REVIEW_REQUIRED';
  return summary;
}
function selfTest(){
  const m=readJson(DEFAULT_MANIFEST);
  const empty=evaluate(m,null);assert.equal(empty.status,'HOLD');assert.ok(empty.expected_trials>10);
  const first=m.cases[0];
  const trial={case_id:first.id,condition:first.conditions[0],run_ref:'synthetic:1',source_set_ref:'synthetic:sources',producer_ref:'synthetic:writer',
    reviewer_ref:'synthetic:reviewer',evidence_ref:'synthetic:not-real-evidence',reported_disposition:'READY',validated_findings:0,invalid_findings:0,review_independent:false};
  const partial=evaluate(m,{protocol_id:m.protocol_id,trials:[trial]});
  assert.equal(partial.status,'HOLD');assert.equal(partial.received_trials,1);
  assert.throws(()=>evaluate(m,{protocol_id:m.protocol_id,trials:[trial,trial]}),/duplicated/);
  const wrong={...trial,reported_disposition:'HOLD'};
  const conflicting=evaluate(m,{protocol_id:m.protocol_id,trials:[wrong]});
  assert.equal(conflicting.status,'CONFLICT_REQUIRES_REPAIR');
  console.log(JSON.stringify({self_test:'PASS',scope:'SYNTHETIC HARNESS ONLY',expected_trials:empty.expected_trials}));
}
const args=process.argv.slice(2);
if(args.includes('--self-test'))selfTest();
else {
  const manifestPath=args.includes('--manifest')?args[args.indexOf('--manifest')+1]:DEFAULT_MANIFEST;
  const resultsPath=args.includes('--results')?args[args.indexOf('--results')+1]:null;
  if(!manifestPath||args.includes('--results')&&!resultsPath)throw Error('Use --manifest <path> and/or --results <path>');
  const result=evaluate(readJson(manifestPath),resultsPath?readJson(resultsPath):null);
  console.log(JSON.stringify(result,null,2));
  if(result.status==='CONFLICT_REQUIRES_REPAIR')process.exitCode=1;
}
