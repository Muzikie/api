export const chainID = Buffer.from(process.env.CHAIN_ID as string, 'hex');
export enum endpoints {
  getAuthAccount ='auth_getAuthAccount',
  postTransaction ='txpool_postTransaction',
};
export const DERIVATION_PATH = "m/44'/134'/0";
export const klayrBaseUrl = process.env.NEXT_PUBLIC_KLAYR_URL ?? 'ws://localhost:7887/rpc-ws';
export enum Module {
  Campaign = 'campaign',
}
export enum Command {
  Create = 'create',
  AddTier = 'addTier',
  Publish = 'publish',
  Payout = 'payout',
  Contribute = 'contribute',
  Reimburse = 'reimburse',
}