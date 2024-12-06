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
      const { project, amount } = ctx.request.body;
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
          const txResult = await strapi.service('api::contribution-tier.contribution-tier').registerOnChain({
            account: wallet[0],
            tierId: entityId,
            campaignId: project.id,
            amount,
          });

          // Check funding progress and update the project status
          if (!txResult.success) {
            throw new Error('Could not register contribution on network');
          }

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
