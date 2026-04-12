import getDb from '../db/index.js';
import { onGameAdded } from '../services/gamificationService.js';
import { searchCovers } from '../services/gameSearchService.js';

export default async function bulkRoutes(fastify) {
  const sql = getDb();

  // POST /api/bulk/import — batch import games by title + platform
  fastify.post('/import', async (req, reply) => {
    const { games } = req.body || {};
    if (!Array.isArray(games) || games.length === 0) {
      return reply.code(400).send({ error: 'games array required' });
    }
    if (games.length > 200) {
      return reply.code(400).send({ error: 'Maximum 200 games per batch' });
    }

    const results = { imported: 0, skipped: 0, errors: [] };

    for (const entry of games) {
      const title = (entry.title || '').trim();
      const platform = (entry.platform || 'PC').trim();
      if (!title) {
        results.errors.push({ title: entry.title, error: 'Empty title' });
        continue;
      }

      try {
        // Try to find IGDB cover art
        let coverUrl = '';
        try {
          const covers = await searchCovers(title);
          if (covers.length > 0) coverUrl = covers[0].cover_image_url || '';
        } catch { /* non-critical */ }

        // Upsert game
        const [game] = await sql`
          INSERT INTO games (title, platform, cover_image_url)
          VALUES (${title}, ${platform}, ${coverUrl})
          ON CONFLICT (title, platform) DO UPDATE SET
            cover_image_url = COALESCE(NULLIF(games.cover_image_url, ''), EXCLUDED.cover_image_url)
          RETURNING id
        `;

        // Check for existing backlog item
        const existing = await sql`
          SELECT id FROM backlog_items WHERE game_id = ${game.id} LIMIT 1
        `;
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Create backlog item
        await sql`
          INSERT INTO backlog_items (game_id, status, hours_played, personal_notes, date_added, last_activity_date)
          VALUES (${game.id}, 'want_to_play', 0, ${`Bulk imported (${platform})`}, NOW(), NOW())
        `;

        try { await onGameAdded(); } catch { /* non-critical */ }
        results.imported++;
      } catch (err) {
        results.errors.push({ title, error: err.message });
      }
    }

    return results;
  });
}
