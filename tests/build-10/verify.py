#!/usr/bin/env python3
"""Finite final proof execution; serial because source-loss/privilege controls mutate test access."""
import subprocess,json,time,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2]
evidence=root/'docs/build-receipts/evidence/build-10'
freeze=json.loads((evidence/'checker-freeze.json').read_text())
for name,digest in freeze['files'].items(): assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
results=[]
try:
 for name in ['primary','pressures','resilience','supplemental','transport','composition','removal']:
  started=time.time()
  p=subprocess.run(['node',str(root/f'tests/build-10/{name}.mjs')],cwd=root,text=True,capture_output=True)
  (evidence/f'final-{name}.log').write_text(p.stdout+p.stderr)
  results.append({'suite':name,'exit_code':p.returncode,'state':'PASS' if p.returncode==0 else 'FAIL_OR_INCONCLUSIVE','log':f'final-{name}.log','seconds':round(time.time()-started,2)})
  print(name,results[-1]['state'],flush=True)
  if p.returncode: print(p.stdout[-2000:]+p.stderr[-3000:],flush=True);raise RuntimeError(name+' did not complete')
finally:
 (evidence/'final-run.json').write_text(json.dumps({'freeze':freeze['method_digest'],'suites':results},indent=2)+'\n')
