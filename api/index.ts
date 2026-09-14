import app from '../server';

export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    url.pathname = '/';
    return app.fetch(new Request(url, request));
  },
};
