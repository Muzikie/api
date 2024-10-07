/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::contribution-tier.contribution-tier', ({ strapi }) => ({
  // POST
  async create(ctx) {
    const { user } = ctx.state;

    try {
      const now = new Date();
      ctx.request.body.data.users_permissions_user = user.id;
      ctx.request.body.data.createdAt = now;
      ctx.request.body.data.updatedAt = now;
      ctx.request.body.data.publishedAt = now;

      // Proceed with creating the the project
      const result = await super.create(ctx);

      // TODO: Call the Smart Contract method here to register the project on the blockchain
      // and if not created, revert the centralized project creation.

      return result;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
