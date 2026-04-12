import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  const statuses = [
    { status: 'want_to_play', label: 'Want to Play' },
    { status: 'playing', label: 'Playing' },
    { status: 'completed', label: 'Completed' },
    { status: 'dropped', label: 'Dropped' },
    { status: 'on_hold', label: 'On Hold' },
  ];

  statuses.forEach(({ status, label }) => {
    test(`renders "${label}" for status "${status}"`, () => {
      render(<StatusBadge status={status} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(`badge`, `badge-${status}`);
    });
  });

  test('falls back to raw status for unknown values', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });
});
