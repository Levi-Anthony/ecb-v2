import profile from './request-profile-v3.json' with { type: 'json' };
import grammar from './grammar-runtime-v0.1.json' with { type: 'json' };

const SOURCE_COMMIT='09c4f3bf5e6275e227cfb4f7e3d89f66dff9deec';
const PROOF_EXPIRES_AT=Date.parse('2026-09-18T23:59:59Z');
const CASES: Record<string,string> = {
  base: 'Jennifer wanted me to call her back.',
  already_discussed: 'Jennifer wanted me to call her back. I already saw Jennifer at the appointment and we talked about what she wanted.',
  gift: "Jennifer wanted me to call her back. Jennifer is Mary's sister. She wanted the callback as soon as possible to learn what I got Mary for her birthday last year so she would not repeat it.",
};
const encoder=new TextEncoder();
async function digest(text:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function json(status:number, body:unknown){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}

Deno.serve(async (req:Request)=>{
  if(Date.now()>=PROOF_EXPIRES_AT) return json(410,{error:'proof_window_expired'});
  if(req.method!=='GET') return json(405,{error:'get_required'});
  const name=new URL(req.url).searchParams.get('case')??'';
  const raw=CASES[name];
  if(!raw) return json(400,{error:'unknown_fixed_case',allowed:Object.keys(CASES)});
  const apiKey=Deno.env.get('OPENROUTER_API_KEY');
  if(!apiKey) return json(503,{error:'openrouter_not_configured'});

  if(profile.grammar_id!==grammar.grammar_id||profile.grammar_version!==grammar.version)return json(500,{error:'pinned_grammar_profile_mismatch'});

  const operationalProtocol=`
OPERATIONAL UNIVERSAL REFERENT WALK — REQUIRED ORDER:
1. SOURCE LEDGER FIRST. Before classifying anything, traverse the Thought once only for disclosure. Enumerate every explicit named participant, every explicit participant pronoun, every event/action/situation needed to preserve a proposition, and every referent required as an argument of a relation. Do not decide yet whether it is important. A referent may be low-relevance; disclosure is not activation. If a pronoun has a source-grounded antecedent, give it a handle. If its antecedent cannot be resolved, still disclose the unresolved referent rather than dropping it.
2. RELATION ARGUMENT CHECK. After the ledger exists, inspect each proposition and ensure every subject and object/argument has a disclosed handle. Never write a relation first and omit one of its referents. Preserve event/action referents when doing so prevents a modality collapse. 'wanted X to do Y' contains the wanting relation, the intended actor X, and the desired action Y; it does not report Y as performed.
3. COVERAGE CHECK. Walk the source again against the ledger. Every materially relevant span must be retained, unresolved, or explicitly excluded with a reason. Do not let a compressed situation description replace its participants, arguments, or action modality.
4. GRAMMAR PRESSURE IS AN INQUIRY, NOT A LABELING EXERCISE. For each required dimension, state what the current source actually exposes at the Master-Key resolution. Use HIGH only for source-supported signal. Use MINIMAL/LOW when little signal exists. Use UNRESOLVED when a material distinction cannot yet be resolved. Do not manufacture a Stage, Line, Type, directional tendency, level, quadrant, or frame merely to populate the field.
5. QUESTION FORWARD BINDING. Every LOW or UNRESOLVED material pressure MUST create a QF object in the same pass, and the pressure entry MUST point to that exact QF id. The QF must be the smallest discriminating question, not a generic request for more context. It must state what observable answer would count, a plausible activation scenario, how new evidence re-enters, and what would change downstream. If currentness is the material distinction, ask whether later evidence satisfied, superseded, or left open the earlier state; do not substitute a generic motivation question.
6. FINAL RECONCILIATION. Before emitting JSON, verify: every relation handle exists; every explicit participant/pronoun is accounted for; desired/performed modality is preserved; every pressure dimension is present; every LOW/UNRESOLVED pressure has a linked QF; and no QF is generic when a sharper structural discriminator is available.
This protocol operationalizes the installed grammar. It does not create new definitions or promote any claim to canonical standing.`;
  const system=[profile.system,operationalProtocol,`\nPRINCIPAL_MASTER_KEY:\n${JSON.stringify(profile.master_key)}`,`\nINSTALLED_GRAMMAR_CONTRACT:\n${JSON.stringify(grammar)}`].join('\n');
  const request={...profile.request,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({raw,source:`principal_fixture_v3_${name}`,status:'supplied_evidence_not_verified_fact'})}]};
  let response,data;
  try{
    response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(45000)});
    if(!response.ok){const provider_body=await response.text();return json(502,{error:'provider_http_error',status:response.status,provider_body:provider_body.slice(0,2000)});}
    data=await response.json();
  }catch(error){return json(502,{error:'provider_unavailable',detail:String(error)});}
  const choice=data?.choices?.[0];
  if(choice?.finish_reason!=='stop') return json(502,{error:'incomplete_generation',finish_reason:choice?.finish_reason??null});
  let annotation;
  try{annotation=JSON.parse(choice.message.content);}catch{return json(502,{error:'invalid_provider_json',content:String(choice?.message?.content??'').slice(0,2000)});}

  return json(200,{
    operation:'integral_ingestion_v3_fixed_proof',
    source_bundle_id:'ecb-ingestion-v3-proof',
    case:name,
    pinned_source_commit:SOURCE_COMMIT,
    input:{text:raw,sha256:await digest(raw)},
    grammar:{id:grammar.grammar_id,version:grammar.version,sha256:await digest(JSON.stringify(grammar))},
    master_key:profile.master_key,
    request_sha256:await digest(JSON.stringify(request)),
    model:data.model??profile.request.model,
    provider:data.provider??null,
    usage:data.usage??null,
    annotation,
    semantic_standing:'UNASSESSED',
    canonical_effect:'NONE',
    qualification_limit:'Exact checked-in mechanical qualification is applied by the GitHub proof workflow after transport.'
  });
});
