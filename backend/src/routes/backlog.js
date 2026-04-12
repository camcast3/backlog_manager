import getDb from '../db/index.js';
import { onGameAdded, onStatusChanged } from '../services/gamificationService.js';
import { analyzeVibeInterview, getStalenessAlerts, recordStalenessResponse } from '../services/vibeService.js';
import { analyzeVibeAnswers } from '../services/vibeQuestionService.js';

export default async function backlogRoutes(fastify) {
  const sql = getDb();

  // Full query helper to get enriched backlog items
  async function getBacklogItemFull(id) {
    const [item] = await sql`
      SELECT
        bi.*,
        g.title AS game_title,
        g.platform,
        g.genre,
        g.developer,
        g.cover_image_url,
        g.hltb_main_story,
        g.hltb_main_plus_extras,
        g.hltb_completionist,
        g.vibe_intensity,
        g.vibe_story_pace,
        g.vibe_mood,
        g.vibe_multiplayer,
        g.release_year,
        vp.tags AS vibe_tags,
        vp.mood_match,
        vp.expected_session_length
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      LEFT JOIN vibe_profiles vp ON vp.backlog_item_id = bi.id
      WHERE bi.id = ${id}
    `;
    return item;
  }

  // GET /backlog - list backlog items with pagination
  fastify.get('/', async (req) => {
    const { status, platform, vibe_intensity, sort } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const sortOptions = {
      priority: sql`bi.priority DESC`,
      added: sql`bi.date_added DESC`,
      title: sql`g.title ASC`,
      last_activity: sql`bi.last_activity_date DESC`,
    };
    const orderBy = sortOptions[sort] ?? sql`bi.priority DESC`;

    let conditions = sql`WHERE 1=1`;
    if (status) conditions = sql`${conditions} AND bi.status = ${status}`;
    if (platform) conditions = sql`${conditions} AND g.platform ILIKE ${'%' + platform + '%'}`;
    if (vibe_intensity) conditions = sql`${conditions} AND g.vibe_intensity = ${vibe_intensity}`;

    const [{ count: total }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      ${conditions}
    `;

    const items = await sql`
      SELECT
        bi.*,
        g.title AS game_title,
        g.platform,
        g.genre,
        g.cover_image_url,
        g.hltb_main_story,
        g.hltb_main_plus_extras,
        g.hltb_completionist,
        g.vibe_intensity,
        g.vibe_story_pace,
        g.vibe_mood,
        g.vibe_multiplayer,
        g.release_year,
        vp.tags AS vibe_tags,
        vp.mood_match,
        vp.expected_session_length
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      LEFT JOIN vibe_profiles vp ON vp.backlog_item_id = bi.id
      ${conditions}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;
    return { items, total, page, limit, hasMore: offset + items.length < total };
  });

  // GET /backlog/stats - summary statistics
  fastify.get('/stats', async () => {
    const [counts] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'want_to_play') AS want_to_play,
        COUNT(*) FILTER (WHERE status = 'playing') AS playing,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'dropped') AS dropped,
        COUNT(*) FILTER (WHERE status = 'on_hold') AS on_hold,
        COUNT(*) AS total,
        SUM(hours_played) AS total_hours
      FROM backlog_items
    `;
    return counts;
  });

  // GET /backlog/staleness - games that haven't been touched in a while
  fastify.get('/staleness', async () => {
    return getStalenessAlerts();
  });

  // GET /backlog/:id
  fastify.get('/:id', async (req, reply) => {
    const item = await getBacklogItemFull(req.params.id);
    if (!item) { reply.code(404); return { error: 'Backlog item not found' }; }
    return item;
  });

  // POST /backlog - add a game to the backlog
  fastify.post('/', async (req, reply) => {
    const {
      game_id, status, priority, personal_notes,
      why_i_want_to_play, interview_answers, vibe_answers,
    } = req.body;

    if (!game_id) { reply.code(400); return { error: 'game_id is required' }; }

    const [game] = await sql`SELECT * FROM games WHERE id = ${game_id}`;
    if (!game) { reply.code(404); return { error: 'Game not found' }; }

    const [backlogItem] = await sql`
      INSERT INTO backlog_items (game_id, status, priority, personal_notes, why_i_want_to_play)
      VALUES (
        ${game_id},
        ${status ?? 'want_to_play'},
        ${priority ?? 50},
        ${personal_notes ?? null},
        ${why_i_want_to_play ?? null}
      )
      RETURNING *
    `;

    // Generate vibe profile — structured quick-answers take priority over free text
    const hasStructured = Array.isArray(vibe_answers) && vibe_answers.length > 0;
    const hasText = why_i_want_to_play || interview_answers;
    if (hasStructured || hasText) {
      const vibe = hasStructured
        ? analyzeVibeAnswers(vibe_answers)
        : analyzeVibeInterview(why_i_want_to_play, interview_answers ?? {});
      await sql`
        INSERT INTO vibe_profiles (backlog_item_id, tags, mood_match, expected_session_length, raw_interview_answers)
        VALUES (
          ${backlogItem.id},
          ${sql.array(vibe.tags)},
          ${vibe.mood_match},
          ${vibe.expected_session_length},
          ${sql.json(vibe.raw_interview_answers)}
        )
      `;
    }

    // Gamification
    const gamification = await onGameAdded(backlogItem, game);

    const enriched = await getBacklogItemFull(backlogItem.id);
    reply.code(201);
    return { item: enriched, gamification };
  });

  // PATCH /backlog/:id - update status, notes, hours, etc.
  fastify.patch('/:id', async (req, reply) => {
    const { id } = req.params;
    const {
      status, priority, personal_notes, why_i_want_to_play,
      hours_played, rating, date_started, date_completed,
    } = req.body;

    const [existing] = await sql`SELECT * FROM backlog_items WHERE id = ${id}`;
    if (!existing) { reply.code(404); return { error: 'Backlog item not found' }; }

    const oldStatus = existing.status;

    // Build update object with only provided fields
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (personal_notes !== undefined) updates.personal_notes = personal_notes;
    if (why_i_want_to_play !== undefined) updates.why_i_want_to_play = why_i_want_to_play;
    if (hours_played !== undefined) updates.hours_played = hours_played;
    if (rating !== undefined) updates.rating = rating;
    if (date_started !== undefined) updates.date_started = date_started;
    if (date_completed !== undefined) updates.date_completed = date_completed;

    // Auto-set dates based on status transitions
    if (status === 'playing' && !existing.date_started) updates.date_started = new Date().toISOString().split('T')[0];
    if (status === 'completed' && !existing.date_completed) updates.date_completed = new Date().toISOString().split('T')[0];
    if (status) updates.last_activity_date = new Date().toISOString().split('T')[0];

    if (Object.keys(updates).length === 0) {
      reply.code(400);
      return { error: 'No valid fields to update' };
    }

    const setClauses = Object.keys(updates).map((k) => sql`${sql(k)} = ${updates[k]}`);
    const setFragment = setClauses.reduce((acc, clause, i) =>
      i === 0 ? clause : sql`${acc}, ${clause}`
    );

    await sql`UPDATE backlog_items SET ${setFragment}, updated_at = NOW() WHERE id = ${id}`;

    // Gamification for status change
    let gamification = null;
    if (status && status !== oldStatus) {
      const [game] = await sql`SELECT * FROM games WHERE id = ${existing.game_id}`;
      const updatedItem = { ...existing, ...updates };
      gamification = await onStatusChanged(updatedItem, game, oldStatus, status);
    }

    const enriched = await getBacklogItemFull(id);
    return { item: enriched, gamification };
  });

  // DELETE /backlog/:id
  fastify.delete('/:id', async (req, reply) => {
    const [item] = await sql`DELETE FROM backlog_items WHERE id = ${req.params.id} RETURNING id`;
    if (!item) { reply.code(404); return { error: 'Backlog item not found' }; }
    return { deleted: true, id: item.id };
  });

  // POST /backlog/:id/staleness-response - user responds to a staleness check
  fastify.post('/:id/staleness-response', async (req, reply) => {
    const { response } = req.body;
    if (!response) { reply.code(400); return { error: 'response is required' }; }

    const [item] = await sql`SELECT id FROM backlog_items WHERE id = ${req.params.id}`;
    if (!item) { reply.code(404); return { error: 'Backlog item not found' }; }

    const check = await recordStalenessResponse(req.params.id, response);

    const { earnAchievement, awardXp } = await import('../services/gamificationService.js');
    const xpResult = await awardXp(15, { action: 'staleness_reply' });
    const achievement = await earnAchievement('staleness_reply', {});

    return {
      check,
      gamification: {
        ...xpResult,
        newAchievements: achievement ? [achievement, ...xpResult.newAchievements] : xpResult.newAchievements,
      },
    };
  });
}
