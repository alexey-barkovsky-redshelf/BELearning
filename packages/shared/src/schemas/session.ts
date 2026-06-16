import { z } from 'zod';

const storedUserSessionSchema = z
  .object({
    token: z.string().min(1),
    userId: z.string().min(1),
    email: z.string().min(1),
    role: z.string().optional(),
  })
  .transform((d) => ({
    token: d.token,
    userId: d.userId,
    email: d.email,
    role: d.role !== undefined && d.role.length > 0 ? d.role : 'user',
  }));

export type StoredUserSession = z.output<typeof storedUserSessionSchema>;

export function parseStoredUserSessionJson(json: string): StoredUserSession | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  const result = storedUserSessionSchema.safeParse(data);
  return result.success ? result.data : null;
}
