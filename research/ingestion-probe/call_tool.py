"""Invoke the commissioned extraction tool. Capability stays in a local file."""
import argparse,json,sys,urllib.request,urllib.error
from pathlib import Path
from probe import RAW,BRANCHES
p=argparse.ArgumentParser()
p.add_argument('--case',choices=['base','already_discussed','gift_information','negated'],default='base')
p.add_argument('--wrong-key',action='store_true')
p.add_argument('--capability-file',type=Path)
p.add_argument('--output-dir',type=Path,default=Path(__file__).with_name('evidence'))
a=p.parse_args()
text={'base':RAW,'already_discussed':RAW+' '+BRANCHES['already_discussed'],'gift_information':RAW+' '+BRANCHES['gift_information'],'negated':'Jennifer did not want me to call her back.'}[a.case]
if not a.wrong_key and not a.capability_file:
 p.error('--capability-file is required except for the authentication negative control')
key='deliberately-wrong-negative-control' if a.wrong_key else a.capability_file.read_text().strip()
req=urllib.request.Request('https://lqbrzoicorehwidkdhoi.supabase.co/functions/v1/ecb-ingestion-experiment',data=json.dumps({'text':text,'source':'Principal-supplied illustrative fixture; not personal history'}).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'},method='POST')
try:
 with urllib.request.urlopen(req,timeout=60) as r: status=r.status;body=json.load(r)
except urllib.error.HTTPError as e:
 status=e.code
 try: body=json.loads(e.read())
 except (ValueError,UnicodeError): body={'error':'non_json_http_error'}
except urllib.error.URLError:
 print('Network unavailable; capability not printed.');sys.exit(2)
result={'http_status':status,'case':a.case,'result':body}
name='auth-negative' if a.wrong_key else a.case
a.output_dir.mkdir(parents=True,exist_ok=True)
target=a.output_dir / ('live-extraction-'+name+'.json')
if target.exists():
 import uuid
 target=a.output_dir / ('live-extraction-'+name+'-'+str(uuid.uuid4())+'.json')
with target.open('x') as out: out.write(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
