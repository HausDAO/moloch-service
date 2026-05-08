import { z } from 'zod';

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Expected EVM address.');

export const chainIdSchema = z.coerce.number().int().positive();

export const graphTableSchema = z.string().min(1).max(80).regex(/^[A-Za-z0-9_.:-]+$/);

export const paginationSchema = z.object({
  first: z.coerce.number().int().min(1).max(1000).default(100),
  skip: z.coerce.number().int().min(0).max(100000).default(0),
});

export function lowerAddress(value: string): string {
  return value.toLowerCase();
}
