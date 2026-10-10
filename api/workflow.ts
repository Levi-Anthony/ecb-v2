import { getApp } from './_runtime.js';

export default {
  async fetch(request: Request) {
    const app=await getApp();
    const url=new URL(request.url);
    url.pathname='/workflow';
    return app.fetch(new Request(url,request));
  },
};
