import 'dotenv/config';
import { createApp } from './app.js';
import { EnvHelper } from './config/index.js';

async function start(): Promise<void> {
  const app = await createApp();
  const port = EnvHelper.getPort();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start();
