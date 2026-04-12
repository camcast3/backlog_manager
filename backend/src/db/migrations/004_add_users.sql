-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  sub TEXT UNIQUE NOT NULL,           -- OIDC subject identifier
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_sub ON users(sub);

-- Add user_id to backlog_items (nullable initially for migration)
ALTER TABLE backlog_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_backlog_items_user_id ON backlog_items(user_id);

-- Add user_id to user_progress  
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
-- Remove the single-row constraint - now one row per user
-- Drop the existing CHECK if it exists
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_singleton;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Add user_id to earned_achievements
ALTER TABLE earned_achievements ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_earned_achievements_user_id ON earned_achievements(user_id);

-- Add user_id to staleness_checks
ALTER TABLE staleness_checks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to vibe_profiles
ALTER TABLE vibe_profiles ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
