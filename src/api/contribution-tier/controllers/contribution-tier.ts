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
      const projectDocs = strapi.documents('api::project.project');

      const { body } = ctx.request;
      let documentId: string = '';

      try {
        const campaign = await projectDocs.findOne({ documentId: body.data.project });
        return tierDocs.create({
          data: {
            name: body.data.name,
            description: body.data.description,
            rewards: body.data.rewards,
            amount: body.data.amount,
            project: campaign.id,
          },
        });
      } catch (err) {
        await tierDocs.delete({ documentId });
        ctx.throw(500, err);
      }
    },
  }),
);
