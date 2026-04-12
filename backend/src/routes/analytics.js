import getDb from '../db/index.js';

export default async function analyticsRoutes(fastify) {
  const sql = getDb();

  // Completion trends - games completed per month (last 12 months)
  fastify.get('/completion-trends', async () => {
    const rows = await sql`
      SELECT 
        TO_CHAR(date_completed, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM backlog_items
      WHERE date_completed IS NOT NULL 
        AND date_completed >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(date_completed, 'YYYY-MM')
      ORDER BY month
    `;
    return rows;
  });

  // Genre breakdown - count of games per genre
  fastify.get('/genre-breakdown', async () => {
    const rows = await sql`
      SELECT g.genre, COUNT(*) as count
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      WHERE g.genre IS NOT NULL AND g.genre != ''
      GROUP BY g.genre
      ORDER BY count DESC
      LIMIT 10
    `;
    return rows;
  });

  // Platform distribution
  fastify.get('/platform-distribution', async () => {
    const rows = await sql`
      SELECT g.platform, COUNT(*) as count
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      GROUP BY g.platform
      ORDER BY count DESC
      LIMIT 15
    `;
    return rows;
  });

  // Playtime stats
  fastify.get('/playtime-stats', async () => {
    const [stats] = await sql`
      SELECT 
        COALESCE(SUM(hours_played), 0) as total_hours,
        COALESCE(AVG(hours_played) FILTER (WHERE hours_played > 0), 0) as avg_hours,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) as total_count
      FROM backlog_items
    `;
    return stats;
  });

  // Backlog health - estimated time to clear
  fastify.get('/backlog-health', async () => {
    const [stats] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('want_to_play', 'playing', 'on_hold')) as remaining,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'completed' AND date_completed >= CURRENT_DATE - INTERVAL '6 months') as completed_last_6mo,
        COALESCE(AVG(g.hltb_main_story) FILTER (WHERE bi.status IN ('want_to_play', 'playing', 'on_hold') AND g.hltb_main_story IS NOT NULL), 0) as avg_remaining_hours
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
    `;
    const monthlyRate = stats.completed_last_6mo / 6;
    const estimatedMonths = monthlyRate > 0 ? Math.round(stats.remaining / monthlyRate) : null;
    const estimatedHours = Math.round(stats.remaining * stats.avg_remaining_hours);
    return {
      ...stats,
      monthly_completion_rate: Math.round(monthlyRate * 10) / 10,
      estimated_months: estimatedMonths,
      estimated_hours: estimatedHours,
    };
  });

  // Vibe distribution
  fastify.get('/vibe-map', async () => {
    const rows = await sql`
      SELECT g.vibe_intensity, COUNT(*) as count
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      WHERE g.vibe_intensity IS NOT NULL
      GROUP BY g.vibe_intensity
    `;
    return rows;
  });

  // Status distribution
  fastify.get('/status-distribution', async () => {
    const rows = await sql`
      SELECT status, COUNT(*) as count
      FROM backlog_items
      GROUP BY status
      ORDER BY count DESC
    `;
    return rows;
  });
}
