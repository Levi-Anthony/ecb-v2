#!/usr/bin/env python3
"""Boundary lint plus sensitivity canaries; not a universal code-safety proof."""
import json
import os
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "artifacts/eco152"
OUT.mkdir(parents=True, exist_ok=True)
def prohibited(text):
    return bool(re.search(r"https?://[^\s'\"]*\.supabase\.(co|com)|SUPABASE_SERVICE_ROLE_KEY", text))
def effect_surface(text):
    return bool(re.search(r"create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?orientation[^\s(]*execute", text, re.I))
# The same check must discriminate both directions, not merely emit PASS.
if not prohibited("https://fixture.supabase.co") or prohibited("postgresql://fixture@127.0.0.1:55439/build6"):
    raise SystemExit("containment checker sensitivity failure")
if not effect_surface("create function public.orientation_v1_execute()") or effect_surface("create function public.orientation_v1_resolve()"):
    raise SystemExit("effect-surface checker sensitivity failure")
paths = list((ROOT / "sql/migrations").glob("*eco152*.sql"))
paths += [p for p in (ROOT / "tests/eco-152").glob("*.py") if p.name != "containment.py"]
for p in paths:
    text = p.read_text()
    if prohibited(text) or (p.suffix == ".sql" and effect_surface(text)):
        raise SystemExit("containment rejected: " + str(p))
for name in ("ECO152_DATABASE_URL", "BUILD6_DATABASE_URL"):
    u = urlparse(os.environ[name])
    if u.hostname not in ("127.0.0.1", "localhost") or u.path != "/build6":
        raise SystemExit("non-loopback/non-disposable target rejected")
if os.environ.get("ECO152_DISPOSABLE") != "YES":
    raise SystemExit("disposable marker required")
result = {"result": "PASS", "targets": "loopback only", "fixture_mode": True,
          "checker_canaries": "prohibited provider and effect-surface positives rejected; allowed controls accepted",
          "limit": "static target/surface lint and explicit fixture routing, not arbitrary-program safety proof"}
(OUT / "containment.json").write_text(json.dumps(result, indent=2))
print("ECO152_CONTAINMENT=PASS")
