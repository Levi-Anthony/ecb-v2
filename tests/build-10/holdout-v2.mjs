import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  make,
  deliver,
  assess,
  close,
  save,
  semanticReached,
  admin,
  sha,
  fixture,
  D
} from './support.mjs';

const PRE_HOLDOUT_CHECKPOINT =
  'f3a4845cecc751055f065b3ae74501380ad01150';

const freeze = JSON.parse(
  readFileSync(
    'docs/build-receipts/evidence/build-10/pre-holdout-freeze-v2.json',
    'utf8'
  )
);

function verifyFrozenBoundary() {
  assert.equal(
    admin('source', 'select ecb10.method_digest();'),
    freeze.method_digest
  );
  assert.equal(
    admin('destination', 'select ecb10.method_digest();'),
    freeze.method_digest
  );

  const actual = {};

  for (const [path, expected] of Object.entries(freeze.files)) {
    const digest = sha(readFileSync(path));
    assert.equal(digest, expected, `frozen file changed: ${path}`);
    actual[path] = digest;
  }

  const material = Object.keys(actual)
    .sort()
    .map(path => `${path}\0${actual[path]}\n`)
    .join('');

  assert.equal(
    sha(Buffer.from(material)),
    freeze.boundary_digest,
    'complete frozen boundary changed'
  );
}

const results = [];
let state = 'FAIL_OR_INCONCLUSIVE';

try {
  verifyFrozenBoundary();

  // New post-freeze semantic holdout:
  // same admitted grammar, but a context not present in the frozen
  // support fixture plus a typed proposition expression.
  const context = 'warm-start/repeated-request';

  const basisMutate = value => {
    if (value?.rule && typeof value.rule === 'object') {
      return {
        ...value,
        rule: {...value.rule, context}
      };
    }

    if (Object.prototype.hasOwnProperty.call(value, 'context')) {
      return {...value, context};
    }

    return value;
  };

  const mutate = projection => {
    const proposition = {
      ...projection.proposition,
      context
    };

    return {
      ...projection,
      proposition,
      expressions: [{...proposition}]
    };
  };

  const f = await make({basisMutate, mutate});

  // The frozen helper constructs Q1 with its default context.
  // The holdout itself supplies a newly admitted context after the
  // durable freeze checkpoint, while preserving the same finite grammar.
  f.question = {
    ...f.question,
    criterion: {
      ...f.question.criterion,
      context
    },
    question:
      `Does this actual received projection support the historical note ` +
      `that the two declared ${context} observations for the exact revision ` +
      `in ${f.binding.report_version} each met 100 ms?`
  };

  f.q = await fixture(D, f.dscope, f.question);

  const transfer = await deliver(f);
  const assessment = await assess(f, transfer.d);

  semanticReached(assessment);

  assert.equal(
    assessment.result.outcome,
    'SUPPORTED_FOR_Q1',
    JSON.stringify(assessment.result)
  );

  for (const component of [
    'preservation:context',
    'source_context',
    'consequence',
    'expression'
  ]) {
    assert(
      assessment.result.findings.some(
        finding =>
          finding.component === component &&
          finding.state === 'PASS'
      ),
      `expected semantic PASS for ${component}`
    );
  }

  results.push({
    name: 'new-context-plus-typed-expression',
    state: 'PASS',
    expected: 'SUPPORTED_FOR_Q1',
    context,
    delivery: transfer.d,
    assessment: assessment.t,
    card: assessment.c
  });

  // Prove the checker + fixture boundary remained byte-identical
  // throughout the new holdout.
  verifyFrozenBoundary();

  state = 'PASS';

  console.log(
    'ECO-122 POST-FREEZE HOLDOUT V2 PASS; frozen boundary unchanged.'
  );
} finally {
  save('holdout-v2.json', {
    state,
    pre_holdout_checkpoint: PRE_HOLDOUT_CHECKPOINT,
    method_digest: freeze.method_digest,
    boundary_digest: freeze.boundary_digest,
    provenance:
      'Authored only after durable pre-holdout checkpoint f3a4845; ' +
      'same-worker holdout, no claim of independent specification authorship.',
    cases: results
  });

  await close();
}
