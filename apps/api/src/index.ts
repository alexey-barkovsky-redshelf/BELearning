import 'dotenv/config';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;

createApp().then((app) => {
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
});
