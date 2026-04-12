import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GamePicker from './GamePicker';

vi.mock('react-icons/fa', () => ({
  FaTimes: () => <span>×</span>,
}));

vi.mock('../hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

describe('GamePicker', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      textAlign: '',
      font: '',
    }));
  });

  const games = [
    { game_title: 'Zelda', platform: 'Switch' },
    { game_title: 'Halo', platform: 'Xbox' },
    { game_title: 'God of War', platform: 'PS5' },
  ];

  it('shows empty state message when games is empty', () => {
    render(<GamePicker games={[]} onClose={vi.fn()} />);
    expect(screen.getByText(/No eligible games/)).toBeInTheDocument();
  });

  it('shows "Game Picker" title', () => {
    render(<GamePicker games={games} onClose={vi.fn()} />);
    expect(screen.getByText('Game Picker')).toBeInTheDocument();
  });

  it('renders Spin button', () => {
    render(<GamePicker games={games} onClose={vi.fn()} />);
    expect(screen.getByText('Spin')).toBeInTheDocument();
  });

  it('renders Close button', () => {
    render(<GamePicker games={games} onClose={vi.fn()} />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('Close button calls onClose', () => {
    const onClose = vi.fn();
    render(<GamePicker games={games} onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows canvas element when games provided', () => {
    render(<GamePicker games={games} onClose={vi.fn()} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
