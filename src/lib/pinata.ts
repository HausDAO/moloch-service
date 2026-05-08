import { PinataSDK } from 'pinata';
import type { AppConfig } from '../config.js';
import { HttpError } from './http-errors.js';

type PinJsonInput = {
  name?: string;
  data: unknown;
};

type PinataResponse = {
  id: string;
  name: string;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
};

export type PinResult = {
  id: string;
  name: string;
  cid: string;
  uri: string;
  gatewayUrl: string;
  size: number;
  numberOfFiles: number;
  mimeType: string;
  groupId: string | null;
};

export async function pinJson(config: AppConfig, input: PinJsonInput): Promise<PinResult> {
  if (!config.pinataJwt) {
    throw new HttpError(503, 'Pinning is not configured. Set PINATA_JWT.');
  }

  const pinata = new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: gatewayHost(config.ipfsGatewayUrl),
  });

  let body: PinataResponse;
  try {
    body = await pinata.upload.public
      .json(toJsonObject(input.data))
      .name(normalizeJsonName(input.name || `moloch-artifact-${Date.now()}.json`)) as PinataResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HttpError(502, `Pinata v3 JSON upload failed: ${message}`);
  }

  return {
    id: body.id,
    name: body.name,
    cid: body.cid,
    uri: `ipfs://${body.cid}`,
    gatewayUrl: `${config.ipfsGatewayUrl}${body.cid}`,
    size: body.size,
    numberOfFiles: body.number_of_files,
    mimeType: body.mime_type,
    groupId: body.group_id,
  };
}

function normalizeJsonName(name: string): string {
  const trimmed = name.trim() || `moloch-artifact-${Date.now()}.json`;
  return trimmed.toLowerCase().endsWith('.json') ? trimmed : `${trimmed}.json`;
}

function gatewayHost(gatewayUrl: string): string {
  const url = new URL(gatewayUrl);
  return url.host;
}

function toJsonObject(value: unknown): object {
  if (value !== null && typeof value === 'object') return value;
  return { value };
}
