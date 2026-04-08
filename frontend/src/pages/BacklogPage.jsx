import { useState, useEffect } from 'react';
import { backlogApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import VibeBadge from '../components/VibeBadge';
import HltbInfo from '../components/HltbInfo';
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';
import GamePicker from '../components/GamePicker';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'want_to_play', label: 'Want to Play' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'on_hold', label: 'On Hold' },
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'added', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'last_activity', label: 'Last Activity' },
];

const STATUS_TRANSITIONS = {
  want_to_play: ['playing', 'dropped'],
  playing: ['completed', 'dropped', 'on_hold'],
  on_hold: ['playing', 'dropped'],
  completed: [],
  dropped: ['want_to_play'],
};

export default function BacklogPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filters, setFilters] = useState({ status: 'want_to_play', sort: 'priority' });

  useEffect(() => {
    loadItems();
  }, [filters]);

  async function loadItems() {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;
      const data = await backlogApi.list(params);
      setItems(data);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(item, newStatus) {
    setUpdatingId(item.id);
    try {
      const result = await backlogApi.update(item.id, { status: newStatus });
      if (result.gamification) {
        const { newXp, newLevel, leveledUp, newAchievements } = result.gamification;
        toast(`Status updated to "${newStatus}"`, 'success');
        if (leveledUp) toast(`Level Up! You're now Level ${newLevel}!`, 'achievement', 6000);
        for (const a of newAchievements) {
          toast(`${a.icon} Achievement: ${a.title} (+${a.xp_reward} XP)`, 'achievement', 6000);
        }
      }
      loadItems();
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Remove "${item.game_title}" from your backlog?`)) return;
    try {
      await backlogApi.delete(item.id);
      toast(`"${item.game_title}" removed from backlog`, 'info');
      loadItems();
    } catch (err) {
      toast(err.message, 'warning');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Backlog</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setShowPicker(true)}>Pick For Me</button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Game</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilters((f) => ({ ...f, status: value }))}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: filters.status === value ? 'var(--accent)' : 'var(--surface)',
                color: filters.status === value ? 'white' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          style={{ maxWidth: 160 }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="spinner" />}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>—</div>
          <p>No games here yet — add one!</p>
        </div>
      )}

      {!loading && items.map((item) => (
        <div key={item.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div
            style={{ display: 'flex', gap: '1rem', cursor: 'pointer', alignItems: 'flex-start' }}
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            {item.cover_image_url && (
              <img
                src={item.cover_image_url}
                alt={item.game_title}
                style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{item.game_title}</span>
                <StatusBadge status={item.status} />
                <VibeBadge intensity={item.vibe_intensity} />
                {item.release_year && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.release_year}</span>
                )}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {item.platform}
                {item.genre ? ` · ${item.genre}` : ''}
                {item.hltb_main_story ? ` · ~${item.hltb_main_story}h` : ''}
              </div>
              {item.vibe_tags && item.vibe_tags.length > 0 && (
                <div style={{ marginTop: '0.3rem' }}>
                  {item.vibe_tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              {(STATUS_TRANSITIONS[item.status] ?? []).map((newStatus) => (
                <button
                  key={newStatus}
                  className={newStatus === 'completed' ? 'btn-success' : 'btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  onClick={(e) => { e.stopPropagation(); updateStatus(item, newStatus); }}
                  disabled={updatingId === item.id}
                >
                  {newStatus === 'completed' ? 'Complete' :
                   newStatus === 'playing' ? 'Start' :
                   newStatus === 'dropped' ? 'Drop' :
                   newStatus === 'on_hold' ? 'Pause' :
                   newStatus === 'want_to_play' ? 'Re-add' : newStatus}
                </button>
              ))}
              <button
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
              >
                ✏️
              </button>
              <button
                className="btn-danger"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {expandedId === item.id && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="grid-2">
                <div>
                  {item.why_i_want_to_play && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>WHY I WANT TO PLAY</div>
                      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--accent-light)' }}>"{item.why_i_want_to_play}"</div>
                    </div>
                  )}
                  {item.personal_notes && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>NOTES</div>
                      <div style={{ fontSize: '0.9rem' }}>{item.personal_notes}</div>
                    </div>
                  )}
                  {item.mood_match && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vibe match: </span>
                      <span className="tag">{item.mood_match}</span>
                      {item.expected_session_length && <span className="tag">{item.expected_session_length} sessions</span>}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>HOW LONG TO BEAT</div>
                  <HltbInfo
                    mainStory={item.hltb_main_story}
                    mainPlusExtras={item.hltb_main_plus_extras}
                    completionist={item.hltb_completionist}
                  />
                  <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {item.vibe_mood && <div>Atmosphere: <span style={{ color: 'var(--text)' }}>{item.vibe_mood}</span></div>}
                    {item.vibe_story_pace && <div>Story pace: <span style={{ color: 'var(--text)' }}>{item.vibe_story_pace.replace('_', ' ')}</span></div>}
                    <div>Added: {new Date(item.date_added).toLocaleDateString()}</div>
                    <div>Priority: {item.priority}/100</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} onAdded={() => loadItems()} />
      )}

      {editingItem && (
        <EditGameModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={() => loadItems()}
        />
      )}

      {showPicker && (
        <GamePicker
          games={items.filter((i) => i.status === 'want_to_play' || i.status === 'playing')}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
