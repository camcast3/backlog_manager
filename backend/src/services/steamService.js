/**
 * Steam integration service — fetches a user's Steam library
 * and categorizes games for smart import.
 *
 * Requires STEAM_API_KEY environment variable.
 * Get one free at https://steamcommunity.com/dev/apikey
 */

const STEAM_API_BASE = 'https://api.steampowered.com';

function getSteamApiKey() {
  return process.env.STEAM_API_KEY || '';
}

/**
 * Resolve a Steam vanity URL (custom profile name) to a 64-bit Steam ID.
 * E.g., "gabelogannewell" → "76561197960287930"
 */
export async function resolveVanityUrl(vanityName) {
  const key = getSteamApiKey();
  if (!key) throw new Error('STEAM_API_KEY not configured');

  const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${encodeURIComponent(vanityName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);

  const data = await res.json();
  if (data.response.success !== 1) {
    throw new Error('Could not resolve Steam profile. Check the username or use a Steam ID instead.');
  }
  return data.response.steamid;
}

/**
 * Fetch a user's owned games from Steam.
 * Returns categorized games: unplayed, recent, mostPlayed, all.
 */
export async function fetchSteamLibrary(steamId) {
  const key = getSteamApiKey();
  if (!key) throw new Error('STEAM_API_KEY not configured');

  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);

  const data = await res.json();
  const games = data.response?.games || [];

  if (games.length === 0) {
    throw new Error('No games found. The Steam profile may be private — game details must be set to public.');
  }

  const enriched = games.map((g) => ({
    appid: g.appid,
    name: g.name,
    playtime_hours: Math.round((g.playtime_forever || 0) / 60 * 10) / 10,
    playtime_minutes: g.playtime_forever || 0,
    icon_url: g.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
      : null,
    header_url: `https://steamcdn-a.akamaihd.net/steam/apps/${g.appid}/header.jpg`,
  }));

  // Sort all by name
  enriched.sort((a, b) => a.name.localeCompare(b.name));

  // Categorize
  const unplayed = enriched.filter((g) => g.playtime_minutes === 0);
  const played = enriched.filter((g) => g.playtime_minutes > 0);
  const mostPlayed = [...played].sort((a, b) => b.playtime_minutes - a.playtime_minutes).slice(0, 50);

  return {
    total: enriched.length,
    categories: {
      unplayed: { label: 'Unplayed — Your Real Backlog', count: unplayed.length, games: unplayed },
      most_played: { label: 'Most Played', count: mostPlayed.length, games: mostPlayed },
      all: { label: 'Full Library', count: enriched.length, games: enriched },
    },
  };
}

/**
 * Determine suggested backlog status based on Steam playtime.
 */
export function suggestStatus(playtimeMinutes) {
  if (playtimeMinutes === 0) return 'want_to_play';
  return 'playing';
}
