export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::session',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'], // @todo use env vars
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
];
