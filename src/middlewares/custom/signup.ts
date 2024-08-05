// src/middlewares/custom/signup.ts

export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (
      ctx.request.url === '/api/auth/local/register' &&
      ctx.request.method.toLowerCase() === 'post'
    ) {
      // Extract user information from the request body
      const { email } = ctx.request.body;

      try {
        // Create a profile for the new user
        const profile = await strapi.entityService.create(
          'api::profile.profile',
          {
            data: {
              first_name: email, // Set first_name to email as requested
            },
          },
        );

        strapi.log.info(`Profile created for user ${profile.id}`);
      } catch (error) {
        strapi.log.error('Error during profile creation:', error);
        return ctx.internalServerError(
          'An error occurred during profile creation',
        );
      }
    }

    // Proceed to the next middleware or route handler
    await next();
  };
};
