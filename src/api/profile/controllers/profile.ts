/**
 * profile controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::profile.profile',
  ({ strapi }) => ({
    async findOne(ctx) {
      const profileDocs = strapi.documents('api::profile.profile');
      const walletDocs = strapi.documents('api::wallet.wallet');

      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }
  
      const [profile] = await profileDocs.findMany({
        filters: { users_permissions_user: user.id },
        populate: ['avatar'],
      });
      const [wallet] = await walletDocs.findMany({
        filters: { users_permissions_user: user.id },
      });
  
      if (!profile) {
        return ctx.notFound('Profile not found');
      }
      if (!wallet) {
        return ctx.notFound('Wallet not found');
      }
  
      return {
        ...profile,
        profileId: profile.documentId,
        id: user.id,
        address: wallet.address,
      };
    }
  })
);
