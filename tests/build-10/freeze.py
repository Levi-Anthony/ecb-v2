#!/usr/bin/env python3
import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
evidence=root/'docs/build-receipts/evidence/build-10'
path=evidence/'checker-freeze.json'
if path.exists(): raise RuntimeError('Existing freeze must be preserved')
def sql(side,q):
 p=subprocess.run(['docker','exec','-i','ecb10-'+side+'-pg17','psql','-X','-qAt','-U','custodian','-d','build10_'+side,'-v','ON_ERROR_STOP=1'],input=q,text=True,capture_output=True,check=True)
 return p.stdout.strip()
inventory="select jsonb_agg(jsonb_build_object('signature',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid)) order by p.oid::regprocedure::text) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb10';"
source=json.loads(sql('source',inventory));destination=json.loads(sql('destination',inventory));assert source==destination
method=sql('destination','select ecb10.method_digest();');assert method==sql('source','select ecb10.method_digest();')
assert sql('destination',"select count(*) from pg_class where relname='b10_context';")=='0'
files=[root/'sql/migrations/20260913070000_build_10_semantic_transfer.sql',*sorted((root/'server/build-10').glob('*.mjs'))]
record={'state':'FROZEN_BEFORE_HOLDOUT','checkpoint':'2f573890f0dbaa4c4f939210641d23b75be88afb','method_digest':method,'files':{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files},'function_count':len(destination),'holdout':'Not yet authored/executed at freeze; no tuning against its result','source_destination_definitions_equal':True}
(evidence/'checker-definitions.json').write_text(json.dumps(destination,indent=2)+'\n');path.write_text(json.dumps(record,indent=2)+'\n')
print('FROZEN',method)
