import { useState, useEffect } from 'react';
import { backlogApi, progressApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import VibeBadge from '../components/VibeBadge';
import StalenessAlert from '../components/StalenessAlert';
import AddGameModal from '../components/AddGameModal';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [staleItems, setStaleItems] = useState([]);
  const [playingNow, setPlayingNow] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, p, activity, stale, items] = await Promise.all([
        backlogApi.stats(),
        progressApi.get(),
        progressApi.activity(),
        backlogApi.staleness(),
        backlogApi.list({ status: 'playing' }),
      ]);
      setStats(s);
      setProgress(p);
      setRecentActivity(activity);
      setStaleItems(stale);
      setPlayingNow(items);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  function dismissStale(id) {
    setStaleItems((items) => items.filter((i) => i.id !== id));
  }

  if (loading) return <div className="spinner" />;

  const xpPct = progress?.level_progress_pct ?? 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏠 Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Game</button>
      </div>

      {/* XP / Level bar */}
      {progress && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              ⭐ Level {progress.level}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {progress.xp} XP — {progress.xp_to_next_level} XP to Level {progress.level + 1}
            </span>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      )}

      {/* Staleness alerts */}
      <StalenessAlert staleItems={staleItems} onDismiss={dismissStale} />

      {/* Stats row */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-value">{stats.want_to_play}</div>
            <div className="stat-label">Want to Play</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.playing}</div>
            <div className="stat-label">Playing Now</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Games</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Currently playing */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>🕹️ Playing Now</h3>
          {playingNow.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nothing playing — pick a game from your backlog!
            </div>
          ) : (
            playingNow.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                {item.cover_image_url && (
                  <img src={item.cover_image_url} alt={item.game_title} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{item.game_title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.platform} · {item.hours_played}h played
                    {item.hltb_main_story ? ` / ~${item.hltb_main_story}h HLTB` : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent activity / achievements */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>🏆 Recent Achievements</h3>
          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No achievements yet — add a game to start earning XP!
            </div>
          ) : (
            recentActivity.slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{a.achievement_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    +{a.xp_reward} XP · {new Date(a.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} onAdded={() => loadAll()} />
      )}
    </div>
  );
}
