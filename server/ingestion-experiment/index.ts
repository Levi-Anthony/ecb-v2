import { makeHandler } from './core.mjs';
import profile from './request-profile-v3.json' with { type: 'json' };
import grammar from './grammar-runtime-v0.1.json' with { type: 'json' };
import commission from './commission.local.json' with { type: 'json' };
// This isolated experimental function reads only the existing OpenRouter secret.
// grammar-runtime-v0.1.json is a compiled deployment view; CI checks it against the source grammar.
// No database client, database credential reads, database/action effects, or logging.
Deno.serve(makeHandler({
  apiKey: Deno.env.get('OPENROUTER_API_KEY'),
  capabilityHash: commission.capabilityHash,
  expiresAt: commission.expiresAt,
  profile,
  grammar,
}));
