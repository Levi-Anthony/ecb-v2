import app from '../server.js';

export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    url.pathname = '/';
    return app.fetch(new Request(url, request));
  },
};
