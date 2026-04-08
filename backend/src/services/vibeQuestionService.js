/**
 * Structured vibe-interview question bank.
 *
 * Five focused questions cover every dimension of a player's mood without
 * requiring them to type anything.  Each answer choice carries a set of
 * vibe tags and, optionally, a mood_weight (used to elect the dominant mood)
 * and a session_hint (used to set expected_session_length).
 *
 * mood_weight on the primary 'mood' question is multiplied by PRIMARY_MOOD_WEIGHT
 * so that question dominates the final mood_match when answers conflict.
 */

export const PRIMARY_MOOD_WEIGHT = 3;

export const VIBE_QUESTIONS = [
  // ── 1. Primary mood ─────────────────────────────────────────────────────────
  {
    id: 'mood',
    question: 'What kind of experience are you chasing?',
    type: 'single',
    required: true,
    answers: [
      {
        id: 'destress',
        emoji: '😌',
        label: 'Relax & decompress',
        tags: ['destress'],
        mood_weight: 'destress',
        session_hint: null,
      },
      {
        id: 'challenge',
        emoji: '💀',
        label: 'Crush a hard challenge',
        tags: ['challenge'],
        mood_weight: 'challenge',
        session_hint: null,
      },
      {
        id: 'story',
        emoji: '📖',
        label: 'Get lost in a story',
        tags: ['story'],
        mood_weight: 'story',
        session_hint: null,
      },
      {
        id: 'nostalgia',
        emoji: '🕹️',
        label: 'Nostalgia trip',
        tags: ['nostalgia'],
        mood_weight: 'nostalgia',
        session_hint: null,
      },
      {
        id: 'adventure',
        emoji: '🗺️',
        label: 'Explore an open world',
        tags: ['adventure'],
        mood_weight: 'adventure',
        session_hint: null,
      },
      {
        id: 'competition',
        emoji: '🏆',
        label: 'Compete & climb ranks',
        tags: ['competition'],
        mood_weight: 'competition',
        session_hint: null,
      },
      {
        id: 'social',
        emoji: '👥',
        label: 'Co-op with friends',
        tags: ['social'],
        mood_weight: 'social',
        session_hint: null,
      },
      {
        id: 'creative',
        emoji: '🎨',
        label: 'Build & create freely',
        tags: ['creative'],
        mood_weight: 'creative',
        session_hint: null,
      },
    ],
  },

  // ── 2. Session length ────────────────────────────────────────────────────────
  {
    id: 'session_length',
    question: 'How long are your typical play sessions?',
    type: 'single',
    required: true,
    answers: [
      {
        id: 'short',
        emoji: '⚡',
        label: 'Quick bursts (under 1 hr)',
        tags: [],
        mood_weight: null,
        session_hint: 'short',
      },
      {
        id: 'medium',
        emoji: '🕐',
        label: 'A couple of hours',
        tags: [],
        mood_weight: null,
        session_hint: 'medium',
      },
      {
        id: 'long',
        emoji: '🌙',
        label: 'Long evening (3–5 hrs)',
        tags: [],
        mood_weight: null,
        session_hint: 'long',
      },
      {
        id: 'marathon',
        emoji: '🏕️',
        label: 'All-day marathon',
        tags: ['destress'],
        mood_weight: null,
        session_hint: 'marathon',
      },
    ],
  },

  // ── 3. Headspace ─────────────────────────────────────────────────────────────
  {
    id: 'headspace',
    question: "What's your headspace right now?",
    type: 'single',
    required: false,
    answers: [
      {
        id: 'focused',
        emoji: '🎯',
        label: 'Laser focused',
        tags: ['challenge'],
        mood_weight: 'challenge',
        session_hint: null,
      },
      {
        id: 'chill',
        emoji: '🛋️',
        label: 'Total chill mode',
        tags: ['destress'],
        mood_weight: 'destress',
        session_hint: null,
      },
      {
        id: 'curious',
        emoji: '🔍',
        label: 'Curious & exploratory',
        tags: ['adventure'],
        mood_weight: 'adventure',
        session_hint: null,
      },
      {
        id: 'social_energy',
        emoji: '💬',
        label: 'Social & chatty',
        tags: ['social'],
        mood_weight: 'social',
        session_hint: null,
      },
      {
        id: 'nostalgic',
        emoji: '💭',
        label: 'Feeling nostalgic',
        tags: ['nostalgia'],
        mood_weight: 'nostalgia',
        session_hint: null,
      },
      {
        id: 'creative_mood',
        emoji: '✏️',
        label: 'In a creative mood',
        tags: ['creative'],
        mood_weight: 'creative',
        session_hint: null,
      },
      {
        id: 'narrative_hunger',
        emoji: '🎬',
        label: 'Craving a good story',
        tags: ['story'],
        mood_weight: 'story',
        session_hint: null,
      },
      {
        id: 'competitive_edge',
        emoji: '🔥',
        label: 'Feeling competitive',
        tags: ['competition'],
        mood_weight: 'competition',
        session_hint: null,
      },
    ],
  },

  // ── 4. Completion goal ───────────────────────────────────────────────────────
  {
    id: 'completion_goal',
    question: 'How do you plan to approach this game?',
    type: 'single',
    required: false,
    answers: [
      {
        id: 'main_story',
        emoji: '🎬',
        label: 'Just the main story',
        tags: ['story'],
        mood_weight: 'story',
        session_hint: null,
      },
      {
        id: 'completionist',
        emoji: '💯',
        label: '100% everything',
        tags: ['challenge'],
        mood_weight: 'challenge',
        session_hint: null,
      },
      {
        id: 'chill_play',
        emoji: '🌿',
        label: 'No goals — just vibe',
        tags: ['destress'],
        mood_weight: 'destress',
        session_hint: null,
      },
      {
        id: 'explore_all',
        emoji: '🌍',
        label: 'Explore every corner',
        tags: ['adventure'],
        mood_weight: 'adventure',
        session_hint: null,
      },
      {
        id: 'speedrun',
        emoji: '⏱️',
        label: 'Speedrun it',
        tags: ['challenge', 'competition'],
        mood_weight: 'challenge',
        session_hint: null,
      },
      {
        id: 'multiplayer_focus',
        emoji: '🤝',
        label: 'Mainly the multiplayer',
        tags: ['social', 'competition'],
        mood_weight: 'social',
        session_hint: null,
      },
      {
        id: 'sandbox_free',
        emoji: '🏗️',
        label: 'Freeform sandbox play',
        tags: ['creative'],
        mood_weight: 'creative',
        session_hint: null,
      },
    ],
  },

  // ── 5. Why now? ──────────────────────────────────────────────────────────────
  {
    id: 'why_now',
    question: 'Why are you adding this game now?',
    type: 'single',
    required: false,
    answers: [
      {
        id: 'hype',
        emoji: '🚀',
        label: 'Just came out or big hype',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'friend_rec',
        emoji: '🤝',
        label: 'Friend recommended it',
        tags: ['social'],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'backlog_clear',
        emoji: '📋',
        label: 'Clearing the backlog',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'revisit',
        emoji: '🔄',
        label: "Replaying an old favourite",
        tags: ['nostalgia'],
        mood_weight: 'nostalgia',
        session_hint: null,
      },
      {
        id: 'genre_itch',
        emoji: '🎮',
        label: 'Scratching a genre itch',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'on_sale',
        emoji: '💸',
        label: 'On sale / in a bundle',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'deep_lore',
        emoji: '📜',
        label: 'Heard the lore is incredible',
        tags: ['story'],
        mood_weight: 'story',
        session_hint: null,
      },
      {
        id: 'challenge_rep',
        emoji: '⚔️',
        label: 'Heard it is brutally hard',
        tags: ['challenge'],
        mood_weight: 'challenge',
        session_hint: null,
      },
    ],
  },
];

// ── Answer lookup ─────────────────────────────────────────────────────────────

const _questionMap = Object.fromEntries(VIBE_QUESTIONS.map((q) => [q.id, q]));

/**
 * Given a structured answers array of the form:
 *   [{ question_id: string, answer_id: string }, ...]
 *
 * Return a vibe profile object matching the shape produced by analyzeVibeInterview:
 *   { tags, mood_match, expected_session_length, raw_interview_answers }
 *
 * Mood is elected by weighted vote.  The primary 'mood' question answer
 * carries PRIMARY_MOOD_WEIGHT votes; all other questions carry 1 vote each.
 */
export function analyzeVibeAnswers(structuredAnswers) {
  const allTags = [];
  const moodVotes = {};
  let sessionLength = 'medium'; // default when no session_length question answered

  for (const { question_id, answer_id } of structuredAnswers) {
    const question = _questionMap[question_id];
    if (!question) continue;

    const answer = question.answers.find((a) => a.id === answer_id);
    if (!answer) continue;

    // Collect vibe tags
    allTags.push(...answer.tags);

    // Vote for dominant mood
    if (answer.mood_weight) {
      const weight = question_id === 'mood' ? PRIMARY_MOOD_WEIGHT : 1;
      moodVotes[answer.mood_weight] = (moodVotes[answer.mood_weight] ?? 0) + weight;
    }

    // Session length: the dedicated session_length question answer wins outright
    if (answer.session_hint) {
      sessionLength = answer.session_hint;
    }
  }

  const sortedMoods = Object.entries(moodVotes).sort(([, a], [, b]) => b - a);
  const dominantMood = sortedMoods[0]?.[0] ?? null;

  return {
    tags: [...new Set(allTags)],
    mood_match: dominantMood,
    expected_session_length: sessionLength,
    raw_interview_answers: structuredAnswers,
  };
}
