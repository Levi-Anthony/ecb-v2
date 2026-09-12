import postgres from '../build-7/node_modules/postgres/src/index.js';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const db=postgres('postgres://custodian@127.0.0.1:55442/build9',{max:1});
try{
 const functions=await db`select n.nspname schema,p.oid::regprocedure::text signature,pg_get_functiondef(p.oid) definition,pg_get_userbyid(p.proowner) owner,p.proacl::text acl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','ecb7','ecb8','ecb_governance') and p.prokind='f' order by signature`;
 const tables=await db`select n.nspname schema,c.relname name,pg_get_userbyid(c.relowner) owner,c.relacl::text acl from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','ecb7','ecb8','ecb_governance') and c.relkind='r' order by schema,name`;
 const columns=await db`select table_schema,table_name,column_name,grantee,privilege_type from information_schema.column_privileges where table_schema in ('public','ecb7','ecb8','ecb_governance') order by table_schema,table_name,column_name,grantee,privilege_type`;
 const triggers=await db`select tgname,pg_get_triggerdef(oid) definition from pg_trigger where not tgisinternal order by tgname`;
 const selected=await db`select id,current_event from ecb7.scopes order by id`;
 writeFileSync(process.argv[2],JSON.stringify({functions:functions.map(f=>({...f,sha256:createHash('sha256').update(f.definition).digest('hex')})),tables,columns,triggers,selected},null,2)+'\n');
}finally{await db.end();}
