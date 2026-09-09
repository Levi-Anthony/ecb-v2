import { routes, type VercelConfig } from "@vercel/config/v1";
export const config: VercelConfig = {
  framework: null,
  buildCommand: "",
  installCommand: "npm ci --ignore-scripts",
  functions: {
    "api/index.mjs": {
      includeFiles:
        "{certs/**,public/**,node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js}",
      maxDuration: 30,
    },
  },
  rewrites: [
    routes.rewrite("/", "/api/index"),
    routes.rewrite("/intervene", "/api/index"),
    routes.rewrite("/(.*)", "/api/index"),
  ],
  headers: [{
    source: "/(.*)",
    headers: [
      { key: "Cache-Control", value: "no-store" },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
    ],
  }],
};
