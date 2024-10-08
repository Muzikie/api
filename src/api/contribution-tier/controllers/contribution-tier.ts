/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi';
import { BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

import { decryptPrivateKey } from '../../../utils/crypto';
import { getProgramDetails, getProjectPDA } from '../../../utils/network';
import { EncryptedSecretKeyMeta } from '../../../utils/types';

export default factories.createCoreController('api::contribution-tier.contribution-tier', ({ strapi }) => ({
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
        }
      );

      if (wallet.length === 1) {
        const { iv, encryptedData } = wallet[0].encrypted_private_key as unknown as EncryptedSecretKeyMeta;
        const privateKey = decryptPrivateKey(encryptedData, iv);
        const keyPair = Keypair.fromSecretKey(privateKey);

        const program = getProgramDetails(keyPair);
        const projectPDA = getProjectPDA(ctx.request.body.data.project, program);

        const projectState = await program.account.projectState.fetch(projectPDA);

        await program.methods.addContributionTier(
          new BN(result.data.id),
          new BN(result.data.attributes.amount),
        )
        .accounts({
          project: projectPDA,
          owner: new PublicKey(wallet[0].public_key),
        })
        .signers([keyPair])
        .rpc();

        return result;
      } else {
        // @todo ridi
        throw new Error('Could not find associated wallet');
      }
    } catch (err) {
      await strapi.entityService.delete('api::contribution-tier.contribution-tier', entityId);
      ctx.throw(500, err);
    }
  }
}));
