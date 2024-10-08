/**
 * project service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::project.project');


// import { factories } from '@strapi/strapi';
// import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
// import { PublicKey, TransactionInstruction } from '@solana/web3.js';
// import { Buffer } from 'buffer';

// // Make sure to load your program IDL and program key
// import idl from './crowdfunding.json';
// import { Crowdfunding } from './crowdfunding';
// import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';

// const idl_string= JSON.stringify(idl);
// const idl_object = JSON.parse(idl_string);
// const programId = new PublicKey(idl.address);
// const { SystemProgram } = web3;

// export default factories.createCoreService('api::project.project', ({ strapi }) => ({
//   async createProject(projectIdInput: number, softCapInput: number, hardCapInput: number, deadlineInput: number) {
//     try {



//       // Setup provider and program
//       const provider = AnchorProvider.env();
//       const program = new Program(idl, new PublicKey('6BsMtttdteCnV3b6XmxTiLS9VQfb57yu7cRH8SKfP4u3'), provider);

//       const owner = provider.wallet.publicKey;
//       const muzikieAddress = new PublicKey("3fh3nfHi22i93zq971bJFEC5o1NCaQYND4g33yMQS2ko");

//       // Convert inputs to anchor types (BN, etc.)
//       const projectId = new BN(projectIdInput);
//       const softCap = new BN(softCapInput);
//       const hardCap = new BN(hardCapInput);
//       const deadline = new BN(deadlineInput);

//       // Find the program derived address (PDA) for the project
//       const [projectPDA] = await PublicKey.findProgramAddress(
//         [Buffer.from(projectId.toArrayLike(Buffer, 'le', 8))],
//         program.programId
//       );

//       // Build the transaction instruction to create the project
//       const tx = new web3.Transaction();
//       tx.add(
//         program.instruction.initProject(
//           projectId,
//           softCap,
//           hardCap,
//           deadline,
//           owner,
//           muzikieAddress,
//           {
//             accounts: {
//               owner: owner,
//               projectState: projectPDA,
//               systemProgram: SystemProgram.programId,
//             },
//           }
//         )
//       );

//       // Send the transaction
//       const signature = await provider.sendAndConfirm(tx);

//       // Log the transaction signature and return the project PDA
//       console.log('Transaction signature', signature);

//       return {
//         message: 'Project created successfully',
//         projectPDA: projectPDA.toString(),
//         signature: signature,
//       };
//     } catch (error) {
//       strapi.log.error('Error creating project on Solana blockchain:', error);
//       throw new Error('Failed to create project on blockchain.');
//     }
//   }
// }));
