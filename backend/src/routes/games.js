import getDb from '../db/index.js';

export default async function gamesRoutes(fastify) {
  const sql = getDb();

  // GET /games - list all games with optional filters
  fastify.get('/', async (req, reply) => {
    const { platform, genre, vibe_intensity, search } = req.query;
    let query = sql`
      SELECT * FROM games
      WHERE 1=1
    `;
    if (platform) query = sql`${query} AND platform ILIKE ${'%' + platform + '%'}`;
    if (genre) query = sql`${query} AND genre ILIKE ${'%' + genre + '%'}`;
    if (vibe_intensity) query = sql`${query} AND vibe_intensity = ${vibe_intensity}`;
    if (search) query = sql`${query} AND title ILIKE ${'%' + search + '%'}`;
    query = sql`${query} ORDER BY title ASC`;

    const games = await query;
    return games;
  });

  // GET /games/:id
  fastify.get('/:id', async (req, reply) => {
    const [game] = await sql`SELECT * FROM games WHERE id = ${req.params.id}`;
    if (!game) return reply.status(404).send({ error: 'Game not found' });
    return game;
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
      return reply.status(400).send({ error: 'title and platform are required' });
    }

    const [game] = await sql`
      INSERT INTO games (
        title, platform, genre, developer, publisher, release_year,
        cover_image_url,
        hltb_main_story, hltb_main_plus_extras, hltb_completionist,
        vibe_intensity, vibe_story_pace, vibe_mood, vibe_multiplayer, vibe_notes
      ) VALUES (
        ${title}, ${platform}, ${genre ?? null}, ${developer ?? null},
        ${publisher ?? null}, ${release_year ?? null}, ${cover_image_url ?? null},
        ${hltb_main_story ?? null}, ${hltb_main_plus_extras ?? null},
        ${hltb_completionist ?? null},
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
        vibe_intensity = EXCLUDED.vibe_intensity,
        vibe_story_pace = EXCLUDED.vibe_story_pace,
        vibe_mood = EXCLUDED.vibe_mood,
        vibe_multiplayer = EXCLUDED.vibe_multiplayer,
        vibe_notes = EXCLUDED.vibe_notes,
        updated_at = NOW()
      RETURNING *
    `;
    return reply.status(201).send(game);
  });

  // PATCH /games/:id - update game data
  fastify.patch('/:id', async (req, reply) => {
    const { id } = req.params;
    const fields = req.body;
    const allowed = [
      'title', 'platform', 'genre', 'developer', 'publisher', 'release_year',
      'cover_image_url', 'hltb_main_story', 'hltb_main_plus_extras',
      'hltb_completionist', 'vibe_intensity', 'vibe_story_pace',
      'vibe_mood', 'vibe_multiplayer', 'vibe_notes',
    ];

    const updates = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'No valid fields to update' });
    }

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
    if (!game) return reply.status(404).send({ error: 'Game not found' });
    return game;
  });

  // DELETE /games/:id
  fastify.delete('/:id', async (req, reply) => {
    const [game] = await sql`DELETE FROM games WHERE id = ${req.params.id} RETURNING id`;
    if (!game) return reply.status(404).send({ error: 'Game not found' });
    return { deleted: true, id: game.id };
  });

  // GET /games/platforms/list - distinct platforms
  fastify.get('/platforms/list', async () => {
    const rows = await sql`SELECT DISTINCT platform FROM games ORDER BY platform`;
    return rows.map((r) => r.platform);
  });
}
