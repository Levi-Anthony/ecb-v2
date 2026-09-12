// Read-only cold entry: locator and exact local disposable state, no fixture imports.
import {compact} from './card.mjs';
import postgres from '../../tests/build-7/node_modules/postgres/src/index.js';
const p=process.argv[2];const drill=process.argv[3]==='--source';
if(!/^[a-f0-9-]{36}$/.test(p??''))throw Error('Exact inquiry UUID required');
const sql=postgres('postgres://b9_observer@127.0.0.1:55442/build9',{max:1,prepare:false});
try{const [r]=drill?await sql`select ecb9.read_source(${p}::uuid) card`:await sql`select ecb9.inspect(${p}::uuid) card`;console.log(JSON.stringify(drill?r.card:compact(r.card),null,2));}finally{await sql.end();}
