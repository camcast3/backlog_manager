import { analyzeVibeInterview } from '../services/vibeService.js';
import { xpForLevel, levelFromXp } from '../services/gamificationService.js';

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
