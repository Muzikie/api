export enum SupportedBlockchains {
  Solana = 'Solana',
}

export interface EncryptedSecretKeyMeta {
  iv: string;
  encryptedData: string;
}
