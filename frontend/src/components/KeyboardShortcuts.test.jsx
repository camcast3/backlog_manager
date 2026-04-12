import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KeyboardShortcuts from './KeyboardShortcuts';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-icons/fa', () => ({
  FaKeyboard: () => <span>⌨</span>,
}));

describe('KeyboardShortcuts', () => {
  let onNewGame;
  let onPickForMe;

  beforeEach(() => {
    onNewGame = vi.fn();
    onPickForMe = vi.fn();
    mockNavigate.mockClear();
  });

  it('returns null initially (no visible content)', () => {
    const { container } = render(
      <KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('pressing "?" shows help modal with "Keyboard Shortcuts" heading', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('clicking overlay hides help modal', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    // Component's own modal-overlay blocks keydown, so close via overlay click
    fireEvent.click(document.querySelector('.modal-overlay'));
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('pressing Escape closes help modal', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('pressing "N" calls onNewGame', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: 'N' });
    expect(onNewGame).toHaveBeenCalled();
  });

  it('pressing "P" calls onPickForMe', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: 'P' });
    expect(onPickForMe).toHaveBeenCalled();
  });

  it('pressing "1" navigates to "/"', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: '1' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('pressing "2" navigates to "/backlog"', () => {
    render(<KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />);
    fireEvent.keyDown(window, { key: '2' });
    expect(mockNavigate).toHaveBeenCalledWith('/backlog');
  });

  it('does NOT trigger shortcuts when typing in input fields', () => {
    render(
      <div>
        <input data-testid="text-input" />
        <KeyboardShortcuts onNewGame={onNewGame} onPickForMe={onPickForMe} />
      </div>
    );
    const input = screen.getByTestId('text-input');
    fireEvent.keyDown(input, { key: 'N' });
    expect(onNewGame).not.toHaveBeenCalled();
  });
});
