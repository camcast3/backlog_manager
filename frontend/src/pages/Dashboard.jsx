import { useState, useEffect } from 'react';
import { backlogApi, progressApi, analyticsApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import VibeBadge from '../components/VibeBadge';
import StalenessAlert from '../components/StalenessAlert';
import AddGameModal from '../components/AddGameModal';
import GamePicker from '../components/GamePicker';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [staleItems, setStaleItems] = useState([]);
  const [playingNow, setPlayingNow] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [focusGames, setFocusGames] = useState([]);
  const [insights, setInsights] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
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

      // Fetch focus games and insights in parallel
      const [focus, health] = await Promise.all([
        backlogApi.focus().catch(() => []),
        analyticsApi.backlogHealth().catch(() => null),
      ]);
      setFocusGames(focus);
      setInsights(health);

      // Also fetch want_to_play for the game picker
      try {
        const wtp = await backlogApi.list({ status: 'want_to_play' });
        setAllItems([...items, ...wtp]);
      } catch { setAllItems(items); }
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  function dismissStale(id) {
    setStaleItems((items) => items.filter((i) => i.id !== id));
  }

  const xpPct = progress?.level_progress_pct ?? 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setShowPicker(true)}>Pick For Me</button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Game</button>
        </div>
      </div>

      {loading && <div className="spinner" />}
      {loading ? null : (<>


      {/* XP / Level bar */}
      {progress && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              Level {progress.level}
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

      {/* Focus: Your Next 5 */}
      {focusGames.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>🎯 Focus: Your Next 5</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {focusGames.map((g) => (
              <div key={g.id} className="focus-card">
                {g.cover_image_url && (
                  <img src={g.cover_image_url} alt={g.game_title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{g.game_title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {g.platform}
                    {g.hltb_main_story ? ` · ~${g.hltb_main_story}h` : ''}
                  </div>
                </div>
                <StatusBadge status={g.status} />
              </div>
            ))}
          </div>
        </div>
      )}

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
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>Playing Now</h3>
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
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>Recent Achievements</h3>
          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No achievements yet — add a game to start earning XP!
            </div>
          ) : (
            recentActivity.slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
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

      {/* Backlog Insights */}
      {insights && (
        <div className="insights-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>📊 Backlog Insights</h3>
          <div className="insight-row">
            <span style={{ color: 'var(--text-muted)' }}>Games remaining</span>
            <span className="insight-value">{insights.remaining}</span>
          </div>
          <div className="insight-row">
            <span style={{ color: 'var(--text-muted)' }}>Games completed</span>
            <span className="insight-value">{insights.completed}</span>
          </div>
          <div className="insight-row">
            <span style={{ color: 'var(--text-muted)' }}>Monthly completion rate</span>
            <span className="insight-value">{insights.monthly_completion_rate} games/mo</span>
          </div>
          <div className="insight-row">
            <span style={{ color: 'var(--text-muted)' }}>Est. time to clear backlog</span>
            <span className="insight-value">
              {insights.estimated_months ? `~${insights.estimated_months} months` : '—'}
              {insights.estimated_hours ? ` (~${insights.estimated_hours}h)` : ''}
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(124, 58, 237, 0.08)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--accent-light)' }}>
            {insights.monthly_completion_rate >= 3
              ? `🔥 You're on fire! ${insights.completed_last_6mo} games completed in 6 months!`
              : insights.monthly_completion_rate >= 1
              ? "📈 Steady progress — keep it up!"
              : insights.remaining > 20
              ? "🤔 Your backlog is growing — consider dropping games you're not excited about."
              : insights.remaining > 0
              ? "🎮 Take it one game at a time. No rush!"
              : "🏆 Your backlog is clear. Time to add some new adventures!"}
          </div>
        </div>
      )}

      </>)}

      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} onAdded={() => loadAll()} />
      )}

      {showPicker && (
        <GamePicker games={allItems} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
