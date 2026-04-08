import { useState } from 'react';
import { gamesApi, backlogApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PLATFORMS = [
  'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
  'Nintendo Switch', 'PC (Steam)', 'PC (Epic)', 'PC (GOG)', 'PC (Other)',
  'iOS', 'Android', 'PlayStation 3', 'Xbox 360', 'Nintendo Wii U',
  'Nintendo 3DS', 'Game Boy Advance', 'Retro / Other',
];

const VIBE_QUESTIONS = [
  { key: 'mood', label: '🧠 What mood are you in when you imagine playing this?', placeholder: 'e.g. I want to relax, I\'m craving a challenge, I want a good story...' },
  { key: 'session', label: '⏱️ How long do you picture a typical session being?', placeholder: 'e.g. 30 min lunch breaks, long weekend sessions, quick before bed...' },
  { key: 'why', label: '❓ Why did this game catch your eye?', placeholder: 'e.g. friends recommended it, saw gameplay on YouTube, loved a similar game...' },
];

export default function AddGameModal({ onClose, onAdded }) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1 = game info, 2 = vibe interview
  const [loading, setLoading] = useState(false);

  // Step 1: game data
  const [gameData, setGameData] = useState({
    title: '', platform: PLATFORMS[0], genre: '', developer: '',
    release_year: '', cover_image_url: '',
    hltb_main_story: '', hltb_main_plus_extras: '', hltb_completionist: '',
    vibe_intensity: 'moderate', vibe_story_pace: 'steady',
    vibe_mood: '', vibe_multiplayer: false, vibe_notes: '',
  });

  // Step 2: personal backlog data
  const [backlogData, setBacklogData] = useState({
    why_i_want_to_play: '',
    priority: 50,
    personal_notes: '',
    interview_answers: {},
  });

  function gSet(field, value) {
    setGameData((d) => ({ ...d, [field]: value }));
  }
  function bSet(field, value) {
    setBacklogData((d) => ({ ...d, [field]: value }));
  }
  function setAnswer(key, value) {
    setBacklogData((d) => ({
      ...d,
      interview_answers: { ...d.interview_answers, [key]: value },
    }));
  }

  async function handleSubmit() {
    if (!gameData.title.trim()) {
      toast('Game title is required', 'warning');
      return;
    }
    setLoading(true);
    try {
      // Create or upsert the game record
      const numericFields = ['release_year', 'hltb_main_story', 'hltb_main_plus_extras', 'hltb_completionist'];
      const gPayload = { ...gameData };
      for (const f of numericFields) {
        if (gPayload[f] === '') gPayload[f] = null;
        else if (gPayload[f]) gPayload[f] = parseFloat(gPayload[f]);
      }

      const game = await gamesApi.create(gPayload);

      // Add to backlog with vibe interview
      const result = await backlogApi.add({
        game_id: game.id,
        why_i_want_to_play: backlogData.why_i_want_to_play,
        priority: backlogData.priority,
        personal_notes: backlogData.personal_notes,
        interview_answers: backlogData.interview_answers,
      });

      // Show gamification rewards
      if (result.gamification) {
        const { newXp, newLevel, leveledUp, newAchievements } = result.gamification;
        toast(`+20 XP 🎮 Added "${game.title}" to your backlog!`, 'success');
        if (leveledUp) toast(`🎉 Level Up! You're now Level ${newLevel}!`, 'achievement', 6000);
        for (const a of newAchievements) {
          toast(`${a.icon} Achievement Unlocked: ${a.title} (+${a.xp_reward} XP)`, 'achievement', 6000);
        }
      }

      onAdded(result.item);
      onClose();
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>
            {step === 1 ? '🎮 Add Game' : '💬 Vibe Interview'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: step >= s ? 'var(--accent)' : 'var(--border)',
            }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="form-group">
              <label>Game Title *</label>
              <input value={gameData.title} onChange={(e) => gSet('title', e.target.value)} placeholder="e.g. Elden Ring" autoFocus />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Platform</label>
                <select value={gameData.platform} onChange={(e) => gSet('platform', e.target.value)}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Genre</label>
                <input value={gameData.genre} onChange={(e) => gSet('genre', e.target.value)} placeholder="e.g. RPG, Action..." />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Developer</label>
                <input value={gameData.developer} onChange={(e) => gSet('developer', e.target.value)} placeholder="e.g. FromSoftware" />
              </div>
              <div className="form-group">
                <label>Release Year</label>
                <input type="number" value={gameData.release_year} onChange={(e) => gSet('release_year', e.target.value)} placeholder="e.g. 2022" min="1970" max="2030" />
              </div>
            </div>

            <div className="form-group">
              <label>Cover Image URL (optional)</label>
              <input value={gameData.cover_image_url} onChange={(e) => gSet('cover_image_url', e.target.value)} placeholder="https://..." />
            </div>

            <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
              <legend style={{ color: 'var(--text-muted)', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>⏱️ How Long To Beat (hours)</legend>
              <div className="grid-3">
                <div className="form-group">
                  <label>Main Story</label>
                  <input type="number" value={gameData.hltb_main_story} onChange={(e) => gSet('hltb_main_story', e.target.value)} placeholder="~30" step="0.5" min="0" />
                </div>
                <div className="form-group">
                  <label>Main + Extras</label>
                  <input type="number" value={gameData.hltb_main_plus_extras} onChange={(e) => gSet('hltb_main_plus_extras', e.target.value)} placeholder="~50" step="0.5" min="0" />
                </div>
                <div className="form-group">
                  <label>Completionist</label>
                  <input type="number" value={gameData.hltb_completionist} onChange={(e) => gSet('hltb_completionist', e.target.value)} placeholder="~96" step="0.5" min="0" />
                </div>
              </div>
            </fieldset>

            <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
              <legend style={{ color: 'var(--text-muted)', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>🎭 Game Vibe</legend>
              <div className="grid-2">
                <div className="form-group">
                  <label>Intensity</label>
                  <select value={gameData.vibe_intensity} onChange={(e) => gSet('vibe_intensity', e.target.value)}>
                    <option value="chill">😌 Chill (PowerWash Simulator)</option>
                    <option value="moderate">🎯 Moderate</option>
                    <option value="intense">🔥 Intense (Dark Souls)</option>
                    <option value="brutal">💀 Brutal (Elden Ring DLC)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Story Pace</label>
                  <select value={gameData.vibe_story_pace} onChange={(e) => gSet('vibe_story_pace', e.target.value)}>
                    <option value="minimal">Minimal story</option>
                    <option value="slow_burn">Slow burn (worth the wait)</option>
                    <option value="steady">Steady</option>
                    <option value="fast_paced">Fast paced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mood / Atmosphere</label>
                <input value={gameData.vibe_mood} onChange={(e) => gSet('vibe_mood', e.target.value)} placeholder="e.g. dark, whimsical, epic, relaxing, cozy..." />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="multi" checked={gameData.vibe_multiplayer} onChange={(e) => gSet('vibe_multiplayer', e.target.checked)} style={{ width: 'auto' }} />
                <label htmlFor="multi" style={{ margin: 0 }}>Has Multiplayer</label>
              </div>
            </fieldset>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={() => gameData.title.trim() ? setStep(2) : toast('Title required', 'warning')}>
                Next: Vibe Interview →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Help us build your vibe profile for <strong style={{ color: 'var(--text)' }}>{gameData.title}</strong>.
              These answers help match games to your current mood later!
            </p>

            <div className="form-group">
              <label>✨ Why do you want to play this game? (the short version)</label>
              <textarea
                value={backlogData.why_i_want_to_play}
                onChange={(e) => bSet('why_i_want_to_play', e.target.value)}
                placeholder="e.g. Heard it's an amazing chill experience, perfect for unwinding..."
              />
            </div>

            {VIBE_QUESTIONS.map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <textarea
                  value={backlogData.interview_answers[key] ?? ''}
                  onChange={(e) => setAnswer(key, e.target.value)}
                  placeholder={placeholder}
                  style={{ minHeight: 60 }}
                />
              </div>
            ))}

            <div className="form-group">
              <label>📊 Priority (1 = low, 100 = must play ASAP)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="range" min="1" max="100"
                  value={backlogData.priority}
                  onChange={(e) => bSet('priority', parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ minWidth: 30, fontWeight: 700, color: 'var(--accent-light)' }}>{backlogData.priority}</span>
              </div>
            </div>

            <div className="form-group">
              <label>📝 Personal Notes (optional)</label>
              <textarea
                value={backlogData.personal_notes}
                onChange={(e) => bSet('personal_notes', e.target.value)}
                placeholder="Any other thoughts, reminders, spoiler-free notes..."
                style={{ minHeight: 60 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-success" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Adding...' : '🎮 Add to Backlog!'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
