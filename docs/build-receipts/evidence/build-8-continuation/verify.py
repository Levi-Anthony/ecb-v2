"""Read-only verification of retained ECO-103 local and CI evidence.

Run from repository root. This checks evidence integrity and reported outcomes;
it does not execute the mechanism or claim independent-author proof.
"""
import hashlib
import json
from pathlib import Path
import zipfile

original = Path("docs/build-receipts/evidence/build-8")
here = Path(__file__).parent
sha = lambda data: hashlib.sha256(data).hexdigest()
read = lambda path: json.loads(path.read_text())

manifest = read(original / "manifest.json")
for path, expected in manifest["files"].items():
    data = Path(path).read_bytes()
    assert sha(data) == expected["sha256"], path
    assert len(data) == expected["bytes"], path
freeze = read(original / "freeze.json")
for path, expected in freeze["files"].items():
    assert sha(Path(path).read_bytes()) == expected, path

artifact = read(here / "ci-artifacts.json")["artifacts"][0]
archive = (here / "ci-proof.zip").read_bytes()
assert "sha256:" + sha(archive) == artifact["digest"]
run = read(here / "ci-run.json")
assert run["headSha"] == "c64d55dd6be00395fc39c0a845a6dcc3dd304b42"
assert run["conclusion"] == "success"

def check_episode(load):
    primary = load("primary.json")["results"]
    assert [x["id"] for x in primary] == [f"P{i:02}" for i in range(1, 15)]
    assert all(x["outcome"] == "PASS" for x in primary)
    assert sum(len(x["controls"]) for x in primary) == 109
    assert len(load("supplemental.json")["results"]) == 18
    dispatch = load("dispatch.json")["results"]
    assert len(dispatch) == 2 and all(x["replay_event_appends"] == 0 for x in dispatch)
    comp = load("composition.json")
    assert comp["result"] == comp["historical_binding"]["receipt"]["result"] == "PASS"
    assert len(comp["routing"]) == 18
    assert all(len(x["hits"]) == 1 for x in comp["routing"])
    audit = load("audit.json")
    assert audit["version"]["version"].startswith("PostgreSQL 17.")
    assert audit["version"]["isolation"] == "read committed"
    assert audit["privilege"] == {"pointer": False, "general_update": False, "lock_column": True}
    assert audit["shape"] == {"tables": 0, "missing_identities": 0}
    assert len(audit["functions"]) == 20
    assert all(x["owner"] == "ecb8_owner" for x in audit["functions"])
    cold = load("cold-output.json")
    assert cold["status"] == "EFFECT_ESTABLISHED" and cold["legitimate"] is True
    assert cold["native"] == {"value": 1, "revision": 1, "ready": True, "effect_count": 1}
    assert cold["retry"] == "HOLD" and cold["entitlement"]["remaining_occurrences"] == 0
    assert cold["entitlement"]["may_dispatch_from_recovery"] is False
    holdout = load("holdout.json")
    assert holdout["result"] == "PASS"
    assert holdout["freeze_sha256"] == sha((original / "freeze.json").read_bytes())
    assert holdout["mixed_storm"] == {"exact_replays": 9, "status_checks": 13, "fences_added": 0, "extra_starts": 0}
    assert load("inherited/layer-b-regression.json")["exit_code"] == 0
    return {x["id"]: x["outcome"] for x in primary}

local_results = check_episode(lambda name: read(original / name))
with zipfile.ZipFile(here / "ci-proof.zip") as z:
    ci_results = check_episode(lambda name: json.loads(z.read(name)))
    assert z.read("freeze.json") == (original / "freeze.json").read_bytes()
    assert z.read("live-sources.json") == (original / "live-sources.json").read_bytes()
    members = {name: sha(z.read(name)) for name in z.namelist()}

print(json.dumps({
    "result": "PASS",
    "proof_class": "atomic-ledger PostgreSQL synthetic-target class only",
    "original_manifest_files": len(manifest["files"]),
    "frozen_files": len(freeze["files"]),
    "original_local_results": local_results,
    "ci_results": ci_results,
    "ci_run": run["url"],
    "ci_archive_sha256": sha(archive),
    "ci_archive_members": members,
    "ci_holdout_standing": "regression of original holdout; not a new untuned holdout",
    "ci_manifest_scope": "archived manifest.json describes original committed local evidence, not regenerated CI UUIDs; member hashes above bind the CI archive",
}, indent=2))
