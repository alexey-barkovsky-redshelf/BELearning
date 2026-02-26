import 'dotenv/config';
import { createApp } from './app.js';
import { getPort } from './config/index.js';

async function start(): Promise<void> {
  const app = await createApp();
  const port = getPort();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start();
