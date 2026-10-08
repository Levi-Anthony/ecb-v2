import type { CivsEnforcementMode } from './civs.js';

export const CIVS_QUALIFICATION_CONTRACT = 'ecos:civs-qualification-record:0.1.0' as const;

export type QualificationStanding = 'PENDING' | 'SUPPORTED' | 'NOT_ESTABLISHED' | 'CONTRADICTED';
export type QualificationDisposition = 'IN_PROGRESS' | 'PARTIAL_HOLD' | 'QUALIFIED';

export type QualificationCheck = {
  id: string;
  label: string;
  standing: QualificationStanding;
  enforcement_mode: CivsEnforcementMode;
  proposition: string;
  method_ref: string;
  evidence_refs: string[];
  currentness_ref?: string;
  limits: string[];
};

export type CurrentnessObservation = {
  id: string;
  surface: string;
  observation: string;
  standing: 'OBSERVED' | 'DEGRADED' | 'UNAVAILABLE';
  evidence_refs: string[];
  currentness_ref: string;
  consequence: string;
  limits: string[];
};

export type CivsQualificationRecord = {
  contract: typeof CIVS_QUALIFICATION_CONTRACT;
  qualification_id: string;
  cir_ref: string;
  basis_ref: string;
  observed_baseline_ref: string;
  overall_disposition: QualificationDisposition;
  checks: QualificationCheck[];
  currentness_observations: CurrentnessObservation[];
  residual_gates: Array<{
    id: string;
    proposition: string;
    standing: 'NOT_ESTABLISHED' | 'HOLD';
    reentry_condition: string;
    evidence_refs: string[];
    limits: string[];
  }>;
  no_promotion_rules: string[];
  source_refs: string[];
  omissions: string[];
};

export type QualificationValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

const text=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
const texts=(x:unknown):x is string[]=>Array.isArray(x)&&x.length>0&&x.every(text);
const object=(x:unknown):Record<string,unknown>|null=>x!==null&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:null;

export function validateCivsQualificationRecord(value:unknown):QualificationValidationResult{
  const errors:string[]=[];
  const r=object(value);
  if(!r) return {valid:false,errors:['qualification record must be an object']};
  if(r.contract!==CIVS_QUALIFICATION_CONTRACT) errors.push('contract is invalid');
  for(const k of ['qualification_id','cir_ref','basis_ref','observed_baseline_ref']) if(!text(r[k])) errors.push(`${k} is required`);
  if(!['IN_PROGRESS','PARTIAL_HOLD','QUALIFIED'].includes(String(r.overall_disposition))) errors.push('overall_disposition is invalid');

  const checks=Array.isArray(r.checks)?r.checks:[];
  if(checks.length===0) errors.push('checks must not be empty');
  const ids=new Set<string>();
  for(const [i,raw] of checks.entries()){
    const c=object(raw);
    if(!c){errors.push(`checks[${i}] must be object`);continue;}
    for(const k of ['id','label','proposition','method_ref']) if(!text(c[k])) errors.push(`checks[${i}].${k} is required`);
    if(text(c.id)){if(ids.has(c.id)) errors.push(`duplicate check: ${c.id}`);ids.add(c.id);}
    if(!['PENDING','SUPPORTED','NOT_ESTABLISHED','CONTRADICTED'].includes(String(c.standing))) errors.push(`checks[${i}].standing is invalid`);
    if(!['STRUCTURAL','SEMANTIC','AUTHORITY','OBSERVATIONAL'].includes(String(c.enforcement_mode))) errors.push(`checks[${i}].enforcement_mode is invalid`);
    if(!Array.isArray(c.evidence_refs)||!c.evidence_refs.every(text)) errors.push(`checks[${i}].evidence_refs invalid`);
    if(!Array.isArray(c.limits)||!c.limits.every(text)) errors.push(`checks[${i}].limits invalid`);
    if(c.standing==='SUPPORTED'&&(!texts(c.evidence_refs)||!text(c.currentness_ref))) errors.push(`checks[${i}] SUPPORTED requires evidence/currentness`);
  }

  const obs=Array.isArray(r.currentness_observations)?r.currentness_observations:[];
  if(obs.length===0) errors.push('currentness_observations must not be empty');
  for(const [i,raw] of obs.entries()){
    const o=object(raw);
    if(!o){errors.push(`currentness_observations[${i}] invalid`);continue;}
    for(const k of ['id','surface','observation','currentness_ref','consequence']) if(!text(o[k])) errors.push(`currentness_observations[${i}].${k} required`);
    if(!['OBSERVED','DEGRADED','UNAVAILABLE'].includes(String(o.standing))) errors.push(`currentness_observations[${i}].standing invalid`);
    if(!texts(o.evidence_refs)) errors.push(`currentness_observations[${i}].evidence_refs required`);
    if(!Array.isArray(o.limits)||!o.limits.every(text)) errors.push(`currentness_observations[${i}].limits invalid`);
  }

  const gates=Array.isArray(r.residual_gates)?r.residual_gates:[];
  for(const [i,raw] of gates.entries()){
    const g=object(raw);
    if(!g||!text(g.id)||!text(g.proposition)||!text(g.reentry_condition)||!['NOT_ESTABLISHED','HOLD'].includes(String(g.standing))) errors.push(`residual_gates[${i}] invalid`);
    if(g&&(!Array.isArray(g.evidence_refs)||!g.evidence_refs.every(text)||!Array.isArray(g.limits)||!g.limits.every(text))) errors.push(`residual_gates[${i}] evidence/limits invalid`);
  }
  if(!texts(r.no_promotion_rules)) errors.push('no_promotion_rules required');
  if(!texts(r.source_refs)) errors.push('source_refs required');
  if(!Array.isArray(r.omissions)||!r.omissions.every(text)) errors.push('omissions invalid');
  if(r.overall_disposition==='QUALIFIED'&&gates.some((x:any)=>x.standing==='HOLD'||x.standing==='NOT_ESTABLISHED')) errors.push('QUALIFIED cannot retain unresolved residual gates');
  return errors.length?{valid:false,errors}:{valid:true,errors:[]};
}

export function renderCivsQualificationRecord(q:CivsQualificationRecord):string{
  const v=validateCivsQualificationRecord(q);
  if(!v.valid) throw new Error(`civs_qualification_invalid: ${v.errors.join('; ')}`);
  const lines=[
    '# CIVS WP8 qualification record','',
    `**Qualification:** \`${q.qualification_id}\`  `,
    `**Contract:** \`${q.contract}\`  `,
    `**Source CIR:** \`${q.cir_ref}\`  `,
    `**Basis:** \`${q.basis_ref}\`  `,
    `**Observed baseline:** \`${q.observed_baseline_ref}\`  `,
    `**Overall disposition:** **${q.overall_disposition}**`,'',
    '> This record qualifies bounded CIVS inspection behavior. It does not manufacture independent fresh-agent evidence, semantic correspondence truth, consumer exposure, or alternate-provider portability.','',
    '## Qualification checks','',
    '| Check | Mode | Standing | Proposition | Limits |','|---|---|---|---|---|',
    ...q.checks.map(c=>`| ${c.label} | ${c.enforcement_mode} | ${c.standing} | ${c.proposition.replaceAll('|','\\|')} | ${c.limits.join('; ').replaceAll('|','\\|')} |`),'',
    '## Currentness observations','',
    ...q.currentness_observations.map(o=>`- **${o.surface} / ${o.standing}:** ${o.observation} Consequence: ${o.consequence} Currentness: \`${o.currentness_ref}\`. Limits: ${o.limits.join('; ')}`),'',
    '## Residual gates','',
    ...(q.residual_gates.length?q.residual_gates.map(g=>`- **${g.id} / ${g.standing}:** ${g.proposition} Reentry: ${g.reentry_condition} Limits: ${g.limits.join('; ')}`):['- None.']),'',
    '## No-promotion rules','',
    ...q.no_promotion_rules.map(x=>`- ${x}`),'',
    '## Omissions','',
    ...q.omissions.map(x=>`- ${x}`),''
  ];
  return lines.join('\n');
}
