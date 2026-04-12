CREATE TABLE IF NOT EXISTS play_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  backlog_item_id INTEGER REFERENCES backlog_items(id) ON DELETE CASCADE,
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_play_sessions_user_id ON play_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_backlog_item ON play_sessions(backlog_item_id);
