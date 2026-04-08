import { z } from 'zod';
import { nonEmptyString } from './common';

export const loginBodySchema = z.object({
  loginId: nonEmptyString,
  password: nonEmptyString,
});

export const registerBodySchema = z.object({
  loginId: nonEmptyString,
  password: nonEmptyString,
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
