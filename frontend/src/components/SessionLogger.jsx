import { useState, useEffect } from 'react';
import { sessionsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FaClock, FaStar, FaPlus } from 'react-icons/fa';

export default function SessionLogger({ backlogItemId, currentRating, onUpdate }) {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    sessionsApi.list(backlogItemId).then(setSessions).catch(() => {});
  }, [backlogItemId]);

  async function logSession() {
    if (duration <= 0) return;
    setLoading(true);
    try {
      const result = await sessionsApi.log(backlogItemId, {
        duration_minutes: duration,
        notes: notes || undefined,
      });
      toast(<><FaClock style={{ verticalAlign: 'middle' }} /> Logged {duration} min session (+5 XP)</>, 'success');
      setSessions(s => [result.session, ...s]);
      setShowForm(false);
      setNotes('');
      onUpdate?.();
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  async function submitRating(value) {
    setRating(value);
    try {
      await sessionsApi.rate(backlogItemId, value);
      toast(`Rated ${value}/10`, 'success');
      onUpdate?.();
    } catch (err) {
      toast(err.message, 'warning');
    }
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Play Sessions
          </span>
          {sessions.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-light)' }}>
              {sessions.length} sessions · {totalHours}h total
            </span>
          )}
        </div>
        <button
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> Log Session
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: '0 0 120px' }}>
              <label style={{ fontSize: '0.75rem' }}>Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)} min="1" step="15" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: '0.75rem' }}>Notes (optional)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you do?" />
            </div>
            <button className="btn-primary" onClick={logSession} disabled={loading} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              {loading ? '...' : 'Log'}
            </button>
          </div>
        </div>
      )}

      {/* Rating (stars) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>Rating:</span>
        <div style={{ display: 'flex', gap: '0.15rem' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <FaStar
              key={i}
              size={16}
              style={{
                cursor: 'pointer',
                color: (hoverRating || rating) > i ? '#fbbf24' : 'var(--border)',
                transition: 'color 0.1s',
              }}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => submitRating(i + 1)}
            />
          ))}
          {rating > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{rating}/10</span>}
        </div>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
          {sessions.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{new Date(s.played_at).toLocaleDateString()}</span>
              <span>{s.duration_minutes} min</span>
              {s.notes && <span style={{ color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
