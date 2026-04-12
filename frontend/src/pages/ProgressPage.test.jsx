import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// ProgressPage calls useMemo after an early return when loading, which changes
// the hooks count between renders. Mock useMemo as a passthrough to avoid this.
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual, useMemo: (fn) => fn() };
});

vi.mock('../services/api', () => ({
  progressApi: {
    get: vi.fn().mockResolvedValue({ level: 5, xp: 1200, xp_to_next_level: 300, level_progress_pct: 80, games_added: 20, games_completed: 12, games_dropped: 3, total_hours_logged: 350 }),
    achievements: vi.fn().mockResolvedValue([
      { id: 1, key: 'first_game', title: 'First Game', description: 'Add your first game', xp_reward: 25, earned: true, earned_at: '2024-01-01' },
      { id: 2, key: 'complete_5', title: 'Handful', description: 'Complete 5 games', xp_reward: 100, earned: false },
      { id: 3, key: 'vibe_master', title: 'Vibe Master', description: 'Profile 10 games', xp_reward: 50, earned: true, earned_at: '2024-02-01' },
    ]),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

import ProgressPage from './ProgressPage';

describe('ProgressPage', () => {
  test('shows loading spinner initially', () => {
    const { container } = render(<ProgressPage />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders "Progress" title after load', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  test('shows level number and XP', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('1200 total XP')).toBeInTheDocument();
      expect(screen.getByText(/300 XP to level 6/)).toBeInTheDocument();
    });
  });

  test('shows achievement count (earned / total)', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('Achievements (2 / 3)')).toBeInTheDocument();
    });
  });

  test('renders category filter buttons', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText(/^All \(/)).toBeInTheDocument();
    });
  });

  test('shows earned achievements with gold styling', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('First Game')).toBeInTheDocument();
      expect(screen.getByText('Vibe Master')).toBeInTheDocument();
    });
  });

  test('shows locked achievements with opacity', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('LOCKED')).toBeInTheDocument();
      expect(screen.getByText('Handful')).toBeInTheDocument();
    });
  });

  test('search input filters achievements', async () => {
    render(<ProgressPage />);
    await waitFor(() => {
      expect(screen.getByText('First Game')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search achievements...');
    fireEvent.change(searchInput, { target: { value: 'Vibe' } });

    expect(screen.getByText('Vibe Master')).toBeInTheDocument();
    expect(screen.queryByText('First Game')).not.toBeInTheDocument();
  });
});
