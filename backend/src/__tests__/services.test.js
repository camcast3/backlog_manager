import { analyzeVibeInterview } from '../services/vibeService.js';
import { xpForLevel, levelFromXp } from '../services/gamificationService.js';
import { getHltbTtlDays, isHltbStale } from '../services/hltbService.js';
import { analyzeVibeAnswers, VIBE_QUESTIONS, PRIMARY_MOOD_WEIGHT } from '../services/vibeQuestionService.js';
import { searchHltb, searchCovers, searchGames, isIgdbConfigured } from '../services/gameSearchService.js';

describe('vibeService.analyzeVibeInterview', () => {
  // ── Mood tag detection ──────────────────────────────────────────────────────

  test('detects chill/destress mood', () => {
    const result = analyzeVibeInterview('I just want to relax and unwind after work', {});
    expect(result.tags).toContain('destress');
    expect(result.mood_match).toBe('destress');
  });

  test('detects challenge mood', () => {
    const result = analyzeVibeInterview('I love a hard challenge, want something difficult', {});
    expect(result.tags).toContain('challenge');
  });

  test('detects nostalgia mood', () => {
    const result = analyzeVibeInterview('This is a childhood classic I remember playing', {});
    expect(result.tags).toContain('nostalgia');
  });

  test('detects story mood', () => {
    const result = analyzeVibeInterview('The narrative and lore look amazing', {});
    expect(result.tags).toContain('story');
  });

  test('detects adventure mood', () => {
    const result = analyzeVibeInterview('I want to explore an open world and discover secrets', {});
    expect(result.tags).toContain('adventure');
    expect(result.mood_match).toBe('adventure');
  });

  test('detects social mood', () => {
    const result = analyzeVibeInterview('I want to play co-op with friends online', {});
    expect(result.tags).toContain('social');
    expect(result.mood_match).toBe('social');
  });

  test('detects competition mood', () => {
    const result = analyzeVibeInterview('I want to compete in pvp and climb the rank leaderboard', {});
    expect(result.tags).toContain('competition');
    expect(result.mood_match).toBe('competition');
  });

  test('detects creative mood', () => {
    const result = analyzeVibeInterview('I love to build and craft things in a sandbox', {});
    expect(result.tags).toContain('creative');
    expect(result.mood_match).toBe('creative');
  });

  test('detects multiple mood tags when text matches several categories', () => {
    const result = analyzeVibeInterview('I want a hard challenge with a deep story and narrative', {});
    expect(result.tags).toContain('challenge');
    expect(result.tags).toContain('story');
    expect(result.tags.length).toBeGreaterThanOrEqual(2);
  });

  // ── Session length detection ────────────────────────────────────────────────

  test('detects expected session length - short via 30 min', () => {
    const result = analyzeVibeInterview('I only have 30 min to play', {});
    expect(result.expected_session_length).toBe('short');
  });

  test('detects expected session length - short via quick keyword', () => {
    const result = analyzeVibeInterview('I want something quick to pick up', {});
    expect(result.expected_session_length).toBe('short');
  });

  test('detects expected session length - short via lunch keyword', () => {
    const result = analyzeVibeInterview('Perfect for a lunch break session', {});
    expect(result.expected_session_length).toBe('short');
  });

  test('detects expected session length - long', () => {
    const result = analyzeVibeInterview('I have a whole evening and a few hours to spare', {});
    expect(result.expected_session_length).toBe('long');
  });

  test('detects expected session length - marathon via weekend', () => {
    const result = analyzeVibeInterview('I plan to binge this all weekend', {});
    expect(result.expected_session_length).toBe('marathon');
  });

  test('detects expected session length - marathon via all night', () => {
    const result = analyzeVibeInterview('Going to play all night until I beat it', {});
    expect(result.expected_session_length).toBe('marathon');
  });

  test('defaults expected session length to medium when no length keywords match', () => {
    const result = analyzeVibeInterview('I want to play something fun', {});
    expect(result.expected_session_length).toBe('medium');
  });

  // ── Interview answers ───────────────────────────────────────────────────────

  test('includes raw interview answers', () => {
    const answers = { q1: 'adventure seeker', q2: 'open world games' };
    const result = analyzeVibeInterview('Looking for exploration', answers);
    expect(result.raw_interview_answers).toEqual(answers);
    expect(result.tags).toContain('adventure');
  });

  test('interview answers alone contribute to mood when whyText is empty', () => {
    const result = analyzeVibeInterview('', { mood: 'I just want to relax and unwind' });
    expect(result.tags).toContain('destress');
  });

  test('interview answers amplify dominant mood over whyText', () => {
    // whyText: 1 story keyword; interview answers: 4 challenge keywords
    const result = analyzeVibeInterview('The story looks interesting', {
      q1: 'I love a hard challenge',
      q2: 'hardcore games with difficult mechanics',
    });
    expect(result.tags).toContain('challenge');
    expect(result.tags).toContain('story');
    expect(result.mood_match).toBe('challenge');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────

  test('returns empty tags for empty input', () => {
    const result = analyzeVibeInterview('', {});
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
    expect(result.expected_session_length).toBe('medium');
  });

  test('deduplicates tags when multiple keywords from the same mood match', () => {
    const result = analyzeVibeInterview('relax chill unwind calm casual easy', {});
    const destressCount = result.tags.filter((t) => t === 'destress').length;
    expect(destressCount).toBe(1);
  });
});

describe('gamificationService XP / level math', () => {
  // ── xpForLevel ──────────────────────────────────────────────────────────────

  test('xpForLevel returns correct values', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(400);
    expect(xpForLevel(5)).toBe(2500);
  });

  test('xpForLevel(3) returns 900', () => {
    expect(xpForLevel(3)).toBe(900);
  });

  test('xpForLevel(10) returns 10000', () => {
    expect(xpForLevel(10)).toBe(10000);
  });

  test('xpForLevel(20) returns 40000', () => {
    expect(xpForLevel(20)).toBe(40000);
  });

  // ── levelFromXp ─────────────────────────────────────────────────────────────

  test('levelFromXp returns correct level', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(1);  // need > xpForLevel(2) = 400 to reach level 2
    expect(levelFromXp(400)).toBe(2);
    expect(levelFromXp(399)).toBe(1);
    expect(levelFromXp(2500)).toBe(5);
    expect(levelFromXp(2499)).toBe(4);
  });

  test('levelFromXp level 1 baseline', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(50)).toBe(1);
  });

  test('levelFromXp at level 3 boundary', () => {
    expect(levelFromXp(899)).toBe(2);
    expect(levelFromXp(900)).toBe(3);
    expect(levelFromXp(901)).toBe(3);
  });

  test('levelFromXp at level 10 boundary', () => {
    expect(levelFromXp(9999)).toBe(9);
    expect(levelFromXp(10000)).toBe(10);
  });

  test('levelFromXp handles large XP values', () => {
    expect(levelFromXp(40000)).toBe(20);
    expect(levelFromXp(39999)).toBe(19);
  });
});

// ── hltbService ───────────────────────────────────────────────────────────────

describe('hltbService.getHltbTtlDays', () => {
  const currentYear = new Date().getFullYear();

  test('brand-new game (current year) gets 7-day TTL', () => {
    expect(getHltbTtlDays(currentYear)).toBe(7);
  });

  test('game released 2 years ago gets 30-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 2)).toBe(30);
  });

  test('game released 5 years ago gets 90-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 5)).toBe(90);
  });

  test('game released 15 years ago gets 365-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 15)).toBe(365);
  });

  test('game with no release year defaults to 30-day TTL', () => {
    expect(getHltbTtlDays(null)).toBe(30);
    expect(getHltbTtlDays(undefined)).toBe(30);
  });

  test('boundary: age exactly 1 year maps to 30-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 1)).toBe(30);
  });

  test('boundary: age exactly 3 years maps to 90-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 3)).toBe(90);
  });

  test('boundary: age exactly 10 years maps to 365-day TTL', () => {
    expect(getHltbTtlDays(currentYear - 10)).toBe(365);
  });
});

describe('hltbService.isHltbStale', () => {
  const currentYear = new Date().getFullYear();

  test('returns true when hltb_cached_at is null (never cached)', () => {
    expect(isHltbStale({ hltb_cached_at: null, release_year: currentYear - 5 })).toBe(true);
  });

  test('returns true when hltb_cached_at is undefined', () => {
    expect(isHltbStale({ release_year: currentYear - 5 })).toBe(true);
  });

  test('returns false when cached very recently (within TTL)', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(isHltbStale({ hltb_cached_at: oneHourAgo, release_year: currentYear })).toBe(false);
  });

  test('returns true when cache is older than the TTL', () => {
    // 10-day-old cache for a brand-new game (7-day TTL) → stale
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(isHltbStale({ hltb_cached_at: tenDaysAgo, release_year: currentYear })).toBe(true);
  });

  test('returns false for an old game cached 100 days ago (365-day TTL)', () => {
    const hundredDaysAgo = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    expect(isHltbStale({ hltb_cached_at: hundredDaysAgo, release_year: currentYear - 20 })).toBe(false);
  });

  test('returns true for an old game cached 400 days ago (365-day TTL)', () => {
    const fourHundredDaysAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    expect(isHltbStale({ hltb_cached_at: fourHundredDaysAgo, release_year: currentYear - 20 })).toBe(true);
  });

  test('uses 30-day TTL when release_year is absent', () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    // 20 days < 30-day TTL → not stale
    expect(isHltbStale({ hltb_cached_at: twentyDaysAgo })).toBe(false);
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    // 35 days > 30-day TTL → stale
    expect(isHltbStale({ hltb_cached_at: thirtyFiveDaysAgo })).toBe(true);
  });
});

// ── vibeQuestionService ───────────────────────────────────────────────────────

describe('VIBE_QUESTIONS question bank shape', () => {
  test('exports exactly 6 questions', () => {
    expect(VIBE_QUESTIONS).toHaveLength(6);
  });

  test('every question has a unique id, a non-empty question string, and at least 4 answers', () => {
    const ids = VIBE_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of VIBE_QUESTIONS) {
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.answers.length).toBeGreaterThanOrEqual(4);
    }
  });

  test('every answer has id, icon, label, tags array, and mood_weight', () => {
    for (const question of VIBE_QUESTIONS) {
      for (const answer of question.answers) {
        expect(typeof answer.id).toBe('string');
        expect(typeof answer.icon).toBe('string');
        expect(typeof answer.label).toBe('string');
        expect(Array.isArray(answer.tags)).toBe(true);
        expect('mood_weight' in answer).toBe(true);
      }
    }
  });

  test('play_motivation question contains 10 motivation answer options', () => {
    const motivationQuestion = VIBE_QUESTIONS.find((q) => q.id === 'play_motivation');
    expect(motivationQuestion).toBeDefined();
    const answerIds = motivationQuestion.answers.map((a) => a.id);
    for (const id of ['escapism', 'challenge', 'story', 'mastery', 'relaxation', 'social', 'exploration', 'creative', 'nostalgia', 'hype']) {
      expect(answerIds).toContain(id);
    }
  });

  test('session_length question covers all four length values', () => {
    const sessionQuestion = VIBE_QUESTIONS.find((q) => q.id === 'session_length');
    const hints = sessionQuestion.answers.map((a) => a.session_hint);
    for (const hint of ['short', 'medium', 'long', 'marathon']) {
      expect(hints).toContain(hint);
    }
  });
});

describe('vibeQuestionService.analyzeVibeAnswers', () => {
  // ── Basic mood detection ─────────────────────────────────────────────────────

  test('single mood answer sets mood_match and tag correctly', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'challenge' }]);
    expect(result.mood_match).toBe('challenge');
    expect(result.tags).toContain('challenge');
  });

  test('session_length answer sets expected_session_length', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'play_motivation', answer_id: 'story' },
      { question_id: 'session_length', answer_id: 'marathon' },
    ]);
    expect(result.expected_session_length).toBe('marathon');
  });

  test('defaults expected_session_length to medium when session_length not answered', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'exploration' }]);
    expect(result.expected_session_length).toBe('medium');
  });

  // ── Weighted mood election ────────────────────────────────────────────────────

  test(`primary play_motivation question carries ${PRIMARY_MOOD_WEIGHT}x weight over other questions`, () => {
    // play_motivation=challenge (3 votes for challenge)
    // why_now=revisit (1 vote for nostalgia), emotional_tone=peaceful (destress tag only, no mood_weight)
    // challenge (3) > nostalgia (1) → challenge wins
    const result = analyzeVibeAnswers([
      { question_id: 'play_motivation', answer_id: 'challenge' },
      { question_id: 'why_now', answer_id: 'revisit' },
    ]);
    expect(result.mood_match).toBe('challenge');
    expect(result.tags).toContain('challenge');
    expect(result.tags).toContain('nostalgia');
  });

  test('secondary questions can override when play_motivation question is absent', () => {
    // No primary play_motivation question — why_now(deep_lore) votes story
    const result = analyzeVibeAnswers([
      { question_id: 'why_now', answer_id: 'deep_lore' },
    ]);
    expect(result.mood_match).toBe('story');
  });

  test('tied mood votes resolve to whichever appeared first in voting order', () => {
    // Two different moods each with 1 vote and no primary question
    const result = analyzeVibeAnswers([
      { question_id: 'why_now', answer_id: 'challenge_rep' },   // challenge
      { question_id: 'why_now', answer_id: 'deep_lore' },       // story (ignored — same question_id)
    ]);
    // Only one answer per question_id is found, so challenge wins
    expect(result.mood_match).toBe('challenge');
  });

  // ── Tag collection ────────────────────────────────────────────────────────────

  test('tags are deduplicated across answers', () => {
    // challenge appears in: play_motivation(challenge) + play_style(completionist)
    const result = analyzeVibeAnswers([
      { question_id: 'play_motivation', answer_id: 'challenge' },
      { question_id: 'play_style', answer_id: 'completionist' },
    ]);
    const challengeCount = result.tags.filter((t) => t === 'challenge').length;
    expect(challengeCount).toBe(1);
  });

  test('speedrun answer produces challenge tag', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'play_style', answer_id: 'speedrun' },
    ]);
    expect(result.tags).toContain('challenge');
  });

  test('multiplayer answer produces both social and competition tags', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'play_style', answer_id: 'multiplayer' },
    ]);
    expect(result.tags).toContain('social');
    expect(result.tags).toContain('competition');
  });

  // ── Raw answers stored ────────────────────────────────────────────────────────

  test('raw_interview_answers is the original structured answers array', () => {
    const answers = [
      { question_id: 'play_motivation', answer_id: 'nostalgia' },
      { question_id: 'session_length', answer_id: 'short' },
    ];
    const result = analyzeVibeAnswers(answers);
    expect(result.raw_interview_answers).toEqual(answers);
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────

  test('returns empty tags and null mood_match for empty answers array', () => {
    const result = analyzeVibeAnswers([]);
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
    expect(result.expected_session_length).toBe('medium');
  });

  test('silently ignores unknown question_ids', () => {
    const result = analyzeVibeAnswers([{ question_id: 'nonexistent', answer_id: 'whatever' }]);
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
  });

  test('silently ignores unknown answer_ids within a known question', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'not_a_real_answer' }]);
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
  });

  // ── Full six-question flow ────────────────────────────────────────────────────

  test('complete six-question flow produces correct profile', () => {
    const answers = [
      { question_id: 'play_motivation', answer_id: 'story' },
      { question_id: 'energy_level', answer_id: 'steady' },
      { question_id: 'emotional_tone', answer_id: 'epic' },
      { question_id: 'play_style', answer_id: 'main_story' },
      { question_id: 'session_length', answer_id: 'long' },
      { question_id: 'why_now', answer_id: 'deep_lore' },
    ];
    const result = analyzeVibeAnswers(answers);
    expect(result.mood_match).toBe('story');
    expect(result.expected_session_length).toBe('long');
    expect(result.tags).toContain('story');
    expect(result.play_motivation).toBe('story');
    expect(result.energy_level).toBe('steady');
    expect(result.emotional_tone_pref).toBe('epic');
    expect(result.play_style).toBe('main_story');
    // story appears in play_motivation, play_style, why_now answers → deduped to 1
    expect(result.tags.filter((t) => t === 'story').length).toBe(1);
  });
});

// ── gameSearchService ─────────────────────────────────────────────────────────

describe('gameSearchService', () => {
  describe('searchHltb', () => {
    test('returns empty array for empty query', async () => {
      expect(await searchHltb('')).toEqual([]);
    });

    test('returns empty array for single character query', async () => {
      expect(await searchHltb('a')).toEqual([]);
    });

    test('returns array of results for valid query', async () => {
      const results = await searchHltb('Elden Ring');
      expect(Array.isArray(results)).toBe(true);
      // May return results from HLTB or empty if API is unreachable
      if (results.length > 0) {
        const first = results[0];
        expect(typeof first.title).toBe('string');
        expect(first.title.length).toBeGreaterThan(0);
        expect(typeof first.hltb_id).toBe('string');
        // HLTB fields should be numbers or null
        for (const field of ['hltb_main_story', 'hltb_main_plus_extras', 'hltb_completionist']) {
          expect(first[field] === null || typeof first[field] === 'number').toBe(true);
        }
      }
    });

    test('returns results with image_url for known games', async () => {
      const results = await searchHltb('The Witcher 3');
      if (results.length > 0) {
        const first = results[0];
        if (first.image_url) {
          expect(first.image_url).toMatch(/^https:\/\//);
        }
      }
    });
  });

  describe('searchCovers', () => {
    test('returns empty array for empty query', async () => {
      expect(await searchCovers('')).toEqual([]);
    });

    test('returns empty array without IGDB credentials', async () => {
      const origId = process.env.TWITCH_CLIENT_ID;
      const origSecret = process.env.TWITCH_CLIENT_SECRET;
      delete process.env.TWITCH_CLIENT_ID;
      delete process.env.TWITCH_CLIENT_SECRET;
      const results = await searchCovers('Mario');
      expect(results).toEqual([]);
      if (origId) process.env.TWITCH_CLIENT_ID = origId;
      if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret;
    });
  });

  describe('isIgdbConfigured', () => {
    test('returns false when credentials are missing', () => {
      const origId = process.env.TWITCH_CLIENT_ID;
      const origSecret = process.env.TWITCH_CLIENT_SECRET;
      delete process.env.TWITCH_CLIENT_ID;
      delete process.env.TWITCH_CLIENT_SECRET;
      expect(isIgdbConfigured()).toBe(false);
      if (origId) process.env.TWITCH_CLIENT_ID = origId;
      if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret;
    });

    test('returns false when only client ID is set', () => {
      const origId = process.env.TWITCH_CLIENT_ID;
      const origSecret = process.env.TWITCH_CLIENT_SECRET;
      process.env.TWITCH_CLIENT_ID = 'test-id';
      delete process.env.TWITCH_CLIENT_SECRET;
      expect(isIgdbConfigured()).toBe(false);
      if (origId) process.env.TWITCH_CLIENT_ID = origId; else delete process.env.TWITCH_CLIENT_ID;
      if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret;
    });

    test('returns true when both credentials are set', () => {
      const origId = process.env.TWITCH_CLIENT_ID;
      const origSecret = process.env.TWITCH_CLIENT_SECRET;
      process.env.TWITCH_CLIENT_ID = 'test-id';
      process.env.TWITCH_CLIENT_SECRET = 'test-secret';
      expect(isIgdbConfigured()).toBe(true);
      if (origId) process.env.TWITCH_CLIENT_ID = origId; else delete process.env.TWITCH_CLIENT_ID;
      if (origSecret) process.env.TWITCH_CLIENT_SECRET = origSecret; else delete process.env.TWITCH_CLIENT_SECRET;
    });
  });

  describe('searchGames (combined)', () => {
    test('returns empty array for empty query', async () => {
      expect(await searchGames('')).toEqual([]);
    });

    test('returns empty array for single char query', async () => {
      expect(await searchGames('x')).toEqual([]);
    });

    test('returns array with source field for valid query', async () => {
      const results = await searchGames('Hollow Knight');
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        for (const r of results) {
          expect(['hltb', 'igdb']).toContain(r.source);
          expect(typeof r.title).toBe('string');
        }
      }
    });

    test('results have expected shape fields', async () => {
      const results = await searchGames('Dark Souls');
      if (results.length > 0) {
        const r = results[0];
        expect(r).toHaveProperty('title');
        expect(r).toHaveProperty('cover_image_url');
        expect(r).toHaveProperty('hltb_main_story');
        expect(r).toHaveProperty('hltb_main_plus_extras');
        expect(r).toHaveProperty('hltb_completionist');
        expect(r).toHaveProperty('developer');
        expect(r).toHaveProperty('source');
      }
    });

    test('IGDB results are primary when available', async () => {
      const results = await searchGames('Elden Ring');
      if (results.length > 0) {
        const igdbResult = results.find((r) => r.source === 'igdb');
        if (igdbResult) {
          expect(igdbResult.igdb_id).toBeTruthy();
          // HLTB times attached to IGDB primary result
          if (igdbResult.hltb_id) {
            expect(typeof igdbResult.hltb_main_story === 'number' || igdbResult.hltb_main_story === null).toBe(true);
          }
        }
      }
    });

    test('limits results to 15 max', async () => {
      const results = await searchGames('Mario');
      expect(results.length).toBeLessThanOrEqual(15);
    });
  });
});

// ── vibeQuestionService ─────────────────────────────────────────────────────

describe('vibeQuestionService.analyzeVibeAnswers', () => {
  test('returns play_motivation="escapism" when answered with escapism', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'escapism' }]);
    expect(result.play_motivation).toBe('escapism');
  });

  test('returns play_motivation="challenge" when answered with challenge', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'challenge' }]);
    expect(result.play_motivation).toBe('challenge');
  });

  test('returns energy_level from energy_level question', () => {
    const cozy = analyzeVibeAnswers([{ question_id: 'energy_level', answer_id: 'cozy' }]);
    expect(cozy.energy_level).toBe('cozy');

    const intense = analyzeVibeAnswers([{ question_id: 'energy_level', answer_id: 'intense' }]);
    expect(intense.energy_level).toBe('intense');
  });

  test('returns emotional_tone_pref from emotional_tone question', () => {
    const hw = analyzeVibeAnswers([{ question_id: 'emotional_tone', answer_id: 'heartwarming' }]);
    expect(hw.emotional_tone_pref).toBe('heartwarming');

    const dark = analyzeVibeAnswers([{ question_id: 'emotional_tone', answer_id: 'dark' }]);
    expect(dark.emotional_tone_pref).toBe('dark');
  });

  test('returns play_style from play_style question', () => {
    const comp = analyzeVibeAnswers([{ question_id: 'play_style', answer_id: 'completionist' }]);
    expect(comp.play_style).toBe('completionist');

    const expl = analyzeVibeAnswers([{ question_id: 'play_style', answer_id: 'explorer' }]);
    expect(expl.play_style).toBe('explorer');
  });

  test('returns session_length from session_length question', () => {
    const short = analyzeVibeAnswers([{ question_id: 'session_length', answer_id: 'short' }]);
    expect(short.expected_session_length).toBe('short');

    const marathon = analyzeVibeAnswers([{ question_id: 'session_length', answer_id: 'marathon' }]);
    expect(marathon.expected_session_length).toBe('marathon');
  });

  test('play_motivation gets PRIMARY_MOOD_WEIGHT votes vs 1 for others', () => {
    // escapism → mood_weight 'destress' with weight 3
    // challenge_rep → mood_weight 'challenge' with weight 1
    // destress should win because 3 > 1
    const result = analyzeVibeAnswers([
      { question_id: 'play_motivation', answer_id: 'escapism' },
      { question_id: 'why_now', answer_id: 'challenge_rep' },
    ]);
    expect(result.mood_match).toBe('destress');
  });

  test('tags are de-duplicated', () => {
    // 'mastery' answer has tags ['challenge','mastery'], 'completionist' has ['challenge','mastery']
    const result = analyzeVibeAnswers([
      { question_id: 'play_motivation', answer_id: 'mastery' },
      { question_id: 'play_style', answer_id: 'completionist' },
    ]);
    const challengeCount = result.tags.filter((t) => t === 'challenge').length;
    const masteryCount = result.tags.filter((t) => t === 'mastery').length;
    expect(challengeCount).toBe(1);
    expect(masteryCount).toBe(1);
  });

  test('unknown question_ids are ignored', () => {
    const result = analyzeVibeAnswers([{ question_id: 'nonexistent', answer_id: 'escapism' }]);
    expect(result.play_motivation).toBeNull();
    expect(result.tags).toEqual([]);
  });

  test('unknown answer_ids are ignored', () => {
    const result = analyzeVibeAnswers([{ question_id: 'play_motivation', answer_id: 'nonexistent' }]);
    expect(result.play_motivation).toBeNull();
    expect(result.tags).toEqual([]);
  });

  test('empty array returns nulls and default session_length="medium"', () => {
    const result = analyzeVibeAnswers([]);
    expect(result.play_motivation).toBeNull();
    expect(result.energy_level).toBeNull();
    expect(result.emotional_tone_pref).toBeNull();
    expect(result.play_style).toBeNull();
    expect(result.mood_match).toBeNull();
    expect(result.expected_session_length).toBe('medium');
    expect(result.tags).toEqual([]);
  });

  test('raw_interview_answers is passed through unchanged', () => {
    const input = [
      { question_id: 'play_motivation', answer_id: 'escapism' },
      { question_id: 'energy_level', answer_id: 'cozy' },
    ];
    const result = analyzeVibeAnswers(input);
    expect(result.raw_interview_answers).toBe(input);
  });
});

describe('VIBE_QUESTIONS structure', () => {
  const questionMap = Object.fromEntries(VIBE_QUESTIONS.map((q) => [q.id, q]));

  test('all 6 questions exist', () => {
    const ids = VIBE_QUESTIONS.map((q) => q.id);
    expect(ids).toContain('play_motivation');
    expect(ids).toContain('energy_level');
    expect(ids).toContain('emotional_tone');
    expect(ids).toContain('play_style');
    expect(ids).toContain('session_length');
    expect(ids).toContain('why_now');
    expect(VIBE_QUESTIONS.length).toBe(6);
  });

  test('play_motivation has 10 answers', () => {
    expect(questionMap.play_motivation.answers.length).toBe(10);
  });

  test('energy_level has 5 answers', () => {
    expect(questionMap.energy_level.answers.length).toBe(5);
  });

  test('emotional_tone has 10 answers', () => {
    expect(questionMap.emotional_tone.answers.length).toBe(10);
  });

  test('play_style has 7 answers', () => {
    expect(questionMap.play_style.answers.length).toBe(7);
  });

  test('session_length has 4 answers', () => {
    expect(questionMap.session_length.answers.length).toBe(4);
  });

  test('why_now has 8 answers', () => {
    expect(questionMap.why_now.answers.length).toBe(8);
  });

  test('required questions: play_motivation, energy_level, session_length', () => {
    expect(questionMap.play_motivation.required).toBe(true);
    expect(questionMap.energy_level.required).toBe(true);
    expect(questionMap.session_length.required).toBe(true);
  });

  test('optional questions: emotional_tone, play_style, why_now', () => {
    expect(questionMap.emotional_tone.required).toBe(false);
    expect(questionMap.play_style.required).toBe(false);
    expect(questionMap.why_now.required).toBe(false);
  });

  test('every answer has id, icon, label, tags fields', () => {
    for (const question of VIBE_QUESTIONS) {
      for (const answer of question.answers) {
        expect(answer).toHaveProperty('id');
        expect(answer).toHaveProperty('icon');
        expect(answer).toHaveProperty('label');
        expect(answer).toHaveProperty('tags');
        expect(typeof answer.id).toBe('string');
        expect(typeof answer.icon).toBe('string');
        expect(typeof answer.label).toBe('string');
        expect(Array.isArray(answer.tags)).toBe(true);
      }
    }
  });
});
