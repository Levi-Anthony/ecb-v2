"""Create expiring access for a bounded run; deploy only its hash. Never prints the capability."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import time

p = argparse.ArgumentParser()
p.add_argument('--capability-file', type=Path, required=True)
p.add_argument('--minutes', type=int, default=60, choices=range(1, 61), metavar='1..60')
a = p.parse_args()
root = Path(__file__).resolve().parents[2]
target = a.capability_file.resolve()
if target.is_relative_to(root):
    p.error('keep the capability outside the repository')
token = secrets.token_urlsafe(32)
fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as out:
    out.write(token+'\n')
config = {'capabilityHash': hashlib.sha256(token.encode()).hexdigest(),
          'expiresAt': int(time.time()*1000)+a.minutes*60000}
Path(__file__).with_name('commission.local.json').write_text(json.dumps(config)+'\n')
print('Access file created; only its hash is in the ignored deployment configuration.')
print('Deploy the reviewed function files to activate this access window.')
