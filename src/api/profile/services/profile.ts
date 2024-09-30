/**
 * profile service
 */

import { factories } from '@strapi/strapi';
import {Keypair} from '@solana/web3.js';
import crypto from 'crypto';

import {encryptPrivateKey} from '../../../utils/crypto';
import {SupportedBlockchains} from '../../../utils/types';

export default factories.createCoreService('api::profile.profile', {
  addProfileAndWallet: async (userId: string) => {
    try {
      const now = new Date().getTime();
  
      // Create a profile for the new user
      await strapi.entityService.create('api::profile.profile', {
        data: {
          first_name: '',
          las_name: '',
          points: 0,
          users_permissions_user: userId,
          createdAt: now,
          publishedAt: now,
        },
      });
  
      // Create a wallet for the new user
      const wallet = Keypair.generate();
      const iv = crypto.randomBytes(16);
      const privateKey = wallet.secretKey.toString();
      await strapi.entityService.create('api::wallet.wallet', {
        data: {
          public_key: wallet.publicKey.toString(),
          encrypted_private_key: encryptPrivateKey(privateKey, iv),
          address: wallet.publicKey.toBase58(),
          blockchain: SupportedBlockchains.Solana,
          encryption_metadata: {},
          users_permissions_user: userId,
          createdAt: now,
          publishedAt: now,
        },
      });
  
      strapi.log.info(`Profile and wallet created for user ${userId}`);
    } catch (error) {
      strapi.log.error('Error during profile or wallet creation:', error);
      // @todo we should delete the user and inform the client about the error
    }
  },
});
