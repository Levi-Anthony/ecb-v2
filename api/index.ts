import { getApp } from './runtime.js';

export default {
  async fetch(request: Request) {
    const app = await getApp();
    const url = new URL(request.url);
    url.pathname = '/';
    return app.fetch(new Request(url, request));
  },
};
