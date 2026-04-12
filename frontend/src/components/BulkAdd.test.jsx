import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('../services/api', () => ({
  bulkApi: {
    importGames: vi.fn(),
  },
}));

import BulkAdd from './BulkAdd';
import { bulkApi } from '../services/api';

describe('BulkAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Quick Bulk Add heading', () => {
    render(<BulkAdd />);
    expect(screen.getByText('Quick Bulk Add')).toBeInTheDocument();
  });

  test('renders platform selector defaulting to PC (Epic)', () => {
    render(<BulkAdd />);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('PC (Epic)');
  });

  test('renders textarea for game titles', () => {
    render(<BulkAdd />);
    expect(screen.getByPlaceholderText(/Fortnite/)).toBeInTheDocument();
  });

  test('shows 0 games detected when textarea is empty', () => {
    render(<BulkAdd />);
    expect(screen.getByText('0 games detected')).toBeInTheDocument();
  });

  test('counts titles correctly as lines are added', () => {
    render(<BulkAdd />);
    const textarea = screen.getByPlaceholderText(/Fortnite/);
    fireEvent.change(textarea, { target: { value: 'Hades\nCeleste\nHollow Knight' } });
    expect(screen.getByText('3 games detected')).toBeInTheDocument();
  });

  test('ignores blank lines in count', () => {
    render(<BulkAdd />);
    const textarea = screen.getByPlaceholderText(/Fortnite/);
    fireEvent.change(textarea, { target: { value: 'Hades\n\n\nCeleste\n' } });
    expect(screen.getByText('2 games detected')).toBeInTheDocument();
  });

  test('import button is disabled when no titles entered', () => {
    render(<BulkAdd />);
    const btn = screen.getByText(/Import 0 Game/i).closest('button');
    expect(btn).toBeDisabled();
  });

  test('import button shows correct count', () => {
    render(<BulkAdd />);
    const textarea = screen.getByPlaceholderText(/Fortnite/);
    fireEvent.change(textarea, { target: { value: 'Game A\nGame B' } });
    expect(screen.getByText(/Import 2 Games/i)).toBeInTheDocument();
  });

  test('calls bulkApi.importGames with correct payload', async () => {
    bulkApi.importGames.mockResolvedValueOnce({ imported: 2, skipped: 0, errors: [] });

    render(<BulkAdd />);
    const textarea = screen.getByPlaceholderText(/Fortnite/);
    fireEvent.change(textarea, { target: { value: 'Hades\nCeleste' } });

    // Change platform
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Nintendo Switch' } });

    fireEvent.click(screen.getByText(/Import 2 Games/i));

    await waitFor(() => {
      expect(bulkApi.importGames).toHaveBeenCalledWith([
        { title: 'Hades', platform: 'Nintendo Switch' },
        { title: 'Celeste', platform: 'Nintendo Switch' },
      ]);
    });
  });

  test('shows completion view after import', async () => {
    bulkApi.importGames.mockResolvedValueOnce({ imported: 3, skipped: 1, errors: [] });

    render(<BulkAdd />);
    fireEvent.change(screen.getByPlaceholderText(/Fortnite/), { target: { value: 'A\nB\nC\nD' } });
    fireEvent.click(screen.getByText(/Import 4 Games/i));

    await waitFor(() => {
      expect(screen.getByText('Bulk Import Complete!')).toBeInTheDocument();
    });

    // Check stats (text split by <strong>)
    const importedDivs = screen.getAllByText((_, el) =>
      el?.tagName === 'DIV' && el?.textContent?.match(/3\s*games imported/)
    );
    expect(importedDivs.length).toBeGreaterThan(0);
    expect(screen.getByText(/1 already in backlog/i)).toBeInTheDocument();
  });

  test('shows error details when some games fail', async () => {
    bulkApi.importGames.mockResolvedValueOnce({
      imported: 1,
      skipped: 0,
      errors: [{ title: 'Bad Game', error: 'DB error' }],
    });

    render(<BulkAdd />);
    fireEvent.change(screen.getByPlaceholderText(/Fortnite/), { target: { value: 'Good\nBad Game' } });
    fireEvent.click(screen.getByText(/Import 2 Games/i));

    await waitFor(() => {
      expect(screen.getByText('Bulk Import Complete!')).toBeInTheDocument();
      expect(screen.getByText(/Bad Game: DB error/)).toBeInTheDocument();
    });
  });

  test('"Import More" resets to input state', async () => {
    bulkApi.importGames.mockResolvedValueOnce({ imported: 1, skipped: 0, errors: [] });

    render(<BulkAdd />);
    fireEvent.change(screen.getByPlaceholderText(/Fortnite/), { target: { value: 'TestGame' } });
    fireEvent.click(screen.getByText(/Import 1 Game$/i));

    await waitFor(() => {
      expect(screen.getByText('Import More')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Import More'));
    expect(screen.getByPlaceholderText(/Fortnite/)).toBeInTheDocument();
  });

  test('shows tip about cover art auto-fetch', () => {
    render(<BulkAdd />);
    expect(screen.getByText(/Cover art is auto-fetched/i)).toBeInTheDocument();
  });

  test('all platform options are available', () => {
    render(<BulkAdd />);
    const options = screen.getAllByRole('option');
    const values = options.map((o) => o.value);
    expect(values).toContain('PC (Epic)');
    expect(values).toContain('PC (GOG)');
    expect(values).toContain('PlayStation 5');
    expect(values).toContain('Nintendo Switch');
    expect(values).toContain('Xbox Series X|S');
  });
});
