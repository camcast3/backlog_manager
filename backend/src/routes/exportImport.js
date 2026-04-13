import getDb from '../db/index.js';

export default async function exportImportRoutes(fastify) {
  const sql = getDb();

  // GET /backlog/export?format=json|csv
  fastify.get('/export', async (req, reply) => {
    const format = (req.query.format || 'json').toLowerCase();

    const items = await sql`
      SELECT
        g.title AS game_title,
        g.platform,
        g.genre,
        bi.status,
        bi.priority,
        bi.rating,
        bi.hours_played,
        bi.personal_notes,
        bi.why_i_want_to_play,
        g.vibe_intensity,
        vp.mood_match,
        vp.tags AS vibe_tags,
        bi.date_added
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      LEFT JOIN vibe_profiles vp ON vp.backlog_item_id = bi.id
      ORDER BY bi.date_added DESC
    `;

    if (format === 'csv') {
      const headers = [
        'game_title', 'platform', 'genre', 'status', 'priority', 'rating',
        'hours_played', 'personal_notes', 'why_i_want_to_play',
        'vibe_intensity', 'mood_match', 'vibe_tags', 'date_added',
      ];

      const escapeCsv = (val) => {
        if (val == null) return '';
        const str = Array.isArray(val) ? val.join('; ') : String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = items.map((item) =>
        headers.map((h) => escapeCsv(item[h])).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="backlog.csv"');
      return csv;
    }

    // Default: JSON
    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', 'attachment; filename="backlog.json"');
    return items;
  });

  // POST /backlog/import
  fastify.post('/import', async (req, reply) => {
    const items = req.body;

    if (!Array.isArray(items)) {
      reply.code(400);
      return { error: 'Request body must be an array of backlog items' };
    }

    let imported = 0;
    const skipped = [];

    for (const item of items) {
      const {
        game_title, platform, genre, status, priority, rating,
        hours_played, personal_notes, why_i_want_to_play,
        vibe_intensity, mood_match, vibe_tags,
      } = item;

      if (!game_title) {
        skipped.push({ game_title: game_title || '(empty)', reason: 'missing game_title' });
        continue;
      }

      // Find or create the game
      let [game] = await sql`
        SELECT id FROM games WHERE title = ${game_title} AND platform = ${platform || null}
      `;

      if (!game) {
        [game] = await sql`
          INSERT INTO games (title, platform, genre, vibe_intensity)
          VALUES (${game_title}, ${platform || null}, ${genre || null}, ${vibe_intensity || null})
          RETURNING id
        `;
      }

      // Check for duplicate backlog entry
      const [existing] = await sql`
        SELECT id FROM backlog_items WHERE game_id = ${game.id}
      `;

      if (existing) {
        skipped.push({ game_title, reason: 'already in backlog' });
        continue;
      }

      // Create backlog item
      const [bi] = await sql`
        INSERT INTO backlog_items (game_id, status, priority, rating, hours_played, personal_notes, why_i_want_to_play)
        VALUES (
          ${game.id},
          ${status || 'backlog'},
          ${priority != null ? priority : 3},
          ${rating || null},
          ${hours_played || 0},
          ${personal_notes || null},
          ${why_i_want_to_play || null}
        )
        RETURNING id
      `;

      // Create vibe profile if vibe data is present
      if (mood_match || (vibe_tags && vibe_tags.length)) {
        const tags = Array.isArray(vibe_tags) ? vibe_tags
          : typeof vibe_tags === 'string' ? vibe_tags.split(';').map((t) => t.trim()).filter(Boolean)
          : [];

        await sql`
          INSERT INTO vibe_profiles (backlog_item_id, mood_match, tags)
          VALUES (${bi.id}, ${mood_match || null}, ${tags})
        `;
      }

      imported++;
    }

    return { imported, skipped, total: items.length };
  });

  // DELETE /backlog/wipe — delete all user data (backlog, vibe profiles, progress, sessions)
  fastify.delete('/wipe', async (req, reply) => {
    const confirm = req.query.confirm;
    if (confirm !== 'yes') {
      return reply.code(400).send({ error: 'Pass ?confirm=yes to wipe all data' });
    }

    // Delete in dependency order
    await sql`DELETE FROM play_sessions`;
    await sql`DELETE FROM staleness_checks`;
    await sql`DELETE FROM vibe_profiles`;
    await sql`DELETE FROM earned_achievements`;
    await sql`DELETE FROM backlog_items`;
    await sql`DELETE FROM games`;
    await sql`UPDATE user_progress SET xp = 0, level = 1, games_added = 0, games_completed = 0, total_hours = 0`;

    return { wiped: true, message: 'All user data has been deleted.' };
  });
}
