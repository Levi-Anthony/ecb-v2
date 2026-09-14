import { pipeline } from '@huggingface/transformers';

const referenceUrl = process.env.REFERENCE_URL;
if (!referenceUrl) throw new Error('REFERENCE_URL required');

const response = await fetch(referenceUrl);
if (!response.ok) throw new Error(`reference_http_${response.status}`);
const reference = await response.json();

const embed = await pipeline('feature-extraction', 'Supabase/gte-small');

function cosine(a, b) {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt(aa * bb);
}

function maxAbs(a, b) {
  let value = 0;
  for (let i = 0; i < a.length; i += 1) {
    value = Math.max(value, Math.abs(a[i] - b[i]));
  }
  return value;
}

let minimumCosine = 1;
let maximumAbs = 0;
for (const fixture of reference.fixtures) {
  if (!Array.isArray(fixture.embedding) || fixture.embedding.length !== 384) {
    throw new Error('reference_dimension_mismatch');
  }
  const output = await embed(fixture.text, { pooling: 'mean', normalize: true });
  const portable = Array.from(output.data);
  if (portable.length !== 384) throw new Error('portable_dimension_mismatch');

  const similarity = cosine(fixture.embedding, portable);
  const difference = maxAbs(fixture.embedding, portable);
  minimumCosine = Math.min(minimumCosine, similarity);
  maximumAbs = Math.max(maximumAbs, difference);
  console.log(JSON.stringify({
    text: fixture.text,
    cosine: similarity,
    max_abs_difference: difference,
  }));
}

console.log(JSON.stringify({ minimum_cosine: minimumCosine, maximum_abs_difference: maximumAbs }));

// Same semantic vector space is the governing requirement. Tight cosine agreement
// permits small runtime/quantization floating-point differences without pretending
// byte identity is required.
if (minimumCosine < 0.999) {
  throw new Error(`portable_embedding_space_mismatch:${minimumCosine}`);
}
