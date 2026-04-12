/**
 * Structured vibe-interview question bank — v2 (psychology-informed).
 *
 * Six focused questions cover every dimension of a player's mood without
 * requiring them to type anything.  Each answer choice carries a set of
 * vibe tags and, optionally, a mood_weight (used to elect the dominant mood),
 * a session_hint, motivation_value, energy_hint, tone_value, or style_value.
 *
 * Icons use react-icons name strings (e.g. 'FaCouch') — the frontend maps
 * these to actual components.
 *
 * mood_weight on the primary 'play_motivation' question is multiplied by
 * PRIMARY_MOOD_WEIGHT so that question dominates the final mood_match when
 * answers conflict.
 */

export const PRIMARY_MOOD_WEIGHT = 3;

export const VIBE_QUESTIONS = [
  // ── 1. Play motivation (primary mood driver) ──────────────────────────────
  {
    id: 'play_motivation',
    question: 'Why do you want to play this game?',
    type: 'single',
    required: true,
    answers: [
      {
        id: 'escapism',
        icon: 'FaDoorOpen',
        label: 'Escape into another world',
        tags: ['escapism'],
        mood_weight: 'destress',
        motivation_value: 'escapism',
      },
      {
        id: 'challenge',
        icon: 'FaSkull',
        label: 'Test my skills on something hard',
        tags: ['challenge'],
        mood_weight: 'challenge',
        motivation_value: 'challenge',
      },
      {
        id: 'story',
        icon: 'FaBook',
        label: 'Experience an incredible story',
        tags: ['story'],
        mood_weight: 'story',
        motivation_value: 'story',
      },
      {
        id: 'mastery',
        icon: 'FaTrophy',
        label: 'Master the mechanics, 100% it',
        tags: ['challenge', 'mastery'],
        mood_weight: 'challenge',
        motivation_value: 'mastery',
      },
      {
        id: 'relaxation',
        icon: 'FaCouch',
        label: 'Wind down and decompress',
        tags: ['destress'],
        mood_weight: 'destress',
        motivation_value: 'relaxation',
      },
      {
        id: 'social',
        icon: 'FaUsers',
        label: 'Play with or against others',
        tags: ['social'],
        mood_weight: 'social',
        motivation_value: 'social',
      },
      {
        id: 'exploration',
        icon: 'FaCompass',
        label: 'Discover and explore freely',
        tags: ['adventure'],
        mood_weight: 'adventure',
        motivation_value: 'exploration',
      },
      {
        id: 'creative',
        icon: 'FaPaintBrush',
        label: 'Build, create, express myself',
        tags: ['creative'],
        mood_weight: 'creative',
        motivation_value: 'creative',
      },
      {
        id: 'nostalgia',
        icon: 'FaGamepad',
        label: 'Revisit something I love',
        tags: ['nostalgia'],
        mood_weight: 'nostalgia',
        motivation_value: 'nostalgia',
      },
      {
        id: 'hype',
        icon: 'FaFire',
        label: "Everyone's playing it right now",
        tags: [],
        mood_weight: null,
        motivation_value: 'hype',
      },
    ],
  },

  // ── 2. Energy level ────────────────────────────────────────────────────────
  {
    id: 'energy_level',
    question: 'What energy level fits your mood?',
    type: 'single',
    required: true,
    answers: [
      {
        id: 'cozy',
        icon: 'FaMugHot',
        label: 'Cozy blanket vibes — warm & safe',
        tags: ['destress'],
        mood_weight: null,
        energy_hint: 'cozy',
      },
      {
        id: 'chill',
        icon: 'FaCloudSun',
        label: 'Chill but engaged — low stress',
        tags: ['destress'],
        mood_weight: null,
        energy_hint: 'chill',
      },
      {
        id: 'steady',
        icon: 'FaHiking',
        label: 'Ready for a solid adventure',
        tags: [],
        mood_weight: null,
        energy_hint: 'steady',
      },
      {
        id: 'intense',
        icon: 'FaBolt',
        label: "Locked in — let's go",
        tags: ['challenge'],
        mood_weight: null,
        energy_hint: 'intense',
      },
      {
        id: 'brutal',
        icon: 'FaSkullCrossbones',
        label: 'Break me. I dare you.',
        tags: ['challenge'],
        mood_weight: null,
        energy_hint: 'brutal',
      },
    ],
  },

  // ── 3. Emotional tone ──────────────────────────────────────────────────────
  {
    id: 'emotional_tone',
    question: 'What atmosphere are you craving?',
    type: 'single',
    required: false,
    answers: [
      {
        id: 'heartwarming',
        icon: 'FaHeart',
        label: 'Heartwarming & uplifting',
        tags: ['destress'],
        mood_weight: null,
        tone_value: 'heartwarming',
      },
      {
        id: 'dark',
        icon: 'FaMoon',
        label: 'Dark & gritty',
        tags: [],
        mood_weight: null,
        tone_value: 'dark',
      },
      {
        id: 'whimsical',
        icon: 'FaMagic',
        label: 'Whimsical & playful',
        tags: ['creative'],
        mood_weight: null,
        tone_value: 'whimsical',
      },
      {
        id: 'epic',
        icon: 'FaCrown',
        label: 'Grand & epic',
        tags: ['adventure'],
        mood_weight: null,
        tone_value: 'epic',
      },
      {
        id: 'mysterious',
        icon: 'FaSearch',
        label: 'Mysterious & intriguing',
        tags: ['adventure'],
        mood_weight: null,
        tone_value: 'mysterious',
      },
      {
        id: 'tense',
        icon: 'FaExclamationTriangle',
        label: 'Tense & thrilling',
        tags: ['challenge'],
        mood_weight: null,
        tone_value: 'tense',
      },
      {
        id: 'peaceful',
        icon: 'FaLeaf',
        label: 'Peaceful & serene',
        tags: ['destress'],
        mood_weight: null,
        tone_value: 'peaceful',
      },
      {
        id: 'humorous',
        icon: 'FaLaugh',
        label: 'Funny & lighthearted',
        tags: [],
        mood_weight: null,
        tone_value: 'humorous',
      },
      {
        id: 'melancholic',
        icon: 'FaCloudRain',
        label: 'Bittersweet & emotional',
        tags: ['story'],
        mood_weight: null,
        tone_value: 'melancholic',
      },
      {
        id: 'nostalgic',
        icon: 'FaClock',
        label: 'Nostalgic & familiar',
        tags: ['nostalgia'],
        mood_weight: null,
        tone_value: 'nostalgic',
      },
    ],
  },

  // ── 4. Play style ──────────────────────────────────────────────────────────
  {
    id: 'play_style',
    question: 'How will you approach this game?',
    type: 'single',
    required: false,
    answers: [
      {
        id: 'main_story',
        icon: 'FaRoute',
        label: 'Follow the main story',
        tags: ['story'],
        mood_weight: null,
        style_value: 'main_story',
      },
      {
        id: 'completionist',
        icon: 'FaCheckDouble',
        label: '100% everything',
        tags: ['challenge', 'mastery'],
        mood_weight: null,
        style_value: 'completionist',
      },
      {
        id: 'explorer',
        icon: 'FaMap',
        label: 'Explore every corner',
        tags: ['adventure'],
        mood_weight: null,
        style_value: 'explorer',
      },
      {
        id: 'speedrun',
        icon: 'FaStopwatch',
        label: 'Speedrun / play efficiently',
        tags: ['challenge'],
        mood_weight: null,
        style_value: 'speedrun',
      },
      {
        id: 'sandbox',
        icon: 'FaCubes',
        label: 'Freeform sandbox play',
        tags: ['creative'],
        mood_weight: null,
        style_value: 'sandbox',
      },
      {
        id: 'multiplayer',
        icon: 'FaUserFriends',
        label: 'Focus on multiplayer',
        tags: ['social', 'competition'],
        mood_weight: null,
        style_value: 'multiplayer',
      },
      {
        id: 'just_vibing',
        icon: 'FaMusic',
        label: 'No plan — just vibing',
        tags: ['destress'],
        mood_weight: null,
        style_value: 'just_vibing',
      },
    ],
  },

  // ── 5. Session length ──────────────────────────────────────────────────────
  {
    id: 'session_length',
    question: 'How long are your typical play sessions?',
    type: 'single',
    required: true,
    answers: [
      {
        id: 'short',
        icon: 'FaBolt',
        label: 'Quick bursts (under 1 hr)',
        tags: [],
        mood_weight: null,
        session_hint: 'short',
      },
      {
        id: 'medium',
        icon: 'FaClock',
        label: 'A couple of hours',
        tags: [],
        mood_weight: null,
        session_hint: 'medium',
      },
      {
        id: 'long',
        icon: 'FaMoon',
        label: 'Long evening (3–5 hrs)',
        tags: [],
        mood_weight: null,
        session_hint: 'long',
      },
      {
        id: 'marathon',
        icon: 'FaCampground',
        label: 'All-day marathon',
        tags: ['destress'],
        mood_weight: null,
        session_hint: 'marathon',
      },
    ],
  },

  // ── 6. Why now? ────────────────────────────────────────────────────────────
  {
    id: 'why_now',
    question: 'Why are you adding this game now?',
    type: 'single',
    required: false,
    answers: [
      {
        id: 'hype',
        icon: 'FaRocket',
        label: 'Just came out or big hype',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'friend_rec',
        icon: 'FaHandshake',
        label: 'Friend recommended it',
        tags: ['social'],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'backlog_clear',
        icon: 'FaClipboardList',
        label: 'Clearing the backlog',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'revisit',
        icon: 'FaSyncAlt',
        label: "Replaying an old favourite",
        tags: ['nostalgia'],
        mood_weight: 'nostalgia',
        session_hint: null,
      },
      {
        id: 'genre_itch',
        icon: 'FaGamepad',
        label: 'Scratching a genre itch',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'on_sale',
        icon: 'FaTag',
        label: 'On sale / in a bundle',
        tags: [],
        mood_weight: null,
        session_hint: null,
      },
      {
        id: 'deep_lore',
        icon: 'FaScroll',
        label: 'Heard the lore is incredible',
        tags: ['story'],
        mood_weight: 'story',
        session_hint: null,
      },
      {
        id: 'challenge_rep',
        icon: 'FaFistRaised',
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
 * Return a vibe profile object:
 *   { tags, mood_match, expected_session_length, play_motivation,
 *     energy_level, emotional_tone_pref, play_style, raw_interview_answers }
 *
 * Mood is elected by weighted vote.  The primary 'play_motivation' question
 * answer carries PRIMARY_MOOD_WEIGHT votes; all other questions carry 1 vote
 * each.
 */
export function analyzeVibeAnswers(structuredAnswers) {
  const allTags = [];
  const moodVotes = {};
  let sessionLength = 'medium';
  let playMotivation = null;
  let energyLevel = null;
  let emotionalTonePref = null;
  let playStyle = null;

  for (const { question_id, answer_id } of structuredAnswers) {
    const question = _questionMap[question_id];
    if (!question) continue;

    const answer = question.answers.find((a) => a.id === answer_id);
    if (!answer) continue;

    // Collect vibe tags
    allTags.push(...answer.tags);

    // Vote for dominant mood
    if (answer.mood_weight) {
      const weight = question_id === 'play_motivation' ? PRIMARY_MOOD_WEIGHT : 1;
      moodVotes[answer.mood_weight] = (moodVotes[answer.mood_weight] ?? 0) + weight;
    }

    // Session length
    if (answer.session_hint) {
      sessionLength = answer.session_hint;
    }

    // New dimension extractors
    if (answer.motivation_value) {
      playMotivation = answer.motivation_value;
    }
    if (answer.energy_hint) {
      energyLevel = answer.energy_hint;
    }
    if (answer.tone_value) {
      emotionalTonePref = answer.tone_value;
    }
    if (answer.style_value) {
      playStyle = answer.style_value;
    }
  }

  const sortedMoods = Object.entries(moodVotes).sort(([, a], [, b]) => b - a);
  const dominantMood = sortedMoods[0]?.[0] ?? null;

  return {
    tags: [...new Set(allTags)],
    mood_match: dominantMood,
    expected_session_length: sessionLength,
    play_motivation: playMotivation,
    energy_level: energyLevel,
    emotional_tone_pref: emotionalTonePref,
    play_style: playStyle,
    raw_interview_answers: structuredAnswers,
  };
}
