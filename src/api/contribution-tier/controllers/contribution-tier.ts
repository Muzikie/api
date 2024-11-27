/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::contribution-tier.contribution-tier',
  ({ strapi }) => ({
    // POST
    async create(ctx) {
      const { user } = ctx.state;
      let entityId: string = '';

      try {
        const now = new Date();
        ctx.request.body.data.users_permissions_user = user.id;
        ctx.request.body.data.createdAt = now;
        ctx.request.body.data.updatedAt = now;
        ctx.request.body.data.publishedAt = now;

        // Proceed with creating the the project
        const result = await super.create(ctx);
        entityId = result.data.id;

        const wallet = await strapi.entityService.findMany(
          'api::wallet.wallet',
          {
            filters: {
              users_permissions_user: user.id,
            },
          },
        );

        if (wallet.length === 1) {
          // @todo Inform the blockchain app

          return result;
        } else {
          // @todo ridi
          throw new Error('Could not find associated wallet');
        }
      } catch (err) {
        await strapi.entityService.delete(
          'api::contribution-tier.contribution-tier',
          entityId,
        );
        ctx.throw(500, err);
      }
    },
  }),
);
