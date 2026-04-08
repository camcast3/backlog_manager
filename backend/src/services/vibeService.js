import getDb from '../db/index.js';

const STALE_MONTHS = 3;

/**
 * Build a vibe profile from the user's "why I want to play" interview answers.
 * This is a simple keyword-based analysis — in production this could be LLM-powered.
 */
export function analyzeVibeInterview(whyText = '', interviewAnswers = {}) {
  const text = `${whyText} ${Object.values(interviewAnswers).join(' ')}`.toLowerCase();

  const tags = [];
  const moodMap = {
    destress: ['relax', 'chill', 'unwind', 'calm', 'casual', 'easy'],
    adventure: ['explore', 'adventure', 'open world', 'journey', 'discover'],
    challenge: ['hard', 'difficult', 'challenge', 'souls', 'hardcore', 'git gud'],
    nostalgia: ['nostalgia', 'classic', 'childhood', 'retro', 'remember', 'old'],
    story: ['story', 'narrative', 'plot', 'character', 'lore', 'immersive'],
    social: ['friends', 'co-op', 'multiplayer', 'together', 'community'],
    competition: ['compete', 'pvp', 'rank', 'tournament', 'esports', 'leaderboard'],
    creative: ['build', 'create', 'craft', 'design', 'sandbox', 'freedom'],
  };

  let dominantMood = null;
  let maxMatches = 0;
  for (const [mood, keywords] of Object.entries(moodMap)) {
    const matches = keywords.filter((k) => text.includes(k)).length;
    if (matches > 0) tags.push(mood);
    if (matches > maxMatches) {
      maxMatches = matches;
      dominantMood = mood;
    }
  }

  // Expected session length
  let expectedSessionLength = 'medium';
  if (/quick|short|30 min|an hour|lunch/.test(text)) expectedSessionLength = 'short';
  else if (/marathon|all night|weekend|binge|whole day/.test(text)) expectedSessionLength = 'marathon';
  else if (/long|evening|few hours/.test(text)) expectedSessionLength = 'long';

  return {
    tags: [...new Set(tags)],
    mood_match: dominantMood,
    expected_session_length: expectedSessionLength,
    raw_interview_answers: interviewAnswers,
  };
}

/**
 * Returns backlog items that have been stale for >= STALE_MONTHS months,
 * excluding items with status 'completed', 'dropped', or that are currently 'playing'.
 */
export async function getStalenessAlerts() {
  const sql = getDb();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STALE_MONTHS);

  const items = await sql`
    SELECT
      bi.id,
      bi.game_id,
      bi.status,
      bi.last_activity_date,
      bi.date_added,
      g.title AS game_title,
      g.platform,
      g.cover_image_url,
      EXTRACT(MONTH FROM AGE(NOW(), bi.last_activity_date)) +
        EXTRACT(YEAR FROM AGE(NOW(), bi.last_activity_date)) * 12 AS months_inactive
    FROM backlog_items bi
    JOIN games g ON bi.game_id = g.id
    WHERE bi.status NOT IN ('completed', 'dropped')
      AND bi.last_activity_date < ${cutoff.toISOString()}
    ORDER BY bi.last_activity_date ASC
  `;

  return items;
}

/**
 * Record a user response to a staleness check and award a small XP reward.
 */
export async function recordStalenessResponse(backlogItemId, response) {
  const sql = getDb();
  const [check] = await sql`
    INSERT INTO staleness_checks (backlog_item_id, reason, user_response)
    VALUES (${backlogItemId}, 'inactive_3_months', ${response})
    RETURNING *
  `;

  // Update last activity so the item is no longer stale
  await sql`
    UPDATE backlog_items
    SET last_activity_date = CURRENT_DATE, updated_at = NOW()
    WHERE id = ${backlogItemId}
  `;

  return check;
}
