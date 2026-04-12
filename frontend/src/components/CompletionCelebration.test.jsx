import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CompletionCelebration from './CompletionCelebration';

describe('CompletionCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    gameTitle: 'Elden Ring',
    hoursPlayed: 120,
    gamification: null,
    onClose: vi.fn(),
  };

  it('renders game title', () => {
    render(<CompletionCelebration {...baseProps} />);
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
  });

  it('renders "Game Complete!" heading', () => {
    render(<CompletionCelebration {...baseProps} />);
    expect(screen.getByText('Game Complete!')).toBeInTheDocument();
  });

  it('shows hours played when > 0', () => {
    render(<CompletionCelebration {...baseProps} hoursPlayed={120} />);
    expect(screen.getByText(/120 hours played/)).toBeInTheDocument();
  });

  it('hides hours played when 0', () => {
    render(<CompletionCelebration {...baseProps} hoursPlayed={0} />);
    expect(screen.queryByText(/hours played/)).not.toBeInTheDocument();
  });

  it('shows level up message', () => {
    const gamification = { leveledUp: true, newLevel: 5 };
    render(<CompletionCelebration {...baseProps} gamification={gamification} />);
    expect(screen.getByText(/Level Up/)).toBeInTheDocument();
    expect(screen.getByText(/Level 5/)).toBeInTheDocument();
  });

  it('shows achievements', () => {
    const gamification = {
      newAchievements: [
        { title: 'First Blood', icon: '🏆', xp_reward: 50 },
        { title: 'Completionist', icon: '⭐', xp_reward: 100 },
      ],
    };
    render(<CompletionCelebration {...baseProps} gamification={gamification} />);
    expect(screen.getByText(/First Blood/)).toBeInTheDocument();
    expect(screen.getByText(/Completionist/)).toBeInTheDocument();
  });

  it('calls onClose on overlay click', () => {
    const onClose = vi.fn();
    render(<CompletionCelebration {...baseProps} onClose={onClose} />);
    const overlay = document.querySelector('.modal-overlay');
    overlay.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-dismisses after 5 seconds', () => {
    const onClose = vi.fn();
    render(<CompletionCelebration {...baseProps} onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders 40 confetti pieces', () => {
    render(<CompletionCelebration {...baseProps} />);
    const pieces = document.querySelectorAll('.confetti-piece');
    expect(pieces).toHaveLength(40);
  });
});
