import type { AuthContext } from './authContext.js';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
      auth?: AuthContext;
    }
  }
}

export {};
