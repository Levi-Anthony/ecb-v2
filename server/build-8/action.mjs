// The bounded dispatch boundary for one accepted admission. A transport retry
// uses the SAME request/admission/predecessor. Recovered starts are observed,
// never redispatched. A later attempt needs explicit reconcile + fresh admission.
// SQL is the custody/effect boundary; this is not a general executor or service.
import { randomUUID } from "node:crypto";
import { recover } from "./recover.mjs";
export async function execute(
  db,
  { scope, action, admission, predecessor, request },
) {
  const [row] =
    await db`select ecb8.control(${scope}::uuid,${action}::uuid,'start',${admission}::uuid,${predecessor}::uuid,${request}::uuid) x`;
  if (row.x.replayed) return recover(db, scope, action);
  // The preceding statement's transaction must have committed. SQL rejects a
  // caller wrapping both boundaries in one outer transaction.
  const start = row.x.event;
  try {
    await db`select ecb8.control(${scope}::uuid,${action}::uuid,'effect',${start}::uuid,${start}::uuid,${randomUUID()}::uuid)`;
  } catch (error) {
    // A failed/uncertain return supplies no no-effect inference or redispatch.
    return {
      ...await recover(db, scope, action),
      dispatch_error: error.message,
    };
  }
  return recover(db, scope, action);
}
export const status = recover;
