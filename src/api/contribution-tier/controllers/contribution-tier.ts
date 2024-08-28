/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::contribution-tier.contribution-tier', ({ strapi }) => ({
  // POST
  async create(ctx) {
    try {
      const contributionTier = await strapi.entityService.create(
        'api::contribution-tier.contribution-tier',
        { data: ctx.request.body },
      );

      // TODO: Call the Smart Contract method here to register the contribution tier on the blockchain

      const sanitizedEntity = await this.sanitizeOutput(contributionTier, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
