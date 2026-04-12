/**
 * Structured vibe-interview questions for the AddGameModal.
 * Mirrors backend/src/services/vibeQuestionService.js VIBE_QUESTIONS.
 * Icons reference react-icons/fa component names.
 */
export const VIBE_QUESTIONS = [
  {
    id: 'play_motivation',
    question: 'Why do you want to play this game?',
    type: 'single',
    required: true,
    answers: [
      { id: 'escapism', icon: 'FaDoorOpen', label: 'Escape into another world' },
      { id: 'challenge', icon: 'FaSkull', label: 'Test my skills on something hard' },
      { id: 'story', icon: 'FaBook', label: 'Experience an incredible story' },
      { id: 'mastery', icon: 'FaTrophy', label: 'Master the mechanics, 100% it' },
      { id: 'relaxation', icon: 'FaCouch', label: 'Wind down and decompress' },
      { id: 'social', icon: 'FaUsers', label: 'Play with or against others' },
      { id: 'exploration', icon: 'FaCompass', label: 'Discover and explore freely' },
      { id: 'creative', icon: 'FaPaintBrush', label: 'Build, create, express myself' },
      { id: 'nostalgia', icon: 'FaGamepad', label: 'Revisit something I love' },
      { id: 'hype', icon: 'FaFire', label: "Everyone's playing it right now" },
    ],
  },
  {
    id: 'energy_level',
    question: 'What energy level fits your mood?',
    type: 'single',
    required: true,
    answers: [
      { id: 'cozy', icon: 'FaMugHot', label: 'Cozy blanket vibes — warm & safe' },
      { id: 'chill', icon: 'FaCloudSun', label: 'Chill but engaged — low stress' },
      { id: 'steady', icon: 'FaHiking', label: 'Ready for a solid adventure' },
      { id: 'intense', icon: 'FaBolt', label: "Locked in — let's go" },
      { id: 'brutal', icon: 'FaSkullCrossbones', label: 'Break me. I dare you.' },
    ],
  },
  {
    id: 'emotional_tone',
    question: 'What atmosphere are you craving?',
    type: 'single',
    required: false,
    answers: [
      { id: 'heartwarming', icon: 'FaHeart', label: 'Heartwarming & uplifting' },
      { id: 'dark', icon: 'FaMoon', label: 'Dark & gritty' },
      { id: 'whimsical', icon: 'FaMagic', label: 'Whimsical & playful' },
      { id: 'epic', icon: 'FaCrown', label: 'Grand & epic' },
      { id: 'mysterious', icon: 'FaSearch', label: 'Mysterious & intriguing' },
      { id: 'tense', icon: 'FaExclamationTriangle', label: 'Tense & thrilling' },
      { id: 'peaceful', icon: 'FaLeaf', label: 'Peaceful & serene' },
      { id: 'humorous', icon: 'FaLaugh', label: 'Funny & lighthearted' },
      { id: 'melancholic', icon: 'FaCloudRain', label: 'Bittersweet & emotional' },
      { id: 'nostalgic', icon: 'FaClock', label: 'Nostalgic & familiar' },
    ],
  },
  {
    id: 'play_style',
    question: 'How will you approach this game?',
    type: 'single',
    required: false,
    answers: [
      { id: 'main_story', icon: 'FaRoute', label: 'Follow the main story' },
      { id: 'completionist', icon: 'FaCheckDouble', label: '100% everything' },
      { id: 'explorer', icon: 'FaMap', label: 'Explore every corner' },
      { id: 'speedrun', icon: 'FaStopwatch', label: 'Speedrun / play efficiently' },
      { id: 'sandbox', icon: 'FaCubes', label: 'Freeform sandbox play' },
      { id: 'multiplayer', icon: 'FaUserFriends', label: 'Focus on multiplayer' },
      { id: 'just_vibing', icon: 'FaMusic', label: 'No plan — just vibing' },
    ],
  },
  {
    id: 'session_length',
    question: 'How long are your typical play sessions?',
    type: 'single',
    required: true,
    answers: [
      { id: 'short', icon: 'FaBolt', label: 'Quick bursts (under 1 hr)' },
      { id: 'medium', icon: 'FaClock', label: 'A couple of hours' },
      { id: 'long', icon: 'FaMoon', label: 'Long evening (3–5 hrs)' },
      { id: 'marathon', icon: 'FaCampground', label: 'All-day marathon' },
    ],
  },
  {
    id: 'why_now',
    question: 'Why are you adding this game now?',
    type: 'single',
    required: false,
    answers: [
      { id: 'hype', icon: 'FaRocket', label: 'Just came out or big hype' },
      { id: 'friend_rec', icon: 'FaHandshake', label: 'Friend recommended it' },
      { id: 'backlog_clear', icon: 'FaClipboardList', label: 'Clearing the backlog' },
      { id: 'revisit', icon: 'FaSyncAlt', label: 'Replaying an old favourite' },
      { id: 'genre_itch', icon: 'FaGamepad', label: 'Scratching a genre itch' },
      { id: 'on_sale', icon: 'FaTag', label: 'On sale / in a bundle' },
      { id: 'deep_lore', icon: 'FaScroll', label: 'Heard the lore is incredible' },
      { id: 'challenge_rep', icon: 'FaFistRaised', label: 'Heard it is brutally hard' },
    ],
  },
];
