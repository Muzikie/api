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

    const profile = await strapi.db.query('api::profile.profile').findOne({
      where: { users_permissions_user: user.id },
      populate: ['avatar'],
    });
    const wallet = await strapi.db.query('api::wallet.wallet').findOne({
      where: { users_permissions_user: user.id },
    });

    if (!profile) {
      return ctx.notFound('Profile not found');
    }
    if (!wallet) {
      return ctx.notFound('Wallet not found');
    }

    return {
      ...profile,
      address: wallet.address,
    };
  }
}));
