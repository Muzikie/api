module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('ADMIN_JWT_SECRET'),
      providers: {
        google: {
          clientId: env('GOOGLE_CLIENT_ID'),
          redirectUri: 'muzikie://auth/callback',
        },
      },
    },
  },
  upload: {
    config: {
      provider: 'local', // Default provider (can be 'local' or another like 'aws-s3', 'cloudinary', etc.)
      sizeLimit: 10 * 1024 * 1024,
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
});