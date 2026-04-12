import * as FaIcons from 'react-icons/fa';
import { PLAY_MOTIVATIONS, EMOTIONAL_TONES, ENERGY_LEVELS } from '../constants';

function getIcon(name) {
  return FaIcons[name] || null;
}

export default function VibeBadge({ intensity, motivation, emotionalTone, compact = false }) {
  if (!intensity && !motivation && !emotionalTone) return null;

  const energyInfo = ENERGY_LEVELS.find(e => e.value === intensity);
  const motivationInfo = PLAY_MOTIVATIONS.find(m => m.value === motivation);
  const toneInfo = EMOTIONAL_TONES.find(t => t.value === emotionalTone);

  if (compact) {
    const label = energyInfo?.label || intensity;
    return (
      <span 
        className={`badge badge-${intensity || 'moderate'}`}
        title={[motivationInfo?.label, toneInfo?.label].filter(Boolean).join(' · ') || undefined}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="vibe-badge-full" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {energyInfo && (
        <span 
          className={`badge badge-${intensity}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          {(() => { const Icon = getIcon(energyInfo.icon); return Icon ? <Icon size={10} /> : null; })()}
          {energyInfo.label}
        </span>
      )}

      {motivationInfo && (() => {
        const Icon = getIcon(motivationInfo.icon);
        return (
          <span 
            className="tag"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              borderColor: motivationInfo.color, color: motivationInfo.color,
              fontSize: '0.7rem',
            }}
          >
            {Icon && <Icon size={10} />}
            {motivationInfo.label}
          </span>
        );
      })()}

      {toneInfo && (() => {
        const Icon = getIcon(toneInfo.icon);
        return (
          <span 
            className="tag"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              borderColor: toneInfo.color, color: toneInfo.color,
              fontSize: '0.7rem',
            }}
          >
            {Icon && <Icon size={10} />}
            {toneInfo.label}
          </span>
        );
      })()}
    </div>
  );
}
