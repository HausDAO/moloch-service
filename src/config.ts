export const BASE_CHAIN_ID = 8453;
export const DAOHAUS_BASE_SUBGRAPH_ID = '7yh4eHJ4qpHEiLPAk9BXhL5YgYrTrRE6gWy8x4oHyAqW';
export const THE_GRAPH_GATEWAY = 'https://gateway.thegraph.com/api';

export type AppConfig = {
  host: string;
  port: number;
  graphUrl?: string;
  graphApiKey?: string;
  pinataJwt?: string;
  ipfsGatewayUrl: string;
};

export function getConfig(env = process.env): AppConfig {
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return {
    host: env.HOST || '0.0.0.0',
    port,
    graphUrl: env.GRAPH_URL,
    graphApiKey: env.GRAPH_API_KEY,
    pinataJwt: env.PINATA_JWT,
    ipfsGatewayUrl: normalizeGateway(env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/'),
  };
}

export function graphEndpoint(config: Pick<AppConfig, 'graphUrl' | 'graphApiKey'>): string {
  if (config.graphUrl) return config.graphUrl;
  if (!config.graphApiKey) {
    throw new Error('Graph is not configured. Set GRAPH_URL or GRAPH_API_KEY.');
  }
  return `${THE_GRAPH_GATEWAY}/${config.graphApiKey}/subgraphs/id/${DAOHAUS_BASE_SUBGRAPH_ID}`;
}

function normalizeGateway(value: string): string {
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '');
  const withIpfsPath = /\/ipfs$/i.test(withoutTrailingSlash) ? withoutTrailingSlash : `${withoutTrailingSlash}/ipfs`;
  return `${withIpfsPath}/`;
}
