import { getApp } from '../../runtime.js';

export default {
  async fetch(request: Request) {
    const app = await getApp();
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/^\/api\/mcp\/k\//, '/mcp/k/');
    // Vercel may also supply the dynamic path parameter as a query parameter.
    url.search = '';
    return app.fetch(new Request(url, request));
  },
};
