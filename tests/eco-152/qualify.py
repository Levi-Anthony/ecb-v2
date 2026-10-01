#!/usr/bin/env python3
"""ECO-152 disposable PG17 qualification. No production target or third-party Python packages.

All candidate calls use a non-superuser login SET ROLE anon. Administrator access
is separate and limited to fixture commissioning, revocation and evidence inspection.
Synthetic reviewer judgments test enforcement, NOT truth of their semantic findings.
"""
from __future__ import annotations
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import subprocess
import threading
import uuid
from urllib.parse import urlparse, urlunparse

ADMIN = os.environ["ECO152_DATABASE_URL"]
url = urlparse(ADMIN)
if os.environ.get("ECO152_DISPOSABLE") != "YES" or url.hostname not in ("127.0.0.1", "localhost") or url.path != "/build6":
    raise SystemExit("Refusing non-disposable/non-loopback target")
CLIENT = urlunparse(url._replace(netloc=f"orientation_client@{url.hostname}:{url.port}"))
CUSTODIAN = urlunparse(url._replace(netloc=f"custodian@{url.hostname}:{url.port}"))
OUT = Path(os.environ.get("ECO152_EVIDENCE_DIR", "artifacts/eco152"))
OUT.mkdir(parents=True, exist_ok=True)
HEADERS = {"x-ecb-runtime-key": "build11-test-runtime-key-00000000000000000000",
           "x-ecb-orientation-reviewer-key": "eco152-fixture-reviewer-only",
           "x-ecb-orientation-binder-key": "eco152-fixture-binder-only"}
LOCK = threading.Lock()
COUNT = 0

def uid(): return str(uuid.uuid4())
def lit(value):
    if value is None: return "NULL"
    if isinstance(value, (int, float)): return str(value)
    return "'" + str(value).replace("'", "''") + "'"
def encode(obj): return json.dumps(obj, separators=(",", ":"), sort_keys=True)
def digest(text): return hashlib.sha256(text.encode()).hexdigest()
def log_file(name, item):
    with LOCK, (OUT / name).open("a", encoding="utf-8") as f:
        f.write(encode(item) + "\n")
def execute(sql, *, admin=False, headers=None):
    prefix = "" if admin else "SET ROLE anon; SET request.headers=" + lit(encode(HEADERS if headers is None else headers)) + ";\n"
    database = CUSTODIAN if admin == "custodian" else (ADMIN if admin else CLIENT)
    return subprocess.run(["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", database],
                          input=prefix + sql, text=True, capture_output=True, timeout=30)
def run(sql, *, admin=False, headers=None):
    p = execute(sql, admin=admin, headers=headers)
    if p.returncode:
        raise RuntimeError(p.stderr.strip())
    return p.stdout.strip()
def value(sql, **kwargs): return json.loads(run(sql, **kwargs))
def check(name, condition, observed, consequence, expected="contract correspondence"):
    global COUNT
    COUNT += 1
    event = {"test": name, "pass": bool(condition), "expected": expected,
             "observed": observed, "decision_consequence": consequence}
    log_file("checks.jsonl", event)
    print(encode(event), flush=True)
    if not condition: raise AssertionError(name)
def rejected(name, sql, error, consequence="Reject the counterfeit/stale transition; preserve prior state", *, headers=None):
    p = execute(sql, headers=headers)
    check(name, p.returncode != 0 and error in p.stderr, {"exit": p.returncode, "error": p.stderr.strip()}, consequence, error)
    return p

def request(kind, payload, s=None, *, op=None, epoch=None, predecessor="AUTO", raw=False):
    submitted = payload if raw else encode(dict(profile="ecb.orientation/1", **payload))
    return {"operation_id": op or uid(), "kind": kind, "scope_id": s["scope_id"] if s else None,
            "epoch": s["epoch"] if s is not None and epoch is None else epoch,
            "predecessor": s["current_binding_id"] if s is not None and predecessor == "AUTO" else (None if predecessor == "AUTO" else predecessor),
            "submitted_text": submitted}
def sql_for(req):
    return "select public.orientation_v1_write(" + ",".join(lit(req[k]) for k in
        ("operation_id", "kind", "scope_id", "epoch", "predecessor", "submitted_text")) + ");"
def send(req, *, headers=None):
    p = execute(sql_for(req), headers=headers)
    log_file("operations.jsonl", {"request": req, "exit": p.returncode, "stdout": p.stdout, "stderr": p.stderr})
    if p.returncode: raise RuntimeError(p.stderr.strip())
    return json.loads(p.stdout)
def write(kind, payload, s=None, **kwargs): return send(request(kind, payload, s, **kwargs))
def resolve(s, use=None):
    v = value("select public.orientation_v1_resolve("+lit(s["scope_id"])+","+lit(use or s["declared_use"])+");")
    log_file("resolutions.jsonl", v)
    return v
def refresh(s):
    v = resolve(s)
    s.update(epoch=v["epoch"], current_binding_id=v["current_binding_id"], last_fence_id=v["last_fence_id"])
    return v
def artifact(text):
    v = value("select row_to_json(x) from public.ecb12_create_artifact("+lit(uid())+","+lit(text)+") x;")
    return {"artifact_id": v["artifact_id"], "sha256": digest(text), "version": "fixture-v1", "role": "fixture", "standing": "synthetic evidence"}
def snapshot(name):
    sql = """select jsonb_build_object(
      'scopes',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from ecb_orientation.scopes s),
      'records',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from ecb_orientation.records r),
      'capabilities_redacted',(select coalesce(jsonb_agg(to_jsonb(c)-'key_digest'),'[]') from ecb_orientation.capabilities c),
      'operations',(select coalesce(jsonb_agg(to_jsonb(o)),'[]') from public.ordinary_operations o where operation_kind like 'orientation_%'),
      'artifacts',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.text_artifacts a));"""
    data = value(sql, admin=True)
    (OUT / name).write_text(json.dumps(data, indent=2), encoding="utf-8")

def main():
    # Cluster-role commissioning is fixture custody, never the candidate's ordinary path.
    run("create role orientation_client login noinherit nosuperuser nocreatedb nocreaterole; grant anon to orientation_client;", admin="custodian")
    actor, issuer, focal = uid(), uid(), uid()
    run("insert into public.referents(id) values("+lit(actor)+"),("+lit(issuer)+"),("+lit(focal)+");", admin=True)
    source = artifact("Fixture governing source: nonexecuting bounded inspection only.")
    grammar = artifact("Fixture grammar v1: keep representation, qualification, currentness and authority distinct.")
    grammar2 = artifact("Fixture grammar v2: material changed dependency for the selected use.")
    unrelated = artifact("Unrelated observation, explicitly assessed unaffected.")
    method = artifact("Fixture reviewer method: stipulates semantic outcomes; tests validate mechanical bindings, not semantic truth.")
    remit = artifact("Fixture remit: bounded orientation qualification and applicability for one scope.")
    basis = artifact("Fixture capability basis; no real Principal or production authority.")
    control = artifact("Fixture control evidence: altered identity/use/epoch must be rejected by the same binding surface.")
    raw_pass = artifact("PASS CURRENT AUTHORIZED -- raw text, no qualification or binding standing")
    snapshot("before.json")

    def open_scope(use):
        v = write("open_scope", {"focal_referent_id": focal, "boundary": "one fixture subject", "declared_use": use,
                                "stop": "no effects", "reentry": "changed use creates new scope"})
        return {"scope_id": v["scope_id"], "epoch": 0, "current_binding_id": None, "last_fence_id": None, "declared_use": use}
    s = open_scope("inspect_nonexecuting")
    other = open_scope("independent_nonexecuting")

    def cap(s, kind, *, expired=False):
        cid = uid()
        secret = HEADERS["x-ecb-orientation-"+kind+"-key"]
        ttl = "-1 second" if expired else "1 hour"
        run("insert into ecb_orientation.capabilities(id,capability_kind,scope_id,subject_id,issuer_id,method_id,remit_id,basis_id,allowed_actions,key_digest,expires_at) values("+
            ",".join(lit(v) for v in (cid,kind,s["scope_id"],actor,issuer,method["artifact_id"],remit["artifact_id"],basis["artifact_id"]))+
            ",ARRAY['select','reaffirm','withdraw'],extensions.digest(convert_to("+lit(secret)+",'UTF8'),'sha256'),clock_timestamp()+interval "+lit(ttl)+");", admin=True)
        return cid
    reviewer = cap(s,"reviewer"); binder = cap(s,"binder")
    reviewer_other = cap(other,"reviewer"); binder_other = cap(other,"binder")

    def resolution(s, *, qf=None, parent=None, grammar_ref=grammar):
        obj = {"scope_id": s["scope_id"], "focal_referent_id": focal, "boundary": "one fixture subject", "declared_use": s["declared_use"],
               "purpose": "test exact nonexecuting orientation", "governing_sources": [source], "grammar": grammar_ref,
               "obligations": [{"name":"basis integrity","version":"1","status":"unexamined"}],
               "evidence": [source], "access_limits":"synthetic fixture only", "dependencies":[grammar_ref],
               "authority":{"status":"unresolved","note":"representation grants nothing"},
               "question_forward":qf or [], "stop":"no real effects", "reentry":"changed semantics or use"}
        if parent: obj["parent_resolution_id"] = parent
        return obj
    def assessment(rid, s, cid, *, result="PASS", **extra):
        return {"resolution_id":rid,"capability_id":cid,"declared_use":s["declared_use"],"method_id":method["artifact_id"],
                "remit_id":remit["artifact_id"],"basis_id":basis["artifact_id"],"findings":[{"obligation":"exact binding","finding":"fixture assertion only"}],
                "negative_controls":[control],"result":result,"limits":"synthetic method, no semantic truth or effects",
                "change_receipt_id":s["last_fence_id"],"historical_requalification":s["last_fence_id"] is not None, **extra}
    def qualify(rid,s,cid,**extra): return write("qualification",assessment(rid,s,cid,**extra),s)["artifact_id"]
    def authorize(action,rid,qid,s,cid):
        return write("authority_decision",{"action":action,"resolution_id":rid,"qualification_id":qid,"capability_id":cid,
            "acting_id":actor,"issuer_id":issuer,"evidence_id":basis["artifact_id"]},s)["artifact_id"]
    def binding_request(action,rid,qid,aid,s,**extra):
        return request("bind",{"action":action,"resolution_id":rid,"qualification_id":qid,"authority_decision_id":aid},s,**extra)
    def bind(action,rid,qid,aid,s):
        v=send(binding_request(action,rid,qid,aid,s)); refresh(s); return v
    def observation(rid,s,*,history=True,before=grammar,after=grammar2):
        return write("observation",{"resolution_id":rid,"after_artifact_id":after["artifact_id"],
            "before_artifact_id":before["artifact_id"] if before else None,"history_available":history,
            "description":"fixture dependency observation"},s)["artifact_id"]
    def applicability(rid,oid,result,s,cid):
        obj=assessment(rid,s,cid,result=result,observation_id=oid,affected_use=s["declared_use"],rationale="fixture method judgment")
        return write("applicability",obj,s)["artifact_id"]

    req_a=request("resolution",resolution(s),s); ra=send(req_a)["artifact_id"]
    rb=write("resolution",resolution(s,parent=ra),s)["artifact_id"]
    replay=send(req_a)
    check("exact_replay",replay["replayed"] and replay["artifact_id"]==ra,replay,"Recover exact committed result without new currentness")
    changed=dict(req_a,submitted_text=req_a["submitted_text"]+" ")
    rejected("changed_request_identity",sql_for(changed),"orientation_operation_conflict")
    rejected("duplicate_json_keys",sql_for(request("resolution",'{"profile":"ecb.orientation/1","x":{"n":1,"n":2}}',s,raw=True)),"orientation_duplicate_json_key")
    bad=dict(resolution(s),profile="not-supported")
    rejected("wrong_profile",sql_for(request("resolution",encode(bad),s,raw=True)),"orientation_profile_unsupported")
    bad=resolution(s,grammar_ref=dict(grammar,sha256="0"*64))
    rejected("wrong_source_revision",sql_for(request("resolution",bad,s)),"orientation_exact_source_revision_mismatch")
    bad=resolution(s,grammar_ref=dict(grammar,artifact_id=uid()))
    rejected("missing_historical_source",sql_for(request("resolution",bad,s)),"orientation_exact_source_revision_mismatch")
    bad=dict(resolution(s),declared_use="permanent_external_action")
    rejected("changed_scope_use",sql_for(request("resolution",bad,s)),"orientation_scope_use_mismatch")
    bad=dict(resolution(s),focal_referent_id=actor)
    rejected("wrong_focal_identity",sql_for(request("resolution",bad,s)),"orientation_scope_use_mismatch")
    check("newest_not_current",resolve(s)["current_binding_id"] is None,{"newest":rb},"Require explicit qualification plus separate binding authority")

    rejected("ordinary_cannot_read_private", "select * from ecb_orientation.scopes;", "permission denied")
    rejected("ordinary_cannot_mutate_private", "update ecb_orientation.scopes set epoch=epoch+1;", "permission denied")
    rejected("ordinary_cannot_become_admin", "set role postgres;", "permission denied")
    rejected("missing_runtime_key","select public.orientation_v1_resolve("+lit(s["scope_id"])+","+lit(s["declared_use"])+");","ecb11_runtime_unauthorized",headers={})
    no_reviewer={k:v for k,v in HEADERS.items() if "reviewer" not in k}
    rejected("runtime_not_reviewer",sql_for(request("qualification",assessment(ra,s,reviewer),s)),"orientation_capability_denied:reviewer",headers=no_reviewer)
    rejected("wrong_scope_reviewer",sql_for(request("qualification",assessment(ra,s,reviewer_other),s)),"orientation_capability_denied:reviewer")
    rejected("wrong_use_qualification",sql_for(request("qualification",assessment(ra,s,reviewer,declared_use="other"),s)),"orientation_reviewer_remit_mismatch")
    rejected("false_pass_no_controls",sql_for(request("qualification",assessment(ra,s,reviewer,negative_controls=[]),s)),"orientation_manifest_empty")
    qa=qualify(ra,s,reviewer)
    check("qualification_not_current",resolve(s)["current_binding_id"] is None,{"qualification":qa},"Keep qualification independent of currentness")
    auth_payload={"action":"select","resolution_id":ra,"qualification_id":qa,"capability_id":binder,"acting_id":actor,"issuer_id":issuer,"evidence_id":basis["artifact_id"]}
    rejected("same_scope_wrong_resolution_qualification",sql_for(request("authority_decision",dict(auth_payload,resolution_id=rb),s)),"orientation_exact_qualification_mismatch")
    rejected("raw_pass_has_no_qualification_standing",sql_for(request("authority_decision",dict(auth_payload,qualification_id=raw_pass["artifact_id"]),s)),"orientation_exact_record_mismatch:qualification")
    rejected("reviewer_not_binder",sql_for(request("authority_decision",dict(auth_payload,capability_id=reviewer),s)),"orientation_capability_denied:binder")
    rejected("wrong_authority_actor",sql_for(request("authority_decision",dict(auth_payload,acting_id=focal),s)),"orientation_authority_remit_mismatch")
    no_binder={k:v for k,v in HEADERS.items() if "binder" not in k}
    rejected("runtime_not_binder",sql_for(request("authority_decision",auth_payload,s)),"orientation_capability_denied:binder",headers=no_binder)
    aa=authorize("select",ra,qa,s,binder)
    rejected("authority_not_interchangeable",sql_for(binding_request("select",rb,qa,aa,s)),"orientation_exact_authority_tuple_mismatch")
    rejected("missing_authority",sql_for(binding_request("select",ra,qa,uid(),s)),"orientation_exact_record_mismatch:authority_decision")
    first=bind("select",ra,qa,aa,s); first_id=first["operation_id"]
    v=resolve(s)
    check("explicit_current_binding",v["resolution_artifact_id"]==ra and v["reliance_permitted"] and not v["external_effect_authorized"],v,"Continue lifecycle; selection is not external-effect authority")
    check("changed_downstream_use",not resolve(s,"permanent_external_action")["reliance_permitted"],resolve(s,"permanent_external_action"),"Reenter use qualification, not silent reuse")

    decisive={"question":"Can the decisive boundary be resolved?","affected_use":s["declared_use"],"decisive":True,
              "status":"open","route":"none_available","restriction":"no dependent reliance","reentry":"evidence arrives"}
    rq=write("resolution",resolution(s,qf=[decisive]),s)["artifact_id"]
    qq=qualify(rq,s,reviewer); aq=authorize("select",rq,qq,s,binder)
    rejected("no_route_decisive_qf",sql_for(binding_request("select",rq,qq,aq,s)),"orientation_decisive_qf")
    check("qf_custody_not_erased",any(json.loads(x["envelope"])["artifact_id"]==rq for x in resolve(s)["history"]),{"resolution":rq},"Preserve question custody while blocking dependent reliance")
    ro=write("resolution",resolution(other,qf=[decisive]),other)["artifact_id"]
    qo=qualify(ro,other,reviewer_other); ao=authorize("select",ro,qo,other,binder_other)
    bind("select",ro,qo,ao,other)
    other_before=resolve(other)
    check("qf_restricts_only_dependent_use",other_before["reliance_permitted"],other_before,"Do not globally invalidate unrelated use")

    ou=observation(ra,s,after=unrelated); au=applicability(ra,ou,"unaffected",s,reviewer)
    rejected("unaffected_cannot_fence",sql_for(request("fence_change",{"applicability_id":au},s)),"orientation_unaffected_must_not_fence")
    check("unaffected_preserves_epoch",resolve(s)["epoch"]==1 and resolve(s)["reliance_permitted"],resolve(s),"No unnecessary requalification fence")
    rejected("applicability_exact_observation_lineage",sql_for(request("applicability",assessment(rb,s,reviewer,result="material",observation_id=ou,affected_use=s["declared_use"],rationale="wrong lineage"),s)),"orientation_observation_lineage_mismatch")
    om=observation(ra,s); am=applicability(ra,om,"material",s,reviewer)
    fence=write("fence_change",{"applicability_id":am},s); refresh(s)
    v=resolve(s)
    check("material_change_fences_not_erases",v["epoch"]==2 and v["current_binding_id"]==first_id and v["qualification_applicability"]=="requalification_required" and not v["reliance_permitted"],v,"Requalify exact Resolution against surfaced change")
    rejected("stale_epoch",sql_for(request("resolution",resolution(s),s,epoch=1)),"orientation_epoch_conflict")
    rejected("old_qualification_after_change",sql_for(request("authority_decision",auth_payload,s)),"orientation_exact_qualification_mismatch")
    rejected("requalification_requires_change_basis",sql_for(request("qualification",assessment(ra,s,reviewer,change_receipt_id=None),s)),"orientation_change_basis_mismatch")
    qa=qualify(ra,s,reviewer); aa=authorize("reaffirm",ra,qa,s,binder)
    reaffirm=bind("reaffirm",ra,qa,aa,s)
    a_before_b=reaffirm["operation_id"]
    check("reaffirm_new_binding_event",a_before_b!=first_id and resolve(s)["reliance_permitted"],resolve(s),"Retain historical binding and issue new applicable event")
    qb=qualify(rb,s,reviewer); ab=authorize("select",rb,qb,s,binder); bind("select",rb,qb,ab,s)
    qa=qualify(ra,s,reviewer); aa=authorize("select",ra,qa,s,binder); bind("select",ra,qa,aa,s)
    check("aba_distinct_identity",s["epoch"]==5 and s["current_binding_id"]!=a_before_b and resolve(s)["resolution_artifact_id"]==ra,resolve(s),"Same Resolution cannot make an old binding predecessor current")
    rejected("aba_stale_predecessor",sql_for(binding_request("select",ra,qa,aa,s,predecessor=a_before_b)),"orientation_predecessor_conflict")

    qa=qualify(ra,s,reviewer); aa=authorize("reaffirm",ra,qa,s,binder)
    requests=[binding_request("reaffirm",ra,qa,aa,s) for _ in range(2)]
    barrier=threading.Barrier(2)
    def competitor(req):
        barrier.wait(timeout=5)
        p=execute(sql_for(req)); log_file("concurrency.jsonl",{"request":req,"exit":p.returncode,"stdout":p.stdout,"stderr":p.stderr}); return p
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(competitor,requests))
    check("concurrent_one_winner",sum(p.returncode==0 for p in results)==1 and any("orientation_epoch_conflict" in p.stderr for p in results),
          [{"exit":p.returncode,"stdout":p.stdout,"stderr":p.stderr} for p in results],"One serializable scope transition, never two heads")
    refresh(s)
    check("concurrent_single_epoch",s["epoch"]==6,resolve(s),"Preserve currentness under competing writers")

    lost=request("observation",{"resolution_id":ra,"after_artifact_id":grammar2["artifact_id"],"before_artifact_id":grammar["artifact_id"],"history_available":True,"description":"response discarded after commit"},s)
    p=execute(sql_for(lost))
    if p.returncode: raise RuntimeError(p.stderr)
    # Deliberately discard the returned body; exact reissue is the recovery path.
    del p
    recovered=send(lost)
    check("lost_response_exact_recovery",recovered["replayed"],recovered,"Recover committed custody, not duplicate operation")

    qa=qualify(ra,s,reviewer); aa=authorize("reaffirm",ra,qa,s,binder)
    rollback_req=binding_request("reaffirm",ra,qa,aa,s)
    before=resolve(s)
    rejected("post_write_precommit_fault","begin;"+sql_for(rollback_req)+"select 1/0;commit;","division by zero","Rollback operation, Artifact, history and scope head atomically")
    after=resolve(s)
    count=int(run("select count(*) from public.ordinary_operations where id="+lit(rollback_req["operation_id"])+";",admin=True))
    check("atomic_rollback_no_head_or_operation",count==0 and before==after,{"operation_count":count,"state_equal":before==after,"epoch":after["epoch"]},"Retry only after confirming uncommitted state")
    retry=send(rollback_req); refresh(s)
    check("rollback_retry_is_new_commit",not retry["replayed"] and s["epoch"]==7,retry,"Uncommitted failure must not consume operation identity")

    revoke=artifact("Fixture reviewer revocation; historical records retained")
    run("update ecb_orientation.capabilities set revoked_by="+lit(revoke["artifact_id"])+" where id="+lit(reviewer)+";",admin=True)
    v=resolve(s)
    check("reviewer_revocation_fresh_reliance",not v["reliance_permitted"] and v["qualification_applicability"]=="reviewer_unavailable",v,"Suspend fresh reliance without erasing current/history")
    rejected("revoked_reviewer_fresh_assessment",sql_for(request("qualification",assessment(ra,s,reviewer),s)),"orientation_capability_denied:reviewer")
    replay=send(rollback_req)
    check("historical_replay_not_fresh_authorization",replay["replayed"] and not resolve(s)["reliance_permitted"],replay,"Replay recovers history but cannot restore revoked applicability")
    expired=cap(s,"reviewer",expired=True)
    rejected("expired_reviewer",sql_for(request("qualification",assessment(ra,s,expired),s)),"orientation_capability_denied:reviewer")
    reviewer2=cap(s,"reviewer")
    qa=qualify(ra,s,reviewer2); aa=authorize("reaffirm",ra,qa,s,binder); bind("reaffirm",ra,qa,aa,s)
    revoke=artifact("Fixture binding-authority revocation; no effect authority existed")
    run("update ecb_orientation.capabilities set revoked_by="+lit(revoke["artifact_id"])+" where id="+lit(binder)+";",admin=True)
    v=resolve(s)
    check("authority_revocation_separate_from_qualification",v["qualification_applicability"]=="applicable" and v["authority"]["status"]=="revoked" and not v["reliance_permitted"],v,"Preserve dimensions; require separately commissioned authority")
    rejected("revoked_binder_cannot_issue",sql_for(request("authority_decision",dict(auth_payload,qualification_id=qa),s)),"orientation_capability_denied:binder")
    binder2=cap(s,"binder")
    aw=authorize("withdraw",None,None,s,binder2); bind("withdraw",None,None,aw,s)
    v=resolve(s)
    check("withdraw_explicit_no_current",v["current_binding_id"] is None and not v["reliance_permitted"] and len(v["history"])>10,v,"No-current is explicit, not latest-wins fallback")
    qa=qualify(ra,s,reviewer2); aa=authorize("select",ra,qa,s,binder2); bind("select",ra,qa,aa,s)

    bad={"resolution_id":ra,"after_artifact_id":grammar2["artifact_id"],"history_available":True,"before_artifact_id":uid(),"description":"nonexistent old meaning"}
    rejected("claimed_history_must_exist",sql_for(request("observation",bad,s)),"orientation_before_payload_unavailable")
    oh=observation(ra,s,history=False,before=None); ah=applicability(ra,oh,"unknown",s,reviewer2)
    write("fence_change",{"applicability_id":ah},s); refresh(s)
    rejected("digest_only_requalification_forbidden",sql_for(request("qualification",assessment(ra,s,reviewer2),s)),"orientation_historical_payload_unavailable")
    qi=qualify(ra,s,reviewer2,result="INCOMPLETE")
    check("unknown_history_preserves_incomplete_custody",not resolve(s)["reliance_permitted"],{"incomplete_qualification":qi,"state":resolve(s)},"Preserve unknown instead of reconstructing old meaning from a digest")
    rc=write("resolution",resolution(s,parent=ra,grammar_ref=grammar2),s)["artifact_id"]
    qc=qualify(rc,s,reviewer2,historical_requalification=False)
    ac=authorize("select",rc,qc,s,binder2); bind("select",rc,qc,ac,s)
    check("replacement_not_false_historical_proof",resolve(s)["resolution_artifact_id"]==rc and resolve(s)["reliance_permitted"],resolve(s),"New exact basis may qualify without claiming lost historical equivalence")
    check("unrelated_scope_not_invalidated",resolve(other)==other_before,resolve(other),"Keep unrelated scope applicable across all changes and revocations")
    aw=authorize("withdraw",None,None,s,binder2); bind("withdraw",None,None,aw,s)
    final=resolve(s)
    check("cold_full_history_no_current",final["current_binding_id"] is None and len(final["history"])>30 and any(x["artifact_id"]==ra for x in final["history"]),final,"Cold recovery retains old semantic payloads and exact binding events")
    check("no_effect_function",int(run("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('ecb_orientation','public') and p.proname like 'orientation%execute%';",admin=True))==0,{"external_effect_authorized":final["external_effect_authorized"]},"No external executor or authority is installed")
    snapshot("after.json")
    (OUT/"cold-state.json").write_text(encode(final),encoding="utf-8")
    (OUT/"summary.json").write_text(encode({"checks":COUNT,"result":"PASS","scope_id":s["scope_id"],"use":s["declared_use"],"boundary":"isolated ordinary DB/RPC","production":False}),encoding="utf-8")
    print("ECO152_QUALIFICATION=PASS",flush=True)
    print("ECO152_PRESSURE=PASS",flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        log_file("failure.jsonl",{"error":str(exc),"completed_checks":COUNT})
        print("ECO152_QUALIFICATION=FAIL: "+str(exc),flush=True)
        try: snapshot("failure-state.json")
        except Exception: pass
        raise
