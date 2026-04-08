-- Seed achievements for gamification
INSERT INTO achievements (key, title, description, icon, xp_reward) VALUES
  ('first_game', 'First Quest', 'Added your very first game to the backlog', '🎮', 50),
  ('backlog_5', 'Growing Collection', 'Reach 5 games in your backlog', '📚', 25),
  ('backlog_10', 'Dedicated Collector', 'Reach 10 games in your backlog', '🗂️', 50),
  ('backlog_25', 'Hoarder Mode', 'Reach 25 games in your backlog', '🏰', 100),
  ('first_complete', 'Finisher', 'Complete your first game', '✅', 100),
  ('complete_5', 'Game Slayer', 'Complete 5 games', '⚔️', 150),
  ('complete_10', 'Backlog Destroyer', 'Complete 10 games', '💥', 300),
  ('complete_long', 'Marathoner', 'Complete a game that took 50+ hours', '🏅', 200),
  ('vibe_match', 'Know Thyself', 'Play a game whose vibe perfectly matched your mood', '🎯', 75),
  ('first_drop', 'Life Is Too Short', 'Drop a game (no shame!)', '🚮', 20),
  ('playing_now', 'In The Zone', 'Start playing a game from your backlog', '🕹️', 30),
  ('staleness_reply', 'Self Aware', 'Responded to a staleness check', '🤔', 15),
  ('level_5', 'Rising Gamer', 'Reach level 5', '⭐', 0),
  ('level_10', 'Veteran Gamer', 'Reach level 10', '🌟', 0),
  ('level_20', 'Legendary Gamer', 'Reach level 20', '👑', 0),
  ('streak_3', 'On A Roll', 'Log activity 3 days in a row', '🔥', 50),
  ('diverse_platforms', 'Platform Agnostic', 'Add games from 5 different platforms', '🌍', 75),
  ('chill_master', 'Chill Master', 'Complete 3 chill-vibe games', '😌', 60),
  ('intense_master', 'Pain Enjoyer', 'Complete 3 intense-vibe games', '💀', 80),
  ('why_champion', 'Story Keeper', 'Fill in "Why I Want to Play" for 10 games', '📖', 40)
ON CONFLICT (key) DO NOTHING;
