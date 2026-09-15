// Bounded evidence-producing tool, not a canonical tokenizer or ordinary database runtime.
const encoder = new TextEncoder();
export async function digest(text) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function reply(status, body) {
  return new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
export function checkAnnotation(raw, annotation) {
  const errors=[];
  if (!annotation || typeof annotation!=='object' || Array.isArray(annotation) ||
      Object.keys(annotation).join()!=='elements' || !Array.isArray(annotation.elements)) return ['invalid_container'];
  if (!annotation.elements.length) errors.push('no_differentiation');
  const required=['basis','description','excerpt','handle','question','relevance_test'];
  const seen=new Set();
  for(const item of annotation.elements){
    if(!item || typeof item!=='object' || Object.keys(item).sort().join()!==required.join() ||
       Object.values(item).some(v=>typeof v!=='string')){errors.push('invalid_element');continue;}
    if(!item.handle || seen.has(item.handle)) errors.push('invalid_or_duplicate_handle');
    seen.add(item.handle);
    if(!item.excerpt || !raw.includes(item.excerpt)) errors.push('excerpt_not_in_source');
    if(!['reported','inquiry'].includes(item.basis)) errors.push('invalid_basis');
    if(![item.description,item.question,item.relevance_test].every(s=>s.trim()))errors.push('missing_interpretive_entry');
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
export function makeHandler({apiKey,capabilityHash,expiresAt,profile,fetcher=fetch,now=Date.now}){
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
    const request={...profile.request,messages:[{role:'system',content:profile.system},
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
    const errors=checkAnnotation(input.text,annotation);
    return reply(errors.length?422:200,{
      operation:'disclose_atomic_thought',version:1,attempt_id:crypto.randomUUID(),
      input:{...input,sha256:await digest(input.text)},
      request_sha256:await digest(JSON.stringify(request)),model:data.model??profile.request.model,
      provider:data.provider??null,usage:data.usage??null,annotation,mechanical_errors:errors,
      semantic_standing:'UNASSESSED',canonical_effect:'NONE',
      qualification_limit:'Source correspondence and shape checks are not semantic truth or completeness.'});
  };
}
