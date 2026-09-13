#!/usr/bin/env python3
"""Reconstruct accepted predecessor in the already-identified BUILD 10 pair only."""
import json, re, subprocess, secrets, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CONFIG=Path('/private/tmp/ecb10-local.json')
def run(args,data=None):
 p=subprocess.run(args,input=data,text=True,capture_output=True)
 if p.returncode: raise RuntimeError(p.stderr)
 return p.stdout.strip()
def sql(c,db,s,user='custodian'):
 return run(['docker','exec','-i',c,'psql','-X','-qAt','-U',user,'-d',db,'-v','ON_ERROR_STOP=1'],s)
cfg={}
for side,port in [('source',55443),('destination',55444)]:
 c=f'ecb10-{side}-pg17'; db=f'build10_{side}'
 info=json.loads(run(['docker','inspect',c]))[0]
 assert info['Config']['Labels']['ecb.build']=='10'
 assert info['Config']['Image']=='pgvector/pgvector:0.8.2-pg17'
 assert info['HostConfig']['PortBindings']['5432/tcp'][0]=={'HostIp':'127.0.0.1','HostPort':str(port)}
 if not info['State']['Running']: run(['docker','start',c])
 run(['docker','exec',c,'pg_isready','-U','postgres'])
 roles=sql(c,'postgres',"select rolname from pg_roles where rolname='custodian'",'postgres')
 if not roles: sql(c,'postgres','create role custodian login superuser;', 'postgres')
 if sql(c,'postgres',f"select 1 from pg_database where datname='{db}'"):
  if '--repair-incomplete-setup' not in sys.argv or sql(c,db,"select 1 from pg_namespace where nspname='ecb10'"):
   raise RuntimeError(f'{db} already exists; preserve it, use reload for ordinary code repairs')
  sql(c,'postgres',f'drop database {db};')
 sql(c,'postgres',f'create database {db} owner postgres;')
 script=(ROOT/'tests/build-6/ci-reconstruct-build5b.sh').read_text()
 # Execute exactly the original SQL blocks and file applications, in original order.
 pattern=r"<<'SQL'\n(.*?)\nSQL|^apply (sql/[^\n]+)|^psql [^\n]*?-f (tests/[^\n]+)"
 for m in re.finditer(pattern,script,re.S|re.M):
  if m.group(1) is not None:
   s=m.group(1)
   if 'create role postgres login' in s:
    s=s.replace('create role postgres login inherit createrole createdb replication bypassrls;',
                'alter role postgres inherit createrole createdb replication bypassrls;')
   for role in ['anon','authenticated','service_role']:
    if sql(c,'postgres',f"select 1 from pg_roles where rolname='{role}'"):
     s=re.sub(r'create role '+role+r'[^;]*;', '', s)
   sql(c,db,s)
  else:
   path=m.group(2) or m.group(3)
   sql(c,db,(ROOT/path).read_text(),'postgres')
 # No predecessor data reset; load only additive B10 migration after reconstruction.
 sql(c,db,'begin;'+(ROOT/'sql/migrations/20260913070000_build_10_semantic_transfer.sql').read_text()+'commit;','postgres')
 users={}
 for role in ['sender','receiver','caller','resolver','observer','fixture']:
  password=secrets.token_hex(24); login=f'b10_{role}'
  sql(c,db,f"create role {login} login noinherit password '{password}'; grant ecb10_{role} to {login};")
  users[role]={'host':'127.0.0.1','port':port,'database':db,'username':login,'password':password}
 cfg[side]={'container':c,'database':db,'users':users}
CONFIG.write_text(json.dumps(cfg)); CONFIG.chmod(0o600)
print('Accepted BUILD 0–5B + additive B10 installed in dedicated pair; local credentials in mode-0600 temporary file.')
