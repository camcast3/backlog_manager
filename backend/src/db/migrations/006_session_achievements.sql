INSERT INTO achievements (key, title, description, icon, xp_reward) VALUES
  ('first_session', 'First Session', 'Logged your first play session', '⏱️', 10),
  ('dedicated_player', 'Dedicated Player', 'Logged 10 play sessions', '📊', 25),
  ('session_veteran', 'Session Veteran', 'Logged 50 play sessions', '🎖️', 50),
  ('session_master', 'Session Master', 'Logged 100 play sessions', '🏅', 100)
ON CONFLICT (key) DO NOTHING;
