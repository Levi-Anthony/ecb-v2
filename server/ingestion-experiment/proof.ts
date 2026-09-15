import commission from './commission.local.json' with { type: 'json' };

const SOURCE_COMMIT='3aa2487a14998bc891add409b646daa79a2c7d02';
const RAW_ROOT=`https://raw.githubusercontent.com/Levi-Anthony/ecb-v2/${SOURCE_COMMIT}`;
const CASES: Record<string,string> = {
  base: 'Jennifer wanted me to call her back.',
  already_discussed: 'Jennifer wanted me to call her back. I already saw Jennifer at the appointment and we talked about what she wanted.',
  gift: "Jennifer wanted me to call her back. Jennifer is Mary's sister. She wanted the callback as soon as possible to learn what I got Mary for her birthday last year so she would not repeat it.",
};
const encoder=new TextEncoder();
async function digest(text:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function json(status:number, body:unknown){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
async function fetchJson(path:string){const r=await fetch(`${RAW_ROOT}/${path}`,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(`source_fetch_${r.status}`);return await r.json();}

Deno.serve(async (req:Request)=>{
  if(Date.now()>=commission.expiresAt) return json(410,{error:'proof_window_expired'});
  if(req.method!=='GET') return json(405,{error:'get_required'});
  const name=new URL(req.url).searchParams.get('case')??'';
  const raw=CASES[name];
  if(!raw) return json(400,{error:'unknown_fixed_case',allowed:Object.keys(CASES)});
  const apiKey=Deno.env.get('OPENROUTER_API_KEY');
  if(!apiKey) return json(503,{error:'openrouter_not_configured'});

  let profile,grammar;
  try{
    [profile,grammar]=await Promise.all([
      fetchJson('server/ingestion-experiment/request-profile-v3.json'),
      fetchJson('server/ingestion-experiment/grammar-runtime-v0.1.json'),
    ]);
  }catch(error){return json(502,{error:'pinned_source_unavailable',detail:String(error)});}
  if(profile.grammar_id!==grammar.grammar_id||profile.grammar_version!==grammar.version)return json(500,{error:'pinned_grammar_profile_mismatch'});

  const system=[profile.system,`\nPRINCIPAL_MASTER_KEY:\n${JSON.stringify(profile.master_key)}`,`\nINSTALLED_GRAMMAR_CONTRACT:\n${JSON.stringify(grammar)}`].join('\n');
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
