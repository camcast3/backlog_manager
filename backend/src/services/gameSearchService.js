/**
 * Game search service — searches HLTB for completion times and RAWG for cover images.
 *
 * Uses native fetch (Node 18+) to avoid third-party HTTP library vulnerabilities.
 */

const HLTB_BASE = 'https://howlongtobeat.com';
const HLTB_SEARCH_URL = `${HLTB_BASE}/api/search`;
const HLTB_IMAGE_BASE = `${HLTB_BASE}/games/`;

const RAWG_BASE = 'https://api.rawg.io/api';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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

// ── RAWG Cover Search ──────────────────────────────────────────

function normalizeRawgEntry(entry) {
  return {
    rawg_id: entry.id,
    title: entry.name,
    cover_image_url: entry.background_image ?? null,
    released: entry.released ?? null,
    release_year: entry.released ? parseInt(entry.released.substring(0, 4), 10) : null,
    platforms: (entry.platforms ?? []).map((p) => p.platform?.name).filter(Boolean),
    genres: (entry.genres ?? []).map((g) => g.name),
    rating: entry.rating ?? null,
    metacritic: entry.metacritic ?? null,
  };
}

/**
 * Search RAWG for game cover images and metadata.
 * Requires RAWG_API_KEY environment variable. Returns empty array if missing.
 */
export async function searchCovers(query) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey || !query || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams({
      key: apiKey,
      search: query.trim(),
      page_size: '10',
      search_precise: 'true',
    });

    const res = await fetch(`${RAWG_BASE}/games?${params}`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.results ?? []).map(normalizeRawgEntry);
  } catch {
    return [];
  }
}

// ── Combined Search ────────────────────────────────────────────

/**
 * Search both HLTB and RAWG in parallel and merge results by best title match.
 * Returns unified entries with HLTB times + RAWG cover images.
 */
export async function searchGames(query) {
  if (!query || query.trim().length < 2) return [];

  const [hltbResults, rawgResults] = await Promise.all([
    searchHltb(query),
    searchCovers(query),
  ]);

  // Merge: start with HLTB results and try to attach RAWG cover image
  const merged = hltbResults.map((hltb) => {
    const titleLower = hltb.title.toLowerCase();
    const rawgMatch = rawgResults.find(
      (r) => r.title.toLowerCase() === titleLower,
    ) ?? rawgResults.find(
      (r) => r.title.toLowerCase().includes(titleLower) || titleLower.includes(r.title.toLowerCase()),
    );

    return {
      ...hltb,
      cover_image_url: rawgMatch?.cover_image_url ?? hltb.image_url,
      genres: rawgMatch?.genres ?? (hltb.genre ? [hltb.genre] : []),
      metacritic: rawgMatch?.metacritic ?? null,
      source: 'hltb',
    };
  });

  // Add RAWG-only results not already in HLTB results
  for (const rawg of rawgResults) {
    const rawgLower = rawg.title.toLowerCase();
    const alreadyMerged = merged.some(
      (m) => m.title.toLowerCase() === rawgLower,
    );
    if (!alreadyMerged) {
      merged.push({
        hltb_id: null,
        title: rawg.title,
        image_url: rawg.cover_image_url,
        cover_image_url: rawg.cover_image_url,
        platforms: rawg.platforms,
        release_year: rawg.release_year,
        hltb_main_story: null,
        hltb_main_plus_extras: null,
        hltb_completionist: null,
        developer: null,
        genre: rawg.genres[0] ?? null,
        genres: rawg.genres,
        metacritic: rawg.metacritic,
        source: 'rawg',
      });
    }
  }

  return merged.slice(0, 15);
}
