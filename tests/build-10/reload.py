#!/usr/bin/env python3
"""Ordinary pre-freeze function repairs only; no schema/data reset."""
import re,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
if (root/'docs/build-receipts/evidence/build-10/checker-freeze.json').exists():
 raise RuntimeError('Checker frozen; no automatic post-freeze repair authorized by this helper')
s=(root/'sql/migrations/20260913070000_build_10_semantic_transfer.sql').read_text()
functions=re.findall(r'create function .*?\$\$;',s,re.S)
for side in ['source','destination']:
 c='ecb10-'+side+'-pg17'
 sql='begin; drop index if exists public.b10_context; set role ecb10_owner;\n'+'\n'.join(x.replace('create function','create or replace function',1) for x in functions)+'\n'+s[s.index('revoke all on all functions in schema ecb10'):s.index('-- Source resolver uses')]+ '\ncommit;'
 p=subprocess.run(['docker','exec','-i',c,'psql','-X','-qAt','-U','custodian','-d','build10_'+side,'-v','ON_ERROR_STOP=1'],input=sql,text=True,capture_output=True)
 if p.returncode: raise RuntimeError(p.stderr)
print('Function definitions refreshed atomically; existing method seals deliberately become stale.')
