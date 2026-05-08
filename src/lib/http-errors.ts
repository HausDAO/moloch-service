import type { FastifyReply } from 'fastify';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  const message = error instanceof Error ? error.message : 'Unexpected error.';
  return reply.status(500).send({ error: message });
}
