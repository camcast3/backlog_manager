import { useState, useEffect } from 'react';
import { gamesApi } from '../services/api';
import VibeBadge from '../components/VibeBadge';
import HltbInfo from '../components/HltbInfo';
import { useToast } from '../context/ToastContext';

export default function GameLibraryPage() {
  const toast = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterVibe, setFilterVibe] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    loadGames(1);
  }, [filterVibe]);

  async function loadGames(requestedPage = 1) {
    setLoading(true);
    try {
      const params = { page: requestedPage };
      if (filterVibe) params.vibe_intensity = filterVibe;
      const data = await gamesApi.list(params);
      setGames(data.items);
      setHasMore(data.hasMore);
      setPage(requestedPage);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreGames() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = { page: nextPage };
      if (filterVibe) params.vibe_intensity = filterVibe;
      const data = await gamesApi.list(params);
      setGames(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = search
    ? games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()))
    : games;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Game Library</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          style={{ maxWidth: 260 }}
        />
        <select value={filterVibe} onChange={(e) => setFilterVibe(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All vibes</option>
          <option value="chill">Chill</option>
          <option value="moderate">Moderate</option>
          <option value="intense">Intense</option>
          <option value="brutal">Brutal</option>
        </select>
      </div>

      {loading && <div className="spinner" />}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>—</div>
          <p>No games in library yet — add games through the backlog!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {filtered.map((game) => (
          <div key={game.id} className="card">
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {game.cover_image_url && (
                <img
                  src={game.cover_image_url}
                  alt={game.title}
                  style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{game.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  {game.platform}{game.release_year ? ` · ${game.release_year}` : ''}{game.genre ? ` · ${game.genre}` : ''}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <VibeBadge intensity={game.vibe_intensity} />
                  {game.vibe_mood && <span className="tag">{game.vibe_mood}</span>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <HltbInfo
                mainStory={game.hltb_main_story}
                mainPlusExtras={game.hltb_main_plus_extras}
                completionist={game.hltb_completionist}
              />
            </div>
            {game.vibe_notes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{game.vibe_notes}"
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && hasMore && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMoreGames} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
