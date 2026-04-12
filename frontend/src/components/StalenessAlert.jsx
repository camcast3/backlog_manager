import { useState } from 'react';
import { backlogApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from './StatusBadge';
import { FaTrophy } from 'react-icons/fa';

const STATUS_OPTIONS = [
  { value: 'want_to_play', label: 'Want to Play' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function StalenessAlert({ staleItems, onDismiss }) {
  const toast = useToast();
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState({});

  if (!staleItems || staleItems.length === 0) return null;

  async function handleRespond(item) {
    const response = responses[item.id];
    if (!response?.trim()) {
      toast('Please write a response first', 'warning');
      return;
    }
    setSubmitting((s) => ({ ...s, [item.id]: true }));
    try {
      const result = await backlogApi.stalenessResponse(item.id, response);
      toast(<>Thanks for the update! {result.gamification?.newAchievements?.length ? <><FaTrophy style={{ verticalAlign: 'middle' }} /> Achievement unlocked!</> : '+15 XP'}</>, 'success');
      onDismiss(item.id);
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setSubmitting((s) => ({ ...s, [item.id]: false }));
    }
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ color: 'var(--warning)', marginBottom: '0.75rem', fontSize: '1rem' }}>
        Staleness Check — These games haven't been touched in 3+ months
      </h3>
      {staleItems.map((item) => (
        <div key={item.id} className="staleness-alert">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <strong>{item.game_title}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({item.platform})</span>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={item.status} />
                <span style={{ color: 'var(--warning)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  Inactive for ~{Math.round(item.months_inactive)} months
                </span>
              </div>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }} onClick={() => onDismiss(item.id)}>
              Dismiss
            </button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Why haven't you picked this up? (No judgment!)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <input
                value={responses[item.id] ?? ''}
                onChange={(e) => setResponses((r) => ({ ...r, [item.id]: e.target.value }))}
                placeholder="Been busy, playing something else, not feeling it right now..."
                onKeyDown={(e) => e.key === 'Enter' && handleRespond(item)}
              />
              <button
                className="btn-primary"
                style={{ minWidth: 80 }}
                onClick={() => handleRespond(item)}
                disabled={submitting[item.id]}
              >
                {submitting[item.id] ? '...' : 'Respond'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
