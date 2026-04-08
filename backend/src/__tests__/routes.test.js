import { jest, describe, test, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';

// ── Mock the database BEFORE any module that imports it is loaded ─────────────
// queryQueue is consumed in FIFO order by the mock SQL tagged-template function.
// Each tagged-template call (sql`...`) shifts the next result off the queue.
// sql(identifier) calls (used for dynamic column names) return the raw string.
const queryQueue = [];

const mockSql = Object.assign(
  jest.fn((stringsOrId, ...vals) => {
    if (Array.isArray(stringsOrId)) {
      // Tagged-template call — return next queued result (default: empty array)
      return Promise.resolve(queryQueue.shift() ?? []);
    }
    // Identifier-escape call: sql(columnName) — return the name unchanged
    return stringsOrId;
  }),
  { array: (a) => a, json: (o) => o },
);

jest.unstable_mockModule('../db/index.js', () => ({
  default: () => mockSql,
}));

// Dynamic import must come AFTER the mock is registered
const { buildServer } = await import('../server.js');

// ── Shared server instance ────────────────────────────────────────────────────
let app;

beforeAll(async () => {
  app = buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  queryQueue.length = 0;
  mockSql.mockClear();
});

// ── Health check ──────────────────────────────────────────────────────────────
describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(typeof body.ts).toBe('string');
  });
});

// ── Games routes ──────────────────────────────────────────────────────────────
describe('GET /api/games/:id', () => {
  test('returns 200 with the game when found', async () => {
    queryQueue.push([{ id: 1, title: 'Hollow Knight', platform: 'PC (Steam)' }]);
    const res = await app.inject({ method: 'GET', url: '/api/games/1' });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Hollow Knight');
  });

  test('returns 404 when game does not exist', async () => {
    queryQueue.push([]);
    const res = await app.inject({ method: 'GET', url: '/api/games/999' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Game not found');
  });
});

describe('POST /api/games', () => {
  test('returns 400 when title is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { platform: 'PC (Steam)' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/title/);
  });

  test('returns 400 when platform is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { title: 'Test Game' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/platform/);
  });

  test('returns 201 with the created game on success', async () => {
    queryQueue.push([{
      id: 1, title: 'Elden Ring', platform: 'PS5',
      vibe_intensity: 'intense', vibe_story_pace: 'steady',
    }]);
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { title: 'Elden Ring', platform: 'PS5' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().title).toBe('Elden Ring');
  });
});

describe('PATCH /api/games/:id', () => {
  test('returns 400 when no valid fields are provided', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/games/1',
      payload: { unknown_field: 'value' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/No valid fields/);
  });
});

describe('DELETE /api/games/:id', () => {
  test('returns 200 with deleted flag on success', async () => {
    queryQueue.push([{ id: 1 }]);
    const res = await app.inject({ method: 'DELETE', url: '/api/games/1' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ deleted: true, id: 1 });
  });

  test('returns 404 when game does not exist', async () => {
    queryQueue.push([]);
    const res = await app.inject({ method: 'DELETE', url: '/api/games/999' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Game not found');
  });
});

describe('GET /api/games/platforms/list', () => {
  test('returns 200 with sorted platform names', async () => {
    queryQueue.push([{ platform: 'PC (Steam)' }, { platform: 'PS5' }]);
    const res = await app.inject({ method: 'GET', url: '/api/games/platforms/list' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(['PC (Steam)', 'PS5']);
  });
});

describe('POST /api/games/:id/refresh-hltb', () => {
  test('returns 200 with updated game including hltb_stale=false when just refreshed', async () => {
    const now = new Date().toISOString();
    queryQueue.push([{
      id: 1, title: 'Hollow Knight', platform: 'PC (Steam)',
      release_year: 2017,
      hltb_main_story: 27.0, hltb_main_plus_extras: 40.5, hltb_completionist: 62.0,
      hltb_cached_at: now,
    }]);
    const res = await app.inject({
      method: 'POST',
      url: '/api/games/1/refresh-hltb',
      payload: { hltb_main_story: 27.0, hltb_main_plus_extras: 40.5, hltb_completionist: 62.0 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.hltb_main_story).toBe(27.0);
    expect(body.hltb_stale).toBe(false);
  });

  test('returns 404 when game does not exist', async () => {
    queryQueue.push([]);  // UPDATE RETURNING returns empty
    const res = await app.inject({
      method: 'POST',
      url: '/api/games/999/refresh-hltb',
      payload: { hltb_main_story: 10.0 },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Game not found');
  });
});

// ── Backlog routes ────────────────────────────────────────────────────────────
describe('GET /api/backlog/stats', () => {
  test('returns 200 with status counts', async () => {
    queryQueue.push([{
      want_to_play: '3', playing: '1', completed: '5',
      dropped: '2', on_hold: '0', total: '11', total_hours: '120',
    }]);
    const res = await app.inject({ method: 'GET', url: '/api/backlog/stats' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe('11');
    expect(body.completed).toBe('5');
  });
});

describe('GET /api/backlog/:id', () => {
  test('returns 404 when backlog item does not exist', async () => {
    queryQueue.push([]);
    const res = await app.inject({ method: 'GET', url: '/api/backlog/999' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Backlog item not found');
  });
});

describe('POST /api/backlog', () => {
  test('returns 400 when game_id is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/backlog',
      payload: { priority: 70 },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('game_id is required');
  });

  test('returns 404 when referenced game does not exist', async () => {
    queryQueue.push([]); // SELECT game returns empty
    const res = await app.inject({
      method: 'POST',
      url: '/api/backlog',
      payload: { game_id: 999 },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Game not found');
  });
});

describe('PATCH /api/backlog/:id', () => {
  test('returns 404 when backlog item does not exist', async () => {
    queryQueue.push([]); // SELECT existing returns empty
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/backlog/999',
      payload: { status: 'playing' },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Backlog item not found');
  });

  test('returns 400 when no valid fields are provided', async () => {
    queryQueue.push([{
      id: 1, game_id: 1, status: 'want_to_play',
      date_started: null, date_completed: null,
    }]);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/backlog/1',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('No valid fields to update');
  });
});

describe('DELETE /api/backlog/:id', () => {
  test('returns 404 when backlog item does not exist', async () => {
    queryQueue.push([]);
    const res = await app.inject({ method: 'DELETE', url: '/api/backlog/999' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Backlog item not found');
  });
});

describe('POST /api/backlog/:id/staleness-response', () => {
  test('returns 400 when response field is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/backlog/1/staleness-response',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('response is required');
  });

  test('returns 404 when backlog item does not exist', async () => {
    queryQueue.push([]); // SELECT id returns empty
    const res = await app.inject({
      method: 'POST',
      url: '/api/backlog/999/staleness-response',
      payload: { response: 'just forgot about it' },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('Backlog item not found');
  });
});

// ── Progress routes ───────────────────────────────────────────────────────────
describe('GET /api/progress', () => {
  test('returns 200 with correct level_progress_pct calculation', async () => {
    // level=1, xp=200; xpForLevel(1)=100, xpForLevel(2)=400
    // pct = Math.round((200 - 100) / (400 - 100) * 100) = Math.round(33.33) = 33
    queryQueue.push([{
      id: 1, xp: 200, level: 1,
      games_added: 3, games_completed: 0, games_dropped: 0,
    }]);
    const res = await app.inject({ method: 'GET', url: '/api/progress' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.xp_to_next_level).toBe(200);   // 400 - 200
    expect(body.level_progress_pct).toBe(33);  // Math.round(100 / 300 * 100)
  });

  test('level_progress_pct is 0 at the exact level threshold', async () => {
    // level=2, xp=400; xpForLevel(2)=400, xpForLevel(3)=900
    // pct = Math.round((400 - 400) / (900 - 400) * 100) = 0
    queryQueue.push([{
      id: 1, xp: 400, level: 2,
      games_added: 5, games_completed: 1, games_dropped: 0,
    }]);
    const res = await app.inject({ method: 'GET', url: '/api/progress' });
    expect(res.statusCode).toBe(200);
    expect(res.json().level_progress_pct).toBe(0);
  });
});

describe('GET /api/progress/achievements', () => {
  test('returns 200 with achievements list', async () => {
    queryQueue.push([
      { id: 1, key: 'first_game', title: 'First Game', earned: true, earned_at: '2026-01-01' },
      { id: 2, key: 'backlog_5', title: 'Backlog Builder', earned: false, earned_at: null },
    ]);
    const res = await app.inject({ method: 'GET', url: '/api/progress/achievements' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body[0].key).toBe('first_game');
  });
});

describe('GET /api/progress/activity', () => {
  test('returns 200 with recent activity feed', async () => {
    queryQueue.push([
      { earned_at: '2026-01-01', achievement_title: 'First Game', icon: '', xp_reward: 50, context: {} },
    ]);
    const res = await app.inject({ method: 'GET', url: '/api/progress/activity' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].achievement_title).toBe('First Game');
  });
});

// ── Vibe questions route ──────────────────────────────────────────────────────
describe('GET /api/vibe-questions', () => {
  test('returns 200 with all 5 questions', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/vibe-questions' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(5);
  });

  test('each question has id, question text, type, and answers array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/vibe-questions' });
    for (const q of res.json()) {
      expect(typeof q.id).toBe('string');
      expect(typeof q.question).toBe('string');
      expect(typeof q.type).toBe('string');
      expect(Array.isArray(q.answers)).toBe(true);
    }
  });

  test('mood question contains all 8 mood answer options', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/vibe-questions' });
    const moodQ = res.json().find((q) => q.id === 'mood');
    expect(moodQ).toBeDefined();
    expect(moodQ.answers).toHaveLength(8);
    const ids = moodQ.answers.map((a) => a.id);
    for (const mood of ['destress', 'challenge', 'story', 'nostalgia', 'adventure', 'competition', 'social', 'creative']) {
      expect(ids).toContain(mood);
    }
  });

  test('every answer has emoji and label fields for UI rendering', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/vibe-questions' });
    for (const question of res.json()) {
      for (const answer of question.answers) {
        expect(typeof answer.emoji).toBe('string');
        expect(answer.emoji.length).toBeGreaterThan(0);
        expect(typeof answer.label).toBe('string');
        expect(answer.label.length).toBeGreaterThan(0);
      }
    }
  });
});

// ── Search routes ─────────────────────────────────────────────────────────────
describe('GET /api/search/games', () => {
  test('returns 400 when q is missing', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/games' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/2.*200 characters/);
  });

  test('returns 400 when q is too short', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/games?q=a' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 200 with results array for valid query', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/games?q=elden+ring' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.query).toBe('elden ring');
    expect(Array.isArray(body.results)).toBe(true);
    expect(typeof body.count).toBe('number');
  });
});

describe('GET /api/search/hltb', () => {
  test('returns 400 when q is missing', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/hltb' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 200 with results for valid query', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/hltb?q=zelda' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.query).toBe('zelda');
    expect(Array.isArray(body.results)).toBe(true);
  });
});

describe('GET /api/search/covers', () => {
  test('returns 400 when q is missing', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/covers' });
    expect(res.statusCode).toBe(400);
  });

  test('returns warning and empty results without IGDB credentials', async () => {
    const origId = process.env.TWITCH_CLIENT_ID;
    const origSecret = process.env.TWITCH_CLIENT_SECRET;
    delete process.env.TWITCH_CLIENT_ID;
    delete process.env.TWITCH_CLIENT_SECRET;
    const res = await app.inject({ method: 'GET', url: '/api/search/covers?q=mario' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.results).toEqual([]);
    expect(body.warning).toMatch(/IGDB not configured/);
    if (origId) process.env.TWITCH_CLIENT_ID = origId;
    if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret;
  });
});

describe('GET /api/search/status', () => {
  test('returns hltb: true always', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search/status' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.hltb).toBe(true);
    expect(typeof body.igdb).toBe('boolean');
    expect(typeof body.message).toBe('string');
  });

  test('returns igdb: false and helpful message when credentials missing', async () => {
    const origId = process.env.TWITCH_CLIENT_ID;
    const origSecret = process.env.TWITCH_CLIENT_SECRET;
    delete process.env.TWITCH_CLIENT_ID;
    delete process.env.TWITCH_CLIENT_SECRET;
    const res = await app.inject({ method: 'GET', url: '/api/search/status' });
    const body = res.json();
    expect(body.igdb).toBe(false);
    expect(body.message).toMatch(/TWITCH_CLIENT_ID/);
    if (origId) process.env.TWITCH_CLIENT_ID = origId;
    if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret;
  });
});
