import getDb from '../db/index.js';

/**
 * XP required to reach a given level (level starts at 1).
 * Uses a simple quadratic curve: level N needs N^2 * 100 cumulative XP.
 */
export function xpForLevel(level) {
  return level * level * 100;
}

/**
 * Compute level from total XP.
 */
export function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

/**
 * Award XP and check for level-up. Returns { newXp, newLevel, leveledUp, newAchievements }.
 */
export async function awardXp(amount, context = {}) {
  const sql = getDb();
  const [progress] = await sql`
    UPDATE user_progress SET xp = xp + ${amount}, updated_at = NOW()
    RETURNING xp, level
  `;

  const newLevel = levelFromXp(progress.xp);
  let leveledUp = false;
  const newAchievements = [];

  if (newLevel > progress.level) {
    leveledUp = true;
    await sql`
      UPDATE user_progress SET level = ${newLevel}, updated_at = NOW()
    `;

    // Check level milestone achievements
    const levelMilestones = { 5: 'level_5', 10: 'level_10', 20: 'level_20' };
    if (levelMilestones[newLevel]) {
      const earned = await earnAchievement(levelMilestones[newLevel], { ...context, level: newLevel });
      if (earned) newAchievements.push(earned);
    }
  }

  return { newXp: progress.xp, newLevel, leveledUp, newAchievements };
}

/**
 * Earn an achievement by key (idempotent — will not double-award).
 * Returns the achievement object if newly earned, or null if already had it.
 */
export async function earnAchievement(key, context = {}) {
  const sql = getDb();
  const [achievement] = await sql`SELECT * FROM achievements WHERE key = ${key}`;
  if (!achievement) return null;

  // Check if already earned
  const [already] = await sql`
    SELECT id FROM earned_achievements WHERE achievement_id = ${achievement.id}
  `;
  if (already) return null;

  await sql`
    INSERT INTO earned_achievements (achievement_id, context)
    VALUES (${achievement.id}, ${sql.json(context)})
  `;

  return achievement;
}

/**
 * Process all gamification side-effects after adding a game to the backlog.
 */
export async function onGameAdded(backlogItem, game) {
  const sql = getDb();
  const newAchievements = [];

  // Update counter
  await sql`UPDATE user_progress SET games_added = games_added + 1`;

  // Award XP for adding
  const xpResult = await awardXp(20, { action: 'game_added', game_title: game.title });
  newAchievements.push(...xpResult.newAchievements);

  // first_game achievement
  const [progress] = await sql`SELECT games_added FROM user_progress`;
  if (progress.games_added === 1) {
    const a = await earnAchievement('first_game', { game_title: game.title });
    if (a) newAchievements.push(a);
  }

  // Backlog size milestones
  const milestones = { 5: 'backlog_5', 10: 'backlog_10', 25: 'backlog_25' };
  if (milestones[progress.games_added]) {
    const a = await earnAchievement(milestones[progress.games_added], {});
    if (a) newAchievements.push(a);
  }

  // why_champion: 10 games with why_i_want_to_play filled in
  if (backlogItem.why_i_want_to_play) {
    const [{ count }] = await sql`
      SELECT COUNT(*) AS count FROM backlog_items
      WHERE why_i_want_to_play IS NOT NULL AND why_i_want_to_play <> ''
    `;
    if (parseInt(count) === 10) {
      const a = await earnAchievement('why_champion', {});
      if (a) newAchievements.push(a);
    }
  }

  // Diverse platforms: 5 distinct platforms
  const [{ count: platformCount }] = await sql`
    SELECT COUNT(DISTINCT g.platform) AS count
    FROM backlog_items bi JOIN games g ON bi.game_id = g.id
  `;
  if (parseInt(platformCount) >= 5) {
    const a = await earnAchievement('diverse_platforms', {});
    if (a) newAchievements.push(a);
  }

  return { ...xpResult, newAchievements };
}

/**
 * Process all gamification side-effects when a game status changes.
 */
export async function onStatusChanged(backlogItem, game, oldStatus, newStatus) {
  const sql = getDb();
  const newAchievements = [];

  if (newStatus === 'playing') {
    const xpResult = await awardXp(30, { action: 'started_playing', game_title: game.title });
    newAchievements.push(...xpResult.newAchievements);
    const a = await earnAchievement('playing_now', { game_title: game.title });
    if (a) newAchievements.push(a);
    return { ...xpResult, newAchievements };
  }

  if (newStatus === 'completed') {
    await sql`UPDATE user_progress SET games_completed = games_completed + 1`;
    const [progress] = await sql`SELECT games_completed FROM user_progress`;
    const xpResult = await awardXp(150, { action: 'game_completed', game_title: game.title });
    newAchievements.push(...xpResult.newAchievements);

    // first_complete
    if (progress.games_completed === 1) {
      const a = await earnAchievement('first_complete', { game_title: game.title });
      if (a) newAchievements.push(a);
    }
    const completeMilestones = { 5: 'complete_5', 10: 'complete_10' };
    if (completeMilestones[progress.games_completed]) {
      const a = await earnAchievement(completeMilestones[progress.games_completed], {});
      if (a) newAchievements.push(a);
    }

    // Marathoner: 50+ hours
    if (backlogItem.hours_played >= 50) {
      const a = await earnAchievement('complete_long', { game_title: game.title });
      if (a) newAchievements.push(a);
    }

    // Vibe-specific completions
    if (game.vibe_intensity === 'chill') {
      const [{ count }] = await sql`
        SELECT COUNT(*) AS count FROM backlog_items bi
        JOIN games g ON bi.game_id = g.id
        WHERE bi.status = 'completed' AND g.vibe_intensity = 'chill'
      `;
      if (parseInt(count) >= 3) {
        const a = await earnAchievement('chill_master', {});
        if (a) newAchievements.push(a);
      }
    }
    if (game.vibe_intensity === 'intense' || game.vibe_intensity === 'brutal') {
      const [{ count }] = await sql`
        SELECT COUNT(*) AS count FROM backlog_items bi
        JOIN games g ON bi.game_id = g.id
        WHERE bi.status = 'completed' AND g.vibe_intensity IN ('intense', 'brutal')
      `;
      if (parseInt(count) >= 3) {
        const a = await earnAchievement('intense_master', {});
        if (a) newAchievements.push(a);
      }
    }

    return { ...xpResult, newAchievements };
  }

  if (newStatus === 'dropped') {
    await sql`UPDATE user_progress SET games_dropped = games_dropped + 1`;
    const xpResult = await awardXp(5, { action: 'game_dropped', game_title: game.title });
    newAchievements.push(...xpResult.newAchievements);
    const a = await earnAchievement('first_drop', { game_title: game.title });
    if (a) newAchievements.push(a);
    return { ...xpResult, newAchievements };
  }

  // Default: award a small amount of XP for any activity
  const xpResult = await awardXp(5, { action: 'status_changed', game_title: game.title });
  return { ...xpResult, newAchievements };
}

/**
 * Get current user progress including level and XP to next level.
 */
export async function getUserProgress() {
  const sql = getDb();
  const [progress] = await sql`SELECT * FROM user_progress WHERE id = 1`;
  const xpToNextLevel = xpForLevel(progress.level + 1) - progress.xp;
  const xpCurrentLevel = xpForLevel(progress.level);
  const xpNextLevel = xpForLevel(progress.level + 1);
  return {
    ...progress,
    xp_to_next_level: xpToNextLevel,
    level_progress_pct: Math.round(
      ((progress.xp - xpCurrentLevel) / (xpNextLevel - xpCurrentLevel)) * 100
    ),
  };
}
