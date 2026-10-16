import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const skillsRoot = path.join(root, ".agents/skills");
const expectedEvaluatedSkills = new Set([
  "ecos-authority-audit",
  "ecos-orient",
  "ecos-question-forward",
  "ecos-reentry-propagation",
  "ecos-ssmm",
  "ecos-state-intention-diff",
]);

function parseFrontmatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert(match, `${file}: missing YAML frontmatter`);

  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  assert(name, `${file}: missing name`);
  assert(description, `${file}: missing description`);
  return { name, description };
}

function validateQueries(contents, file, expectedCount, expectedTrue, expectedFalse) {
  assert(Array.isArray(contents), `${file}: root must be an array`);
  assert.equal(contents.length, expectedCount, `${file}: unexpected query count`);

  const prompts = new Set();
  let positives = 0;
  let negatives = 0;
  for (const [index, item] of contents.entries()) {
    assert.equal(typeof item?.query, "string", `${file}[${index}]: query must be a string`);
    assert(item.query.trim().length >= 20, `${file}[${index}]: query is not realistic enough to discriminate`);
    assert.equal(typeof item?.should_trigger, "boolean", `${file}[${index}]: should_trigger must be boolean`);
    assert(!prompts.has(item.query), `${file}[${index}]: duplicate query`);
    prompts.add(item.query);
    if (item.should_trigger) positives += 1;
    else negatives += 1;
  }

  assert.equal(positives, expectedTrue, `${file}: unexpected positive count`);
  assert.equal(negatives, expectedFalse, `${file}: unexpected negative count`);
  return prompts;
}

async function validateQueryFile(file, expectedCount, expectedTrue, expectedFalse) {
  return validateQueries(JSON.parse(await readFile(file, "utf8")), file, expectedCount, expectedTrue, expectedFalse);
}

assert.throws(
  () => validateQueries([{ query: "too short", should_trigger: true }], "negative-control.json", 1, 1, 0),
  /not realistic enough to discriminate/,
  "validator sensitivity control did not reject a malformed fixture",
);

const entries = await readdir(skillsRoot, { withFileTypes: true });
const skillNames = [];
const libraryReadme = await readFile(path.join(skillsRoot, "README.md"), "utf8");

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const skillDir = path.join(skillsRoot, entry.name);
  const skillFile = path.join(skillDir, "SKILL.md");
  try {
    assert((await stat(skillFile)).isFile());
  } catch {
    continue;
  }

  const text = await readFile(skillFile, "utf8");
  const { name, description } = parseFrontmatter(text, skillFile);
  assert.equal(name, entry.name, `${skillFile}: name must match parent directory`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name), `${skillFile}: invalid name`);
  assert(name.length <= 64, `${skillFile}: name exceeds 64 characters`);
  assert(description.length >= 1 && description.length <= 1024, `${skillFile}: invalid description length`);
  assert(!/\b(?:TODO|TBD|PLACEHOLDER)\b/.test(text), `${skillFile}: unfinished scaffold marker`);
  assert(libraryReadme.includes(`| \`${name}\` |`), `${name}: missing capability contract`);
  skillNames.push(name);

  if (expectedEvaluatedSkills.has(name)) {
    const train = await validateQueryFile(path.join(skillDir, "evals/train_queries.json"), 12, 6, 6);
    const validation = await validateQueryFile(path.join(skillDir, "evals/validation_queries.json"), 8, 4, 4);
    for (const query of validation) {
      assert(!train.has(query), `${name}: train/validation query overlap`);
    }
  }
}

assert.equal(skillNames.length, 10, "expected exactly ten first-extraction skills");
assert.equal(new Set(skillNames).size, skillNames.length, "duplicate skill name");
for (const name of expectedEvaluatedSkills) {
  assert(skillNames.includes(name), `missing evaluated skill: ${name}`);
}

console.log(`Agent Skills structural validation passed: ${skillNames.length} skills, ${expectedEvaluatedSkills.size} trigger suites, sensitivity control detected.`);
