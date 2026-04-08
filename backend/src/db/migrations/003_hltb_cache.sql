-- Migration: Add hltb_cached_at to games for cache-staleness tracking
-- HLTB data is mutable over time (especially for newer games) so we track
-- when it was last refreshed and use an age-based TTL to signal staleness.

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS hltb_cached_at TIMESTAMP WITH TIME ZONE;
