declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
      auth?: { userId: string; loginId: string; role: string };
    }
  }
}

export {};
