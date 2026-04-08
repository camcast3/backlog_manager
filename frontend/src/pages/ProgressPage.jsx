import { useState, useEffect } from 'react';
import { progressApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ProgressPage() {
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="spinner" />;

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Progress</h1>
      </div>

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

      {earned.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {earned.map((a) => (
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
      {locked.length > 0 && (
        <>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            LOCKED
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.75rem',
          }}>
            {locked.map((a) => (
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
    </div>
  );
}
