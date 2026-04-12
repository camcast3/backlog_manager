import getDb from '../db/index.js';
import { awardXp, earnAchievement } from '../services/gamificationService.js';

export default async function sessionRoutes(fastify) {
  const sql = getDb();

  // Log a play session
  fastify.post('/:backlogItemId/sessions', async (req, reply) => {
    const { backlogItemId } = req.params;
    const { duration_minutes, notes, played_at } = req.body;

    if (!duration_minutes || duration_minutes <= 0) {
      return reply.code(400).send({ error: 'duration_minutes must be positive' });
    }

    // Verify backlog item exists
    const items = await sql`SELECT * FROM backlog_items WHERE id = ${backlogItemId}`;
    if (items.length === 0) {
      return reply.code(404).send({ error: 'Backlog item not found' });
    }

    // Insert session (user_id is nullable for now since auth isn't wired yet)
    const [sessionRow] = await sql`
      INSERT INTO play_sessions (backlog_item_id, duration_minutes, notes, played_at)
      VALUES (${backlogItemId}, ${duration_minutes}, ${notes || null}, ${played_at || new Date().toISOString().split('T')[0]})
      RETURNING *
    `;

    // Update hours_played on the backlog item
    await sql`
      UPDATE backlog_items
      SET hours_played = COALESCE(hours_played, 0) + ${duration_minutes / 60},
          last_activity_date = CURRENT_DATE
      WHERE id = ${backlogItemId}
    `;

    // Award XP for logging a session
    const gamification = await awardXp(5, { action: 'session_logged', backlog_item_id: backlogItemId });

    // Check for session-related achievements
    const [totalSessions] = await sql`SELECT COUNT(*) as count FROM play_sessions`;
    const count = parseInt(totalSessions.count);
    if (count === 1) await earnAchievement('first_session', { session_count: 1 });
    if (count >= 10) await earnAchievement('dedicated_player', { session_count: count });
    if (count >= 50) await earnAchievement('session_veteran', { session_count: count });
    if (count >= 100) await earnAchievement('session_master', { session_count: count });

    return reply.code(201).send({ session: sessionRow, gamification });
  });

  // Get sessions for a backlog item
  fastify.get('/:backlogItemId/sessions', async (req) => {
    const { backlogItemId } = req.params;
    const rows = await sql`
      SELECT * FROM play_sessions
      WHERE backlog_item_id = ${backlogItemId}
      ORDER BY played_at DESC, created_at DESC
    `;
    return rows;
  });

  // Update rating for a backlog item
  fastify.patch('/:backlogItemId/rating', async (req, reply) => {
    const { backlogItemId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return reply.code(400).send({ error: 'Rating must be between 1 and 10' });
    }

    const result = await sql`
      UPDATE backlog_items SET rating = ${rating} WHERE id = ${backlogItemId} RETURNING *
    `;

    if (result.length === 0) {
      return reply.code(404).send({ error: 'Backlog item not found' });
    }

    return result[0];
  });
}
