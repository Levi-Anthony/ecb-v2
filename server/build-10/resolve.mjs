// Trusted resolver: no verdict and no source representation body crosses this interface.
import { readFileSync } from 'node:fs';
import { connect } from './client.mjs';
export async function resolve(check, config) {
  const D=connect(config.destination,'resolver'); await D.ready;
  let S;
  try {
    const req=(await D.db`select ecb10.resolver_request(${check}::uuid) x`)[0].x;
    if(req.existing) return req.existing;
    const q=req.question;
    const ids=[...new Set([q.binding.report,q.export,...q.manifest.map(x=>x.id)])];
    let records={}, missing=[], observation;
    try {
      S=connect(config.source,'resolver'); await S.ready;
      const rows=await S.db.begin('read only isolation level repeatable read', tx=>
        tx`select id,payload_text,encode(payload_digest,'hex') digest from public.artifacts where id in ${tx(ids)} and artifact_role='b10_basis'`);
      records=Object.fromEntries(rows.map(r=>[r.id,JSON.parse(r.payload_text)]));
      missing=ids.filter(i=>!records[i]);
      observation={kind:'exact_read_only_snapshot',digests:Object.fromEntries(rows.map(r=>[r.id,r.digest]))};
    } catch(e) {
      missing=ids; observation={kind:'unavailable',reason:e.code||'SOURCE_UNAVAILABLE'};
    }
    const v={check,records,missing,observation};
    return (await D.db`select ecb10.record_resolution(${check}::uuid,${D.db.json(v)}) x`)[0].x;
  } finally { await D.db.end(); if(S) await S.db.end({timeout:1}); }
}
if(import.meta.url===`file://${process.argv[1]}`){
  const config=JSON.parse(readFileSync(process.env.ECB10_RESOLVER_CONFIG,'utf8'));
  console.log(JSON.stringify({observation:await resolve(process.argv[2],config)}));
}
