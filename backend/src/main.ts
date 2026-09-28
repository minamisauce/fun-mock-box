import { serve } from '@hono/node-server';
import { app } from './app';
import { PORT } from './env';
import { tunePragmas } from './shared/prisma';

await tunePragmas();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`backend listening on http://localhost:${info.port}`);
});
