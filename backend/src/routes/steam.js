import getDb from '../db/index.js';
import { resolveVanityUrl, fetchSteamLibrary, suggestStatus } from '../services/steamService.js';
import { onGameAdded } from '../services/gamificationService.js';

export default async function steamRoutes(fastify) {
  const sql = getDb();

  // GET /api/steam/status — check if Steam API is configured
  fastify.get('/status', async () => ({
    configured: !!process.env.STEAM_API_KEY,
  }));

  // GET /api/steam/resolve?username=xxx — resolve vanity URL to Steam ID
  fastify.get('/resolve', async (req, reply) => {
    const { username } = req.query;
    if (!username) return reply.code(400).send({ error: 'username query param required' });

    try {
      const steamId = await resolveVanityUrl(username);
      return { steamId };
    } catch (err) {
      return reply.code(400).send({ error: err.message });
    }
  });

  // GET /api/steam/library?steam_id=xxx — fetch and categorize Steam library
  fastify.get('/library', async (req, reply) => {
    const { steam_id } = req.query;
    if (!steam_id) return reply.code(400).send({ error: 'steam_id query param required' });

    try {
      const library = await fetchSteamLibrary(steam_id);

      // Check which games already exist in our DB
      const existingGames = await sql`
        SELECT LOWER(title) AS title_lower FROM games WHERE platform ILIKE '%PC%' OR platform ILIKE '%Steam%'
      `;
      const existingSet = new Set(existingGames.map((g) => g.title_lower));

      // Mark games as already imported or not
      for (const cat of Object.values(library.categories)) {
        for (const game of cat.games) {
          game.already_imported = existingSet.has(game.name.toLowerCase());
        }
      }

      return library;
    } catch (err) {
      return reply.code(400).send({ error: err.message });
    }
  });

  // POST /api/steam/import — batch import selected games
  fastify.post('/import', async (req, reply) => {
    const { games } = req.body || {};
    if (!Array.isArray(games) || games.length === 0) {
      return reply.code(400).send({ error: 'games array required' });
    }

    const results = { imported: 0, skipped: 0, errors: [] };

    for (const steamGame of games) {
      try {
        // Upsert game into games table
        const [game] = await sql`
          INSERT INTO games (title, platform, cover_image_url)
          VALUES (${steamGame.name}, ${'PC (Steam)'}, ${steamGame.header_url})
          ON CONFLICT (title, platform) DO UPDATE SET
            cover_image_url = COALESCE(NULLIF(games.cover_image_url, ''), ${steamGame.header_url})
          RETURNING id
        `;

        // Check if backlog item already exists
        const existing = await sql`
          SELECT id FROM backlog_items WHERE game_id = ${game.id} LIMIT 1
        `;

        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Create backlog item with auto-detected status
        const status = suggestStatus(steamGame.playtime_minutes || 0);
        const hoursPlayed = steamGame.playtime_hours || 0;

        await sql`
          INSERT INTO backlog_items (game_id, status, hours_played, personal_notes, date_added, last_activity_date)
          VALUES (
            ${game.id},
            ${status},
            ${hoursPlayed},
            ${`Imported from Steam (${hoursPlayed}h played)`},
            NOW(),
            NOW()
          )
        `;

        // Award XP for adding game (but quietly — no celebration spam)
        try { await onGameAdded(); } catch { /* non-critical */ }

        results.imported++;
      } catch (err) {
        results.errors.push({ name: steamGame.name, error: err.message });
      }
    }

    return results;
  });
}
