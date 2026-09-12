import postgres from "../build-7/node_modules/postgres/src/index.js";
const [p, operation, stopAt, request] = process.argv.slice(2);
const role = operation === "publish" ? "b9_child" : "b9_parent";
const db = postgres(`postgres://${role}@127.0.0.1:55442/build9`, {
  max: 1,
  prepare: false,
});
const pause = () => new Promise((resolve) => process.once("message", resolve));
try {
  const card = (await db`select ecb9.inspect(${p}::uuid) x`)[0].x;
  process.send({ phase: "ready", card, request });
  await pause();
  let result;
  await db.begin(async (tx) => {
    const b = tx.json(card.dependency.binding), pred = card.boundary;
    if (operation === "open") {
      result =
        (await tx`select ecb9.open_child(${p}::uuid,${b},${pred}::uuid,${request}::uuid) x`)[
          0
        ].x;
    }
    if (operation === "publish") {
      result =
        (await tx`select ecb9.publish(${p}::uuid,${card.child.attempt}::uuid,${b},null,${pred}::uuid,${request}::uuid) x`)[
          0
        ].x;
    }
    if (operation === "return") {
      const q =
        (await tx`select ecb9.read_source(${pred}::uuid) x`)[0].x.judgment;
      result =
        (await tx`select ecb9.return_result(${p}::uuid,${q}::uuid,${b},${pred}::uuid,${request}::uuid) x`)[
          0
        ].x;
    }
    if (operation === "reentry") {
      result =
        (await tx`select ecb9.reenter(${p}::uuid,${
          tx.json(card.observations)
        },${pred}::uuid,${request}::uuid) x`)[0].x;
    }
    if (stopAt === "before-commit") {
      process.send({ phase: "applied-uncommitted" });
      await pause();
    }
  });
  process.send({ phase: "committed-no-caller-ack" });
  await pause();
} catch (e) {
  process.send?.({ phase: "error", message: e.message });
  process.exitCode = 1;
} finally {
  await db.end();
}
