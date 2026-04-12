import { useState } from 'react';
import { FaSteam, FaCheck, FaDownload, FaTimes, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { steamApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  { key: 'unplayed', desc: 'Games you own but have never launched — your real backlog.' },
  { key: 'most_played', desc: 'Your top games by playtime.' },
  { key: 'all', desc: 'Every game in your Steam library.' },
];

export default function SteamImport({ onImported }) {
  const toast = useToast();
  const [step, setStep] = useState('input'); // input | loading | browse | importing | done
  const [steamInput, setSteamInput] = useState('');
  const [library, setLibrary] = useState(null);
  const [activeCategory, setActiveCategory] = useState('unplayed');
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  async function fetchLibrary() {
    setStep('loading');
    setError(null);
    try {
      let steamId = steamInput.trim();

      // If not a numeric Steam ID, try to resolve as vanity URL
      if (!/^\d{10,}$/.test(steamId)) {
        // Extract from profile URL if pasted
        const urlMatch = steamId.match(/steamcommunity\.com\/(id|profiles)\/([^/]+)/);
        if (urlMatch) {
          steamId = urlMatch[1] === 'profiles' ? urlMatch[2] : urlMatch[2];
        }
        // Resolve vanity name to ID
        if (!/^\d{10,}$/.test(steamId)) {
          const resolved = await steamApi.resolve(steamId);
          steamId = resolved.steamId;
        }
      }

      const lib = await steamApi.library(steamId);
      setLibrary(lib);
      setStep('browse');
    } catch (err) {
      setError(err.message);
      setStep('input');
    }
  }

  function toggleGame(appid) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appid)) next.delete(appid);
      else next.add(appid);
      return next;
    });
  }

  function selectAll(games) {
    setSelected((prev) => {
      const next = new Set(prev);
      games.filter((g) => !g.already_imported).forEach((g) => next.add(g.appid));
      return next;
    });
  }

  function deselectAll(games) {
    setSelected((prev) => {
      const next = new Set(prev);
      games.forEach((g) => next.delete(g.appid));
      return next;
    });
  }

  async function doImport() {
    if (selected.size === 0) {
      toast('Select at least one game to import', 'warning');
      return;
    }

    setStep('importing');
    try {
      // Gather selected games from all categories
      const allGames = library.categories.all.games;
      const toImport = allGames.filter((g) => selected.has(g.appid));

      const result = await steamApi.importGames(toImport);
      setImportResult(result);
      setStep('done');
      toast(`Imported ${result.imported} games from Steam!`, 'success');
      if (onImported) onImported();
    } catch (err) {
      toast(err.message, 'warning');
      setStep('browse');
    }
  }

  const currentCategory = library?.categories?.[activeCategory];
  const filteredGames = currentCategory?.games?.filter(
    (g) => !filter || g.name.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <FaSteam /> Steam Import
      </h3>

      {step === 'input' && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Enter your Steam ID, custom URL, or profile link. Your game details must be set to <strong>public</strong> in Steam privacy settings.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Steam ID, username, or profile URL..."
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && steamInput.trim() && fetchLibrary()}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={fetchLibrary}
              disabled={!steamInput.trim()}
            >
              <FaSearch style={{ marginRight: '0.3rem' }} /> Fetch Library
            </button>
          </div>
          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaExclamationTriangle /> {error}
            </div>
          )}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>How it works:</strong> We fetch your library, then you pick which games to import.
            No need to add hundreds — just the ones you actually want to play.
            Unplayed games are added as "Want to Play". Played games are set to "Playing".
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching your Steam library...</p>
        </div>
      )}

      {step === 'browse' && library && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <strong>{library.total}</strong> games found · <strong style={{ color: 'var(--accent-light)' }}>{selected.size}</strong> selected for import
            </span>
            <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => { setStep('input'); setLibrary(null); setSelected(new Set()); }}>
              <FaTimes style={{ marginRight: '0.3rem' }} /> Start Over
            </button>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const data = library.categories[cat.key];
              return (
                <button
                  key={cat.key}
                  className={activeCategory === cat.key ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {data.label} ({data.count})
                </button>
              );
            })}
          </div>

          {/* Category description */}
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {CATEGORIES.find((c) => c.key === activeCategory)?.desc}
          </p>

          {/* Search + Select All */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <input
              placeholder="Filter games..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button className="btn-secondary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => selectAll(filteredGames)}>Select All</button>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => deselectAll(filteredGames)}>Deselect All</button>
          </div>

          {/* Game list */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {filteredGames.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No games match your filter
              </div>
            ) : (
              filteredGames.map((game) => (
                <label
                  key={game.appid}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid var(--border)', cursor: game.already_imported ? 'default' : 'pointer',
                    opacity: game.already_imported ? 0.5 : 1,
                    background: selected.has(game.appid) ? 'rgba(124,58,237,0.1)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(game.appid)}
                    disabled={game.already_imported}
                    onChange={() => toggleGame(game.appid)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <img
                    src={game.header_url}
                    alt=""
                    style={{ width: 60, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {game.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {game.playtime_hours > 0 ? `${game.playtime_hours}h played` : 'Never played'}
                      {game.already_imported && ' · Already in backlog'}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Import button */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              onClick={doImport}
              disabled={selected.size === 0}
              style={{ fontSize: '0.95rem', padding: '0.6rem 1.5rem' }}
            >
              <FaDownload style={{ marginRight: '0.4rem' }} />
              Import {selected.size} Game{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Importing {selected.size} games...</p>
        </div>
      )}

      {step === 'done' && importResult && (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <FaCheck style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.75rem' }} />
          <h4>Import Complete!</h4>
          <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div><strong>{importResult.imported}</strong> games imported</div>
            {importResult.skipped > 0 && <div>{importResult.skipped} already in backlog (skipped)</div>}
            {importResult.errors?.length > 0 && <div style={{ color: 'var(--warning)' }}>{importResult.errors.length} errors</div>}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => { setStep('input'); setLibrary(null); setSelected(new Set()); setImportResult(null); }}>
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
