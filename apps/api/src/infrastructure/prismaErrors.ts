import { Prisma } from '@prisma/client';

export const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export function isPrismaUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_UNIQUE_CONSTRAINT_VIOLATION
  );
}
