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

  const name = normalizeJsonName(input.name || `moloch-artifact-${Date.now()}.json`);
  const json = JSON.stringify(input.data, null, 2);
  const form = new FormData();
  form.append('file', new Blob([json], { type: 'application/json' }), name);

  const response = await fetch('https://uploads.pinata.cloud/v3/files', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.pinataJwt}`,
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HttpError(response.status, `Pinata v3 file upload failed: ${text}`);
  }

  const body = await response.json() as PinataResponse;
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
