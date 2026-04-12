import { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#7c3aed', '#a78bfa', '#10b981', '#fbbf24', '#ef4444', '#38bdf8', '#fb7185', '#34d399'];
const CONFETTI_COUNT = 40;

function makeConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    drift: -30 + Math.random() * 60,
  }));
}

export default function CompletionCelebration({ gameTitle, hoursPlayed, gamification, onClose }) {
  const [pieces] = useState(makeConfetti);

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      {/* Confetti layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Game Complete!</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--accent-light)', fontWeight: 700, marginBottom: '0.75rem' }}>
          {gameTitle}
        </p>
        {hoursPlayed > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            ⏱ {hoursPlayed} hours played
          </p>
        )}
        {gamification && (
          <div style={{ marginTop: '0.5rem' }}>
            {gamification.leveledUp && (
              <p style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.95rem' }}>
                ⭐ Level Up! You&apos;re now Level {gamification.newLevel}!
              </p>
            )}
            {gamification.newAchievements?.map((a) => (
              <p key={a.title} style={{ color: '#fbbf24', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {a.icon} {a.title} (+{a.xp_reward} XP)
              </p>
            ))}
          </div>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
          Click anywhere or wait to dismiss
        </p>
      </div>
    </div>
  );
}
