import { App } from './src/core/app';
import { env } from './src/utils/env';

async function startServer() {
  const app = new App();
  await app.initialize();

  Bun.serve({
    port: parseInt(env.PORT),
    async fetch(req) {
      return app.handleRequest(req);
    },
  });

  console.log(`Server running on port ${env.PORT}`);
}

startServer().catch(console.error);