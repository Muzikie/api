/**
 * contribution-tier controller
 */

import { factories } from '@strapi/strapi'
import { address as klayrAddress } from '@klayr/cryptography';

import { Commands } from '../../../utils/network';
import { createTransaction, EncryptedAccount } from '../../../utils/network/register';
import { getCampaignId } from '../../../utils/crypto';

export default factories.createCoreController(
  'api::contribution-tier.contribution-tier',
  ({ strapi }) => ({
    // POST
    async create(ctx) {
      const tierDocs = strapi.documents('api::contribution-tier.contribution-tier');
      const walletDocs = strapi.documents('api::wallet.wallet');
      const projectDocs = strapi.documents('api::project.project');

      const { user } = ctx.state;
      const { body } = ctx.request;
      let documentId: string = '';

      try {
        const campaign = await projectDocs.findOne({ documentId: body.data.project });
        const result = await tierDocs.create({
          data: {
            name: body.data.name,
            description: body.data.description,
            rewards: body.data.rewards,
            amount: body.data.amount,
            project: campaign.id,
          },
        });
        // await tierDocs.publish({ documentId: result.documentId })
        documentId = result.documentId;

        const wallet = await walletDocs.findMany({
          filters: {
            users_permissions_user: user.id,
          },
        });

        if (wallet.length !== 1) {
          throw new Error('Could not find associated wallet');
        }
        const campaignId = getCampaignId({
          apiId: campaign.id as unknown as number,
          address: klayrAddress.getAddressFromKlayr32Address(wallet[0].address),
        });
        const txResult = await createTransaction(
          Commands.AddTier,
          {
            amount: result.amount,
            apiId: result.id,
            campaignId,
          },
          {
            address: wallet[0].address,
            encrypted_private_key: wallet[0].encrypted_private_key,
            public_key: wallet[0].public_key,
          } as unknown as EncryptedAccount,
        );
        return result;
      } catch (err) {
        await tierDocs.delete({ documentId });
        ctx.throw(500, err);
      }
    },
  }),
);
