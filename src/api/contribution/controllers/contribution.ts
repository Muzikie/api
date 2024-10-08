import { factories } from '@strapi/strapi';
import { BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

import { decryptPrivateKey } from '../../../utils/crypto';
import { getProgramDetails, getProjectPDA } from '../../../utils/network';
import { EncryptedSecretKeyMeta } from '../../../utils/types';
import { ProjectStatus } from '../../../../types/collections';

export default factories.createCoreController('api::contribution.contribution', ({ strapi }) => ({
  async create(ctx) {
    const { user } = ctx.state;
    const { contribution_tier } = ctx.request.body;
    let contributionId;
    let project;

    try {
      // Find the contribution tier and associated project
      const tier = await strapi.entityService.findOne('api::contribution-tier.contribution-tier', contribution_tier, {
        populate: { project: true }
      });

      if (!tier) {
        return ctx.badRequest('Contribution tier not found');
      }

      // Check if the project exists
      project = tier.project;
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

      contributionId = contribution.id;

      // Update the project's current_funding
      const current_funding = (BigInt(project.current_funding) + BigInt(tier.amount)).toString()
      let status = project.status;
      if (current_funding >= project.hard_goal) {
        status = ProjectStatus.SoldOut;
      } else if (current_funding >= project.soft_goal) {
        status = ProjectStatus.Successful;
      }
      await strapi.entityService.update('api::project.project', project.id, {
        data: {
          current_funding,
          status,
        }
      });

      // Return the created contribution
      const sanitizedEntity = await this.sanitizeOutput(contribution, ctx);

      const wallet = await strapi.entityService.findMany(
        'api::wallet.wallet',
        {
          filters: {
            users_permissions_user: user.id,
          },
        },
      );

      if (wallet.length === 1) {
        const { iv, encryptedData } = wallet[0]
          .encrypted_private_key as unknown as EncryptedSecretKeyMeta;
        const privateKey = decryptPrivateKey(encryptedData, iv);
        const keyPair = Keypair.fromSecretKey(privateKey);
        const program = getProgramDetails(keyPair);
        const projectPDA = getProjectPDA(String(project.id), program);
        await program.methods
          .contribute(
            new BN(tier.id),
            new BN(tier.amount),
          )
          .accounts({
            contributor: new PublicKey(wallet[0].public_key),
            project: projectPDA,
            appAddress: new PublicKey(process.env.APP_PUBLIC_KEY)
          })
          .signers([keyPair])
          .rpc();


        // Check funding progress and update the project status
      } else {
        throw new Error('Could not find associated wallet');
      }
      // before returning the value, make sure to update the Solana project too
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      await strapi.entityService.delete(
        'api::contribution.contribution',
        contributionId,
      );
      await strapi.entityService.update('api::project.project', project.id, {
        data: {
          current_funding: project.current_funding,
          status: project.status,
        }
      });
      ctx.throw(500, err);
    }
  },
}));
