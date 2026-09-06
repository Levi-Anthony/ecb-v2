// Worked Trace 07 frozen fixtures.
//
// These are the acceptance authority's exact values. They judge recovered content; they never
// supply it. Nothing here may be regenerated from the implementation under test.

export const TR1 = "a6925494-a862-441b-a361-5f5ec41dc9dc";
export const CLAIM_C = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
export const LINK_L = "4c6c0f50-a936-4da6-bb09-233f93320639";
export const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
export const CLAIM_C2 = "c7f7d330-e778-4ae5-be96-3a172bea1166";
export const RELATION_R = "cb429206-5abd-4adb-8ff9-d6d6a885034c";

export const A1_ID = "8777e33d-7555-40aa-92f9-d5107395c0c7";
export const OP1_ID = "ba27d938-c586-4c09-ac31-9c67a2d0b5e0";
export const A2_ID = "95b5db1d-cb79-439b-ae93-0bdaef5cfda2";
export const CHECK1_ID = "661fc2b6-63f8-4cfc-8d29-697213ac2286";
export const RC1_ID = "6d0b744b-9707-46cb-b771-9085501e93ee";
export const OP2_ID = "f64d508d-df25-47c8-8d6d-e26a6dc9a906";
export const A_BAD_ID = "9c322dda-54b8-4838-bdf1-2df471f0f992";
export const CHECK2_ID = "407027f9-05cf-4bc3-85dc-012d2e0aa3fe";
export const RC2_ID = "1217d889-e874-4875-9c8a-d78c86156583";

// Exact frozen bytes, single line, no trailing newline.
export const A1_TEXT =
  `{"format":"transition_v1","event":"a6925494-a862-441b-a361-5f5ec41dc9dc","claim":"0f89e778-b16e-4840-9129-a2aa3eb6f697","from":"unassessed","to":"basis_qualified","recorded_at":"2026-09-05T02:24:35.793609Z","basis":{"link":"4c6c0f50-a936-4da6-bb09-233f93320639","evidence":"19a949ea-a8fc-4250-a386-fa64e5530180","scheme":"ecb_thought_revision_v1_sha256","linked_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55","observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"},"scope":"recorded_transition_only"}`;

export const A2_TEXT =
  `{"format":"basis_v1","basis":{"evidence":"19a949ea-a8fc-4250-a386-fa64e5530180","link":"4c6c0f50-a936-4da6-bb09-233f93320639","scheme":"ecb_thought_revision_v1_sha256","linked_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55","observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"},"transition":{"id":"a6925494-a862-441b-a361-5f5ec41dc9dc","claim":"0f89e778-b16e-4840-9129-a2aa3eb6f697","from":"unassessed","to":"basis_qualified","recorded_at":"2026-09-05T02:24:35.793609Z"},"scope":"recorded_transition_only"}`;

// A_BAD is exactly A2 with the entire observed_digest member removed from basis, including its
// preceding comma. Constructed by literal excision, not by re-serializing a parsed object.
const OBSERVED_MEMBER =
  `,"observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"`;
export const A_BAD_TEXT = (() => {
  const cut = A2_TEXT.indexOf(OBSERVED_MEMBER);
  if (cut < 0) {
    throw new Error(
      "A_BAD construction: observed_digest member not found in A2",
    );
  }
  return A2_TEXT.slice(0, cut) + A2_TEXT.slice(cut + OBSERVED_MEMBER.length);
})();

// P23's sole mutation: a syntactically valid digest that differs from the frozen source.
export const ZERO_DIGEST = "0".repeat(64);
export const A2_P23_TEXT = A2_TEXT.replace(
  `"observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"},"transition"`,
  `"observed_digest":"${ZERO_DIGEST}"},"transition"`,
);

export const CHECKER_ID = "prepare_build_5b_artifact/v1";
export const CONTRACT_ID = "ecb_transition_relayout_v1";
export const OBLIGATIONS = [
  "input_format",
  "output_format",
  "participation",
  "grounding",
  "preservation",
  "checker_binding",
] as const;

// The source witness the checker must independently observe, stated here as fixed expectation.
export const EXPECTED_WITNESS = {
  event_id: TR1,
  claim_id: CLAIM_C,
  from_standing: "unassessed",
  to_standing: "basis_qualified",
  recorded_at: "2026-09-05T02:24:35.793609Z",
  link_id: LINK_L,
  evidence_referent_id: GT01,
  evidence_revision_scheme: "ecb_thought_revision_v1_sha256",
  evidence_revision_digest:
    "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
  observed_revision_digest:
    "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
  link_claim_id: CLAIM_C,
};
