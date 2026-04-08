/**
 * Search routes — HLTB game search + IGDB cover image search.
 */
import { searchGames, searchHltb, searchCovers, isIgdbConfigured } from '../services/gameSearchService.js';

export default async function searchRoutes(fastify) {
  // Status: check which search providers are available
  fastify.get('/status', async () => ({
    hltb: true,
    igdb: isIgdbConfigured(),
    message: isIgdbConfigured()
      ? 'All search providers configured'
      : 'IGDB not configured — set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET for cover images',
  }));

  // Combined search: HLTB times + IGDB covers merged
  fastify.get('/games', async (request, reply) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2) {
      reply.code(400);
      return { error: 'Query parameter "q" must be at least 2 characters' };
    }
    const results = await searchGames(q);
    const response = { query: q, count: results.length, results };
    if (!isIgdbConfigured()) {
      response.warning = 'IGDB not configured — cover images unavailable. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.';
    }
    return response;
  });

  // HLTB-only search
  fastify.get('/hltb', async (request, reply) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2) {
      reply.code(400);
      return { error: 'Query parameter "q" must be at least 2 characters' };
    }
    const results = await searchHltb(q);
    return { query: q, count: results.length, results };
  });

  // IGDB cover-only search
  fastify.get('/covers', async (request, reply) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2) {
      reply.code(400);
      return { error: 'Query parameter "q" must be at least 2 characters' };
    }
    if (!isIgdbConfigured()) {
      return { query: q, count: 0, results: [], warning: 'IGDB not configured — set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET' };
    }
    const results = await searchCovers(q);
    return { query: q, count: results.length, results };
  });
}
