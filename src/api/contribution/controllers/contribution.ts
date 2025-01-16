/**
 * contribution controller
 */

import { factories } from '@strapi/strapi'
import { address as klayrAddress } from '@klayr/cryptography';

import { ProjectStatus } from '../../../../types/collections';
import { Commands } from '../../../utils/network';
import { createTransaction, EncryptedAccount } from '../../../utils/network/register';
import { getCampaignId, getContributionId } from '../../../utils/crypto';

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
          documentId: contribution_tier, // @todo get by id
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

        contributionId = contribution.documentId;

        // Update the project's current_funding
        const current_funding = BigInt(project.current_funding) + BigInt(tier.amount);
        let project_status = project.project_status;
        if (current_funding >= BigInt(project.hard_goal)) {
          project_status = ProjectStatus.SoldOut;
        } else if (current_funding >= BigInt(project.soft_goal)) {
          project_status = ProjectStatus.Successful;
        }
        await projectDocs.update({
          documentId: project.documentId,
          data: {
            current_funding: current_funding.toString(),
            project_status,
          },
        });

        // Return the created contribution
        const sanitizedEntity = await this.sanitizeOutput(contribution, ctx);

        const wallet = await walletDocs.findMany({
          filters: {
            users_permissions_user: user.id,
          },
        });

        if (wallet.length !== 1) {
          throw new Error('Wallet not found');
        }
        const params = {
          campaignId: project.on_chain_id,
          tierId: tier.id,
        };
        const txResult = await createTransaction(
          Commands.Contribute,
          params,
          {
            address: wallet[0].address,
            encrypted_private_key: wallet[0].encrypted_private_key,
            public_key: wallet[0].public_key,
          } as unknown as EncryptedAccount,
        );

        if (!txResult.transactionId) {
          throw new Error(
            `Blockchain transaction failed. Error: ${txResult}`,
          );
        }

        // const on_chain_id = getContributionId({
        //   campaignId: project.on_chain_id,
        //   address,
        //   tierId,
        //   apiId: result.id as unknown as number,
        //   address:  klayrAddress.getAddressFromKlayr32Address(wallet[0].address),
        // });

        // before returning the value, make sure to update the Solana project too
        return this.transformResponse(sanitizedEntity);
      } catch (err) {
        await contributionDocs.delete({
          documentId: contributionId,
        });
        await projectDocs.update({
          documentId: project.documentId,
          data: {
            current_funding: project.current_funding,
            project_status: project.project_status,
          },
        });
        ctx.throw(500, err);
      }
    },
  }),
);
