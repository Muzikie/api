/**
 * profile service
 */

import { factories } from '@strapi/strapi';
import { passphrase, cryptography } from 'klayr-sdk';
import crypto from 'crypto';
import { encryptPrivateKey } from '../../../utils/crypto';
import { SupportedBlockchains } from '../../../utils/types';
import { DERIVATION_PATH } from '../../../utils/network';

export default factories.createCoreService('api::profile.profile', {
  addProfileAndWallet: async (userId: string) => {
    try {
      const now = new Date().getTime();

      // Create a profile for the new user
      await strapi.documents('api::profile.profile').create({
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
      const phrase = passphrase.Mnemonic.generateMnemonic();
      const privateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(phrase, DERIVATION_PATH)
      const publicKey = cryptography.ed.getPublicKeyFromPrivateKey(privateKey);
      const address = cryptography.address.getKlayr32AddressFromPublicKey(publicKey);
      const iv = crypto.randomBytes(16);
      await strapi.documents('api::wallet.wallet').create({
        data: {
          public_key: publicKey.toString('hex'),
          encrypted_private_key: encryptPrivateKey(privateKey, iv),
          address: address,
          blockchain: SupportedBlockchains.Klayr,
          encryption_metadata: {},
          users_permissions_user: userId,
          createdAt: now,
          publishedAt: now,
        },
      });

      strapi.log.info(`Profile and wallet created for user ${userId}`);
    } catch (error) {
      strapi.log.error('Error during profile or wallet creation:', error);
    }
  },
});
