import { Wallet, Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './crowdfunding.json';



export const getProgramDetails = (keyPair)  => {
  const connection = new Connection(process.env.NETWORK_URL, 'confirmed');
  const provider = new AnchorProvider(connection, new Wallet(keyPair), {
    preflightCommitment: 'confirmed',
  });
  // @ts-expect-error
  return new Program(idl, provider);
};

export const getProjectPDA = (id: string, program) => {
  const [projectPDA] = PublicKey.findProgramAddressSync(
    [new BN(id).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  return projectPDA;
};
