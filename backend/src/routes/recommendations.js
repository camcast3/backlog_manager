import db from '../db/index.js';

export default async function recommendationRoutes(fastify) {
  fastify.get('/', async (req) => {
    const { mood, session_length, energy } = req.query;

    // Get all eligible games (want_to_play or playing)
    const result = await db.query(`
      SELECT bi.id, bi.status, bi.priority, bi.last_activity_date, bi.hours_played,
             g.title as game_title, g.platform, g.genre, g.cover_image_url,
             g.hltb_main_story, g.vibe_intensity, g.vibe_story_pace, g.vibe_mood,
             vp.tags as vibe_tags, vp.mood_match, vp.expected_session_length
      FROM backlog_items bi
      JOIN games g ON bi.game_id = g.id
      LEFT JOIN vibe_profiles vp ON vp.backlog_item_id = bi.id
      WHERE bi.status IN ('want_to_play', 'playing', 'on_hold')
      ORDER BY bi.priority DESC
    `);

    const games = result.rows;
    if (games.length === 0) return [];

    // Score each game
    const scored = games.map(game => {
      let score = 0;
      const reasons = [];

      // Mood match (highest weight)
      if (mood && game.mood_match === mood) {
        score += 15;
        reasons.push('Perfect mood match');
      } else if (mood && game.vibe_tags && game.vibe_tags.includes(mood)) {
        score += 8;
        reasons.push('Matches your mood');
      }

      // Vibe mood text contains mood keyword
      if (mood && game.vibe_mood && game.vibe_mood.toLowerCase().includes(mood.toLowerCase())) {
        score += 5;
        reasons.push('Vibes align');
      }

      // Session length match
      if (session_length && game.expected_session_length === session_length) {
        score += 10;
        reasons.push('Fits your time');
      }

      // Energy / intensity alignment
      if (energy) {
        const intensityMap = {
          low: ['chill'],
          medium: ['chill', 'moderate'],
          high: ['moderate', 'intense', 'brutal'],
        };
        const preferred = intensityMap[energy] || [];
        if (preferred.includes(game.vibe_intensity)) {
          score += 8;
          reasons.push('Right energy level');
        }
      }

      // HLTB time fits session
      if (session_length && game.hltb_main_story) {
        const fits = {
          short: game.hltb_main_story <= 10,
          medium: game.hltb_main_story <= 30,
          long: game.hltb_main_story <= 60,
          marathon: true,
        };
        if (fits[session_length]) {
          score += 3;
        }
      }

      // Priority boost (normalized 1-100 to 0-5 points)
      score += (game.priority || 50) / 20;

      // Recency penalty - recently active games scored lower to encourage variety
      if (game.last_activity_date) {
        const daysSince = Math.floor((Date.now() - new Date(game.last_activity_date).getTime()) / 86400000);
        if (daysSince < 7) score -= 3;
        else if (daysSince > 90) {
          score += 3;
          reasons.push('Been waiting for you');
        }
      }

      // Playing status bonus (continue what you started)
      if (game.status === 'playing') {
        score += 5;
        reasons.push('Already started');
      }

      if (reasons.length === 0) reasons.push('In your backlog');

      return { ...game, score: Math.round(score * 10) / 10, reasons };
    });

    // Sort by score descending, return top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(g => ({
      ...g,
      match_pct: Math.min(100, Math.round((g.score / 40) * 100)),
    }));
  });
}
