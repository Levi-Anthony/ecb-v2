#!/usr/bin/env python3
"""First internal-Move discriminator; disposable custody only, not P01 proof."""
import hashlib
import json
import secrets
import subprocess
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IMAGE = "pgvector/pgvector:0.8.2-pg17"
RUN = str(uuid.uuid4())
PASSWORD = secrets.token_hex(24)
SID, DID, ROLLBACK_ID = (str(uuid.uuid4()) for _ in range(3))
SOURCE = "ecb10-source-pg17"
DEST = "ecb10-destination-pg17"
EVIDENCE = ROOT / "docs/build-receipts/evidence/build-10/custody-probe.json"
facts = {"probe": "dual-custody/v1", "run": RUN, "claim": "environment and octet custody only; not P01", "stages": []}


def docker(*args, data=None, check=True):
    return subprocess.run(["docker", *args], input=data, text=True,
                          capture_output=True, check=check)


def sql(container, statement, user="postgres", database="postgres", check=True):
    return docker("exec", "-i", "-e", f"PGPASSWORD={PASSWORD}", container,
                  "psql", "-X", "-qAt", "-h", "127.0.0.1", "-U", user,
                  "-d", database, "-v", "ON_ERROR_STOP=1", data=statement, check=check)


def ready(name):
    for _ in range(30):
        if docker("exec", name, "pg_isready", "-U", "postgres", check=False).returncode == 0:
            return
        time.sleep(0.5)
    raise RuntimeError(f"not ready: {name}")


def stage(name, **values):
    facts["stages"].append({"stage": name, **values})


try:
    # Never reset/reuse/remove any existing resource, including predecessor containers.
    for name in (SOURCE, DEST):
        found = docker("container", "inspect", name, check=False)
        if found.returncode == 0:
            raise RuntimeError(f"existing container requires separate disposition: {name}")
        if "No such" not in found.stderr:
            raise RuntimeError(found.stderr)
        volume = docker("volume", "inspect", name + "-data", check=False)
        if volume.returncode == 0:
            raise RuntimeError(f"existing volume requires separate disposition: {name}-data")
        if "no such" not in volume.stderr.lower():
            raise RuntimeError(volume.stderr)
    for name, port in ((SOURCE, 55443), (DEST, 55444)):
        docker("volume", "create", "--label", "ecb.build=10", "--label", f"ecb.probe={RUN}", name + "-data")
        docker("run", "-d", "--name", name, "--label", "ecb.build=10", "--label", f"ecb.probe={RUN}",
               "-p", f"127.0.0.1:{port}:5432", "-v", f"{name}-data:/var/lib/postgresql/data",
               "-e", f"POSTGRES_PASSWORD={PASSWORD}", IMAGE)
        ready(name)
        sql(name, "create database custody_probe;")
        sql(name, f"create role probe_receiver login password '{PASSWORD}'; create role probe_reader login password '{PASSWORD}';")
        sql(name, "create table octets(id uuid primary key, state text not null, body bytea not null);"
            "grant select,insert on octets to probe_receiver; grant select on octets to probe_reader;", database="custody_probe")
    metadata = []
    for name in (SOURCE, DEST):
        inspected = json.loads(docker("inspect", name).stdout)[0]
        metadata.append({"name": name, "image_id": inspected["Image"],
                         "volume": [m["Name"] for m in inspected["Mounts"] if m["Destination"] == "/var/lib/postgresql/data"],
                         "system_identifier": sql(name, "select system_identifier from pg_control_system();").stdout.strip()})
    assert metadata[0]["system_identifier"] != metadata[1]["system_identifier"]
    assert metadata[0]["volume"] != metadata[1]["volume"]
    stage("independent_stores", stores=metadata)
    raw = b'BUILD10 actual source octets\x00\xff\n80,100 <=100\n'
    sql(SOURCE, f"insert into octets values('{SID}','selected',decode('{raw.hex()}','hex'));", "probe_receiver", "custody_probe")
    selected_hex = sql(SOURCE, f"select encode(body,'hex') from octets where id='{SID}';", "probe_reader", "custody_probe").stdout.strip()
    assert bytes.fromhex(selected_hex) == raw
    prefix_id = str(uuid.uuid4())
    sql(DEST, f"insert into octets values('{prefix_id}','partial',decode('{selected_hex[:16]}','hex'));", "probe_receiver", "custody_probe")
    sql(DEST, f"begin; insert into octets values('{ROLLBACK_ID}','complete',decode('{selected_hex}','hex')); rollback;", "probe_receiver", "custody_probe")
    assert sql(DEST, f"select count(*) from octets where id='{ROLLBACK_ID}';", "probe_reader", "custody_probe").stdout.strip() == "0"
    stage("partial_and_rollback", partial_id=prefix_id, rolled_back_id=ROLLBACK_ID, completed_rows_after_rollback=0)
    sql(DEST, f"insert into octets values('{DID}','complete',decode('{selected_hex}','hex'));", "probe_receiver", "custody_probe")
    denied = sql(DEST, f"insert into octets values('{uuid.uuid4()}','forged','x');", "probe_reader", "custody_probe", check=False)
    assert denied.returncode != 0 and "permission denied" in denied.stderr
    stage("reader_write_denied", sql_error="permission denied")
    docker("stop", SOURCE)
    assert json.loads(docker("inspect", SOURCE).stdout)[0]["State"]["Running"] is False
    docker("restart", DEST)
    ready(DEST)
    # New psql process, destination-only credentials and exact locator.
    recovered = sql(DEST, f"select encode(body,'hex') from octets where id='{DID}' and state='complete';", "probe_reader", "custody_probe").stdout.strip()
    assert recovered == selected_hex
    assert sql(DEST, f"select state from octets where id='{prefix_id}';", "probe_reader", "custody_probe").stdout.strip() == "partial"
    stage("cold_destination_recovery", source_stopped=True, destination_restarted=True,
          locator={"container": DEST, "database": "custody_probe", "id": DID},
          source_id=SID, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest(), equal=True)
    facts["outcome"] = "PASS_ENVIRONMENT_ONLY"
    facts["retained_resources"] = "Source stopped; destination running; independent labeled volumes retained. Disposable probe schema only. No BUILD 10 semantic implementation installed."
except Exception as exc:
    facts["outcome"] = "FAIL_OR_INCONCLUSIVE"
    # Do not include subprocess arguments: they can contain ephemeral credentials.
    facts["error"] = str(exc) if not isinstance(exc, subprocess.CalledProcessError) else (exc.stderr or "subprocess failed")
    raise RuntimeError(facts["error"]) from None
finally:
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    EVIDENCE.write_text(json.dumps(facts, indent=2) + "\n")
    print(json.dumps({"outcome": facts.get("outcome"), "evidence": str(EVIDENCE), "stages": len(facts["stages"])}))
