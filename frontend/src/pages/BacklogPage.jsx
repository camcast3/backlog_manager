import { useState, useEffect, useMemo } from 'react';
import { backlogApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import VibeBadge from '../components/VibeBadge';
import HltbInfo from '../components/HltbInfo';
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';
import GamePicker from '../components/GamePicker';
import { useToast } from '../context/ToastContext';
import { FaPen, FaTimes, FaGripVertical, FaQuoteLeft } from 'react-icons/fa';
import SessionLogger from '../components/SessionLogger';
import CompletionCelebration from '../components/CompletionCelebration';
import { PLATFORMS, VIBE_INTENSITIES } from '../constants';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  { value: 'hltb', label: 'Play Time' },
];

function SortableCard({ item, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '0.75rem',
  };
  return (
    <div ref={setNodeRef} style={style} className={`card${isDragging ? ' sortable-dragging' : ''}`}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div className="drag-handle" {...attributes} {...listeners}>
          <FaGripVertical />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}

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
  const [filters, setFilters] = useState({ status: 'want_to_play', sort: 'priority', platform: '', genre: '', vibe_intensity: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [dropConfirm, setDropConfirm] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const isDragEnabled = filters.sort === 'priority';

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filteredItems.findIndex((i) => i.id === active.id);
    const newIndex = filteredItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(filteredItems, oldIndex, newIndex);
    // Optimistic local update
    setItems((prev) => {
      const ids = new Set(reordered.map((i) => i.id));
      const untouched = prev.filter((i) => !ids.has(i.id));
      return [...reordered, ...untouched];
    });
    // Calculate new priority values
    const step = reordered.length > 1 ? 100 / (reordered.length - 1) : 0;
    try {
      await Promise.all(
        reordered.map((item, idx) => {
          const newPriority = Math.round(100 - idx * step);
          return backlogApi.update(item.id, { priority: newPriority });
        })
      );
      toast('Priority order updated', 'success');
    } catch (err) {
      toast(err.message, 'warning');
      loadItems();
    }
  }

  useEffect(() => {
    setPage(1);
    loadItems(1);
  }, [filters]);

  async function loadItems(requestedPage = 1) {
    setLoading(true);
    try {
      const params = { page: requestedPage };
      if (filters.status) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;
      const data = await backlogApi.list(params);
      setItems(data.items);
      setHasMore(data.hasMore);
      setPage(requestedPage);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = { page: nextPage };
      if (filters.status) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;
      const data = await backlogApi.list(params);
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredItems = useMemo(() => {
    let result = items;
    if (filters.platform) result = result.filter(i => i.platform === filters.platform);
    if (filters.genre) result = result.filter(i => i.genre?.toLowerCase().includes(filters.genre.toLowerCase()));
    if (filters.vibe_intensity) result = result.filter(i => i.vibe_intensity === filters.vibe_intensity);
    return result;
  }, [items, filters.platform, filters.genre, filters.vibe_intensity]);

  const DROP_MESSAGES = [
    "Life's too short for games you don't enjoy! 🎯",
    "Smart move — more time for games you'll love! ✨",
    "Not every game is for everyone. Onwards! 🚀",
    "Your backlog just got lighter! 💪",
    "Knowing when to walk away is a skill! 🧠",
  ];

  async function updateStatus(item, newStatus, dropReason) {
    if (newStatus === 'dropped' && !dropConfirm) {
      setDropConfirm(item);
      return;
    }

    const previousItems = [...items];
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: newStatus } : i
    ));

    try {
      const updateData = { status: newStatus };
      if (newStatus === 'dropped' && dropReason) {
        updateData.personal_notes = (item.personal_notes ? item.personal_notes + '\n' : '') + `Drop reason: ${dropReason}`;
      }
      const result = await backlogApi.update(item.id, updateData);

      if (newStatus === 'dropped') {
        const msg = DROP_MESSAGES[Math.floor(Math.random() * DROP_MESSAGES.length)];
        toast(msg, 'success', 5000);
      } else if (newStatus === 'completed') {
        setCelebration({
          gameTitle: item.game_title,
          hoursPlayed: item.hours_played || 0,
          gamification: result.gamification,
        });
      }

      if (result.gamification && newStatus !== 'completed') {
        const { newXp, newLevel, leveledUp, newAchievements } = result.gamification;
        toast(`Status → ${newStatus}`, 'success');
        if (leveledUp) toast(`Level Up! You're now Level ${newLevel}!`, 'achievement', 6000);
        for (const a of newAchievements) {
          toast(`${a.icon} Achievement: ${a.title} (+${a.xp_reward} XP)`, 'achievement', 6000);
        }
      } else if (!result.gamification && newStatus !== 'dropped' && newStatus !== 'completed') {
        toast(`Status → ${newStatus}`, 'success');
      }

      loadItems();
    } catch (err) {
      setItems(previousItems);
      toast(err.message, 'warning');
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Remove "${item.game_title}" from your backlog?`)) return;
    const previousItems = [...items];
    setItems(prev => prev.filter(i => i.id !== item.id));

    try {
      await backlogApi.delete(item.id);
      toast(`"${item.game_title}" removed`, 'info');
    } catch (err) {
      setItems(previousItems);
      toast(err.message, 'warning');
    }
  }

  function renderCardContent(item) {
    return (
      <>
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
                disabled={false}
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
              aria-label={`Edit ${item.game_title}`}
            >
              <FaPen />
            </button>
            <button
              className="btn-danger"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
              aria-label={`Remove ${item.game_title}`}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {expandedId === item.id && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div className="grid-2">
              <div>
                {item.why_i_want_to_play && (
                  <div className="why-callout">
                    <div className="why-callout-label">
                      <FaQuoteLeft /> Remember why you added this?
                    </div>
                    <div className="why-callout-text">&ldquo;{item.why_i_want_to_play}&rdquo;</div>
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
            <SessionLogger backlogItemId={item.id} currentRating={item.rating} onUpdate={() => loadItems()} />
          </div>
        )}
      </>
    );
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
              aria-label={`Filter by status: ${label}`}
              aria-pressed={filters.status === value}
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
          aria-label="Sort order"
          style={{ maxWidth: 160 }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filters.platform || ''}
          onChange={(e) => setFilters(f => ({ ...f, platform: e.target.value }))}
          aria-label="Filter by platform"
          style={{ maxWidth: 180, fontSize: '0.82rem' }}
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <input
          value={filters.genre || ''}
          onChange={(e) => setFilters(f => ({ ...f, genre: e.target.value }))}
          placeholder="Filter by genre..."
          aria-label="Filter by genre"
          style={{ maxWidth: 160, fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
        />

        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[{ value: '', label: 'Any Vibe' }, ...VIBE_INTENSITIES].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilters(f => ({ ...f, vibe_intensity: value }))}
              aria-label={`Filter by vibe: ${label}`}
              aria-pressed={filters.vibe_intensity === value}
              style={{
                padding: '0.35rem 0.7rem', borderRadius: 999,
                border: '1px solid var(--border)',
                background: filters.vibe_intensity === value ? 'var(--accent)' : 'var(--surface)',
                color: filters.vibe_intensity === value ? 'white' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {(filters.platform || filters.genre || filters.vibe_intensity) && (
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setFilters(f => ({ ...f, platform: '', genre: '', vibe_intensity: '' }))}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && <div className="spinner" />}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>—</div>
          <p>No games here yet — add one!</p>
        </div>
      )}

      {!loading && filteredItems.length === 0 && items.length > 0 && (
        <div className="empty-state">
          <p>No games match your filters</p>
        </div>
      )}

      {!loading && filteredItems.length > 0 && isDragEnabled && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {filteredItems.map((item) => (
              <SortableCard key={item.id} item={item}>
                {renderCardContent(item)}
              </SortableCard>
            ))}
          </SortableContext>
        </DndContext>
      )}

      {!loading && filteredItems.length > 0 && !isDragEnabled && filteredItems.map((item) => (
        <div key={item.id} className="card" style={{ marginBottom: '0.75rem' }}>
          {renderCardContent(item)}
        </div>
      ))}

      {!loading && hasMore && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

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

      {dropConfirm && (
        <DropConfirmModal
          item={dropConfirm}
          onConfirm={(reason) => {
            const item = dropConfirm;
            setDropConfirm(null);
            updateStatus(item, 'dropped', reason);
          }}
          onCancel={() => setDropConfirm(null)}
        />
      )}

      {celebration && (
        <CompletionCelebration
          gameTitle={celebration.gameTitle}
          hoursPlayed={celebration.hoursPlayed}
          gamification={celebration.gamification}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

function DropConfirmModal({ item, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h3 className="modal-title">Drop &ldquo;{item.game_title}&rdquo;?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          No shame in dropping a game! Why are you moving on? (optional)
        </p>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ marginBottom: '1rem' }}
        >
          <option value="">No reason needed</option>
          <option value="Not my vibe">Not my vibe</option>
          <option value="Too long">Too long</option>
          <option value="Got boring">Got boring</option>
          <option value="Too hard">Too hard</option>
          <option value="Something better came along">Something better came along</option>
          <option value="Just not feeling it">Just not feeling it</option>
        </select>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm(reason)}>Drop It</button>
        </div>
      </div>
    </div>
  );
}