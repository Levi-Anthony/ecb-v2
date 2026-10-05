import { env } from '@huggingface/transformers';

env.cacheDir = '/tmp/transformers-cache';
env.useFSCache = true;

let appPromise: Promise<(typeof import('../server.js'))['default']> | null = null;

export function getApp() {
  appPromise ??= import('../server.js').then((module) => module.default);
  return appPromise;
}
