import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip,
} from 'recharts';
import * as FaIcons from 'react-icons/fa';
import { FaDna } from 'react-icons/fa';
import { PLAY_MOTIVATIONS, EMOTIONAL_TONES, PLAY_STYLES, ENERGY_LEVELS } from '../constants';
import { backlogApi } from '../services/api';

function getIcon(name) {
  return FaIcons[name] || null;
}

export default function VibePortfolioPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    backlogApi.vibePortfolio()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><FaDna style={{ marginRight: 8 }} />My Gamer DNA</h1>
      </div>
      <div className="spinner" />
    </div>
  );
  if (error) return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><FaDna style={{ marginRight: 8 }} />My Gamer DNA</h1>
      </div>
      <div className="card" style={{ textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
    </div>
  );

  const {
    total_profiled = 0,
    motivations = {},
    emotional_tones = {},
    play_styles = {},
    energy_levels = {},
    dominant_motivation,
    dominant_tone,
    dominant_energy,
  } = data || {};

  if (total_profiled === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title"><FaDna style={{ marginRight: 8 }} />My Gamer DNA</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🧬</div>
          <p>Add games to your backlog and answer the vibe questions to build your Gamer DNA!</p>
        </div>
      </div>
    );
  }

  // Build chart data
  const motivationData = PLAY_MOTIVATIONS.map(m => ({
    name: m.label,
    value: motivations[m.value] || 0,
    color: m.color,
    icon: m.icon,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const radarData = PLAY_MOTIVATIONS.map(m => ({
    subject: m.label,
    count: motivations[m.value] || 0,
  }));

  const energyData = ENERGY_LEVELS.map(e => ({
    name: e.label,
    value: energy_levels[e.value] || 0,
    color: e.color,
  }));

  const dominantMotivationInfo = PLAY_MOTIVATIONS.find(m => m.value === dominant_motivation);
  const dominantToneInfo = EMOTIONAL_TONES.find(t => t.value === dominant_tone);
  const dominantEnergyInfo = ENERGY_LEVELS.find(e => e.value === dominant_energy);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><FaDna style={{ marginRight: 8 }} />My Gamer DNA</h1>
      </div>

      {/* Personality summary */}
      <div className="vibe-dna-summary">
        <h2>Your Gamer Identity</h2>
        <p>
          You&apos;re primarily a <strong>{dominantMotivationInfo?.label || dominant_motivation || '—'}</strong> gamer
          who loves <strong>{dominantToneInfo?.label || dominant_tone || '—'}</strong> games
          at a <strong>{dominantEnergyInfo?.label || dominant_energy || '—'}</strong> pace.
        </p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Based on {total_profiled} profiled game{total_profiled !== 1 ? 's' : ''} in your backlog.
        </p>
      </div>

      {/* Motivation chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Play Motivations</h3>

        {motivationData.length > 0 && (
          <>
            {/* Radar chart */}
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="count" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Horizontal bar chart */}
            <ResponsiveContainer width="100%" height={motivationData.length * 36 + 20}>
              <BarChart data={motivationData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text)', fontSize: 12 }} width={75} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {motivationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Emotional tone cloud */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Emotional Tones</h3>
        <div className="vibe-grid">
          {EMOTIONAL_TONES.map(tone => {
            const count = emotional_tones[tone.value] || 0;
            if (count === 0) return null;
            const Icon = getIcon(tone.icon);
            return (
              <div key={tone.value} className="vibe-tone-card" style={{ borderColor: tone.color }}>
                {Icon && <Icon size={20} color={tone.color} />}
                <div className="tone-count" style={{ color: tone.color }}>{count}</div>
                <div className="tone-label">{tone.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Play style breakdown */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Play Styles</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PLAY_STYLES.map(style => {
            const count = play_styles[style.value] || 0;
            if (count === 0) return null;
            const Icon = getIcon(style.icon);
            return (
              <span
                key={style.value}
                className="tag"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem' }}
              >
                {Icon && <Icon size={12} />}
                {style.label}
                <strong style={{ marginLeft: '0.2rem' }}>×{count}</strong>
              </span>
            );
          })}
        </div>
      </div>

      {/* Energy profile */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Energy Profile</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={energyData} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text)', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--text)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {energyData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
