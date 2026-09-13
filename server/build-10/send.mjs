// One bounded transfer; no autonomous retry and no semantic qualification.
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {connect} from './client.mjs';
export async function send({representation,question,request},config){
 const S=connect(config.source,'sender'); let D;
 let delivery=null,selected=false;
 const destination=`${config.destination.host}:${config.destination.port}/${config.destination.database}`;
 const observe=async status=>(await S.db`select ecb10.report_source(${representation}::uuid,${randomUUID()}::uuid,${request}::uuid,${question}::uuid,${destination},${delivery}::uuid,${status}) x`)[0].x;
 try{
  await S.ready;
  const p=(await S.db`select ecb10.read_export(${representation}::uuid) x`)[0].x;selected=true;
  await observe('SELECTED');await observe('ATTEMPTED');D=connect(config.destination,'sender');await D.ready;
  delivery=(await D.db`select ecb10.admit(${question}::uuid,${request}::uuid,${D.db.json(p.frame)},null) x`)[0].x;
  const copy=(await D.db`select ecb10.complete(${delivery}::uuid,${D.db.json(p.frame)},${Buffer.from(p.body,'base64')}) x`)[0].x;
  await observe('ACK_OBSERVED');
  return {delivery,copy,request,observation:'ACK_OBSERVED',semantic_assessment:null};
 }catch(e){
  if(selected){try{await observe('UNKNOWN');}catch{/* Persisted ATTEMPTED remains unresolved when S also disappears. */}}
  return {delivery,request,observation:'UNKNOWN',reason:e.code||'UNAVAILABLE',semantic_assessment:null};
 }finally{await S.db.end({timeout:1});if(D) await D.db.end({timeout:1});}
}
if(import.meta.url===`file://${process.argv[1]}`){
 const config=JSON.parse(readFileSync(process.env.ECB10_SENDER_CONFIG,'utf8'));
 console.log(JSON.stringify(await send({representation:process.argv[2],question:process.argv[3],request:process.argv[4]},config)));
}
