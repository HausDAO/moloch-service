import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { sendError } from '../lib/http-errors.js';
import { pinJson } from '../lib/pinata.js';

const pinJsonBody = z.object({
  name: z.string().min(1).max(200).optional(),
  data: z.custom<unknown>((value) => value !== undefined, 'data is required'),
});

export async function registerPinRoutes(app: FastifyInstance, config: AppConfig) {
  app.post('/pin/json', async (request, reply) => {
    try {
      const body = pinJsonBody.parse(request.body) as { name?: string; data: unknown };
      return await pinJson(config, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
