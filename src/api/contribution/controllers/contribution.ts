import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contribution.contribution', ({ strapi }) => ({
  async create(ctx) {
    const { user } = ctx.state;
    const { contribution_tier } = ctx.request.body;

    try {
      // Find the contribution tier and associated project
      const tier = await strapi.entityService.findOne('api::contribution-tier.contribution-tier', contribution_tier, {
        populate: { project: true }
      });

      if (!tier) {
        return ctx.badRequest('Contribution tier not found');
      }

      // Check if the project exists
      const project = tier.project;
      if (!project) {
        return ctx.badRequest('Project not found');
      }

      const now = new Date();

      // Create the contribution
      const contribution = await strapi.entityService.create('api::contribution.contribution', {
        data: {
          amount: tier.amount,
          contribution_tier: tier.id,
          project: project.id,
          users_permissions_user: user.id,
          createdAt: now,
          updatedAt: now,
          publishedAt: now,
        },
      });

      // Update the project's current_funding
      await strapi.entityService.update('api::project.project', project.id, {
        data: {
          current_funding: project.current_funding + tier.amount
        }
      });

      // Return the created contribution
      const sanitizedEntity = await this.sanitizeOutput(contribution, ctx);

      // interact with program
      // send tokens to the program

      // before returning the value, make sure to update the Solana project too
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
