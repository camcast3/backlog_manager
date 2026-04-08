import { useState } from 'react';
import { gamesApi, backlogApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PLATFORMS, VIBE_INTENSITIES, STORY_PACES } from '../constants';

export default function EditGameModal({ item, onClose, onUpdated }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [gameData, setGameData] = useState({
    title: item.game_title || '',
    platform: item.platform || PLATFORMS[0],
    genre: item.genre || '',
    developer: item.developer || '',
    release_year: item.release_year ?? '',
    cover_image_url: item.cover_image_url || '',
    hltb_main_story: item.hltb_main_story ?? '',
    hltb_main_plus_extras: item.hltb_main_plus_extras ?? '',
    hltb_completionist: item.hltb_completionist ?? '',
    vibe_intensity: item.vibe_intensity || 'moderate',
    vibe_story_pace: item.vibe_story_pace || 'steady',
    vibe_mood: item.vibe_mood || '',
    vibe_multiplayer: item.vibe_multiplayer ?? false,
    vibe_notes: item.vibe_notes || '',
  });

  const [backlogData, setBacklogData] = useState({
    why_i_want_to_play: item.why_i_want_to_play || '',
    priority: item.priority ?? 50,
    personal_notes: item.personal_notes || '',
  });

  function gSet(field, value) {
    setGameData((d) => ({ ...d, [field]: value }));
  }

  async function handleSave() {
    if (!gameData.title.trim()) {
      toast('Game title is required', 'warning');
      return;
    }
    setLoading(true);
    try {
      const numericFields = ['release_year', 'hltb_main_story', 'hltb_main_plus_extras', 'hltb_completionist'];
      const gPayload = { ...gameData };
      for (const f of numericFields) {
        if (gPayload[f] === '') gPayload[f] = null;
        else if (gPayload[f]) gPayload[f] = parseFloat(gPayload[f]);
      }

      // Update the game record
      await gamesApi.update(item.game_id, gPayload);

      // Update backlog item
      await backlogApi.update(item.id, {
        why_i_want_to_play: backlogData.why_i_want_to_play,
        priority: backlogData.priority,
        personal_notes: backlogData.personal_notes,
      });

      toast(`Updated "${gameData.title}"`, 'success');
      onUpdated();
      onClose();
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Edit Game</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
        </div>

        {/* Cover image preview */}
        {gameData.cover_image_url && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <img
              src={gameData.cover_image_url}
              alt="Cover"
              style={{ width: 80, height: 107, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <div style={{ flex: 1 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Cover Image URL</label>
                <input value={gameData.cover_image_url} onChange={(e) => gSet('cover_image_url', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Title</label>
          <input value={gameData.title} onChange={(e) => gSet('title', e.target.value)} />
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
            <input value={gameData.developer} onChange={(e) => gSet('developer', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Release Year</label>
            <input type="number" value={gameData.release_year} onChange={(e) => gSet('release_year', e.target.value)} min="1970" max="2030" />
          </div>
        </div>

        <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <legend style={{ color: 'var(--text-muted)', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>How Long To Beat (hours)</legend>
          <div className="grid-3">
            <div className="form-group">
              <label>Main Story</label>
              <input type="number" value={gameData.hltb_main_story} onChange={(e) => gSet('hltb_main_story', e.target.value)} step="0.5" min="0" />
            </div>
            <div className="form-group">
              <label>Main + Extras</label>
              <input type="number" value={gameData.hltb_main_plus_extras} onChange={(e) => gSet('hltb_main_plus_extras', e.target.value)} step="0.5" min="0" />
            </div>
            <div className="form-group">
              <label>Completionist</label>
              <input type="number" value={gameData.hltb_completionist} onChange={(e) => gSet('hltb_completionist', e.target.value)} step="0.5" min="0" />
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <legend style={{ color: 'var(--text-muted)', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Game Vibe</legend>
          <div className="grid-2">
            <div className="form-group">
              <label>Intensity</label>
              <select value={gameData.vibe_intensity} onChange={(e) => gSet('vibe_intensity', e.target.value)}>
                {VIBE_INTENSITIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Story Pace</label>
              <select value={gameData.vibe_story_pace} onChange={(e) => gSet('vibe_story_pace', e.target.value)}>
                {STORY_PACES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Mood / Atmosphere</label>
            <input value={gameData.vibe_mood} onChange={(e) => gSet('vibe_mood', e.target.value)} placeholder="e.g. dark, whimsical, epic, cozy..." />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="edit-multi" checked={gameData.vibe_multiplayer} onChange={(e) => gSet('vibe_multiplayer', e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="edit-multi" style={{ margin: 0 }}>Has Multiplayer</label>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <legend style={{ color: 'var(--text-muted)', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Personal</legend>
          <div className="form-group">
            <label>Why I Want to Play</label>
            <textarea value={backlogData.why_i_want_to_play} onChange={(e) => setBacklogData((d) => ({ ...d, why_i_want_to_play: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Priority: {backlogData.priority}</label>
            <input type="range" min="1" max="100" value={backlogData.priority} onChange={(e) => setBacklogData((d) => ({ ...d, priority: parseInt(e.target.value) }))} style={{ width: '100%' }} />
          </div>
          <div className="form-group">
            <label>Personal Notes</label>
            <textarea value={backlogData.personal_notes} onChange={(e) => setBacklogData((d) => ({ ...d, personal_notes: e.target.value }))} />
          </div>
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
