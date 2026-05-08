import type { AppConfig } from '../config.js';
import { HttpError } from './http-errors.js';

type PinJsonInput = {
  name?: string;
  data: unknown;
};

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

export type PinResult = {
  cid: string;
  uri: string;
  gatewayUrl: string;
  size: number;
  timestamp: string;
};

export async function pinJson(config: AppConfig, input: PinJsonInput): Promise<PinResult> {
  if (!config.pinataJwt) {
    throw new HttpError(503, 'Pinning is not configured. Set PINATA_JWT.');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.pinataJwt}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      pinataMetadata: input.name ? { name: input.name } : undefined,
      pinataContent: input.data,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HttpError(response.status, `Pinata pinJSONToIPFS failed: ${text}`);
  }

  const body = await response.json() as PinataResponse;
  return {
    cid: body.IpfsHash,
    uri: `ipfs://${body.IpfsHash}`,
    gatewayUrl: `${config.ipfsGatewayUrl}${body.IpfsHash}`,
    size: body.PinSize,
    timestamp: body.Timestamp,
  };
}
