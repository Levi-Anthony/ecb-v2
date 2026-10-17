/** Read-only preparation. Prints an inspectable release payload; never connects to a database. */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { prepareCommissionProjection } from '../server/current-commission.js';

const source = await readFile(new URL('../docs/current-product-delivery-commission.md', import.meta.url), 'utf8');
const projection = prepareCommissionProjection(source, 'a95956b6-11c0-4607-90fb-8e1adae499cb',
  ['5e552acb-fed7-48a4-b020-2e278fa36dc5', '77773bab-2f5c-408f-a899-e210528f6080']);
const operationId = (role: string) => {
  const hex = createHash('sha256').update(`ecos:commission-release:v1:${role}:${projection.source.sha256}`).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-8${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
};
console.log(JSON.stringify({ status: 'PREPARED_NOT_INSTALLED', projection,
  operations: { capture: operationId('capture'), artifact: operationId('artifact'), transition: operationId('transition') },
  release_requirement: 'Separate authorization to publish this exact source-bound projection through capture(raw_only), immutable Artifact and predecessor-checked disposition; set the nonsecret ECB_CURRENT_COMMISSION_THOUGHT_ID to the returned anchor. No direct SQL repair.',
}, null, 2));
