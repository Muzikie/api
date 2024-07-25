/**
 * profile controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const knex = strapi.db.connection;
    const link = await knex('profiles_users_permissions_user_links')
        .where('user_id', user.id)
        .first();

    if (!link) {
      return ctx.notFound('Profile link not found');
    }

    const profile = await strapi.db.query('api::profile.profile').findOne({
      where: { id: link.profile_id },
    })

    if (!profile) {
      return ctx.notFound('Profile not found');
    }

    return profile;
  }
}));
