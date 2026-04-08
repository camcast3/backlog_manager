import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';

import gamesRoutes from './routes/games.js';
import backlogRoutes from './routes/backlog.js';
import progressRoutes from './routes/progress.js';
import vibeQuestionsRoutes from './routes/vibeQuestions.js';
import searchRoutes from './routes/search.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

export function buildServer(opts = {}) {
  const fastify = Fastify({
    logger: opts.logger ?? { level: process.env.NODE_ENV === 'test' ? 'silent' : 'info' },
    ...opts,
  });

  fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // API routes
  fastify.register(gamesRoutes, { prefix: '/api/games' });
  fastify.register(backlogRoutes, { prefix: '/api/backlog' });
  fastify.register(progressRoutes, { prefix: '/api/progress' });
  fastify.register(vibeQuestionsRoutes, { prefix: '/api/vibe-questions' });
  fastify.register(searchRoutes, { prefix: '/api/search' });

  return fastify;
}

// Start the server when this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = buildServer();
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🎮 Backlog Manager API running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
