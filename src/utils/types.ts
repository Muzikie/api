export enum SupportedBlockchains {
  Solana = 'Solana',
  Klayr = 'Klayr',
}

export interface EncryptedSecretKeyMeta {
  iv: string;
  encryptedData: string;
}

interface KlayrSuccessResponse<T> {
  success: true;
  data: T;
}
interface KlayrFailureResponse {
  success: false;
  error: string;
}

export type KlayrResponse<T> = KlayrSuccessResponse<T> | KlayrFailureResponse;

export interface getCampaignIdProps {
	apiId: number;
	address: Buffer;
}

export interface getContributionIdProps {
	campaignId: string;
	tierId: number;
	address: Buffer;
}
