import { checkAnnotation, digest, runtimeGrammar } from './core.mjs';
import profile from './request-profile-v3.json' with { type: 'json' };
import grammar from './grammar-runtime-v0.1.json' with { type: 'json' };
import commission from './commission.local.json' with { type: 'json' };

const CASES: Record<string,string> = {
  base: 'Jennifer wanted me to call her back.',
  already_discussed: 'Jennifer wanted me to call her back. I already saw Jennifer at the appointment and we talked about what she wanted.',
  gift: "Jennifer wanted me to call her back. Jennifer is Mary's sister. She wanted the callback as soon as possible to learn what I got Mary for her birthday last year so she would not repeat it.",
};

function json(status:number, body:unknown){
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}

Deno.serve(async (req:Request)=>{
  if(Date.now()>=commission.expiresAt) return json(410,{error:'proof_window_expired'});
  if(req.method!=='GET') return json(405,{error:'get_required'});
  const name=new URL(req.url).searchParams.get('case')??'';
  const raw=CASES[name];
  if(!raw) return json(400,{error:'unknown_fixed_case',allowed:Object.keys(CASES)});
  const apiKey=Deno.env.get('OPENROUTER_API_KEY');
  if(!apiKey) return json(503,{error:'openrouter_not_configured'});
  const compiledGrammar=runtimeGrammar(grammar);
  const system=[profile.system,`\nPRINCIPAL_MASTER_KEY:\n${JSON.stringify(profile.master_key)}`,`\nINSTALLED_GRAMMAR_CONTRACT:\n${JSON.stringify(compiledGrammar)}`].join('\n');
  const request={...profile.request,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({raw,source:`principal_fixture_v3_${name}`,status:'supplied_evidence_not_verified_fact'})}]};
  let response,data;
  try{
    response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(45000)});
    if(!response.ok) return json(502,{error:'provider_http_error',status:response.status});
    data=await response.json();
  }catch{return json(502,{error:'provider_unavailable'});}
  const choice=data?.choices?.[0];
  if(choice?.finish_reason!=='stop') return json(502,{error:'incomplete_generation'});
  let annotation;
  try{annotation=JSON.parse(choice.message.content);}catch{return json(502,{error:'invalid_provider_json'});}
  const mechanical_errors=checkAnnotation(raw,annotation,profile.grammar_version);
  return json(mechanical_errors.length?422:200,{
    operation:'integral_ingestion_v3_fixed_proof',
    case:name,
    input:{text:raw,sha256:await digest(raw)},
    grammar:{id:compiledGrammar.grammar_id,version:compiledGrammar.version,sha256:await digest(JSON.stringify(compiledGrammar))},
    master_key:profile.master_key,
    request_sha256:await digest(JSON.stringify(request)),
    model:data.model??profile.request.model,
    provider:data.provider??null,
    usage:data.usage??null,
    annotation,
    mechanical_errors,
    semantic_standing:'UNASSESSED',
    canonical_effect:'NONE'
  });
});
