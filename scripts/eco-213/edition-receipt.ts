import {createHash} from 'node:crypto';
import {z} from 'zod';
import {sourceManifest} from './commission.js';
import {MODEL,instructions,schemas} from '../../server/circulation/profile.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const source_manifest=await sourceManifest();
console.log('ECO213_EDITION_RECEIPT_JSON='+JSON.stringify({
 source_manifest,model:MODEL,qualification_scope:'compiled code/prompt/schema identity; not provider adequacy or hosted installation',
 editions:Object.fromEntries(Object.entries(schemas).map(([kind,schema])=>[kind,{
  prompt_digest:sha(instructions[kind as keyof typeof instructions]),schema_digest:sha(JSON.stringify(z.toJSONSchema(schema))),model:MODEL
 }]).concat([['embed',{prompt_digest:sha('gte-small 384 dimensions; mean pooling; normalized; no semantic verdict'),
  schema_digest:sha(JSON.stringify({dimensions:384,model:'Supabase/gte-small'})),model:'Supabase/gte-small'}]]))
}));
