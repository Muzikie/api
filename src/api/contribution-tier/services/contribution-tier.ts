import { factories } from '@strapi/strapi';
import { createTransaction, Commands } from '../../../utils/network';

export default factories.createCoreService('api::contribution-tier.contribution-tier', () =>  ({
  async registerOnChain({ account, tierId, campaignId, amount }) {
    const params = {
      campaignId,
      tierId,
      amount,
    };

    const txResult = await createTransaction(Commands.Create, params, account);
    return txResult;
  },
}));
