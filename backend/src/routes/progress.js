import getDb from '../db/index.js';
import { getUserProgress } from '../services/gamificationService.js';

export default async function progressRoutes(fastify) {
  const sql = getDb();

  // GET /progress - current XP, level, and stats
  fastify.get('/', async () => {
    return getUserProgress();
  });

  // GET /progress/achievements - all achievements with earned status
  fastify.get('/achievements', async () => {
    const rows = await sql`
      SELECT
        a.*,
        ea.earned_at,
        ea.context AS earned_context,
        (ea.id IS NOT NULL) AS earned
      FROM achievements a
      LEFT JOIN earned_achievements ea ON ea.achievement_id = a.id
      ORDER BY earned DESC, a.xp_reward DESC
    `;
    return rows;
  });

  // GET /progress/leaderboard - recent activity feed
  fastify.get('/activity', async () => {
    const rows = await sql`
      SELECT
        ea.earned_at,
        a.title AS achievement_title,
        a.icon,
        a.xp_reward,
        ea.context
      FROM earned_achievements ea
      JOIN achievements a ON a.id = ea.achievement_id
      ORDER BY ea.earned_at DESC
      LIMIT 20
    `;
    return rows;
  });
}
