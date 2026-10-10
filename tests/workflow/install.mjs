import pg from 'pg';
import {readFile,readdir} from 'node:fs/promises';
const url=process.env.ECO213_TEST_DATABASE_URL;
if (url!=='postgresql://postgres@127.0.0.1:55439/build6') throw new Error('Explicit local CI reconstruction required');
const client=new pg.Client({connectionString:url}); await client.connect();
try{
  for(const file of (await readdir('sql/migrations')).filter(f=>f.includes('_workflow_') && !f.includes('_observer')).sort()){
    await client.query(await readFile(`sql/migrations/${file}`,'utf8'));
  }
  await client.query(await readFile('tests/workflow/native.sql','utf8'));
  console.log('PASS: complete positive cycle and native rejection/currentness/reentry controls. Provider Cron scheduling is verified on the enduring installation separately.');
}finally{await client.end();}
