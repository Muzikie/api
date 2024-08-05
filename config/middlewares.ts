export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'plugin::users-permissions.permissions',
  {
    resolve: './src/middlewares/custom/signup',
    config: {
      enabled: true,
    },
  },
];
