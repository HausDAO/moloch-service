import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function registerHealthRoutes(app: FastifyInstance, config: AppConfig) {
  app.get('/health', async () => ({
    ok: true,
    service: 'moloch-service',
  }));

  app.get('/capabilities', async () => ({
    service: 'moloch-service',
    network: {
      defaultChainId: 8453,
      supportedChainIds: [8453],
    },
    graph: {
      configured: Boolean(config.graphUrl || config.graphApiKey),
      defaultSubgraph: '7yh4eHJ4qpHEiLPAk9BXhL5YgYrTrRE6gWy8x4oHyAqW',
    },
    pinning: {
      configured: Boolean(config.pinataJwt),
      json: Boolean(config.pinataJwt),
      files: false,
      directories: false,
    },
    signing: {
      handledByService: false,
      note: 'The service never accepts private keys. Agents sign locally.',
    },
  }));
}
