export const REQUIRED_DEFINITION_FIELDS = [
  'term',
  'positive_definition',
  'structural_function',
  'discriminator',
  'must_not_collapse_with',
  'canonical_questions',
  'worked_examples',
  'boundary_examples',
  'dependencies',
  'standing',
  'provenance',
  'supersession_history',
];

export function validateGrammarContract(grammar) {
  const failures = [];
  for (const [key, definition] of Object.entries(grammar.definitions ?? {})) {
    for (const field of REQUIRED_DEFINITION_FIELDS) {
      if (!Object.hasOwn(definition, field)) failures.push(`${key}:missing:${field}`);
    }
    const open = String(definition.standing ?? '').includes('DEFINITION_OPEN');
    if (!open && !String(definition.positive_definition ?? '').trim()) {
      failures.push(`${key}:empty:positive_definition`);
    }
    if (!open && !String(definition.discriminator ?? '').trim()) {
      failures.push(`${key}:empty:discriminator`);
    }
    if (open && String(definition.positive_definition ?? '').trim()) {
      failures.push(`${key}:open_definition_must_not_fake_closure`);
    }
  }
  return { pass: failures.length === 0, failures };
}

export function assessExistenceAsymmetry({
  focal,
  required_constituents,
  required_organization,
  survivors_if_focal_disappears,
}) {
  const missing = [];
  if (!focal) missing.push('focal');
  if (!Array.isArray(required_constituents) || required_constituents.length === 0) missing.push('required_constituents');
  if (!required_organization) missing.push('required_organization');
  if (!Array.isArray(survivors_if_focal_disappears)) missing.push('survivors_if_focal_disappears');
  if (missing.length) return { status: 'INCOMPLETE', missing };

  const survivingConstituents = required_constituents.filter((item) => survivors_if_focal_disappears.includes(item));
  return {
    status: survivingConstituents.length > 0 ? 'ASYMMETRY_OBSERVED' : 'ASYMMETRY_NOT_ESTABLISHED',
    focal,
    required_constituents,
    required_organization,
    surviving_constituents: survivingConstituents,
  };
}

export function evaluateCardDeparture({ master_key, departure_mode }) {
  if (!['hold_as_long_as_possible', 'play_selected_cards_effectively'].includes(master_key)) {
    return { status: 'INCOMPLETE', reason: 'unknown_master_key' };
  }
  if (!['played', 'dropped'].includes(departure_mode)) {
    return { status: 'INCOMPLETE', reason: 'unknown_departure_mode' };
  }

  if (master_key === 'hold_as_long_as_possible') {
    return { status: 'FAILURE_RELATIVE_TO_MASTER_KEY', reason: 'physical_retention_ended' };
  }
  if (departure_mode === 'played') {
    return { status: 'SUCCESS_POSSIBLE_RELATIVE_TO_MASTER_KEY', reason: 'intended_play_can_advance_game_work' };
  }
  return { status: 'FAILURE_RELATIVE_TO_MASTER_KEY', reason: 'unintended_loss_does_not_serve_play' };
}

export function classifyDirectionalSignals({
  same_focal_identity_continues = false,
  persistence_improves = false,
  responsive_reconfiguration = false,
  higher_order_organization_emerges = false,
  focal_organization_ceases = false,
}) {
  return {
    preservation: same_focal_identity_continues && persistence_improves ? 'HIGH' : 'LOW_OR_UNESTABLISHED',
    adaptation: same_focal_identity_continues && responsive_reconfiguration ? 'HIGH' : 'LOW_OR_UNESTABLISHED',
    transcendence: higher_order_organization_emerges ? 'HIGH' : 'LOW_OR_UNESTABLISHED',
    dissolution: focal_organization_ceases ? 'HIGH' : 'LOW_OR_UNESTABLISHED',
  };
}

export function validateQuadrantReferentCorrespondence({ focal_referent_id, quadrant_entries }) {
  const entries = Object.entries(quadrant_entries ?? {});
  const failures = entries
    .filter(([, entry]) => entry?.referent_id !== focal_referent_id)
    .map(([quadrant, entry]) => ({ quadrant, referent_id: entry?.referent_id ?? null }));
  return { pass: entries.length === 4 && failures.length === 0, failures, entry_count: entries.length };
}

export function evaluateUL({ focal_referent_id, frame_anchor_referent_id, mapper_referent_id, access_basis }) {
  const selfIndexed = focal_referent_id === frame_anchor_referent_id;
  const impossibleAccessClaim = access_basis === 'mapper_direct_access_to_other_referent_ul' && mapper_referent_id !== focal_referent_id;
  return {
    self_indexed: selfIndexed,
    access_claim_valid: !impossibleAccessClaim,
    pass: selfIndexed && !impossibleAccessClaim,
  };
}

export function validateQuestionForward(qf) {
  const failures = [];
  if (!['LOW', 'NO_SIGNAL', 'LOW_OR_UNESTABLISHED', 'UNRESOLVED'].includes(qf?.current_signal)) {
    failures.push('current_signal_not_low_or_unresolved');
  }
  if (!String(qf?.question ?? '').trim()) failures.push('missing_question');
  if (!Array.isArray(qf?.answer_detection_criteria) || qf.answer_detection_criteria.length === 0) {
    failures.push('missing_answer_detection_criteria');
  }
  if (!qf?.activation_scenario || !String(qf.activation_scenario.description ?? '').trim()) {
    failures.push('missing_activation_scenario');
  }
  if (qf?.activation_scenario?.evidence_status !== 'HYPOTHETICAL_CALIBRATION' &&
      qf?.activation_scenario?.evidence_status !== 'OBSERVED_EVIDENCE') {
    failures.push('activation_scenario_evidence_status_missing');
  }
  if (!String(qf?.reentry_trigger ?? '').trim()) failures.push('missing_reentry_trigger');
  if (!String(qf?.decision_consequence ?? '').trim()) failures.push('missing_decision_consequence');
  return { pass: failures.length === 0, failures };
}

export function demonstrateLineIndependence({ before, after, line_a, line_b }) {
  if (![before, after].every((item) => item && typeof item === 'object')) {
    return { status: 'INCOMPLETE' };
  }
  const aChanged = before[line_a] !== after[line_a];
  const bChanged = before[line_b] !== after[line_b];
  if (aChanged === bChanged) {
    return { status: 'INDEPENDENCE_NOT_DEMONSTRATED', a_changed: aChanged, b_changed: bChanged };
  }
  return { status: 'INDEPENDENCE_WITNESS', changed_line: aChanged ? line_a : line_b, stable_line: aChanged ? line_b : line_a };
}
