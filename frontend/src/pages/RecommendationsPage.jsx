import { useState } from 'react';
import {
  FaCouch, FaCompass, FaFistRaised, FaBook,
  FaGamepad, FaUsers, FaTrophy, FaPaintBrush,
  FaDice, FaClock,
} from 'react-icons/fa';
import { recommendApi } from '../services/api';

const MOODS = [
  { key: 'destress',    icon: FaCouch,      label: 'Wind Down',    desc: 'Something relaxing and low-key' },
  { key: 'adventure',   icon: FaCompass,     label: 'Explore',      desc: 'Open worlds and discovery' },
  { key: 'challenge',   icon: FaFistRaised,  label: 'Test Myself',  desc: 'Something that pushes my skills' },
  { key: 'story',       icon: FaBook,        label: 'Get Immersed', desc: 'Deep narrative and characters' },
  { key: 'nostalgia',   icon: FaGamepad,     label: 'Revisit',      desc: 'Classic vibes and memories' },
  { key: 'social',      icon: FaUsers,       label: 'Play Together',desc: 'Co-op or multiplayer fun' },
  { key: 'competition', icon: FaTrophy,      label: 'Compete',      desc: 'PvP and leaderboards' },
  { key: 'creative',    icon: FaPaintBrush,  label: 'Create',       desc: 'Building and sandbox freedom' },
];

const SESSION_LENGTHS = [
  { key: 'short',    label: 'Short',    sub: '<1hr' },
  { key: 'medium',   label: 'Medium',   sub: '1-3hr' },
  { key: 'long',     label: 'Long',     sub: '3-5hr' },
  { key: 'marathon', label: 'Marathon', sub: '5+hr' },
];

const ENERGY_LEVELS = ['low', 'medium', 'high'];

function matchColor(pct) {
  if (pct >= 75) return 'var(--success)';
  if (pct >= 50) return 'var(--accent-light)';
  if (pct >= 25) return 'var(--warning)';
  return 'var(--text-muted)';
}

export default function RecommendationsPage() {
  const [mood, setMood] = useState(null);
  const [sessionLength, setSessionLength] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function findGames() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (mood) params.mood = mood;
      if (sessionLength) params.session_length = sessionLength;
      if (energy) params.energy = energy;
      const data = await recommendApi.get(params);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reroll() {
    setResults(null);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><FaDice style={{ marginRight: 8 }} />What Should I Play?</h1>
      </div>

      {/* Mood selector */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>How are you feeling?</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
        }}>
          {MOODS.map(m => {
            const Icon = m.icon;
            const selected = mood === m.key;
            return (
              <button
                key={m.key}
                className="card"
                onClick={() => setMood(selected ? null : m.key)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: selected ? 'var(--surface-alt)' : 'var(--surface)',
                  padding: '1rem 0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={24} color={selected ? 'var(--accent-light)' : 'var(--text-muted)'} />
                <div style={{ fontWeight: 700, marginTop: '0.4rem', color: selected ? 'var(--accent-light)' : 'var(--text)' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Session length */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>How long can you play?</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SESSION_LENGTHS.map(s => {
            const selected = sessionLength === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSessionLength(selected ? null : s.key)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: selected ? 'var(--accent)' : 'var(--surface)',
                  color: selected ? '#fff' : 'var(--text)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s.label} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({s.sub})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Energy level */}
      <section style={{ marginBottom: '2rem' }}>
        <label style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Energy level?</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {ENERGY_LEVELS.map(e => {
            const selected = energy === e;
            return (
              <button
                key={e}
                onClick={() => setEnergy(selected ? null : e)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: 'var(--radius)',
                  border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: selected ? 'var(--accent)' : 'var(--surface)',
                  color: selected ? '#fff' : 'var(--text)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {e}
              </button>
            );
          })}
        </div>
      </section>

      {/* Find My Game button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          className="btn-primary"
          onClick={findGames}
          disabled={loading}
          style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}
        >
          {loading ? 'Searching…' : '🎮 Find My Game'}
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <section>
          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎲</div>
              <p>No games matched your criteria. Try adjusting your filters!</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                Your Picks
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.map((g, i) => (
                  <div key={g.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i === 0 ? 'var(--accent)' : 'var(--surface-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    {/* Cover image */}
                    {g.cover_image_url ? (
                      <img
                        src={g.cover_image_url}
                        alt={g.game_title}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 56, height: 56, borderRadius: 8,
                        background: 'var(--surface-alt)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <FaGamepad color="var(--text-muted)" />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.game_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        {g.platform && <span>{g.platform}</span>}
                        {g.hltb_main_story != null && (
                          <span><FaClock size={10} style={{ marginRight: 3 }} />{g.hltb_main_story}h</span>
                        )}
                      </div>
                      <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {g.reasons.map((r, ri) => (
                          <span key={ri} className="tag">{r}</span>
                        ))}
                        {g.vibe_tags && typeof g.vibe_tags === 'string' && g.vibe_tags.split(',').slice(0, 3).map((t, ti) => (
                          <span key={`t${ti}`} className="tag">{t.trim()}</span>
                        ))}
                      </div>
                    </div>

                    {/* Match percentage */}
                    <div style={{
                      textAlign: 'center', flexShrink: 0,
                    }}>
                      <div className="badge" style={{
                        background: matchColor(g.match_pct),
                        color: '#fff',
                        fontSize: '0.9rem',
                        padding: '0.35rem 0.75rem',
                      }}>
                        {g.match_pct}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>match</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button className="btn-secondary" onClick={reroll}>
                  🎲 Not feeling these? Re-roll
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
