import getDb from '../db/index.js';
import { isHltbStale, refreshHltbCache } from '../services/hltbService.js';

const HLTB_FIELDS = ['hltb_main_story', 'hltb_main_plus_extras', 'hltb_completionist'];

/** Attach a computed hltb_stale boolean to a game object (or array of objects). */
function withHltbStale(gameOrGames) {
  if (Array.isArray(gameOrGames)) return gameOrGames.map((g) => ({ ...g, hltb_stale: isHltbStale(g) }));
  return { ...gameOrGames, hltb_stale: isHltbStale(gameOrGames) };
}

export default async function gamesRoutes(fastify) {
  const sql = getDb();

  // GET /games - list games with optional filters and pagination
  fastify.get('/', async (req, reply) => {
    const { platform, genre, vibe_intensity, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    let conditions = sql`WHERE 1=1`;
    if (platform) conditions = sql`${conditions} AND platform ILIKE ${'%' + platform + '%'}`;
    if (genre) conditions = sql`${conditions} AND genre ILIKE ${'%' + genre + '%'}`;
    if (vibe_intensity) conditions = sql`${conditions} AND vibe_intensity = ${vibe_intensity}`;
    if (search) conditions = sql`${conditions} AND title ILIKE ${'%' + search + '%'}`;

    const [{ count: total }] = await sql`
      SELECT COUNT(*)::int AS count FROM games ${conditions}
    `;

    const games = await sql`
      SELECT * FROM games ${conditions}
      ORDER BY title ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return { items: withHltbStale(games), total, page, limit, hasMore: offset + games.length < total };
  });

  // GET /games/:id
  fastify.get('/:id', async (req, reply) => {
    const [game] = await sql`SELECT * FROM games WHERE id = ${req.params.id}`;
    if (!game) { reply.code(404); return { error: 'Game not found' }; }
    return withHltbStale(game);
  });

  // POST /games - create a new game record (global data)
  fastify.post('/', async (req, reply) => {
    const {
      title, platform, genre, developer, publisher, release_year,
      cover_image_url,
      hltb_main_story, hltb_main_plus_extras, hltb_completionist,
      vibe_intensity, vibe_story_pace, vibe_mood, vibe_multiplayer, vibe_notes,
    } = req.body;

    if (!title || !platform) {
      reply.code(400);
      return { error: 'title and platform are required' };
    }

    const [game] = await sql`
      INSERT INTO games (
        title, platform, genre, developer, publisher, release_year,
        cover_image_url,
        hltb_main_story, hltb_main_plus_extras, hltb_completionist,
        hltb_cached_at,
        vibe_intensity, vibe_story_pace, vibe_mood, vibe_multiplayer, vibe_notes
      ) VALUES (
        ${title}, ${platform}, ${genre ?? null}, ${developer ?? null},
        ${publisher ?? null}, ${release_year ?? null}, ${cover_image_url ?? null},
        ${hltb_main_story ?? null}, ${hltb_main_plus_extras ?? null},
        ${hltb_completionist ?? null},
        ${(hltb_main_story != null || hltb_main_plus_extras != null || hltb_completionist != null) ? sql`NOW()` : null},
        ${vibe_intensity ?? 'moderate'}, ${vibe_story_pace ?? 'steady'},
        ${vibe_mood ?? null}, ${vibe_multiplayer ?? false}, ${vibe_notes ?? null}
      )
      ON CONFLICT (title, platform) DO UPDATE SET
        genre = EXCLUDED.genre,
        developer = EXCLUDED.developer,
        publisher = EXCLUDED.publisher,
        release_year = EXCLUDED.release_year,
        cover_image_url = EXCLUDED.cover_image_url,
        hltb_main_story = EXCLUDED.hltb_main_story,
        hltb_main_plus_extras = EXCLUDED.hltb_main_plus_extras,
        hltb_completionist = EXCLUDED.hltb_completionist,
        hltb_cached_at = CASE
          WHEN EXCLUDED.hltb_main_story IS NOT NULL
            OR EXCLUDED.hltb_main_plus_extras IS NOT NULL
            OR EXCLUDED.hltb_completionist IS NOT NULL
          THEN NOW()
          ELSE games.hltb_cached_at
        END,
        vibe_intensity = EXCLUDED.vibe_intensity,
        vibe_story_pace = EXCLUDED.vibe_story_pace,
        vibe_mood = EXCLUDED.vibe_mood,
        vibe_multiplayer = EXCLUDED.vibe_multiplayer,
        vibe_notes = EXCLUDED.vibe_notes,
        updated_at = NOW()
      RETURNING *
    `;
    reply.code(201);
    return withHltbStale(game);
  });
  // PATCH /games/:id - update game data
  fastify.patch('/:id', async (req, reply) => {
    const { id } = req.params;
    const fields = req.body;
    const allowed = [
      'title', 'platform', 'genre', 'developer', 'publisher', 'release_year',
      'cover_image_url', 'hltb_main_story', 'hltb_main_plus_extras',
      'hltb_completionist', 'vibe_intensity', 'vibe_story_pace',
      'vibe_mood', 'vibe_multiplayer', 'vibe_notes', 'hltb_cached_at',
    ];

    const updates = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(updates).length === 0) {
      reply.code(400);
      return { error: 'No valid fields to update' };
    }

    // Stamp hltb_cached_at if any HLTB field is being updated
    const touchesHltb = HLTB_FIELDS.some((f) => f in updates);
    if (touchesHltb) updates.hltb_cached_at = new Date().toISOString();

    // Build dynamic update using postgres tagged template
    const setClauses = Object.keys(updates).map((k) => sql`${sql(k)} = ${updates[k]}`);
    const setFragment = setClauses.reduce((acc, clause, i) =>
      i === 0 ? clause : sql`${acc}, ${clause}`
    );

    const [game] = await sql`
      UPDATE games SET ${setFragment}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!game) { reply.code(404); return { error: 'Game not found' }; }
    return withHltbStale(game);
  });
  fastify.delete('/:id', async (req, reply) => {
    const [game] = await sql`DELETE FROM games WHERE id = ${req.params.id} RETURNING id`;
    if (!game) { reply.code(404); return { error: 'Game not found' }; }
    return { deleted: true, id: game.id };
  });

  // GET /games/platforms/list - distinct platforms
  fastify.get('/platforms/list', async () => {
    const rows = await sql`SELECT DISTINCT platform FROM games ORDER BY platform`;
    return rows.map((r) => r.platform);
  });

  // POST /games/:id/refresh-hltb - supply fresh HLTB data and reset the cache timestamp
  fastify.post('/:id/refresh-hltb', async (req, reply) => {
    const { hltb_main_story, hltb_main_plus_extras, hltb_completionist } = req.body ?? {};
    const game = await refreshHltbCache(req.params.id, {
      hltb_main_story,
      hltb_main_plus_extras,
      hltb_completionist,
    });
    if (!game) { reply.code(404); return { error: 'Game not found' }; }
    return withHltbStale(game);
  });
}
