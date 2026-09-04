export type QualificationStatus = "complete" | "unfinished";

export interface Candidate {
  candidate_id: string;
  source_shape: string;
  prior_art_seen: boolean;
  approach: string[];
  assumptions: string[];
  standing: Record<"candidate_only" | "accepted" | "installed" | "governing" | "current", boolean>;
}

export interface Comparison {
  comparison_id: string;
  candidate_id: string;
  canonical_prior_art: {
    repository: string;
    commit: string;
    local_receipt: string;
    encountered: boolean;
  };
  independently_derived: string[];
  already_present_in_prior_art: string[];
  conflicts_or_differences: Array<{
    topic: string;
    candidate: string;
    prior_art: string;
    decision_consequence: string;
    disposition: "ADAPT" | "REJECT" | "PRESERVE_OPEN";
  }>;
  open_conflicts: string[];
  qualification: {
    comparison_provenance_complete: boolean;
    requirement_satisfied: boolean;
    accepted: boolean;
    installed: boolean;
    authority_conferred: boolean;
    governing: boolean;
    current: boolean;
  };
}

export interface Fixture {
  fixture_id: string;
  harvest_disposition: "REBUILD";
  master_key: string;
  recorded_at: string;
  required_prior_art: {
    source_id: string;
    repository: string;
    commit: string;
    local_receipt: string;
    decision_standard: string;
  };
  identity_boundary: {
    antecedent: string;
    consequence: string;
    consequence_required: boolean;
    universal_referents_implemented: boolean;
    does_not_imply: string[];
  };
}

export interface QualificationTrace {
  fixture_id: string;
  case:
    | "missing_qualification_encounter"
    | "completed_qualification_encounter"
    | "drifted_qualification_basis";
  freedom: {
    independent_derivation_preserved: boolean;
    candidate_id: string;
  };
  control: {
    prior_art_qualification: QualificationStatus;
    this_requirement_satisfied: boolean;
    overall_installation_qualified: false;
    installation_seam_crossed: false;
    reason: string;
  };
  awareness: {
    detected_condition: "required_encounter_omitted" | "qualification_basis_drift" | null;
    feedback_phase: "metabolize" | null;
    route: "control_before_next_authority_bearing_installation" | null;
  };
  identity: {
    durable_uuid_implies_stable_referential_addressability: true;
    universal_referents_implemented: false;
  };
  standing: {
    accepted: false;
    promoted: false;
    installed: false;
    authority_conferred: false;
    governing: false;
    current: false;
  };
  comparison: {
    artifact: string;
    canonical_commit: string;
    independently_derived_count: number;
    already_present_count: number;
    conflict_or_difference_count: number;
  } | null;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function comparisonMeetsStandard(
  fixture: Fixture,
  candidate: Candidate,
  comparison: Comparison,
): boolean {
  const provenanceMatches = comparison.canonical_prior_art.encountered === true &&
    comparison.canonical_prior_art.repository === fixture.required_prior_art.repository &&
    comparison.canonical_prior_art.commit === fixture.required_prior_art.commit &&
    comparison.canonical_prior_art.local_receipt === fixture.required_prior_art.local_receipt;

  const categoriesPresent = comparison.candidate_id === candidate.candidate_id &&
    comparison.independently_derived.length > 0 &&
    comparison.already_present_in_prior_art.length > 0 &&
    comparison.conflicts_or_differences.length > 0;

  const consequencesExplicit = comparison.conflicts_or_differences.every((finding) =>
    hasText(finding.topic) && hasText(finding.candidate) && hasText(finding.prior_art) &&
    hasText(finding.decision_consequence) &&
    ["ADAPT", "REJECT", "PRESERVE_OPEN"].includes(finding.disposition)
  );

  const noStandingLeak = comparison.qualification.requirement_satisfied === true &&
    comparison.qualification.comparison_provenance_complete === true &&
    comparison.qualification.accepted === false &&
    comparison.qualification.installed === false &&
    comparison.qualification.authority_conferred === false &&
    comparison.qualification.governing === false &&
    comparison.qualification.current === false;

  return provenanceMatches && categoriesPresent && consequencesExplicit && noStandingLeak;
}

export function evaluateQualification(
  fixture: Fixture,
  candidate: Candidate,
  comparison: Comparison | null,
): QualificationTrace {
  if (
    candidate.prior_art_seen !== false || candidate.source_shape !== "8568a00:BUILD_CHECKOUT.md"
  ) {
    throw new Error("independent_derivation_boundary_violated");
  }

  if (
    candidate.approach.length === 0 || candidate.standing.candidate_only !== true ||
    candidate.standing.accepted || candidate.standing.installed || candidate.standing.governing ||
    candidate.standing.current
  ) {
    throw new Error("candidate_standing_boundary_violated");
  }

  if (
    fixture.identity_boundary.consequence_required !== true ||
    fixture.identity_boundary.consequence !== "stable referential addressability" ||
    fixture.identity_boundary.universal_referents_implemented !== false
  ) {
    throw new Error("identity_boundary_violated");
  }

  const complete = comparison !== null && comparisonMeetsStandard(fixture, candidate, comparison);
  const drifted = comparison !== null && !complete;

  return {
    fixture_id: fixture.fixture_id,
    case: comparison === null
      ? "missing_qualification_encounter"
      : complete
      ? "completed_qualification_encounter"
      : "drifted_qualification_basis",
    freedom: {
      independent_derivation_preserved: true,
      candidate_id: candidate.candidate_id,
    },
    control: {
      prior_art_qualification: complete ? "complete" : "unfinished",
      this_requirement_satisfied: complete,
      overall_installation_qualified: false,
      installation_seam_crossed: false,
      reason: complete
        ? "pinned_comparison_recorded_without_installation_consequence"
        : comparison === null
        ? "required_prior_art_encounter_missing"
        : "required_prior_art_basis_drifted_or_incomplete",
    },
    awareness: {
      detected_condition: complete
        ? null
        : comparison === null
        ? "required_encounter_omitted"
        : "qualification_basis_drift",
      feedback_phase: complete ? null : "metabolize",
      route: complete ? null : "control_before_next_authority_bearing_installation",
    },
    identity: {
      durable_uuid_implies_stable_referential_addressability: true,
      universal_referents_implemented: false,
    },
    standing: {
      accepted: false,
      promoted: false,
      installed: false,
      authority_conferred: false,
      governing: false,
      current: false,
    },
    comparison: complete
      ? {
        artifact: "completed-comparison.json",
        canonical_commit: comparison.canonical_prior_art.commit,
        independently_derived_count: comparison.independently_derived.length,
        already_present_count: comparison.already_present_in_prior_art.length,
        conflict_or_difference_count: comparison.conflicts_or_differences.length,
      }
      : null,
  };
}

export function assertTracePass(trace: QualificationTrace): void {
  if (!trace.freedom.independent_derivation_preserved) throw new Error("freedom_not_preserved");
  if (trace.control.installation_seam_crossed) throw new Error("installation_seam_crossed");
  if (trace.control.overall_installation_qualified) {
    throw new Error("installation_qualified_by_fixture");
  }
  if (Object.values(trace.standing).some(Boolean)) throw new Error("standing_leak");
  if (!trace.identity.durable_uuid_implies_stable_referential_addressability) {
    throw new Error("referential_addressability_lost");
  }
  if (trace.identity.universal_referents_implemented) throw new Error("build_2_opened");

  if (trace.case === "completed_qualification_encounter") {
    if (
      trace.control.prior_art_qualification !== "complete" ||
      !trace.control.this_requirement_satisfied
    ) {
      throw new Error("completed_encounter_not_qualified");
    }
    if (trace.comparison === null) throw new Error("completed_encounter_missing_comparison");
    return;
  }

  if (
    trace.control.prior_art_qualification !== "unfinished" ||
    trace.control.this_requirement_satisfied
  ) {
    throw new Error("unsatisfied_encounter_advanced");
  }
  if (
    trace.awareness.feedback_phase !== "metabolize" ||
    trace.awareness.route !== "control_before_next_authority_bearing_installation"
  ) {
    throw new Error("awareness_feedback_missing");
  }
}
