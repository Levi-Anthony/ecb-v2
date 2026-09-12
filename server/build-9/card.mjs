// Rebuildable projection only; no case identities or expected answers. Exact
// evidence remains at the returned judgment and contract links. No card is stored.
export function compact(card) {
  if (card.integrity) return card;
  const d = card.last_disposition, j = card.judgment;
  return {
    locator: card.locator,
    source_contract: card.source_contract,
    boundary: card.boundary,
    parent: card.parent,
    dependency: card.dependency,
    child: card.child,
    judgment: j
      ? {
        source: j.source,
        outcome: j.outcome,
        summary: j.summary,
        findings: j.findings.map((f) => ({
          obligation: f.obligation,
          expected: f.expected,
          observed: f.observed.outcome,
        })),
        evidence_access:
          "Exact witnesses, paths, method, source standing and limits: read judgment source.",
        limits: j.limits,
      }
      : null,
    observations: card.observations,
    changes: card.changes,
    last_disposition: d
      ? {
        source: d.id,
        disposition: d.disposition,
        reason: d.reason,
        result: d.result,
        attribution: d.attribution,
      }
      : null,
    present: {
      ...card.present,
      g1_acceptance: card.present.g1_acceptance
        ? { outcome: card.present.g1_acceptance.outcome }
        : undefined,
      findings: card.present.findings
        ? "See exact judgment findings and source."
        : undefined,
    },
    history: {
      head: card.boundary,
      retained_transitions: card.history.length,
      access: "Read head source and follow exact predecessor links.",
    },
    non_promotion: card.non_promotion,
  };
}
