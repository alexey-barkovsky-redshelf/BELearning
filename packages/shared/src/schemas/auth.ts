import { z } from 'zod';
import { nonEmptyString } from './common';

const emailCredential = z.string().trim().email().transform((s) => s.toLowerCase());

export const loginBodySchema = z.object({
  email: emailCredential,
  password: nonEmptyString,
});

export const registerBodySchema = z.object({
  email: emailCredential,
  password: nonEmptyString,
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
