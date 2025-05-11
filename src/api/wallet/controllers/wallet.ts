/**
 * wallet controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::wallet.wallet',
  ({ strapi }) => {
    const walletDocs = strapi.documents('api::wallet.wallet');

    return {
      // POST
      async create(ctx) {
        const { user } = ctx.state;
        try {
          const { body: { data } } = ctx.request

          const walletData = {
            data: {
              ...data,
              users_permissions_user:  user.id,
            },
          };
          return walletDocs.create(walletData)
        } catch (err) {
          ctx.throw(500, err);
        }
      },
    };
  },
);

