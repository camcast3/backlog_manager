import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StalenessAlert from './StalenessAlert';

const mockToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => mockToast,
}));

vi.mock('../services/api', () => ({
  backlogApi: {
    stalenessResponse: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('react-icons/fa', () => ({
  FaTrophy: () => <span>🏆</span>,
}));

vi.mock('./StatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

describe('StalenessAlert', () => {
  const onDismiss = vi.fn();

  const staleItem = {
    id: 1,
    game_title: 'Dark Souls',
    platform: 'PC',
    status: 'playing',
    months_inactive: 4.2,
  };

  beforeEach(() => {
    onDismiss.mockClear();
    mockToast.mockClear();
  });

  it('returns null when staleItems is empty', () => {
    const { container } = render(<StalenessAlert staleItems={[]} onDismiss={onDismiss} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when staleItems is null', () => {
    const { container } = render(<StalenessAlert staleItems={null} onDismiss={onDismiss} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders stale item details', () => {
    render(<StalenessAlert staleItems={[staleItem]} onDismiss={onDismiss} />);
    expect(screen.getByText('Dark Souls')).toBeInTheDocument();
    expect(screen.getByText('(PC)')).toBeInTheDocument();
    expect(screen.getByText(/4 months/)).toBeInTheDocument();
  });

  it('renders multiple stale items', () => {
    const items = [
      staleItem,
      { id: 2, game_title: 'Hollow Knight', platform: 'Switch', status: 'want_to_play', months_inactive: 6.7 },
    ];
    render(<StalenessAlert staleItems={items} onDismiss={onDismiss} />);
    expect(screen.getByText('Dark Souls')).toBeInTheDocument();
    expect(screen.getByText('Hollow Knight')).toBeInTheDocument();
  });

  it('clicking Dismiss calls onDismiss with item id', () => {
    render(<StalenessAlert staleItems={[staleItem]} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledWith(1);
  });

  it('shows warning toast when trying to respond with empty text', () => {
    render(<StalenessAlert staleItems={[staleItem]} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Respond'));
    expect(mockToast).toHaveBeenCalledWith('Please write a response first', 'warning');
  });
});
