/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::contribution-tier.contribution-tier',
  ({ strapi }) => ({
    // POST
    async create(ctx) {
      const tierDocs = strapi.documents('api::contribution-tier.contribution-tier');
      const walletDocs = strapi.documents('api::wallet.wallet');

      const { user } = ctx.state;
      let documentId: string = '';

      try {
        // Proceed with creating the the project
        const result = await super.create(ctx);
        documentId = result.data.id;

        const wallet = await walletDocs.findMany({
          filters: {
            users_permissions_user: user.id,
          },
        });

        if (wallet.length === 1) {
          // @todo Inform the blockchain app

          return result;
        } else {
          // @todo ridi
          throw new Error('Could not find associated wallet');
        }
      } catch (err) {
        await tierDocs.delete({ documentId });
        ctx.throw(500, err);
      }
    },
  }),
);
