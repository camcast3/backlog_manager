import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock the toast context
vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

// Mock the API — use inline fns since vi.mock is hoisted
vi.mock('../services/api', () => ({
  steamApi: {
    status: vi.fn(),
    resolve: vi.fn(),
    library: vi.fn(),
    importGames: vi.fn(),
  },
}));

import SteamImport from './SteamImport';
import { steamApi } from '../services/api';

describe('SteamImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Steam Import heading', () => {
    render(<SteamImport />);
    expect(screen.getByText('Steam Import')).toBeInTheDocument();
  });

  test('renders input field and fetch button', () => {
    render(<SteamImport />);
    expect(screen.getByPlaceholderText(/Steam ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch Library/i)).toBeInTheDocument();
  });

  test('fetch button is disabled when input is empty', () => {
    render(<SteamImport />);
    const btn = screen.getByText(/Fetch Library/i).closest('button');
    expect(btn).toBeDisabled();
  });

  test('fetch button is enabled when input has value', () => {
    render(<SteamImport />);
    const input = screen.getByPlaceholderText(/Steam ID/i);
    fireEvent.change(input, { target: { value: 'testuser' } });
    const btn = screen.getByText(/Fetch Library/i).closest('button');
    expect(btn).not.toBeDisabled();
  });

  test('shows "How it works" info box', () => {
    render(<SteamImport />);
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    expect(screen.getByText(/you pick which games to import/i)).toBeInTheDocument();
  });

  test('shows error message when fetch fails', async () => {
    steamApi.resolve.mockRejectedValueOnce(new Error('Profile not found'));
    render(<SteamImport />);

    const input = screen.getByPlaceholderText(/Steam ID/i);
    fireEvent.change(input, { target: { value: 'baduser' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(screen.getByText(/Profile not found/i)).toBeInTheDocument();
    });
  });

  test('resolves vanity URL when non-numeric ID entered', async () => {
    steamApi.resolve.mockResolvedValueOnce({ steamId: '76561198012345678' });
    steamApi.library.mockResolvedValueOnce({
      total: 1,
      categories: {
        unplayed: { label: 'Unplayed', count: 1, games: [{ appid: 1, name: 'Test Game', playtime_hours: 0, header_url: '', already_imported: false }] },
        most_played: { label: 'Most Played', count: 0, games: [] },
        all: { label: 'All', count: 1, games: [{ appid: 1, name: 'Test Game', playtime_hours: 0, header_url: '', already_imported: false }] },
      },
    });

    render(<SteamImport />);
    const input = screen.getByPlaceholderText(/Steam ID/i);
    fireEvent.change(input, { target: { value: 'myvanityname' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(steamApi.resolve).toHaveBeenCalledWith('myvanityname');
    });
  });

  test('shows browse view with category tabs after fetch', async () => {
    steamApi.library.mockResolvedValueOnce({
      total: 5,
      categories: {
        unplayed: { label: 'Unplayed', count: 2, games: [
          { appid: 1, name: 'Alpha Game', playtime_hours: 0, header_url: '', already_imported: false },
          { appid: 2, name: 'Beta Game', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
        most_played: { label: 'Most Played', count: 1, games: [
          { appid: 3, name: 'Gamma Game', playtime_hours: 100, header_url: '', already_imported: false },
        ]},
        all: { label: 'Full Library', count: 5, games: [
          { appid: 1, name: 'Alpha Game', playtime_hours: 0, header_url: '', already_imported: false },
          { appid: 2, name: 'Beta Game', playtime_hours: 0, header_url: '', already_imported: false },
          { appid: 3, name: 'Gamma Game', playtime_hours: 100, header_url: '', already_imported: false },
          { appid: 4, name: 'Delta Game', playtime_hours: 10, header_url: '', already_imported: true },
          { appid: 5, name: 'Epsilon Game', playtime_hours: 5, header_url: '', already_imported: false },
        ]},
      },
    });

    render(<SteamImport />);
    const input = screen.getByPlaceholderText(/Steam ID/i);
    // Use numeric ID to skip vanity resolution
    fireEvent.change(input, { target: { value: '76561198012345678' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      // Text is split across elements; check the container span
      const spans = screen.getAllByText((_, el) =>
        el?.tagName === 'SPAN' && el?.textContent?.includes('5 games found')
      );
      expect(spans.length).toBeGreaterThan(0);
    });

    // Category tabs
    expect(screen.getByText(/Unplayed \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Most Played \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Library \(5\)/i)).toBeInTheDocument();
  });

  test('shows game names and "Never played" label for unplayed games', async () => {
    steamApi.library.mockResolvedValueOnce({
      total: 1,
      categories: {
        unplayed: { label: 'Unplayed', count: 1, games: [
          { appid: 1, name: 'New Game', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
        most_played: { label: 'Most Played', count: 0, games: [] },
        all: { label: 'All', count: 1, games: [
          { appid: 1, name: 'New Game', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
      },
    });

    render(<SteamImport />);
    fireEvent.change(screen.getByPlaceholderText(/Steam ID/i), { target: { value: '76561198012345678' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(screen.getByText('New Game')).toBeInTheDocument();
      expect(screen.getByText('Never played')).toBeInTheDocument();
    });
  });

  test('import button shows selected count', async () => {
    steamApi.library.mockResolvedValueOnce({
      total: 2,
      categories: {
        unplayed: { label: 'Unplayed', count: 2, games: [
          { appid: 1, name: 'Game A', playtime_hours: 0, header_url: '', already_imported: false },
          { appid: 2, name: 'Game B', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
        most_played: { label: 'Most Played', count: 0, games: [] },
        all: { label: 'All', count: 2, games: [
          { appid: 1, name: 'Game A', playtime_hours: 0, header_url: '', already_imported: false },
          { appid: 2, name: 'Game B', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
      },
    });

    render(<SteamImport />);
    fireEvent.change(screen.getByPlaceholderText(/Steam ID/i), { target: { value: '76561198012345678' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(screen.getByText('Game A')).toBeInTheDocument();
    });

    // Select one game
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText(/Import 1 Game$/i)).toBeInTheDocument();
  });

  test('shows completion view after import', async () => {
    steamApi.library.mockResolvedValueOnce({
      total: 1,
      categories: {
        unplayed: { label: 'Unplayed', count: 1, games: [
          { appid: 1, name: 'Solo Game', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
        most_played: { label: 'Most Played', count: 0, games: [] },
        all: { label: 'All', count: 1, games: [
          { appid: 1, name: 'Solo Game', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
      },
    });

    steamApi.importGames.mockResolvedValueOnce({ imported: 1, skipped: 0, errors: [] });

    render(<SteamImport />);
    fireEvent.change(screen.getByPlaceholderText(/Steam ID/i), { target: { value: '76561198012345678' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(screen.getByText('Solo Game')).toBeInTheDocument();
    });

    // Select and import
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByText(/Import 1 Game/i));

    await waitFor(() => {
      expect(screen.getByText('Import Complete!')).toBeInTheDocument();
      const importedDivs = screen.getAllByText((_, el) =>
        el?.tagName === 'DIV' && el?.textContent?.match(/\d+\s*games imported/)
      );
      expect(importedDivs.length).toBeGreaterThan(0);
    });
  });

  test('"Start Over" returns to input state', async () => {
    steamApi.library.mockResolvedValueOnce({
      total: 1,
      categories: {
        unplayed: { label: 'Unplayed', count: 1, games: [
          { appid: 1, name: 'Test', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
        most_played: { label: 'Most Played', count: 0, games: [] },
        all: { label: 'All', count: 1, games: [
          { appid: 1, name: 'Test', playtime_hours: 0, header_url: '', already_imported: false },
        ]},
      },
    });

    render(<SteamImport />);
    fireEvent.change(screen.getByPlaceholderText(/Steam ID/i), { target: { value: '76561198012345678' } });
    fireEvent.click(screen.getByText(/Fetch Library/i));

    await waitFor(() => {
      expect(screen.getByText(/Start Over/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Start Over/i));

    expect(screen.getByPlaceholderText(/Steam ID/i)).toBeInTheDocument();
  });
});
