"""Check draft format, reference resolution and fixed fixture shape; not model activation."""
import json
import re
from pathlib import Path

base = Path(__file__).resolve().parents[1]
expected = {"AUDIT", "SCOUT", "FULCRUM", "TRANSLATION", "NOTATION", "NEXT", "MIXED"}
for name in ("ecos-frontier-exploration", "ecos-translation-frontier"):
    path = base / "drafts" / name / "SKILL.md"
    content = path.read_text()
    assert content.startswith("---\n") and content.count("\n---\n") >= 1, path
    header = content.split("\n---\n", 1)[0]
    assert f"name: {name}" in header and "description:" in header
    for relative in re.findall(r"\]\(([^)]+\.md)\)", content):
        assert (path.parent / relative).is_file(), (path, relative)
for split in ("train", "holdout"):
    records = json.loads((base / "evals" / f"{split}.json").read_text())
    assert len(records) == 14 and {r["intent"] for r in records} == expected
    assert len({r["id"] for r in records}) == 14
    assert len({r["prompt"] for r in records}) == 14
assert not ({r["prompt"] for r in json.loads((base / "evals" / "train.json").read_text())}
            & {r["prompt"] for r in json.loads((base / "evals" / "holdout.json").read_text())})
print("PASS: two draft Skill files, all referenced files, seven classes and 28 unique prompts")
