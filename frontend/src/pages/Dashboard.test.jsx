import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  backlogApi: {
    stats: vi.fn().mockResolvedValue({ want_to_play: 5, playing: 2, completed: 10, dropped: 1, on_hold: 0, total: 18, total_hours: 200 }),
    staleness: vi.fn().mockResolvedValue([]),
    list: vi.fn().mockResolvedValue([]),
    focus: vi.fn().mockResolvedValue([]),
  },
  progressApi: {
    get: vi.fn().mockResolvedValue({ level: 3, xp: 450, xp_to_next_level: 450, level_progress_pct: 50, games_added: 18, games_completed: 10, games_dropped: 1, total_hours_logged: 200 }),
    activity: vi.fn().mockResolvedValue([{ achievement_title: 'First Game', xp_reward: 25, earned_at: '2024-01-01' }]),
  },
  analyticsApi: {
    backlogHealth: vi.fn().mockResolvedValue({ remaining: 8, completed: 10, monthly_completion_rate: 2, estimated_months: 4, estimated_hours: 60 }),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('../components/AddGameModal', () => ({ default: () => null }));
vi.mock('../components/GamePicker', () => ({ default: () => null }));
vi.mock('../components/StalenessAlert', () => ({ default: () => null }));
vi.mock('../components/StatusBadge', () => ({ default: () => null }));
vi.mock('../components/VibeBadge', () => ({ default: () => null }));

import Dashboard from './Dashboard';

describe('Dashboard', () => {
  test('shows loading spinner initially', () => {
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders "Dashboard" title after load', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  test('shows stats cards (want_to_play, playing, completed, total)', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Want to Play')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('Total Games')).toBeInTheDocument();
    });
  });

  test('shows level and XP information', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText(/450 XP/)).toBeInTheDocument();
    });
  });

  test('shows "Add Game" and "Pick For Me" buttons', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('+ Add Game')).toBeInTheDocument();
      expect(screen.getByText('Pick For Me')).toBeInTheDocument();
    });
  });

  test('shows empty state when no games playing', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Nothing playing/)).toBeInTheDocument();
    });
  });

  test('shows insights card with metrics', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('📊 Backlog Insights')).toBeInTheDocument();
      expect(screen.getByText('Games remaining')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Monthly completion rate')).toBeInTheDocument();
    });
  });
});
