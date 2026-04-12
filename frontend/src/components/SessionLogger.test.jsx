import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  sessionsApi: {
    list: vi.fn().mockResolvedValue([]),
    log: vi.fn().mockResolvedValue({ session: { id: 1, duration_minutes: 60, played_at: new Date().toISOString() } }),
    rate: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('react-icons/fa', () => ({
  FaClock: () => <span data-testid="icon-clock">clock</span>,
  FaStar: (props) => <span data-testid="icon-star" {...props}>★</span>,
  FaPlus: () => <span data-testid="icon-plus">+</span>,
}));

import SessionLogger from './SessionLogger';

describe('SessionLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders "Play Sessions" label', () => {
    render(<SessionLogger backlogItemId={1} />);
    expect(screen.getByText('Play Sessions')).toBeInTheDocument();
  });

  test('renders "Log Session" button', () => {
    render(<SessionLogger backlogItemId={1} />);
    expect(screen.getByText('Log Session')).toBeInTheDocument();
  });

  test('renders rating label', () => {
    render(<SessionLogger backlogItemId={1} />);
    expect(screen.getByText('Rating:')).toBeInTheDocument();
  });

  test('renders 10 star icons for rating', () => {
    render(<SessionLogger backlogItemId={1} />);
    const stars = screen.getAllByTestId('icon-star');
    expect(stars).toHaveLength(10);
  });

  test('shows log form when "Log Session" button is clicked', () => {
    render(<SessionLogger backlogItemId={1} />);
    fireEvent.click(screen.getByText('Log Session'));
    expect(screen.getByText('Duration (min)')).toBeInTheDocument();
    expect(screen.getByText('Notes (optional)')).toBeInTheDocument();
    expect(screen.getByText('Log')).toBeInTheDocument();
  });

  test('shows current rating when provided', () => {
    render(<SessionLogger backlogItemId={1} currentRating={7} />);
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });
});
