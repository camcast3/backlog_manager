/**
 * Game search service — searches HLTB for completion times and IGDB for cover images.
 *
 * Uses native fetch (Node 18+) to avoid third-party HTTP library vulnerabilities.
 * IGDB requires Twitch OAuth (client credentials flow) — set TWITCH_CLIENT_ID
 * and TWITCH_CLIENT_SECRET in your environment.
 */

const HLTB_BASE = 'https://howlongtobeat.com';
const HLTB_SEARCH_URL = `${HLTB_BASE}/api/search`;
const HLTB_IMAGE_BASE = `${HLTB_BASE}/games/`;

const IGDB_BASE = 'https://api.igdb.com/v4';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_IMAGE_BASE = 'https://images.igdb.com/igdb/image/upload';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ── Twitch OAuth Token Management ──────────────────────────────

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get a valid Twitch app access token (client credentials flow).
 * Tokens are cached in memory and refreshed 60s before expiry.
 */
export async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const res = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    body: params,
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

// Exposed for testing
export function _resetTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

// ── HLTB Search ────────────────────────────────────────────────

function buildHltbPayload(searchTerms) {
  return {
    searchType: 'games',
    searchTerms: searchTerms.split(' ').filter(Boolean),
    searchPage: 1,
    size: 10,
    searchOptions: {
      games: {
        userId: 0,
        platform: '',
        sortCategory: 'popular',
        rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: '', flow: '', genre: '' },
        modifier: '',
      },
      users: { sortCategory: 'postcount' },
      filter: '',
      sort: 0,
      randomizer: 0,
    },
  };
}

function normalizeHltbEntry(entry) {
  return {
    hltb_id: String(entry.game_id),
    title: entry.game_name,
    image_url: entry.game_image ? `${HLTB_IMAGE_BASE}${entry.game_image}` : null,
    platforms: entry.profile_platform ? entry.profile_platform.split(', ') : [],
    release_year: entry.release_world ? new Date(entry.release_world * 1000).getFullYear() : null,
    hltb_main_story: entry.comp_main ? Math.round(entry.comp_main / 3600) : null,
    hltb_main_plus_extras: entry.comp_plus ? Math.round(entry.comp_plus / 3600) : null,
    hltb_completionist: entry.comp_100 ? Math.round(entry.comp_100 / 3600) : null,
    developer: entry.profile_dev ?? null,
    genre: entry.profile_genre ?? null,
  };
}

/**
 * Search HLTB for games matching the query. Returns normalized results.
 * Fails gracefully — returns empty array on network/parse errors.
 */
export async function searchHltb(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(HLTB_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': UA,
        'Origin': HLTB_BASE,
        'Referer': `${HLTB_BASE}/`,
      },
      body: JSON.stringify(buildHltbPayload(query)),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.data ?? []).map(normalizeHltbEntry);
  } catch {
    return [];
  }
}

// ── IGDB Cover Search ──────────────────────────────────────────

function buildIgdbCoverUrl(imageId, size = 't_cover_big') {
  return `${IGDB_IMAGE_BASE}/${size}/${imageId}.jpg`;
}

function normalizeIgdbEntry(entry) {
  return {
    igdb_id: entry.id,
    title: entry.name,
    cover_image_url: entry.cover?.image_id
      ? buildIgdbCoverUrl(entry.cover.image_id)
      : null,
    released: entry.first_release_date
      ? new Date(entry.first_release_date * 1000).toISOString().substring(0, 10)
      : null,
    release_year: entry.first_release_date
      ? new Date(entry.first_release_date * 1000).getFullYear()
      : null,
    platforms: (entry.platforms ?? []).map((p) => p.name).filter(Boolean),
    genres: (entry.genres ?? []).map((g) => g.name),
    rating: entry.total_rating ? Math.round(entry.total_rating) : null,
    summary: entry.summary ?? null,
  };
}

/**
 * Search IGDB for game cover images and metadata.
 * Requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.
 * Returns empty array if credentials are missing or on error.
 */
export async function searchCovers(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const token = await getTwitchToken();
    if (!token) return [];

    const clientId = process.env.TWITCH_CLIENT_ID;
    const body = `search "${query.trim().replace(/"/g, '\\"')}"; fields name, cover.image_id, first_release_date, genres.name, platforms.name, total_rating, summary; limit 10;`;

    const res = await fetch(`${IGDB_BASE}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (Array.isArray(json) ? json : []).map(normalizeIgdbEntry);
  } catch {
    return [];
  }
}

// ── Combined Search ────────────────────────────────────────────

/**
 * Search both HLTB and IGDB in parallel and merge results by best title match.
 * Returns unified entries with HLTB times + IGDB cover images.
 */
export async function searchGames(query) {
  if (!query || query.trim().length < 2) return [];

  const [hltbResults, igdbResults] = await Promise.all([
    searchHltb(query),
    searchCovers(query),
  ]);

  // Merge: start with HLTB results and try to attach IGDB cover image
  const merged = hltbResults.map((hltb) => {
    const titleLower = hltb.title.toLowerCase();
    const igdbMatch = igdbResults.find(
      (r) => r.title.toLowerCase() === titleLower,
    ) ?? igdbResults.find(
      (r) => r.title.toLowerCase().includes(titleLower) || titleLower.includes(r.title.toLowerCase()),
    );

    return {
      ...hltb,
      cover_image_url: igdbMatch?.cover_image_url ?? hltb.image_url,
      genres: igdbMatch?.genres ?? (hltb.genre ? [hltb.genre] : []),
      metacritic: null,
      source: 'hltb',
    };
  });

  // Add IGDB-only results not already in HLTB results
  for (const igdb of igdbResults) {
    const igdbLower = igdb.title.toLowerCase();
    const alreadyMerged = merged.some(
      (m) => m.title.toLowerCase() === igdbLower,
    );
    if (!alreadyMerged) {
      merged.push({
        hltb_id: null,
        title: igdb.title,
        image_url: igdb.cover_image_url,
        cover_image_url: igdb.cover_image_url,
        platforms: igdb.platforms,
        release_year: igdb.release_year,
        hltb_main_story: null,
        hltb_main_plus_extras: null,
        hltb_completionist: null,
        developer: null,
        genre: igdb.genres[0] ?? null,
        genres: igdb.genres,
        metacritic: null,
        source: 'igdb',
      });
    }
  }

  return merged.slice(0, 15);
}
