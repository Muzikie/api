import { factories } from '@strapi/strapi';
import { createTransaction, Commands } from '../../../utils/network';

export default factories.createCoreService('api::project.project', () =>  ({
  async createCampaign({ account, softGoal, hardGoal, deadline, apiId }) {
    const params = {
      apiId,
      softGoal,
      hardGoal,
      deadline,
    };

    const txResult = await createTransaction(Commands.Create, params, account);
    return txResult;
  },

  async publish({ account, campaignId }) {
    const params = {
      campaignId,
    };

    const txResult = await createTransaction(Commands.Publish, params, account);
    return txResult;
  },

  async payout({ account, campaignId }) {
    const params = {
      campaignId,
    };

    const txResult = await createTransaction(Commands.Payout, params, account);
    return txResult;
  },
}));
