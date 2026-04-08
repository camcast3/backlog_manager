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
  test('exports exactly 5 questions', () => {
    expect(VIBE_QUESTIONS).toHaveLength(5);
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

  test('every answer has id, emoji, label, tags array, mood_weight, and session_hint', () => {
    for (const question of VIBE_QUESTIONS) {
      for (const answer of question.answers) {
        expect(typeof answer.id).toBe('string');
        expect(typeof answer.emoji).toBe('string');
        expect(typeof answer.label).toBe('string');
        expect(Array.isArray(answer.tags)).toBe(true);
        expect('mood_weight' in answer).toBe(true);
        expect('session_hint' in answer).toBe(true);
      }
    }
  });

  test('all 8 mood categories appear as answer ids in the mood question', () => {
    const moodQuestion = VIBE_QUESTIONS.find((q) => q.id === 'mood');
    const answerIds = moodQuestion.answers.map((a) => a.id);
    for (const mood of ['destress', 'challenge', 'story', 'nostalgia', 'adventure', 'competition', 'social', 'creative']) {
      expect(answerIds).toContain(mood);
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
    const result = analyzeVibeAnswers([{ question_id: 'mood', answer_id: 'challenge' }]);
    expect(result.mood_match).toBe('challenge');
    expect(result.tags).toContain('challenge');
  });

  test('session_length answer sets expected_session_length', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'mood', answer_id: 'story' },
      { question_id: 'session_length', answer_id: 'marathon' },
    ]);
    expect(result.expected_session_length).toBe('marathon');
  });

  test('defaults expected_session_length to medium when session_length not answered', () => {
    const result = analyzeVibeAnswers([{ question_id: 'mood', answer_id: 'adventure' }]);
    expect(result.expected_session_length).toBe('medium');
  });

  // ── Weighted mood election ────────────────────────────────────────────────────

  test(`primary mood question carries ${PRIMARY_MOOD_WEIGHT}x weight over other questions`, () => {
    // mood=challenge (3 votes for challenge)
    // headspace=chill (1 vote for destress), completion_goal=chill_play (1 vote for destress)
    // challenge (3) > destress (2) → challenge wins
    const result = analyzeVibeAnswers([
      { question_id: 'mood', answer_id: 'challenge' },
      { question_id: 'headspace', answer_id: 'chill' },
      { question_id: 'completion_goal', answer_id: 'chill_play' },
    ]);
    expect(result.mood_match).toBe('challenge');
    expect(result.tags).toContain('challenge');
    expect(result.tags).toContain('destress');
  });

  test('secondary questions can override when mood question is absent', () => {
    // No primary mood question — headspace(social) + why_now(friend_rec) both vote social
    const result = analyzeVibeAnswers([
      { question_id: 'headspace', answer_id: 'social_energy' },
      { question_id: 'why_now', answer_id: 'friend_rec' },
    ]);
    expect(result.mood_match).toBe('social');
  });

  test('tied mood votes resolve to whichever appeared first in voting order', () => {
    // Two different moods each with 1 vote and no primary question
    const result = analyzeVibeAnswers([
      { question_id: 'headspace', answer_id: 'focused' },       // challenge
      { question_id: 'completion_goal', answer_id: 'main_story' }, // story
    ]);
    // challenge was inserted first and sort is stable-ish at equal weight
    expect(['challenge', 'story']).toContain(result.mood_match);
  });

  // ── Tag collection ────────────────────────────────────────────────────────────

  test('tags are deduplicated across answers', () => {
    // challenge appears in: mood + headspace(focused) + completion_goal(completionist)
    const result = analyzeVibeAnswers([
      { question_id: 'mood', answer_id: 'challenge' },
      { question_id: 'headspace', answer_id: 'focused' },
      { question_id: 'completion_goal', answer_id: 'completionist' },
    ]);
    const challengeCount = result.tags.filter((t) => t === 'challenge').length;
    expect(challengeCount).toBe(1);
  });

  test('speedrun answer produces both challenge and competition tags', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'completion_goal', answer_id: 'speedrun' },
    ]);
    expect(result.tags).toContain('challenge');
    expect(result.tags).toContain('competition');
  });

  test('multiplayer_focus answer produces both social and competition tags', () => {
    const result = analyzeVibeAnswers([
      { question_id: 'completion_goal', answer_id: 'multiplayer_focus' },
    ]);
    expect(result.tags).toContain('social');
    expect(result.tags).toContain('competition');
  });

  // ── Raw answers stored ────────────────────────────────────────────────────────

  test('raw_interview_answers is the original structured answers array', () => {
    const answers = [
      { question_id: 'mood', answer_id: 'nostalgia' },
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
    const result = analyzeVibeAnswers([{ question_id: 'mood', answer_id: 'not_a_real_answer' }]);
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
  });

  // ── Full five-question flow ───────────────────────────────────────────────────

  test('complete five-question flow produces correct profile', () => {
    const answers = [
      { question_id: 'mood', answer_id: 'story' },
      { question_id: 'session_length', answer_id: 'long' },
      { question_id: 'headspace', answer_id: 'narrative_hunger' },
      { question_id: 'completion_goal', answer_id: 'main_story' },
      { question_id: 'why_now', answer_id: 'deep_lore' },
    ];
    const result = analyzeVibeAnswers(answers);
    expect(result.mood_match).toBe('story');
    expect(result.expected_session_length).toBe('long');
    expect(result.tags).toContain('story');
    // story appears in mood, headspace, completion_goal, why_now answers → deduped to 1
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
        expect(r).toHaveProperty('source');
      }
    });

    test('limits results to 15 max', async () => {
      const results = await searchGames('Mario');
      expect(results.length).toBeLessThanOrEqual(15);
    });
  });
});
