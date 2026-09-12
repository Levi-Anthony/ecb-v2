const projectionUrl = new URL(
  "../../docs/ecos/p2-0-projection-boundary-harness.md",
  import.meta.url,
);
const acceptanceUrl = new URL(
  "../../docs/ecos/p2-0-acceptance-matrix.md",
  import.meta.url,
);

const projection = await Deno.readTextFile(projectionUrl);
const acceptance = await Deno.readTextFile(acceptanceUrl);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function requireText(document: string, text: string, context: string): void {
  assert(
    document.includes(text),
    `${context}: missing ${JSON.stringify(text)}`,
  );
}

const expectedRowIds = [
  ...Array.from(
    { length: 15 },
    (_, index) => `P20-Z${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 21 },
    (_, index) => `P20-L${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 8 },
    (_, index) => `P20-C${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 6 },
    (_, index) => `P20-A${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 4 },
    (_, index) => `P20-R${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 4 },
    (_, index) => `P20-P${String(index + 1).padStart(2, "0")}`,
  ),
];

const allowedOwners = new Set(["ECB", "ECOS", "INTERFACE"]);
const availabilityPattern =
  /^(AVAILABLE|EXPECTED_IN_BUILD_(?:[3-9]|10)|ECOS_LOCAL|INTERFACE_LOCAL|APERTURE|CONFLICT)$/;
const enforcementPattern =
  /(STRUCTURAL|SEMANTIC|AUTHORITY|OBSERVATIONAL|observation|check|test)/i;
const boundarySignalPattern =
  /P2-(?:COMPILE|ADVANCE|HOLD|ROUTE-SUBSTRATE|RESHAPE-LOCAL|REOPEN-UPSTREAM|STOP)/;

Deno.test("all settled obligations have a complete P2.0 mapping row", () => {
  const rows = projection.split("\n").filter((line) =>
    /^\| P20-[ZLCARP]\d{2} \|/.test(line)
  );
  assert(
    rows.length === expectedRowIds.length,
    `expected ${expectedRowIds.length} rows, found ${rows.length}`,
  );

  const foundIds = new Set<string>();
  for (const row of rows) {
    const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
    assert(
      cells.length === 10,
      `${
        cells[0] ?? "unknown row"
      }: expected 10 columns, found ${cells.length}`,
    );
    const [
      id,
      source,
      capability,
      owner,
      availability,
      ecosProjection,
      enforcement,
      falsifier,
      route,
      reopen,
    ] = cells;
    assert(expectedRowIds.includes(id), `unexpected row ID ${id}`);
    assert(!foundIds.has(id), `duplicate row ID ${id}`);
    foundIds.add(id);
    for (
      const [name, value] of [
        ["SOURCE OBLIGATION", source],
        ["REQUIRED CAPABILITY", capability],
        ["ECOS PROJECTION", ecosProjection],
        ["ENFORCEMENT / OBSERVATION", enforcement],
        ["FALSIFIER", falsifier],
        ["FAILURE ROUTE", route],
        ["MINIMUM REOPEN SCOPE", reopen],
      ]
    ) {
      assert(
        value.length > 2 && !/^(?:TBD|TODO|UNKNOWN)$/i.test(value),
        `${id}: ${name} is not populated`,
      );
    }
    assert(allowedOwners.has(owner), `${id}: invalid owner ${owner}`);
    assert(
      availabilityPattern.test(availability),
      `${id}: invalid availability ${availability}`,
    );
    assert(
      enforcementPattern.test(enforcement),
      `${id}: enforcement/observation is not explicit`,
    );
    assert(
      boundarySignalPattern.test(route),
      `${id}: failure route has no P2 boundary signal`,
    );
  }

  for (const id of expectedRowIds) {
    assert(foundIds.has(id), `missing obligation row ${id}`);
  }
});

Deno.test("availability is calibrated to installed evidence rather than roadmap prose", () => {
  const expectedAvailability: Record<string, string> = {
    "P20-Z01": "AVAILABLE",
    "P20-Z02": "AVAILABLE",
    "P20-Z03": "EXPECTED_IN_BUILD_3",
    "P20-Z04": "EXPECTED_IN_BUILD_4",
    "P20-Z05": "EXPECTED_IN_BUILD_5",
    "P20-Z06": "EXPECTED_IN_BUILD_5",
    "P20-Z07": "EXPECTED_IN_BUILD_6",
    "P20-Z08": "EXPECTED_IN_BUILD_6",
    "P20-Z09": "EXPECTED_IN_BUILD_7",
    "P20-Z10": "EXPECTED_IN_BUILD_8",
    "P20-Z11": "EXPECTED_IN_BUILD_8",
    "P20-R01": "EXPECTED_IN_BUILD_9",
    "P20-P01": "EXPECTED_IN_BUILD_10",
  };

  for (const [id, availability] of Object.entries(expectedAvailability)) {
    const row = projection.split("\n").find((line) =>
      line.startsWith(`| ${id} |`)
    );
    assert(row, `missing row ${id}`);
    const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
    assert(
      cells[4] === availability,
      `${id}: expected ${availability}, found ${cells[4]}`,
    );
  }

  requireText(
    acceptance,
    "Build 3 Shape text exists but no Build 3 installation receipt exists",
    "calibration fixture",
  );
  requireText(
    projection,
    "closed Shape is not installation",
    "capability gate",
  );
  requireText(
    projection,
    "capability evidence can update the projected number",
    "non-invariant build number",
  );
});

Deno.test("every required acceptance family is frozen with all fixture fields", () => {
  const headings = [...acceptance.matchAll(/^## (F\d{2}) — (.+)$/gm)];
  assert(
    headings.length === 16,
    `expected 16 fixture families, found ${headings.length}`,
  );

  const requiredNames = [
    "Substrate sufficiency",
    "Projection fidelity",
    "Authority ordering",
    "Sense closure",
    "Comprehensive sweep",
    "Currentness",
    "Semantic contamination",
    "Worker break",
    "Handoff minimization",
    "Evidence return",
    "Recursion control",
    "Propagation qualification",
    "Door independence",
    "Legacy temptation",
    "Zipper routing meta-test",
    "Upstream falsifier",
  ];
  const requiredFields = [
    "PRECONDITION",
    "ATTACK",
    "EXPECTED OBSERVATION",
    "EXPECTED NARROW FAILURE CODE",
    "CORRECT BOUNDARY SIGNAL",
    "OWNING LAYER",
    "MINIMUM REOPEN SCOPE",
    "PRESERVED EVIDENCE",
  ];

  for (let index = 0; index < headings.length; index++) {
    const match = headings[index];
    assert(
      match[1] === `F${String(index + 1).padStart(2, "0")}`,
      `fixture order mismatch at ${match[1]}`,
    );
    assert(
      match[2] === requiredNames[index],
      `${match[1]}: expected ${requiredNames[index]}, found ${match[2]}`,
    );
    const end = headings[index + 1]?.index ?? acceptance.length;
    const section = acceptance.slice(match.index!, end);
    for (const field of requiredFields) {
      requireText(section, `**${field}:**`, match[1]);
    }
  }
});

Deno.test("zipper meta-test discriminates general, local, and ambiguous requirements", () => {
  const zipperStart = acceptance.indexOf("## F15 — Zipper routing meta-test");
  const zipperEnd = acceptance.indexOf("## F16 — Upstream falsifier");
  assert(
    zipperStart >= 0 && zipperEnd > zipperStart,
    "zipper fixture section is missing",
  );
  const zipper = acceptance.slice(zipperStart, zipperEnd);
  requireText(zipper, "A → `P2-ROUTE-SUBSTRATE`", "zipper A");
  requireText(zipper, "B → smallest local ECOS Shape", "zipper B");
  requireText(zipper, "C → `P2-HOLD`", "zipper C");
  requireText(
    zipper,
    "Can loss, contradiction, or concurrent mutation of",
    "zipper forward question",
  );
  requireText(
    zipper,
    "ECB becoming an omnivorous ontology",
    "zipper downward diagnostic",
  );
  requireText(
    zipper,
    "ECOS rebuilding a shadow substrate",
    "zipper local diagnostic",
  );
  requireText(
    zipper,
    "boundary governance insufficient",
    "zipper forced-ambiguity diagnostic",
  );
});

Deno.test("P2.0 remains a non-runtime, non-schema, non-legacy-import installation unit", () => {
  const normalizedProjection = projection.replace(/\s+/g, " ").toLowerCase();
  const normalizedAcceptance = acceptance.replace(/\s+/g, " ");
  for (
    const phrase of [
      "does not implement SSMM",
      "add persistence",
      "import legacy ECOS",
      "create substitute substrate",
      "activate recursion or propagation",
      "runtime gates unchanged",
    ]
  ) {
    requireText(
      normalizedProjection,
      phrase.toLowerCase(),
      "projection prohibition",
    );
  }

  for (
    const phrase of [
      "not create database objects",
      "install an SSMM runtime",
      "import legacy state/anatomy",
      "manufacture a missing ECB capability",
    ]
  ) requireText(normalizedAcceptance, phrase, "acceptance prohibition");

  assert(
    !/\bCREATE\s+(?:TABLE|TYPE|FUNCTION|TRIGGER|POLICY)\b/i.test(projection),
    "projection contains database DDL",
  );
  assert(
    !/\bCREATE\s+(?:TABLE|TYPE|FUNCTION|TRIGGER|POLICY)\b/i.test(acceptance),
    "acceptance matrix contains database DDL",
  );
});
