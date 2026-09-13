// Cold entry: only a destination observer credential and exact delivery locator.
import { readFileSync } from 'node:fs';
import { connect } from './client.mjs';
const config=JSON.parse(readFileSync(process.env.ECB10_DESTINATION_CONFIG,'utf8'));
if(config.source || config.users) throw Error('cold config must contain only destination observer credentials');
const D=connect(config,'observer');
try {await D.ready; console.log(JSON.stringify((await D.db`select ecb10.inspect_delivery(${process.argv[2]}::uuid) x`)[0].x,null,2));}
finally {await D.db.end();}
