/**
 * Search routes — HLTB game search + RAWG cover image search.
 */
import { searchGames, searchHltb, searchCovers } from '../services/gameSearchService.js';

export default async function searchRoutes(fastify) {
  // Combined search: HLTB times + RAWG covers merged
  fastify.get('/games', async (request, reply) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2) {
      reply.code(400);
      return { error: 'Query parameter "q" must be at least 2 characters' };
    }
    const results = await searchGames(q);
    return { query: q, count: results.length, results };
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

  // RAWG cover-only search
  fastify.get('/covers', async (request, reply) => {
    const { q } = request.query;
    if (!q || q.trim().length < 2) {
      reply.code(400);
      return { error: 'Query parameter "q" must be at least 2 characters' };
    }
    const results = await searchCovers(q);
    return { query: q, count: results.length, results };
  });
}
