/**
 * profile service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::profile.profile', {
  addProfile: async (userId: string) => {
    try {
      const now = new Date().getTime();

      // Create a profile for the new user
      await strapi.documents('api::profile.profile').create({
        data: {
          first_name: '',
          las_name: '',
          points: 0,
          users_permissions_user: userId,
          createdAt: now,
          publishedAt: now,
        },
      });

      strapi.log.info(`Profile created for user ${userId}`);
    } catch (error) {
      strapi.log.error('Error during profile creation:', error);
    }
  },
});
