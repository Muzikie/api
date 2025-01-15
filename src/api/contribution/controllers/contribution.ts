/**
 * contribution controller
 */

import { factories } from '@strapi/strapi'

import { ProjectStatus } from '../../../../types/collections';

export default factories.createCoreController(
  'api::contribution.contribution',
  ({ strapi }) => ({
    async create(ctx) {
      const tierDocs = strapi.documents('api::contribution-tier.contribution-tier');
      const contributionDocs = strapi.documents('api::contribution.contribution');
      const projectDocs = strapi.documents('api::project.project');
      const walletDocs = strapi.documents('api::wallet.wallet');

      const { user } = ctx.state;
      const { contribution_tier } = ctx.request.body.data;
      let contributionId;
      let project;

      try {
        // Find the contribution tier and associated project
        const tier = await tierDocs.findOne({
          documentId: contribution_tier,
          populate: { project: true },
        });

        if (!tier) {
          return ctx.badRequest('Contribution tier not found');
        }

        // Check if the project exists
        project = tier.project;
        if (!project) {
          return ctx.badRequest('Project not found');
        }

        // Create the contribution
        const contribution = await contributionDocs.create({
          data: {
            amount: tier.amount,
            contribution_tier: tier.id,
            project: project.id,
            users_permissions_user: user.id,
          },
        });
        // await contributionDocs.publish({ documentId: contribution.documentId });

        contributionId = contribution.id;

        // Update the project's current_funding
        const current_funding = (
          BigInt(project.current_funding) + BigInt(tier.amount)
        ).toString();
        let status = project.status;
        if (current_funding >= project.hard_goal) {
          status = ProjectStatus.SoldOut;
        } else if (current_funding >= project.soft_goal) {
          status = ProjectStatus.Successful;
        }
        await projectDocs.update({
          documentId: project.documentId,
          data: {
            current_funding,
            status,
          },
        });

        // Return the created contribution
        const sanitizedEntity = await this.sanitizeOutput(contribution, ctx);

        const wallet = await walletDocs.findMany({
          filters: {
            users_permissions_user: user.id,
          },
        });

        if (wallet.length === 1) {
          // @todo Inform the blockchain app

          // Check funding progress and update the project status
        } else {
          throw new Error('Could not find associated wallet');
        }
        // before returning the value, make sure to update the Solana project too
        return this.transformResponse(sanitizedEntity);
      } catch (err) {
        await contributionDocs.delete({
          documentId: contributionId,
        });
        await projectDocs.update({
          documentId: project.id,
          data: {
            current_funding: project.current_funding,
            status: project.status,
          },
        });
        ctx.throw(500, err);
      }
    },
  }),
);
