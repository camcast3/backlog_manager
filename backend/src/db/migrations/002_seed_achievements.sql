-- Seed achievements for gamification (100 achievements)
-- Icons removed — the UI renders achievements without per-item emoji.
INSERT INTO achievements (key, title, description, icon, xp_reward) VALUES
  -- ── Collection Milestones (10) ──
  ('first_game',       'First Quest',          'Added your very first game to the backlog', '', 50),
  ('backlog_5',        'Growing Collection',   'Reach 5 games in your backlog', '', 25),
  ('backlog_10',       'Dedicated Collector',  'Reach 10 games in your backlog', '', 50),
  ('backlog_25',       'Hoarder Mode',         'Reach 25 games in your backlog', '', 100),
  ('backlog_50',       'Library Builder',      'Reach 50 games in your backlog', '', 150),
  ('backlog_75',       'Shelf Overflow',       'Reach 75 games in your backlog', '', 200),
  ('backlog_100',      'Century Club',         'Reach 100 games in your backlog', '', 300),
  ('backlog_150',      'Serious Collector',    'Reach 150 games in your backlog', '', 400),
  ('backlog_200',      'Digital Museum',       'Reach 200 games in your backlog', '', 500),
  ('backlog_500',      'Infinite Backlog',     'Reach 500 games in your backlog', '', 1000),

  -- ── Completion Milestones (15) ──
  ('first_complete',   'Finisher',             'Complete your first game', '', 100),
  ('complete_3',       'Getting Started',      'Complete 3 games', '', 75),
  ('complete_5',       'Game Slayer',          'Complete 5 games', '', 150),
  ('complete_10',      'Backlog Destroyer',    'Complete 10 games', '', 300),
  ('complete_15',      'Committed Player',     'Complete 15 games', '', 350),
  ('complete_25',      'Quarter Century',      'Complete 25 games', '', 500),
  ('complete_50',      'Half Century',         'Complete 50 games', '', 750),
  ('complete_75',      'Silver Gamer',         'Complete 75 games', '', 1000),
  ('complete_100',     'Platinum Club',        'Complete 100 games', '', 1500),
  ('complete_long',    'Marathoner',           'Complete a game that took 50+ hours', '', 200),
  ('complete_epic',    'Epic Journey',         'Complete a game that took 100+ hours', '', 400),
  ('complete_short',   'Speed Reader',         'Complete a game under 5 hours', '', 50),
  ('complete_streak_3','Triple Finish',        'Complete 3 games in a single month', '', 200),
  ('complete_streak_5','Unstoppable',          'Complete 5 games in a single month', '', 400),
  ('zero_backlog',     'Backlog Zero',         'Have zero games in "Want to Play" status', '', 500),

  -- ── Playing & Status (10) ──
  ('playing_now',      'In The Zone',          'Start playing a game from your backlog', '', 30),
  ('playing_3',        'Juggler',              'Have 3 games in "Playing" status at once', '', 50),
  ('playing_5',        'Multitasker',          'Have 5 games in "Playing" status at once', '', 75),
  ('first_drop',       'Life Is Too Short',    'Drop a game — no shame!', '', 20),
  ('drop_5',           'Ruthless Curator',     'Drop 5 games total', '', 40),
  ('drop_10',          'Quality Over Quantity', 'Drop 10 games total', '', 60),
  ('first_hold',       'On Pause',             'Put a game on hold for the first time', '', 15),
  ('resume_hold',      'Back In Action',       'Resume a game that was on hold', '', 30),
  ('replay',           'Encore',               'Move a completed game back to playing', '', 50),
  ('status_all',       'Full Spectrum',         'Have games in all 5 status categories', '', 100),

  -- ── Vibe & Mood (12) ──
  ('vibe_match',       'Know Thyself',         'Play a game whose vibe perfectly matched your mood', '', 75),
  ('chill_master',     'Chill Master',         'Complete 3 chill-vibe games', '', 60),
  ('chill_expert',     'Zen Garden',           'Complete 10 chill-vibe games', '', 150),
  ('moderate_master',  'Balanced Gamer',       'Complete 3 moderate-vibe games', '', 60),
  ('moderate_expert',  'Golden Mean',          'Complete 10 moderate-vibe games', '', 150),
  ('intense_master',   'Pain Enjoyer',         'Complete 3 intense-vibe games', '', 80),
  ('intense_expert',   'Adrenaline Junkie',    'Complete 10 intense-vibe games', '', 200),
  ('brutal_master',    'Masochist',            'Complete 3 brutal-vibe games', '', 100),
  ('brutal_expert',    'Iron Will',            'Complete 10 brutal-vibe games', '', 300),
  ('vibe_variety',     'Mood Ring',            'Have games across all 4 vibe intensities', '', 50),
  ('slow_burn_fan',    'Patient Player',       'Complete 5 games with slow-burn story pace', '', 75),
  ('fast_fan',         'Action Hero',          'Complete 5 games with fast-paced story', '', 75),

  -- ── Platform Diversity (10) ──
  ('diverse_platforms','Platform Agnostic',    'Add games from 5 different platforms', '', 75),
  ('platform_10',      'Platform Hopper',      'Add games from 10 different platforms', '', 150),
  ('platform_ps',      'PlayStation Fan',      'Add 10 PlayStation games', '', 50),
  ('platform_xbox',    'Xbox Loyalist',        'Add 10 Xbox games', '', 50),
  ('platform_nintendo','Nintendo Devotee',     'Add 10 Nintendo games', '', 50),
  ('platform_pc',      'PC Master Race',       'Add 10 PC games', '', 50),
  ('platform_retro',   'Retro Gamer',          'Add 5 games from retro consoles (PS2, GBA, N64, etc.)', '', 75),
  ('platform_sega',    'Sega Forever',         'Add a Dreamcast or Genesis game', '', 30),
  ('platform_handheld','On The Go',            'Add 5 handheld games (3DS, Vita, Switch, etc.)', '', 50),
  ('cross_gen',        'Cross-Generation',     'Own the same franchise on 3+ platforms', '', 100),

  -- ── Genre Exploration (8) ──
  ('genre_5',          'Genre Sampler',        'Add games across 5 different genres', '', 50),
  ('genre_10',         'Well Rounded',         'Add games across 10 different genres', '', 100),
  ('rpg_fan',          'RPG Enthusiast',       'Complete 5 RPG games', '', 75),
  ('action_fan',       'Action Junkie',        'Complete 5 action games', '', 75),
  ('indie_fan',        'Indie Supporter',      'Complete 5 indie games', '', 75),
  ('strategy_fan',     'Master Tactician',     'Complete 5 strategy games', '', 75),
  ('horror_fan',       'Fear Conqueror',       'Complete 5 horror games', '', 100),
  ('genre_all',        'Renaissance Gamer',    'Complete a game in every genre you have', '', 200),

  -- ── Time & Dedication (10) ──
  ('streak_3',         'On A Roll',            'Log activity 3 days in a row', '', 50),
  ('streak_7',         'Weekly Warrior',       'Log activity 7 days in a row', '', 100),
  ('streak_14',        'Two Week Streak',      'Log activity 14 days in a row', '', 200),
  ('streak_30',        'Monthly Dedication',   'Log activity 30 days in a row', '', 500),
  ('total_100h',       'Centurion',            'Log 100 total hours played', '', 100),
  ('total_500h',       'Time Traveler',        'Log 500 total hours played', '', 300),
  ('total_1000h',      'Thousand Hour Club',   'Log 1000 total hours played', '', 500),
  ('night_owl',        'Night Owl',            'Log activity after midnight', '', 25),
  ('early_bird',       'Early Bird',           'Log activity before 7 AM', '', 25),
  ('weekend_warrior',  'Weekend Warrior',      'Log activity every weekend for a month', '', 100),

  -- ── Personal & Story (10) ──
  ('why_champion',     'Story Keeper',         'Fill in "Why I Want to Play" for 10 games', '', 40),
  ('why_20',           'Narrative Builder',     'Fill in "Why I Want to Play" for 20 games', '', 80),
  ('notes_10',         'Note Taker',           'Add personal notes to 10 games', '', 40),
  ('notes_25',         'Diary Keeper',         'Add personal notes to 25 games', '', 80),
  ('staleness_reply',  'Self Aware',           'Responded to a staleness check', '', 15),
  ('staleness_5',      'Honest Player',        'Responded to 5 staleness checks', '', 50),
  ('staleness_10',     'Soul Searcher',        'Responded to 10 staleness checks', '', 100),
  ('priority_max',     'Top Priority',         'Set a game to priority 100', '', 10),
  ('priority_change',  'Reevaluator',          'Change the priority of 10 games', '', 40),
  ('multiplayer_5',    'Social Gamer',         'Add 5 multiplayer games', '', 50),

  -- ── Level Milestones (10) ──
  ('level_5',          'Rising Gamer',         'Reach level 5', '', 0),
  ('level_10',         'Veteran Gamer',        'Reach level 10', '', 0),
  ('level_15',         'Seasoned Pro',         'Reach level 15', '', 0),
  ('level_20',         'Legendary Gamer',      'Reach level 20', '', 0),
  ('level_25',         'Elite Status',         'Reach level 25', '', 0),
  ('level_30',         'Grandmaster',          'Reach level 30', '', 0),
  ('level_40',         'Mythic Rank',          'Reach level 40', '', 0),
  ('level_50',         'Transcendent',         'Reach level 50', '', 0),
  ('level_75',         'Ascended',             'Reach level 75', '', 0),
  ('level_100',        'Max Prestige',         'Reach level 100', '', 0),

  -- ── Special & Hidden (5) ──
  ('first_edit',       'Perfectionist',        'Edit a game after adding it', '', 20),
  ('theme_change',     'Interior Designer',    'Change the app theme', '', 10),
  ('decision_spin',    'Wheel of Destiny',     'Use the game picker to decide what to play', '', 15),
  ('year_one',         'Anniversary',          'Use Backlog Manager for a full year', '', 500),
  ('completionist',    'True Completionist',   'Earn 50 other achievements', '', 1000)
ON CONFLICT (key) DO NOTHING;
