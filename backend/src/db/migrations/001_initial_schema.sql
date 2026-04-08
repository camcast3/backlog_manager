-- Migration: Initial schema for backlog_manager
-- Creates all tables needed for the video game backlog manager

-- Games table: global data about games (not user-specific)
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  genre VARCHAR(100),
  developer VARCHAR(255),
  publisher VARCHAR(255),
  release_year INTEGER,
  cover_image_url TEXT,
  -- How Long To Beat data (in hours, null if unknown)
  hltb_main_story NUMERIC(6,1),
  hltb_main_plus_extras NUMERIC(6,1),
  hltb_completionist NUMERIC(6,1),
  -- Vibe tags: data about the game itself, not the user
  vibe_intensity VARCHAR(20) CHECK (vibe_intensity IN ('chill', 'moderate', 'intense', 'brutal')) DEFAULT 'moderate',
  vibe_story_pace VARCHAR(20) CHECK (vibe_story_pace IN ('minimal', 'slow_burn', 'steady', 'fast_paced')) DEFAULT 'steady',
  vibe_mood VARCHAR(50),          -- e.g. 'dark', 'whimsical', 'epic', 'relaxing', 'tense'
  vibe_multiplayer BOOLEAN DEFAULT FALSE,
  vibe_notes TEXT,                -- curator notes about the game experience
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(title, platform)
);

-- Backlog items: user-specific data linking a user to a game in their backlog
CREATE TABLE IF NOT EXISTS backlog_items (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'want_to_play'
    CHECK (status IN ('want_to_play', 'playing', 'completed', 'dropped', 'on_hold')),
  priority INTEGER DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
  personal_notes TEXT,            -- user's personal note about the game
  why_i_want_to_play TEXT,        -- captured at add time: the "vibe interview" answer
  date_added DATE DEFAULT CURRENT_DATE,
  date_started DATE,
  date_completed DATE,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  hours_played NUMERIC(6,1) DEFAULT 0,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vibe profiles: derived vibe keywords from the "why I want to play" interview
CREATE TABLE IF NOT EXISTS vibe_profiles (
  id SERIAL PRIMARY KEY,
  backlog_item_id INTEGER NOT NULL REFERENCES backlog_items(id) ON DELETE CASCADE,
  -- Tags generated from the user's "why" answer
  tags TEXT[] DEFAULT '{}',
  mood_match VARCHAR(50),         -- e.g. 'destress', 'adventure', 'challenge', 'nostalgia'
  expected_session_length VARCHAR(20) CHECK (expected_session_length IN ('short', 'medium', 'long', 'marathon')),
  raw_interview_answers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staleness checks: tracks when we last nudged the user about an untouched game
CREATE TABLE IF NOT EXISTS staleness_checks (
  id SERIAL PRIMARY KEY,
  backlog_item_id INTEGER NOT NULL REFERENCES backlog_items(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason VARCHAR(100),            -- e.g. 'inactive_3_months'
  user_response TEXT              -- user's reply to why they haven't played
);

-- Achievements: gamification table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earned achievements: which achievements the user has unlocked
CREATE TABLE IF NOT EXISTS earned_achievements (
  id SERIAL PRIMARY KEY,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context JSONB DEFAULT '{}'      -- e.g. { game_title: 'Elden Ring' }
);

-- User XP / level: single-row table for the overall progress
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  games_added INTEGER DEFAULT 0,
  games_completed INTEGER DEFAULT 0,
  games_dropped INTEGER DEFAULT 0,
  total_hours_logged NUMERIC(8,1) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial user progress row
INSERT INTO user_progress (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Trigger: update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER backlog_items_updated_at BEFORE UPDATE ON backlog_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER vibe_profiles_updated_at BEFORE UPDATE ON vibe_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
