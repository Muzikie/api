export enum SupportedBlockchains {
  Solana = 'Solana',
  Klayr = 'Klayr',
}

export interface EncryptedSecretKeyMeta {
  iv: string;
  encryptedData: string;
}
