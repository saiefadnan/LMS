import type { Core } from '@strapi/strapi';

/**
 * Middleware configuration
 * 
 * The order matters — each middleware runs in sequence for every request.
 * We customize 'strapi::cors' to allow our Next.js frontend to make
 * cross-origin requests to this Strapi backend.
 * 
 * Without CORS config, the browser would block requests from
 * localhost:3000 (Next.js) to localhost:1337 (Strapi) because
 * they're on different ports = different origins.
 */
const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // Allow requests from our frontend (local dev + deployed Vercel URL)
      origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ],
      // Allow these HTTP methods
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      // Allow the Authorization header (needed for JWT) and Content-Type
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      // Keep the connection alive for 1 hour (browser caches preflight)
      maxAge: 3600,
      // Allow cookies to be sent cross-origin (needed for httpOnly JWT cookie)
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
