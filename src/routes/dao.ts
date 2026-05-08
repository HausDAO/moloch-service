import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { BASE_CHAIN_ID } from '../config.js';
import type { GraphClient } from '../lib/graph.js';
import { sendError } from '../lib/http-errors.js';
import { addressSchema, chainIdSchema, graphTableSchema, lowerAddress, paginationSchema } from '../lib/schema.js';

const chainDaoParams = z.object({
  chainId: chainIdSchema,
  dao: addressSchema.transform(lowerAddress),
});

export async function registerDaoRoutes(app: FastifyInstance, graph: GraphClient) {
  app.get('/dao/:chainId/:dao', async (request, reply) => {
    try {
      const params = chainDaoParams.parse(request.params);
      requireBase(params.chainId);
      return await graph.dao(params.dao);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get('/dao/:chainId/:dao/proposals', async (request, reply) => {
    try {
      const params = chainDaoParams.parse(request.params);
      const query = paginationSchema.parse(request.query);
      requireBase(params.chainId);
      return await graph.proposals(params.dao, query.first, query.skip);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get('/dao/:chainId/:dao/proposals/:proposalId', async (request, reply) => {
    try {
      const params = chainDaoParams.extend({
        proposalId: z.coerce.string().regex(/^\d+$/),
      }).parse(request.params);
      requireBase(params.chainId);
      return await graph.proposal(params.dao, params.proposalId);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get('/dao/:chainId/:dao/members', async (request, reply) => {
    try {
      const params = chainDaoParams.parse(request.params);
      const query = paginationSchema.parse(request.query);
      requireBase(params.chainId);
      return await graph.members(params.dao, query.first, query.skip);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get('/dao/:chainId/:dao/records', async (request, reply) => {
    try {
      const params = chainDaoParams.parse(request.params);
      const query = paginationSchema.extend({
        table: graphTableSchema.default('communityMemory'),
      }).parse(request.query);
      requireBase(params.chainId);
      return await graph.records(params.dao, query.table, query.first, query.skip);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}

function requireBase(chainId: number) {
  if (chainId !== BASE_CHAIN_ID) {
    throw new Error(`Unsupported chainId ${chainId}. This service currently supports Base ${BASE_CHAIN_ID}.`);
  }
}
