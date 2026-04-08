import { analyzeVibeInterview } from '../services/vibeService.js';
import { xpForLevel, levelFromXp } from '../services/gamificationService.js';

describe('vibeService.analyzeVibeInterview', () => {
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

  test('detects expected session length - short', () => {
    const result = analyzeVibeInterview('I only have 30 min to play', {});
    expect(result.expected_session_length).toBe('short');
  });

  test('detects expected session length - marathon', () => {
    const result = analyzeVibeInterview('I plan to binge this all weekend', {});
    expect(result.expected_session_length).toBe('marathon');
  });

  test('includes raw interview answers', () => {
    const answers = { q1: 'adventure seeker', q2: 'open world games' };
    const result = analyzeVibeInterview('Looking for exploration', answers);
    expect(result.raw_interview_answers).toEqual(answers);
    expect(result.tags).toContain('adventure');
  });

  test('returns empty tags for empty input', () => {
    const result = analyzeVibeInterview('', {});
    expect(result.tags).toEqual([]);
    expect(result.mood_match).toBeNull();
    expect(result.expected_session_length).toBe('medium');
  });
});

describe('gamificationService XP / level math', () => {
  test('xpForLevel returns correct values', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(400);
    expect(xpForLevel(5)).toBe(2500);
  });

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
});
