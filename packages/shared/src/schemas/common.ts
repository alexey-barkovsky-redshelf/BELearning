import { z } from 'zod';

export function isEmptyQueryInput(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export const nonEmptyString = z.string().trim().min(1);

export const idParamSchema = z.object({
  id: nonEmptyString,
});
