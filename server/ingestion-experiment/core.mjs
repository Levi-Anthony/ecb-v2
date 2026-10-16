// Bounded evidence-producing tool, not a canonical tokenizer or ordinary database runtime.
const encoder = new TextEncoder();
export async function digest(text) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function reply(status, body) {
  return new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}

const PRESSURE_DIMENSIONS = ['reference_frame','quadrant','holoarchic_level','directional_tendency','line','stage','state','type'];
const QF_SIGNALS = new Set(['LOW','UNRESOLVED']);

export function runtimeGrammar(grammar) {
  const definitions = {};
  for (const [key, value] of Object.entries(grammar?.definitions ?? {})) {
    definitions[key] = {
      term: value.term,
      positive_definition: value.positive_definition,
      structural_function: value.structural_function,
      discriminator: value.discriminator,
      must_not_collapse_with: value.must_not_collapse_with,
      canonical_questions: value.canonical_questions,
      standing: value.standing,
    };
  }
  return {
    grammar_id: grammar?.grammar_id,
    version: grammar?.version,
    governing_rules: grammar?.governing_rules,
    definitions,
  };
}

export function checkAnnotation(raw, annotation, expectedGrammarVersion) {
  const errors=[];
  const topKeys=['coverage','grammar_pressure','grammar_version','questions_forward','referents','relations'];
  if(!annotation || typeof annotation!=='object' || Array.isArray(annotation) ||
     Object.keys(annotation).sort().join()!==topKeys.join()) return ['invalid_container'];
  if(annotation.grammar_version!==expectedGrammarVersion) errors.push('grammar_version_mismatch');
  if(!Array.isArray(annotation.referents) || !annotation.referents.length) errors.push('no_referents');
  if(!Array.isArray(annotation.relations)) errors.push('invalid_relations');
  if(!Array.isArray(annotation.coverage) || !annotation.coverage.length) errors.push('no_coverage');
  if(!Array.isArray(annotation.grammar_pressure)) errors.push('invalid_grammar_pressure');
  if(!Array.isArray(annotation.questions_forward)) errors.push('invalid_questions_forward');
  if(errors.some(e=>e.startsWith('invalid_')||e==='no_referents'||e==='no_coverage')) return errors;

  const handles=new Set();
  const referentKeys=['description','disclosure_basis','epistemic_basis','excerpt','handle'];
  for(const item of annotation.referents){
    if(!item || typeof item!=='object' || Object.keys(item).sort().join()!==referentKeys.join()){
      errors.push('invalid_referent');continue;
    }
    if(!String(item.handle??'').trim() || handles.has(item.handle)) errors.push('invalid_or_duplicate_handle');
    handles.add(item.handle);
    if(!item.excerpt || !raw.includes(item.excerpt)) errors.push('referent_excerpt_not_in_source');
    if(!['explicit','structurally_required','unresolved'].includes(item.disclosure_basis)) errors.push('invalid_disclosure_basis');
    if(!['reported','inquiry'].includes(item.epistemic_basis)) errors.push('invalid_epistemic_basis');
    if(!String(item.description??'').trim()) errors.push('missing_referent_description');
  }

  const relationKeys=['excerpt','modality','object_handle','relation','subject_handle'];
  for(const item of annotation.relations){
    if(!item || typeof item!=='object' || Object.keys(item).sort().join()!==relationKeys.join()){
      errors.push('invalid_relation');continue;
    }
    if(!handles.has(item.subject_handle)||!handles.has(item.object_handle)) errors.push('relation_unknown_handle');
    if(!item.excerpt || !raw.includes(item.excerpt)) errors.push('relation_excerpt_not_in_source');
    if(!['reported_relation','desired_or_requested_action','performed_action','negated_relation','unresolved_relation'].includes(item.modality)) errors.push('invalid_relation_modality');
    if(!String(item.relation??'').trim()) errors.push('missing_relation');
  }

  const coverageKeys=['disposition','excerpt','reason','semantic_role'];
  for(const item of annotation.coverage){
    if(!item || typeof item!=='object' || Object.keys(item).sort().join()!==coverageKeys.join()){
      errors.push('invalid_coverage');continue;
    }
    if(!item.excerpt || !raw.includes(item.excerpt)) errors.push('coverage_excerpt_not_in_source');
    if(!['retained','unresolved','excluded'].includes(item.disposition)) errors.push('invalid_coverage_disposition');
    if(!String(item.semantic_role??'').trim()||!String(item.reason??'').trim()) errors.push('incomplete_coverage');
  }

  const qfIds=new Set();
  const qfKeys=['activation_scenario','answer_detection_criteria','current_signal','decision_consequence','id','question','reentry_trigger','target_dimension'];
  for(const qf of annotation.questions_forward){
    if(!qf || typeof qf!=='object' || Object.keys(qf).sort().join()!==qfKeys.join()){
      errors.push('invalid_question_forward');continue;
    }
    if(!qf.id || qfIds.has(qf.id)) errors.push('invalid_or_duplicate_qf_id');
    qfIds.add(qf.id);
    if(!['LOW','NO_SIGNAL','LOW_OR_UNESTABLISHED','UNRESOLVED'].includes(qf.current_signal)) errors.push('invalid_qf_signal');
    if(!String(qf.question??'').trim()) errors.push('qf_missing_question');
    if(!Array.isArray(qf.answer_detection_criteria)||!qf.answer_detection_criteria.length||qf.answer_detection_criteria.some(x=>!String(x).trim())) errors.push('qf_missing_criteria');
    if(!qf.activation_scenario || !['HYPOTHETICAL_CALIBRATION','OBSERVED_EVIDENCE'].includes(qf.activation_scenario.evidence_status) || !String(qf.activation_scenario.description??'').trim()) errors.push('qf_invalid_activation_scenario');
    if(!String(qf.reentry_trigger??'').trim()) errors.push('qf_missing_reentry_trigger');
    if(!String(qf.decision_consequence??'').trim()) errors.push('qf_missing_decision_consequence');
  }

  const pressureKeys=['dimension','observation','question_forward_id','signal'];
  const seenDimensions=new Set();
  for(const pressure of annotation.grammar_pressure){
    if(!pressure || typeof pressure!=='object' || Object.keys(pressure).sort().join()!==pressureKeys.join()){
      errors.push('invalid_grammar_pressure_entry');continue;
    }
    if(!PRESSURE_DIMENSIONS.includes(pressure.dimension)||seenDimensions.has(pressure.dimension)) errors.push('invalid_or_duplicate_pressure_dimension');
    seenDimensions.add(pressure.dimension);
    if(!['HIGH','MINIMAL','LOW','UNRESOLVED','DEFINITION_OPEN'].includes(pressure.signal)) errors.push('invalid_pressure_signal');
    if(!String(pressure.observation??'').trim()) errors.push('missing_pressure_observation');
    if(QF_SIGNALS.has(pressure.signal)) {
      if(!pressure.question_forward_id || !qfIds.has(pressure.question_forward_id)) errors.push('low_signal_without_question_forward');
    } else if(pressure.question_forward_id!==null && !qfIds.has(pressure.question_forward_id)) {
      errors.push('pressure_unknown_question_forward');
    }
  }
  for(const dimension of PRESSURE_DIMENSIONS){
    if(!seenDimensions.has(dimension)) errors.push(`missing_pressure_dimension:${dimension}`);
  }
  return errors;
}

async function boundedBody(req){
  if(Number(req.headers.get('content-length')??0)>16384)throw new Error('body_limit');
  const reader=req.body?.getReader();if(!reader)throw new Error('body_missing');
  let size=0;const chunks=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;
    if(size>16384){await reader.cancel();throw new Error('body_limit');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}

export function makeHandler({apiKey,capabilityHash,expiresAt,profile,grammar,fetcher=fetch,now=Date.now}){
  return async req=>{
    if(now()>=expiresAt)return reply(410,{error:'experiment_capability_expired'});
    const auth=req.headers.get('authorization')??'';
    if(!auth.startsWith('Bearer ') || await digest(auth.slice(7))!==capabilityHash)return reply(401,{error:'unauthorized'});
    if(req.method!=='POST')return reply(405,{error:'post_required'});
    if(!apiKey)return reply(503,{error:'openrouter_not_configured'});
    let input;try{input=await boundedBody(req);}catch{return reply(400,{error:'invalid_input'});}
    if(!input || typeof input!=='object' || Array.isArray(input) ||
       Object.keys(input).sort().join()!=='source,text' || typeof input.text!=='string' ||
       !input.text.trim() || input.text.length>8000 || typeof input.source!=='string' ||
       !input.source.trim() || input.source.length>500)return reply(400,{error:'invalid_input'});

    const compiledGrammar=runtimeGrammar(grammar);
    if(compiledGrammar.grammar_id!==profile.grammar_id || compiledGrammar.version!==profile.grammar_version){
      return reply(500,{error:'grammar_profile_mismatch'});
    }
    const operationalProtocol=`
OPERATIONAL UNIVERSAL REFERENT WALK — REQUIRED ORDER:
1. SOURCE LEDGER FIRST. Before classifying anything, traverse the Thought once only for disclosure. Enumerate every explicit named participant, every explicit participant pronoun, every event/action/situation needed to preserve a proposition, and every referent required as an argument of a relation. Do not decide yet whether it is important. A referent may be low-relevance; disclosure is not activation. If a pronoun has a source-grounded antecedent, give it a handle. If its antecedent cannot be resolved, still disclose the unresolved referent rather than dropping it.
2. RELATION ARGUMENT CHECK. After the ledger exists, inspect each proposition and ensure every subject and object/argument has a disclosed handle. Never write a relation first and omit one of its referents. Preserve event/action referents when doing so prevents a modality collapse. 'wanted X to do Y' contains the wanting relation, the intended actor X, and the desired action Y; it does not report Y as performed.
3. COVERAGE CHECK. Walk the source again against the ledger. Every materially relevant span must be retained, unresolved, or explicitly excluded with a reason. Do not let a compressed situation description replace its participants, arguments, or action modality.
4. GRAMMAR PRESSURE IS AN INQUIRY, NOT A LABELING EXERCISE. For each required dimension, state what the current source actually exposes at the Master-Key resolution. Use HIGH only for source-supported signal. Use MINIMAL/LOW when little signal exists. Use UNRESOLVED when a material distinction cannot yet be resolved. Do not manufacture a Stage, Line, Type, directional tendency, level, quadrant, or frame merely to populate the field.
5. QUESTION FORWARD BINDING. Every LOW or UNRESOLVED material pressure MUST create a QF object in the same pass, and the pressure entry MUST point to that exact QF id. The QF must be the smallest discriminating question, not a generic request for more context. It must state what observable answer would count, a plausible activation scenario, how new evidence re-enters, and what would change downstream. If currentness is the material distinction, ask whether later evidence satisfied, superseded, or left open the earlier state; do not substitute a generic motivation question.
6. FINAL RECONCILIATION. Before emitting JSON, verify: every relation handle exists; every explicit participant/pronoun is accounted for; desired/performed modality is preserved; every pressure dimension is present; every LOW/UNRESOLVED pressure has a linked QF; and no QF is generic when a sharper structural discriminator is available.
This protocol operationalizes the installed grammar. It does not create new definitions or promote any claim to canonical standing.`;
    const system=[
      profile.system,
      operationalProtocol,
      `\nPRINCIPAL_MASTER_KEY:\n${JSON.stringify(profile.master_key)}`,
      `\nINSTALLED_GRAMMAR_CONTRACT:\n${JSON.stringify(compiledGrammar)}`,
    ].join('\n');
    const request={...profile.request,messages:[{role:'system',content:system},
      {role:'user',content:JSON.stringify({raw:input.text,source:input.source,status:'supplied_evidence_not_verified_fact'})}]};
    let response,data;
    try{
      response=await fetcher('https://openrouter.ai/api/v1/chat/completions',{
        method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
        body:JSON.stringify(request),signal:AbortSignal.timeout(45000)});
      if(!response.ok)return reply(502,{error:'provider_http_error',status:response.status});
      data=await response.json();
    }catch{return reply(502,{error:'provider_unavailable'});}
    const choice=data?.choices?.[0];
    if(choice?.finish_reason!=='stop')return reply(502,{error:'incomplete_generation'});
    let annotation;try{annotation=JSON.parse(choice.message.content);}catch{return reply(502,{error:'invalid_provider_json'});}
    const errors=checkAnnotation(input.text,annotation,profile.grammar_version);
    return reply(errors.length?422:200,{
      operation:'disclose_atomic_thought',version:3,attempt_id:crypto.randomUUID(),
      input:{...input,sha256:await digest(input.text)},
      grammar:{id:compiledGrammar.grammar_id,version:compiledGrammar.version,sha256:await digest(JSON.stringify(compiledGrammar))},
      master_key:profile.master_key,
      request_sha256:await digest(JSON.stringify(request)),model:data.model??profile.request.model,
      provider:data.provider??null,usage:data.usage??null,annotation,mechanical_errors:errors,
      semantic_standing:'UNASSESSED',canonical_effect:'NONE',
      qualification_limit:'Mechanical source/shape/coverage obligations do not prove semantic truth, completeness, identity resolution, or canonical standing.'});
  };
}
