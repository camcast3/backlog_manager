import { useState, useEffect, useMemo } from 'react';
import { progressApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const ACHIEVEMENT_CATEGORIES = [
  'All', 'Collection', 'Completion', 'Playing', 'Vibe', 'Platform', 'Genre', 'Time', 'Personal', 'Level', 'Special',
];

function getCategory(achievement) {
  const key = achievement.key || '';
  if (key.startsWith('backlog_') || key.includes('collection') || key === 'first_game') return 'Collection';
  if (key.startsWith('complete_') || key.includes('complete') || key === 'first_complete' || key.includes('marathoner')) return 'Completion';
  if (key.startsWith('playing_') || key.includes('juggler') || key.includes('multitask') || key === 'first_drop') return 'Playing';
  if (key.includes('vibe') || key.includes('chill') || key.includes('intense') || key.includes('brutal')) return 'Vibe';
  if (key.includes('platform') || key.includes('retro') || key.includes('nintendo') || key.includes('playstation') || key.includes('xbox') || key.includes('pc_') || key.includes('sega') || key.includes('handheld') || key.includes('cross_gen')) return 'Platform';
  if (key.includes('genre') || key.includes('rpg') || key.includes('action') || key.includes('indie') || key.includes('strategy') || key.includes('horror')) return 'Genre';
  if (key.includes('streak') || key.includes('hours') || key.includes('night') || key.includes('weekend') || key.includes('time')) return 'Time';
  if (key.includes('why') || key.includes('notes') || key.includes('staleness') || key.includes('priority') || key.includes('social')) return 'Personal';
  if (key.startsWith('level_')) return 'Level';
  return 'Special';
}

export default function ProgressPage() {
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([progressApi.get(), progressApi.achievements()]);
      setProgress(p);
      setAchievements(a);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of ACHIEVEMENT_CATEGORIES) {
      if (cat === 'All') {
        counts[cat] = { earned: earned.length, total: achievements.length };
      } else {
        const inCat = achievements.filter(a => getCategory(a) === cat);
        counts[cat] = { earned: inCat.filter(a => a.earned).length, total: inCat.length };
      }
    }
    return counts;
  }, [achievements, earned.length]);

  const filteredEarned = useMemo(() => {
    let result = earned;
    if (selectedCategory !== 'All') result = result.filter(a => getCategory(a) === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }
    return result;
  }, [earned, selectedCategory, searchQuery]);

  const filteredLocked = useMemo(() => {
    let result = locked;
    if (selectedCategory !== 'All') result = result.filter(a => getCategory(a) === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }
    return result;
  }, [locked, selectedCategory, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Progress</h1>
      </div>

      {loading && <div className="spinner" />}
      {loading ? null : (<>

      {/* Level card */}
      {progress && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-light)' }}>Level {progress.level}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem', fontSize: '0.9rem' }}>{progress.xp} total XP</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {progress.xp_to_next_level} XP to level {progress.level + 1}
            </div>
          </div>
          <div className="xp-bar-container" style={{ height: 16 }}>
            <div className="xp-bar-fill" style={{ width: `${progress.level_progress_pct}%` }} />
          </div>

          <div className="grid-4" style={{ marginTop: '1.25rem' }}>
            <div className="stat-card">
              <div className="stat-value">{progress.games_added}</div>
              <div className="stat-label">Added</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{progress.games_completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progress.games_dropped}</div>
              <div className="stat-label">Dropped</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Number(progress.total_hours_logged).toFixed(0)}h</div>
              <div className="stat-label">Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* Earned achievements */}
      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800 }}>
        Achievements ({earned.length} / {achievements.length})
      </h2>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {ACHIEVEMENT_CATEGORIES.filter(cat => categoryCounts[cat].total > 0 || cat === 'All').map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: 999,
              border: '1px solid var(--border)',
              background: selectedCategory === cat ? 'var(--accent)' : 'var(--surface)',
              color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
            }}
          >
            {cat} ({categoryCounts[cat].earned}/{categoryCounts[cat].total})
          </button>
        ))}
      </div>

      {/* Search achievements */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search achievements..."
        style={{ maxWidth: 260, fontSize: '0.82rem', padding: '0.4rem 0.75rem', marginBottom: '1rem' }}
      />

      {/* Category progress bar */}
      {selectedCategory !== 'All' && categoryCounts[selectedCategory].total > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            {selectedCategory} progress: {categoryCounts[selectedCategory].earned} / {categoryCounts[selectedCategory].total}
          </div>
          <div className="xp-bar-container" style={{ height: 10 }}>
            <div
              className="xp-bar-fill"
              style={{ width: `${(categoryCounts[selectedCategory].earned / categoryCounts[selectedCategory].total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {filteredEarned.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {filteredEarned.map((a) => (
            <div key={a.id} className="card" style={{ borderColor: '#fbbf24', background: 'rgba(251,191,36,0.06)' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.description}</div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.2rem' }}>
                  +{a.xp_reward} XP · Earned {new Date(a.earned_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Locked achievements */}
      {filteredLocked.length > 0 && (
        <>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            LOCKED
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.75rem',
          }}>
            {filteredLocked.map((a) => (
              <div key={a.id} className="card" style={{ opacity: 0.5 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{a.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    +{a.xp_reward} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </>)}
    </div>
  );
}
