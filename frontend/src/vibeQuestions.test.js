import { describe, test, expect } from 'vitest';
import { VIBE_QUESTIONS } from './vibeQuestions';

describe('vibeQuestions', () => {
  test('exports 6 questions', () => {
    expect(VIBE_QUESTIONS).toHaveLength(6);
  });

  test('all 6 question IDs are correct', () => {
    const ids = VIBE_QUESTIONS.map((q) => q.id);
    expect(ids).toEqual([
      'play_motivation',
      'energy_level',
      'emotional_tone',
      'play_style',
      'session_length',
      'why_now',
    ]);
  });

  test('play_motivation has 10 answers', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'play_motivation');
    expect(q.answers).toHaveLength(10);
    expect(q.required).toBe(true);
  });

  test('energy_level has 5 answers', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'energy_level');
    expect(q.answers).toHaveLength(5);
    expect(q.required).toBe(true);
  });

  test('emotional_tone has 10 answers', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'emotional_tone');
    expect(q.answers).toHaveLength(10);
    expect(q.required).toBe(false);
  });

  test('play_style has 7 answers', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'play_style');
    expect(q.answers).toHaveLength(7);
    expect(q.required).toBe(false);
  });

  test('session_length has 4 answers and is required', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'session_length');
    expect(q.answers).toHaveLength(4);
    expect(q.required).toBe(true);
  });

  test('why_now has 8 answers', () => {
    const q = VIBE_QUESTIONS.find((q) => q.id === 'why_now');
    expect(q.answers).toHaveLength(8);
    expect(q.required).toBe(false);
  });

  test('every answer has id, icon, and label', () => {
    for (const q of VIBE_QUESTIONS) {
      for (const a of q.answers) {
        expect(a.id).toBeTruthy();
        expect(a.icon).toBeTruthy();
        expect(a.label).toBeTruthy();
      }
    }
  });

  test('all answer IDs are unique within each question', () => {
    for (const q of VIBE_QUESTIONS) {
      const ids = q.answers.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('all question IDs are unique', () => {
    const ids = VIBE_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
