import cors from 'cors';
import express, { type Express } from 'express';
import { registerRoutes } from './routes/index.js';

export async function createApp(): Promise<Express> {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(await registerRoutes());

  return app;
}
