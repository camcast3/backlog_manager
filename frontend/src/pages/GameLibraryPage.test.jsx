import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  gamesApi: {
    list: vi.fn().mockResolvedValue({
      items: [
        { id: 1, title: 'Elden Ring', platform: 'PC', release_year: 2022, genre: 'RPG', vibe_intensity: 'intense', cover_image_url: null, vibe_mood: null, vibe_notes: null, hltb_main_story: 50, hltb_main_plus_extras: 90, hltb_completionist: 130 },
        { id: 2, title: 'Stardew Valley', platform: 'Switch', release_year: 2016, genre: 'Simulation', vibe_intensity: 'chill', cover_image_url: null, vibe_mood: 'cozy', vibe_notes: null, hltb_main_story: 50, hltb_main_plus_extras: null, hltb_completionist: null },
      ],
      hasMore: true,
    }),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('../components/VibeBadge', () => ({ default: () => <span>VibeBadge</span> }));
vi.mock('../components/HltbInfo', () => ({ default: () => <span>HltbInfo</span> }));

import GameLibraryPage from './GameLibraryPage';
import { gamesApi } from '../services/api';

describe('GameLibraryPage', () => {
  test('shows loading spinner initially', () => {
    const { container } = render(<GameLibraryPage />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders "Game Library" title after load', async () => {
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText('Game Library')).toBeInTheDocument();
    });
  });

  test('shows game cards', async () => {
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      expect(screen.getByText('Stardew Valley')).toBeInTheDocument();
    });
  });

  test('shows empty state when no games', async () => {
    gamesApi.list.mockResolvedValueOnce({ items: [], hasMore: false });
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText(/No games in library yet/)).toBeInTheDocument();
    });
  });

  test('search input filters client-side', async () => {
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search games...');
    fireEvent.change(searchInput, { target: { value: 'stardew' } });

    expect(screen.getByText('Stardew Valley')).toBeInTheDocument();
    expect(screen.queryByText('Elden Ring')).not.toBeInTheDocument();
  });

  test('shows "Load More" button when hasMore is true', async () => {
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
  });

  test('hides "Load More" when hasMore is false', async () => {
    gamesApi.list.mockResolvedValueOnce({
      items: [
        { id: 1, title: 'Elden Ring', platform: 'PC', release_year: 2022, genre: 'RPG', vibe_intensity: 'intense', cover_image_url: null, vibe_mood: null, vibe_notes: null, hltb_main_story: 50, hltb_main_plus_extras: 90, hltb_completionist: 130 },
      ],
      hasMore: false,
    });
    render(<GameLibraryPage />);
    await waitFor(() => {
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
    });
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });
});
