import getDb from '../db/index.js';

/**
 * Return the cache TTL in days for HLTB data based on the game's age.
 *
 * Newer games have rapidly changing crowd-sourced completion times, so they
 * get a short TTL.  The older a game is the more stable its data becomes, so
 * the TTL grows accordingly.
 *
 * | Game age          | TTL      |
 * |-------------------|----------|
 * | < 1 year          | 7 days   |
 * | 1 – 3 years       | 30 days  |
 * | 3 – 10 years      | 90 days  |
 * | 10+ years         | 365 days |
 * | unknown age       | 30 days  |
 */
export function getHltbTtlDays(releaseYear) {
  if (!releaseYear) return 30;
  const age = new Date().getFullYear() - releaseYear;
  if (age < 1) return 7;
  if (age < 3) return 30;
  if (age < 10) return 90;
  return 365;
}

/**
 * Return true if the cached HLTB data for a game should be considered stale.
 *
 * A game with no hltb_cached_at has never had its HLTB data explicitly set
 * and is always considered stale.
 */
export function isHltbStale(game) {
  if (!game.hltb_cached_at) return true;
  const ttlMs = getHltbTtlDays(game.release_year) * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(game.hltb_cached_at).getTime() > ttlMs;
}

/**
 * Update the HLTB fields for a game and stamp hltb_cached_at = NOW().
 * Returns the updated game row.
 */
export async function refreshHltbCache(gameId, { hltb_main_story, hltb_main_plus_extras, hltb_completionist }) {
  const sql = getDb();
  const [game] = await sql`
    UPDATE games
    SET
      hltb_main_story       = ${hltb_main_story ?? null},
      hltb_main_plus_extras = ${hltb_main_plus_extras ?? null},
      hltb_completionist    = ${hltb_completionist ?? null},
      hltb_cached_at        = NOW(),
      updated_at            = NOW()
    WHERE id = ${gameId}
    RETURNING *
  `;
  return game ?? null;
}
