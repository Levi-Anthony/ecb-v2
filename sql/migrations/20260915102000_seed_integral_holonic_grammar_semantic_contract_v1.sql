-- Principal-confirmed semantic freeze: Integral holonic grammar core definitions v1.
-- Exact payload bytes below were explicitly accepted with “No notes.”
-- Artifact storage preserves the approved representation; it does not independently confer
-- epistemic truth or authority beyond the recorded provenance of that principal disposition.

begin;

do $install$
declare
  v_artifact_id uuid := pg_catalog.gen_random_uuid();
  v_version_id uuid := pg_catalog.gen_random_uuid();
  v_payload text := $semantic$A definition needs more than a sentence. At minimum it should carry:

* Term
* Positive definition — what it is
* Structural function — what distinction it preserves
* Discriminator/test — how to tell it from neighboring concepts
* Must-not-collapse-with
* Canonical questions
* Worked example
* Boundary/counterexample
* Dependencies — which other definitions it presupposes
* Standing/version/provenance
* Supersession history

Then prompts and tools should reference the installed definition version rather than paraphrasing it.

That means the work we just did should produce something like this, physically and durably:

MAP / TERRITORY

Definition: A map/projection is a representation of a referent produced under particular mapping conditions. It is not the referent itself.

Structural function: Prevent representation, interpretation, evidence, or model state from acquiring the identity or standing of what it represents.

Discriminator: Could the representation change while the referent remains unchanged? Could two validly produced representations differ while referring to the same territory? If yes, they are maps, not territory.

Must not collapse with: Referent, mapper, access, reference frame, quadrant.

That one definition propagates everywhere.

REFERENCE FRAME

Definition: The indexing relation relative to which a referent is represented.

Not the mapper. Not the access mechanism. Not the representation.

Structural function: Makes explicit relative to what a claim or representation obtains.

Discriminator: If mapper and evidence source remain fixed but the index relative to which the referent is considered changes, the reference frame changed.

MAPPER

Definition: The actor or process producing the map/projection.

Discriminator: Change who or what constructs the representation while holding referent and reference frame constant.

ACCESS

Definition: The evidentiary or observational path available to the mapper.

Discriminator: Same mapper, same referent, same reference frame, different sensory/tool/testimony/inference path.

QUADRANT

Definition: One of the four structurally available indexing relations through which the same focal referent can be interrogated.

Core invariant:

Changing quadrant does not change the referent.

This is already much better than “four cells.”

UL

Definition: The focal referent under a self-indexed reference frame.

“Internal” is not the defining property.

Epistemic consequence: Every UL representation available to ECOS remains a map produced by a mapper through some access path. The mapper does not acquire the focal referent’s self-indexed access merely by modeling it.

Worked example: Levi’s reports of his own experience can provide unusually strong evidence for a Levi-self-indexed map. ECOS still possesses Levi’s testimony, not Levi’s phenomenology.

Boundary example: A thermostat’s self-indexed register may concern what it itself senses/registers. Conscious experience is not required by the structural definition.

That is the sharpening we would otherwise lose again.

HOLOARCHIC LEVEL

Definition: Relative structural level determined through asymmetric existence dependency.

Canonical test:

What must continue to exist, and in what organization, for this referent to continue existing as this referent?

Then:

If this referent disappears, what can continue existing as itself?$semantic$;
  v_expected_digest text := '054b554c463c9aa643e3e8ef7f4de1495aab929bc254b85c2d7fc2c55103c3e2';
  v_observed_digest text;
  v_observed_bytes integer;
begin
  if exists (
    select 1
    from public.artifact_objects
    where artifact_key = 'semantic-contract.integral-holonic-grammar-core'
  ) then
    raise exception 'semantic_contract_integral_holonic_grammar_core_already_installed';
  end if;

  insert into public.artifact_objects (
    id, artifact_key, artifact_type, created_by
  ) values (
    v_artifact_id,
    'semantic-contract.integral-holonic-grammar-core',
    'semantic_definition_contract',
    'principal_authorized_semantic_install'
  );

  insert into public.artifact_versions (
    id,
    artifact_id,
    version_number,
    media_type,
    payload_text,
    provenance,
    supersedes_version_id,
    created_by
  ) values (
    v_version_id,
    v_artifact_id,
    1,
    'text/markdown; charset=utf-8',
    v_payload,
    pg_catalog.jsonb_build_object(
      'standing', 'LOCKED',
      'basis', 'principal_explicit_no_notes_confirmation',
      'source_mode', 'verbatim_principal_confirmed_semantic_freeze',
      'freeze_end', 'HOLOARCHIC LEVEL canonical test second question',
      'install_path', 'recorded_database_migration'
    ),
    null,
    'principal_authorized_semantic_install'
  );

  select
    pg_catalog.encode(version.payload_digest, 'hex'),
    pg_catalog.octet_length(pg_catalog.convert_to(version.payload_text, 'UTF8'))
  into strict v_observed_digest, v_observed_bytes
  from public.artifact_versions as version
  where version.id = v_version_id;

  if v_observed_digest <> v_expected_digest then
    raise exception 'semantic contract digest mismatch: %', v_observed_digest;
  end if;

  if v_observed_bytes <> 3403 then
    raise exception 'semantic contract byte-count mismatch: %', v_observed_bytes;
  end if;
end;
$install$;

commit;
