// Read-only Edge projection of server/current-commission.ts at released a320b47.
// Existing admitted navigation anchor; no installer or authority transition runs here.
export const CURRENT_COMMISSION_ANCHOR = "58ec9e33-1b29-4312-90b5-38df68f2064d";
import { z } from "zod";

export const COMMISSION_CONTRACT = "ecos:current-commission:1.0.0";
export const commissionInstructions =
  "Before consequential ECOS product or engineering work, call get_current_commission (no arguments) to recover the current governing decisions and next action. Apply its source, standing and authority limits. If unavailable, report the exact recovery gap and continue only supported work. Custody and deployment are not proof of consumer reception; this guidance does not grant action permission.";

export const commissionProjectionSchema = z.strictObject({
  contract: z.literal(COMMISSION_CONTRACT),
  source: z.strictObject({
    artifact_id: z.string().uuid(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    edition: z.string().min(1),
  }),
  authority_refs: z.array(z.string().uuid()).min(1),
  standing: z.literal("PRINCIPAL_DIRECTED_DISTRIBUTION"),
  summary: z.string().min(1).max(8000),
  next_action: z.string().min(1).max(2000),
  limitations: z.string().min(1).max(2000),
});
export type CommissionProjection = z.infer<typeof commissionProjectionSchema>;
export type CommissionAnchor = {
  id: string;
  disposition: { revision_id: string; state: string };
  projection: { artifact_id: string; kind: "ACTION" | "HOLD"; content: string };
};
export type CommissionPorts = {
  fetchThought(id: string): Promise<CommissionAnchor | null>;
  fetchArtifact(id: string): Promise<{ id: string; content: string } | null>;
};
export async function commissionDigest(content: string): Promise<string> {
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content)),
  );
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export class CommissionUnavailable extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

/** No discovery, representation repair, persistent writes or process-global current-head cache. */
export async function getCurrentCommission(
  anchorId: string | undefined,
  ports: CommissionPorts,
) {
  if (!anchorId || !z.string().uuid().safeParse(anchorId).success) {
    throw new CommissionUnavailable("commission_anchor_unconfigured");
  }
  let anchor: CommissionAnchor | null;
  try {
    anchor = await ports.fetchThought(anchorId);
  } catch {
    throw new CommissionUnavailable("commission_anchor_unavailable");
  }
  if (
    !anchor || anchor.id !== anchorId ||
    !z.string().uuid().safeParse(anchor.disposition?.revision_id).success ||
    !z.string().uuid().safeParse(anchor.projection?.artifact_id).success ||
    anchor.disposition.state !== "current_commission" ||
    anchor.projection?.kind !== "ACTION"
  ) {
    throw new CommissionUnavailable("commission_head_unqualified");
  }
  let projection: CommissionProjection;
  try {
    projection = commissionProjectionSchema.parse(
      JSON.parse(anchor.projection.content),
    );
  } catch {
    throw new CommissionUnavailable("commission_projection_invalid");
  }
  let source: { id: string; content: string } | null;
  try {
    source = await ports.fetchArtifact(projection.source.artifact_id);
  } catch {
    throw new CommissionUnavailable("commission_source_unavailable");
  }
  if (!source || source.id !== projection.source.artifact_id) {
    throw new CommissionUnavailable("commission_source_unavailable");
  }
  if (
    await commissionDigest(source.content) !== projection.source.sha256 ||
    !source.content.split("\n").includes(
      `Edition: ${projection.source.edition}`,
    )
  ) {
    throw new CommissionUnavailable("commission_source_binding_mismatch");
  }
  let exit: CommissionAnchor | null;
  try {
    exit = await ports.fetchThought(anchorId);
  } catch {
    throw new CommissionUnavailable("commission_head_revalidation_failed");
  }
  if (
    !exit || exit.id !== anchor.id ||
    exit.disposition?.revision_id !== anchor.disposition.revision_id ||
    exit.disposition.state !== anchor.disposition.state ||
    exit.projection?.artifact_id !== anchor.projection.artifact_id ||
    exit.projection.kind !== anchor.projection.kind ||
    exit.projection.content !== anchor.projection.content
  ) {
    throw new CommissionUnavailable("commission_head_changed");
  }
  return {
    ...projection,
    anchor_id: anchorId,
    revision_id: anchor.disposition.revision_id,
    projection_artifact_id: anchor.projection.artifact_id,
    source_content: source.content,
    selection: "CURRENT_AT_READ_REVALIDATION",
    qualification:
      "Source bytes and current-head binding checked; authorized adoption does not prove empirical success or consumer uptake.",
  };
}

export function commissionFailure(error: unknown) {
  return {
    error: error instanceof CommissionUnavailable
      ? error.code
      : "commission_unavailable",
    recovery:
      "Recover the admitted distribution anchor, its current disposition and exact bound source through authorized runtime operations; then retry. Do not substitute search ranking or a historical edition.",
    contract: COMMISSION_CONTRACT,
  };
}
