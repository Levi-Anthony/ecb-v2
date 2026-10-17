import { getApp } from './_runtime.js';

// The authenticated human door delegates to the same installed runtime as MCP.
export default {
  async fetch(request: Request) {
    const app = await getApp();
    const url = new URL(request.url);
    url.pathname = '/personal';
    return app.fetch(new Request(url, request));
  },
};
