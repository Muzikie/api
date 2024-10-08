import { Wallet, Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './crowdfunding.json';
import {Crowdfunding} from './crowdfunding';



export const getProgramDetails = (keyPair)  => {
  const connection = new Connection(process.env.NETWORK_URL, 'confirmed');
  const provider = new AnchorProvider(connection, new Wallet(keyPair), {
    preflightCommitment: 'confirmed',
  });
  return new Program(idl as Crowdfunding, provider);
};

export const getProjectPDA = (id: string, program) => {
  const [projectPDA] = PublicKey.findProgramAddressSync(
    [new BN(id).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  return projectPDA;
};
