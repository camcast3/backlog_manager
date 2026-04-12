import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import VibeBadge from './VibeBadge';

describe('VibeBadge', () => {
  const intensities = [
    { intensity: 'chill', label: 'Chill' },
    { intensity: 'moderate', label: 'Moderate' },
    { intensity: 'intense', label: 'Intense' },
    { intensity: 'brutal', label: 'Brutal' },
    { intensity: 'cozy', label: 'Cozy' },
  ];

  intensities.forEach(({ intensity, label }) => {
    test(`renders "${label}" for intensity "${intensity}"`, () => {
      render(<VibeBadge intensity={intensity} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge');
    });
  });

  test('returns null when intensity is null', () => {
    const { container } = render(<VibeBadge intensity={null} />);
    expect(container.innerHTML).toBe('');
  });

  test('returns null when intensity is undefined', () => {
    const { container } = render(<VibeBadge />);
    expect(container.innerHTML).toBe('');
  });

  test('falls back to raw intensity for unknown values', () => {
    render(<VibeBadge intensity="extreme" />);
    expect(screen.getByText('extreme')).toBeInTheDocument();
  });
});
