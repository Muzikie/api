import { Transaction, codec } from 'klayr-sdk';
import WebSocket from 'ws';

import { endpoints, chainID } from './config';
import { schemas } from './schemas';
import { decryptPrivateKey } from '../crypto';

const WS_API_ENDPOINT = process.env.WS_API_ENDPOINT;
if (!WS_API_ENDPOINT) {
  throw new Error('Missing env variable WS_API_ENDPOINT');
}

interface JsonRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: { code: number; message: string };
}

interface AuthResult {
  nonce: number;
}

interface PostTransactionResult {
  transactionId: string;
}

export interface EncryptedAccount {
  address: string;
  encrypted_private_key: {
    encryptedData: string;
    iv: string;
  };
  public_key?: string;
}

export enum Commands {
  Create = 'create',
  AddTier = 'addTier',
  Publish = 'publish',
  Payout = 'payout',
  Contribute = 'contribute',
  Reimburse = 'reimburse',
}

let requestId = 1;

export async function invokeEndpoint<T>(
  method: endpoints,
  params: Record<string, unknown>,
): Promise<T> {
  const ws = new WebSocket(WS_API_ENDPOINT);

  requestId = requestId < 1000 ? requestId + 1 : 1;

  return new Promise((resolve, reject) => {
    ws.on('open', () => {
      const payload: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: requestId++,
        method,
        params,
      };

      ws.send(JSON.stringify(payload));
    });

    ws.on('message', (data) => {
      const response: JsonRpcResponse = JSON.parse(data.toString());
      if (response.id !== requestId - 1) {
        return; // Ignore responses with mismatched IDs
      }

      if (response.error) {
        reject(new Error('Broadcast error: ' + response.error.message));
      } else {
        resolve(response.result as T);
      }

      ws.close();
    });

    ws.on('error', (err) => {
      console.log('WS Error', err);
      reject(err);
    });
  });
}

export async function createTransaction(command: Commands, params: Record<string, unknown>, account: EncryptedAccount) {
  if (!schemas[command]) {
    throw new Error('Error creating tx: Command is unknown')
  }

  const authResult = await invokeEndpoint<AuthResult>(endpoints.getAuthAccount, { address: account.address });
  if (!Object.keys(authResult).includes('nonce')) {
    throw new Error('Error creating tx: Failed to retrieve account nonce')
  }

  const schema = schemas[command];
  const tx = new Transaction({
    module: 'campaign',
    command,
    fee: command === Commands.Contribute ? BigInt(9000000) : BigInt(200000),
    params: codec.encodeJSON(schema, params),
    nonce: BigInt(authResult.nonce),
    senderPublicKey: Buffer.from(account.public_key, 'hex'),
    signatures: [],
  });

  const privateKey = decryptPrivateKey(account.encrypted_private_key.encryptedData, account.encrypted_private_key.iv)
  tx.sign(chainID, privateKey);

  const transaction = tx.getBytes().toString('hex');
  const txResult = await invokeEndpoint<PostTransactionResult>(endpoints.postTransaction, { transaction })
  return txResult;
}
