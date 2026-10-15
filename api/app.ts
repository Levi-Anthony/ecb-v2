import { getApp } from './_runtime.js';
export default { async fetch(request: Request) {
  const app = await getApp(), url = new URL(request.url); url.pathname = '/app';
  return app.fetch(new Request(url, request));
} };
