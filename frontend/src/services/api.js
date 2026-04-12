const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ── Games ──────────────────────────────────────────────────────
export const gamesApi = {
  list: (params = {}) => request('GET', `/games?${new URLSearchParams(params)}`),
  get: (id) => request('GET', `/games/${id}`),
  create: (data) => request('POST', '/games', data),
  update: (id, data) => request('PATCH', `/games/${id}`, data),
  delete: (id) => request('DELETE', `/games/${id}`),
  platforms: () => request('GET', '/games/platforms/list'),
};

// ── Backlog ────────────────────────────────────────────────────
export const backlogApi = {
  list: (params = {}) => request('GET', `/backlog?${new URLSearchParams(params)}`),
  stats: () => request('GET', '/backlog/stats'),
  staleness: () => request('GET', '/backlog/staleness'),
  get: (id) => request('GET', `/backlog/${id}`),
  add: (data) => request('POST', '/backlog', data),
  update: (id, data) => request('PATCH', `/backlog/${id}`, data),
  delete: (id) => request('DELETE', `/backlog/${id}`),
  stalenessResponse: (id, response) =>
    request('POST', `/backlog/${id}/staleness-response`, { response }),
};

// ── Progress / Gamification ────────────────────────────────────
export const progressApi = {
  get: () => request('GET', '/progress'),
  achievements: () => request('GET', '/progress/achievements'),
  activity: () => request('GET', '/progress/activity'),
};

// ── Game Search (HLTB + IGDB) ─────────────────────────────────
export const searchApi = {
  games: (q) => request('GET', `/search/games?${new URLSearchParams({ q })}`),
  hltb: (q) => request('GET', `/search/hltb?${new URLSearchParams({ q })}`),
  covers: (q) => request('GET', `/search/covers?${new URLSearchParams({ q })}`),
  status: () => request('GET', '/search/status'),
};

// ── Sessions ──────────────────────────────────────────────────
export const sessionsApi = {
  log: (backlogItemId, data) => request('POST', `/backlog/${backlogItemId}/sessions`, data),
  list: (backlogItemId) => request('GET', `/backlog/${backlogItemId}/sessions`),
  rate: (backlogItemId, rating) => request('PATCH', `/backlog/${backlogItemId}/rating`, { rating }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  completionTrends: () => request('GET', '/analytics/completion-trends'),
  genreBreakdown:   () => request('GET', '/analytics/genre-breakdown'),
  platformDist:     () => request('GET', '/analytics/platform-distribution'),
  playtimeStats:    () => request('GET', '/analytics/playtime-stats'),
  backlogHealth:    () => request('GET', '/analytics/backlog-health'),
  vibeMap:          () => request('GET', '/analytics/vibe-map'),
  statusDist:       () => request('GET', '/analytics/status-distribution'),
};

// ── Recommendations ───────────────────────────────────────────
export const recommendApi = {
  get: (params = {}) => request('GET', `/recommendations?${new URLSearchParams(params)}`),
};
