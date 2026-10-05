import { oauthEnabled, protectedResourceMetadata } from '../server/oauth.js';

export default {
  fetch(request: Request) {
    const headers = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET') return new Response(null, { status: 405, headers });
    if (!oauthEnabled()) return Response.json({ error: 'oauth_not_enabled' }, { status: 503, headers });
    return Response.json(protectedResourceMetadata(), { headers });
  },
};
