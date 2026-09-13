import {readFileSync} from 'node:fs';
export const cfg=JSON.parse(readFileSync('/private/tmp/ecb10-local.json','utf8'));
