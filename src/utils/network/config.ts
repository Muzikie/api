export const chainID = Buffer.from(process.env.CHAIN_ID as string, 'hex');
export enum endpoints {
  getAuthAccount ='auth_getAuthAccount',
  postTransaction ='txpool_postTransaction',
};
export const DERIVATION_PATH = "m/44'/134'/0";