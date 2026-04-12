import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKeyboard } from 'react-icons/fa';

export default function KeyboardShortcuts({ onNewGame, onPickForMe }) {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      // Allow Escape to close our own help modal even when modal-overlay exists
      if (e.key === 'Escape' && showHelp) {
        e.preventDefault();
        setShowHelp(false);
        return;
      }

      // Don't trigger when modal is open (check for modal-overlay)
      if (document.querySelector('.modal-overlay')) return;

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          onNewGame?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          onPickForMe?.();
          break;
        case '?':
          e.preventDefault();
          setShowHelp(h => !h);
          break;
        case '1':
          e.preventDefault();
          navigate('/');
          break;
        case '2':
          e.preventDefault();
          navigate('/backlog');
          break;
        case '3':
          e.preventDefault();
          navigate('/games');
          break;
        case '4':
          e.preventDefault();
          navigate('/progress');
          break;
        case '5':
          e.preventDefault();
          navigate('/settings');
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onNewGame, onPickForMe, showHelp]);

  if (!showHelp) return null;

  const shortcuts = [
    { key: 'N', desc: 'Add new game' },
    { key: 'P', desc: 'Pick for me (game wheel)' },
    { key: '1-5', desc: 'Navigate pages' },
    { key: '?', desc: 'Toggle this help' },
    { key: 'Esc', desc: 'Close modals / this help' },
  ];

  return (
    <div className="modal-overlay" onClick={() => setShowHelp(false)}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaKeyboard /> Keyboard Shortcuts
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {shortcuts.map(({ key, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{desc}</span>
              <kbd style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '0.2rem 0.6rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--text)',
                minWidth: 32,
                textAlign: 'center',
              }}>{key}</kbd>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Press <kbd style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 3, padding: '0.1rem 0.4rem', fontFamily: 'monospace' }}>?</kbd> anytime to toggle
        </div>
      </div>
    </div>
  );
}
