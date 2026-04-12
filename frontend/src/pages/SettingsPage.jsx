import { useState } from 'react';
import { FaFileExport, FaFileImport } from 'react-icons/fa';
import { THEMES, useTheme } from '../context/ThemeContext';
import { exportApi } from '../services/api';
import SteamImport from '../components/SteamImport';
import BulkAdd from '../components/BulkAdd';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExport = async (format) => {
    try {
      if (format === 'json') await exportApi.json();
      else await exportApi.csv();
      showToast(`Backlog exported as ${format.toUpperCase()}`);
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = await exportApi.importData(data);
        showToast(`Imported ${result.imported} items (${result.skipped.length} skipped)`);
      } catch {
        showToast('Import failed — check file format', 'error');
      }
    };
    input.click();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Theme Selection */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Theme</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                padding: '1rem', borderRadius: 'var(--radius)',
                border: theme === key ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: t.vars['--surface'], color: t.vars['--text'],
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {/* Color preview */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[t.vars['--bg'], t.vars['--surface'], t.vars['--accent'], t.vars['--accent-light']].map((c, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {t.Icon && <t.Icon />} {t.label}
              </span>
              {theme === key && <span style={{ fontSize: '0.7rem', color: t.vars['--accent'] }}>Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Data Management</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={() => handleExport('json')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.25rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            <FaFileExport /> Export Backlog (JSON)
          </button>
          <button
            onClick={() => handleExport('csv')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.25rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            <FaFileExport /> Export Backlog (CSV)
          </button>
          <button
            onClick={handleImport}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.25rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            <FaFileImport /> Import Backlog
          </button>
        </div>
      </div>

      {/* Steam Integration */}
      <SteamImport onImported={() => showToast('Steam import complete — check your backlog!')} />

      {/* Bulk Add (Epic, GOG, etc.) */}
      <BulkAdd onImported={() => showToast('Bulk import complete — check your backlog!')} />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)',
          background: toast.type === 'error' ? '#e74c3c' : 'var(--accent)',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}

      {/* About */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>About</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <p><strong>Backlog Manager</strong> — a gamified tool to track your video game backlog.</p>
          <p style={{ marginTop: '0.5rem' }}>
            Track games across all platforms<br />
            HLTB integration for time-to-beat<br />
            IGDB covers and metadata<br />
            Earn XP and achievements<br />
            Vibe profiles to remember why you wanted to play
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Tips</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 2 }}>
          <div>• Click a backlog item to expand details</div>
          <div>• Use the edit button to edit game info after adding</div>
          <div>• Status transitions are context-aware (e.g., you can only pause a game you're playing)</div>
          <div>• Staleness alerts appear on the dashboard when games go untouched for 3+ months</div>
          <div>• Completing and adding games earns XP toward your next level</div>
        </div>
      </div>
    </div>
  );
}
