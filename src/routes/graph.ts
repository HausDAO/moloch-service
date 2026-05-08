import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { GraphClient } from '../lib/graph.js';
import { sendError } from '../lib/http-errors.js';

const queryBody = z.object({
  query: z.string().min(1).max(20000),
  variables: z.record(z.unknown()).optional(),
});

export async function registerGraphRoutes(app: FastifyInstance, graph: GraphClient) {
  app.post('/graph/query', async (request, reply) => {
    try {
      const body = queryBody.parse(request.body);
      rejectUnsafeGraphQuery(body.query);
      return await graph.query(body.query, body.variables);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}

function rejectUnsafeGraphQuery(query: string) {
  if (/\bmutation\b/i.test(query)) {
    throw new Error('Graph mutations are not allowed.');
  }
}
