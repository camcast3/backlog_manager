import db from '../db/index.js';
import { awardXp, earnAchievement } from '../services/gamificationService.js';

export default async function sessionRoutes(fastify) {
  // Log a play session
  fastify.post('/:backlogItemId/sessions', async (req, reply) => {
    const { backlogItemId } = req.params;
    const { duration_minutes, notes, played_at } = req.body;

    if (!duration_minutes || duration_minutes <= 0) {
      return reply.code(400).send({ error: 'duration_minutes must be positive' });
    }

    // Verify backlog item exists
    const itemResult = await db.query('SELECT * FROM backlog_items WHERE id = $1', [backlogItemId]);
    if (itemResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Backlog item not found' });
    }

    // Insert session (user_id is nullable for now since auth isn't wired yet)
    const session = await db.query(
      `INSERT INTO play_sessions (backlog_item_id, duration_minutes, notes, played_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [backlogItemId, duration_minutes, notes || null, played_at || new Date().toISOString().split('T')[0]]
    );

    // Update hours_played on the backlog item
    await db.query(
      `UPDATE backlog_items SET hours_played = COALESCE(hours_played, 0) + $1, last_activity_date = CURRENT_DATE WHERE id = $2`,
      [duration_minutes / 60, backlogItemId]
    );

    // Award XP for logging a session
    const gamification = await awardXp(5, { action: 'session_logged', backlog_item_id: backlogItemId });

    // Check for session-related achievements
    const totalSessions = await db.query('SELECT COUNT(*) as count FROM play_sessions');
    const count = parseInt(totalSessions.rows[0].count);
    if (count === 1) await earnAchievement('first_session', { session_count: 1 });
    if (count >= 10) await earnAchievement('dedicated_player', { session_count: count });
    if (count >= 50) await earnAchievement('session_veteran', { session_count: count });
    if (count >= 100) await earnAchievement('session_master', { session_count: count });

    return reply.code(201).send({ session: session.rows[0], gamification });
  });

  // Get sessions for a backlog item
  fastify.get('/:backlogItemId/sessions', async (req) => {
    const { backlogItemId } = req.params;
    const result = await db.query(
      'SELECT * FROM play_sessions WHERE backlog_item_id = $1 ORDER BY played_at DESC, created_at DESC',
      [backlogItemId]
    );
    return result.rows;
  });

  // Update rating for a backlog item
  fastify.patch('/:backlogItemId/rating', async (req, reply) => {
    const { backlogItemId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return reply.code(400).send({ error: 'Rating must be between 1 and 10' });
    }

    const result = await db.query(
      'UPDATE backlog_items SET rating = $1 WHERE id = $2 RETURNING *',
      [rating, backlogItemId]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Backlog item not found' });
    }

    return result.rows[0];
  });
}
