/**
 * project service
 */

import { factories } from '@strapi/strapi';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../../../../config/solana/crowdfunding.json';

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID);
const SOLANA_CLUSTER_URL = process.env.SOLANA_CLUSTER_URL;

export default factories.createCoreService('api::project.project', ({ strapi }) => ({
  // Override default service functions if necessary
  async interactWithSolanaProgram(wallet: any, instructionData: any) {
    try {
      // Setup connection to Solana
      const connection = new Connection(SOLANA_CLUSTER_URL, 'confirmed');

      // Load provider with wallet (this can be a keypair for backend wallets or user wallets from frontend)
      const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: 'processed',
      });

      // Fetch the IDL for your program
      const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
      const program = new anchor.Program(idl, PROGRAM_ID, provider);

      // Interact with the program method
      const tx = await program.methods
        .yourMethodName(instructionData) // Change to your program method
        .accounts({
          // Specify the accounts needed for your transaction, e.g.:
          // user: wallet.publicKey,
        })
        .signers([]) // Add signers if necessary
        .rpc(); // Send the transaction

      return tx; // Return the transaction ID
    } catch (error) {
      strapi.log.error('Failed to interact with Solana program:', error);
      throw new Error('Interaction failed: ' + error.message);
    }
  },
}));
