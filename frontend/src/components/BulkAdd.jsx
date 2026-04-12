import { useState } from 'react';
import { FaListUl, FaDownload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { bulkApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PLATFORMS = [
  'PC (Epic)',
  'PC (GOG)',
  'PC (Steam)',
  'PlayStation 5',
  'PlayStation 4',
  'Xbox Series X|S',
  'Xbox One',
  'Nintendo Switch',
  'iOS',
  'Android',
  'Other',
];

export default function BulkAdd({ onImported }) {
  const toast = useToast();
  const [step, setStep] = useState('input'); // input | importing | done
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState('PC (Epic)');
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const titles = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  async function doImport() {
    if (titles.length === 0) {
      toast('Paste at least one game title', 'warning');
      return;
    }
    if (titles.length > 200) {
      toast('Maximum 200 games per batch', 'warning');
      return;
    }

    setStep('importing');
    setError(null);
    try {
      const games = titles.map((title) => ({ title, platform }));
      const result = await bulkApi.importGames(games);
      setImportResult(result);
      setStep('done');
      toast(`Imported ${result.imported} games!`, 'success');
      if (onImported) onImported();
    } catch (err) {
      setError(err.message);
      setStep('input');
    }
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <FaListUl /> Quick Bulk Add
      </h3>

      {step === 'input' && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Paste a list of game titles (one per line) to batch-add them to your backlog.
            Works for <strong>Epic, GOG, PlayStation, Xbox, Switch</strong> — any platform without an API.
          </p>

          {/* Platform selector */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Textarea for game titles */}
          <textarea
            placeholder={"Fortnite\nRocket League\nAlan Wake 2\nHades\n..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {titles.length} game{titles.length !== 1 ? 's' : ''} detected
            </span>
            <button
              className="btn-primary"
              onClick={doImport}
              disabled={titles.length === 0}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              <FaDownload style={{ marginRight: '0.3rem' }} />
              Import {titles.length} Game{titles.length !== 1 ? 's' : ''}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Tip:</strong> Copy your game list from Epic, GOG, or any store.
            Cover art is auto-fetched from IGDB when available. All games are added as "Want to Play".
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Importing {titles.length} games with cover art lookup...
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This may take a moment for large lists
          </p>
        </div>
      )}

      {step === 'done' && importResult && (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <FaCheck style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.75rem' }} />
          <h4>Bulk Import Complete!</h4>
          <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div><strong>{importResult.imported}</strong> games imported</div>
            {importResult.skipped > 0 && <div>{importResult.skipped} already in backlog (skipped)</div>}
            {importResult.errors?.length > 0 && (
              <div style={{ color: 'var(--warning)', marginTop: '0.5rem' }}>
                {importResult.errors.length} failed:
                <ul style={{ textAlign: 'left', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  {importResult.errors.map((e, i) => (
                    <li key={i}>{e.title}: {e.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn-secondary" onClick={() => { setStep('input'); setText(''); setImportResult(null); }}>
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
