import cors from 'cors';
import express, { type Express } from 'express';
import { AppRouter } from './routes/index.js';
import { domainErrorMiddleware } from './shared/middleware/domainErrorMiddleware.js';

export async function createApp(): Promise<Express> {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const appRouter = new AppRouter();
  app.use(await appRouter.getRouter());

  app.use(domainErrorMiddleware);

  return app;
}
