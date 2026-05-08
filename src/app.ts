import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import type { AppConfig } from './config.js';
import { createGraphClient } from './lib/graph.js';
import { registerDaoRoutes } from './routes/dao.js';
import { registerGraphRoutes } from './routes/graph.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerPinRoutes } from './routes/pin.js';

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: true,
    bodyLimit: 5 * 1024 * 1024,
  });

  await app.register(cors, {
    origin: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 10,
    },
  });

  const graph = createGraphClient(config);

  await registerHealthRoutes(app, config);
  await registerDaoRoutes(app, graph);
  await registerGraphRoutes(app, graph);
  await registerPinRoutes(app, config);

  return app;
}
