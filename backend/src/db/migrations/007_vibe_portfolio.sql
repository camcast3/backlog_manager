-- 007_vibe_portfolio.sql
-- Expand vibe dimensions: intensity, emotional tone, social style, and profile fields

-- Add 'cozy' to vibe_intensity
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_vibe_intensity_check;
ALTER TABLE games ADD CONSTRAINT games_vibe_intensity_check 
  CHECK (vibe_intensity IN ('cozy', 'chill', 'moderate', 'intense', 'brutal'));

-- Add structured emotional_tone to games (replaces free-text vibe_mood)
ALTER TABLE games ADD COLUMN IF NOT EXISTS emotional_tone VARCHAR(30) 
  CHECK (emotional_tone IN ('heartwarming', 'dark', 'whimsical', 'epic', 'mysterious', 'tense', 'peaceful', 'humorous', 'melancholic', 'nostalgic'));

-- Add social_style (replaces boolean vibe_multiplayer)
ALTER TABLE games ADD COLUMN IF NOT EXISTS social_style VARCHAR(20)
  CHECK (social_style IN ('solo', 'co_op', 'competitive', 'mmo'));

-- Add new dimensions to vibe_profiles
ALTER TABLE vibe_profiles ADD COLUMN IF NOT EXISTS play_motivation VARCHAR(30);
ALTER TABLE vibe_profiles ADD COLUMN IF NOT EXISTS emotional_tone_pref VARCHAR(30);
ALTER TABLE vibe_profiles ADD COLUMN IF NOT EXISTS play_style VARCHAR(30);
ALTER TABLE vibe_profiles ADD COLUMN IF NOT EXISTS energy_level VARCHAR(20);
