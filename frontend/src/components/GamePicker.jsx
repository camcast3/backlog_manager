import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaDice } from 'react-icons/fa';
import { useFocusTrap } from '../hooks/useFocusTrap';

const WHEEL_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#ec4899',
];

export default function GamePicker({ games, onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const items = games.slice(0, 10); // max 10 on the wheel

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, items]);

  function drawWheel(rot) {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 8;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, size, size);

    // Outer shadow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    items.forEach((game, i) => {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      // Slice with gradient
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      const baseColor = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fillStyle = baseColor;
      ctx.fill();

      // Subtle inner highlight
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r * 0.95, startAngle + 0.02, endAngle - 0.02);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fill();

      // Slice border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text — render along the slice
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);

      const label = game.game_title || game.title || 'Game';
      const maxChars = items.length <= 3 ? 28 : items.length <= 6 ? 20 : 16;
      const fontSize = items.length <= 3 ? 14 : items.length <= 6 ? 12 : 11;
      const truncated = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 3;
      ctx.fillText(truncated, r * 0.55, 5);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Pointer (triangle at top)
    ctx.beginPath();
    ctx.moveTo(cx - 14, 0);
    ctx.lineTo(cx + 14, 0);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function spin() {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const winIndex = Math.floor(Math.random() * items.length);
    const arc = 360 / items.length;
    const targetAngle = 360 - (winIndex * arc + arc / 2) + 270;
    const totalRotation = 360 * (5 + Math.random() * 3) + (targetAngle % 360);

    let startTime = null;
    const duration = 4000;
    const startRotation = rotation;

    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(items[winIndex]);
      }
    }

    requestAnimationFrame(animate);
  }

  const trapRef = useFocusTrap(true);

  if (items.length === 0) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal" ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="game-picker-title-empty" style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 id="game-picker-title-empty" className="modal-title">Game Picker</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            No eligible games to pick from. Add more games to your backlog!
          </p>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="game-picker-title" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 id="game-picker-title" className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaDice style={{ color: 'var(--accent-light)' }} /> Game Picker
          </h2>
          <button onClick={onClose} aria-label="Close dialog" style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', border: 'none' }}><FaTimes /></button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Can't decide? Let the wheel choose for you.
        </p>

        <div style={{ position: 'relative', margin: '0 auto', width: 320, height: 320 }}>
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            style={{ width: 320, height: 320 }}
          />
        </div>

        {/* Legend for small game counts */}
        {items.length <= 4 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
            {items.map((g, i) => (
              <span key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.8rem', color: 'var(--text-muted)',
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: WHEEL_COLORS[i % WHEEL_COLORS.length], flexShrink: 0 }} />
                {g.game_title || g.title}
              </span>
            ))}
          </div>
        )}

        {winner && (
          <div style={{
            marginTop: '1.25rem', padding: '1rem',
            background: 'rgba(124, 58, 237, 0.1)', border: '1px solid var(--accent)',
            borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              You should play
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)' }}>
              {winner.game_title || winner.title}
            </div>
            {winner.platform && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {winner.platform}
                {winner.hltb_main_story ? ` · ~${winner.hltb_main_story}h` : ''}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            onClick={spin}
            disabled={spinning}
            style={{ minWidth: 140, fontSize: '1rem', padding: '0.6rem 1.5rem' }}
          >
            {spinning ? 'Spinning...' : winner ? 'Spin Again' : 'Spin'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
