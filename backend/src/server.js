import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';

import gamesRoutes from './routes/games.js';
import backlogRoutes from './routes/backlog.js';
import progressRoutes from './routes/progress.js';
import vibeQuestionsRoutes from './routes/vibeQuestions.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import recommendationRoutes from './routes/recommendations.js';
import sessionRoutes from './routes/sessions.js';

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
  fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
  fastify.register(recommendationRoutes, { prefix: '/api/recommendations' });
  fastify.register(sessionRoutes, { prefix: '/api/backlog' });

  return fastify;
}

// Start the server when this file is run directly
const __filename = new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
if (process.argv[1].replace(/\\/g, '/') === __filename) {
  const server = buildServer();
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🎮 Backlog Manager API running at http://${HOST}:${PORT}`);
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      console.log('⚠️  IGDB not configured — game cover images will be unavailable.');
      console.log('   Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in your .env file.');
      console.log('   Register at https://dev.twitch.tv/console/apps');
    }
  }catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
