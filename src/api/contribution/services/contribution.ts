import { factories } from '@strapi/strapi';
import { createTransaction, Commands } from '../../../utils/network';

export default factories.createCoreService('api::contribution.contribution', () =>  ({
  async registerOnChain({ account, tierId, campaignId }) {
    const params = {
      campaignId,
      tierId,
    };

    const txResult = await createTransaction(Commands.Create, params, account);
    return txResult;
  },
}));
