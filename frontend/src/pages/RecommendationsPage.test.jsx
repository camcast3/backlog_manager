import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();

vi.mock('../services/api', () => ({
  recommendApi: {
    get: (...args) => mockGet(...args),
  },
}));

vi.mock('react-icons/fa', () => ({
  FaCouch: () => <span>couch</span>,
  FaCompass: () => <span>compass</span>,
  FaFistRaised: () => <span>fist</span>,
  FaBook: () => <span>book</span>,
  FaGamepad: () => <span>gamepad</span>,
  FaUsers: () => <span>users</span>,
  FaTrophy: () => <span>trophy</span>,
  FaPaintBrush: () => <span>brush</span>,
  FaDice: () => <span>dice</span>,
  FaClock: () => <span>clock</span>,
  FaDoorOpen: () => <span>door</span>,
}));

import RecommendationsPage from './RecommendationsPage';

describe('RecommendationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title', () => {
    render(<RecommendationsPage />);
    expect(screen.getByText(/What Should I Play/)).toBeInTheDocument();
  });

  test('renders all mood selection cards', () => {
    render(<RecommendationsPage />);
    expect(screen.getByText('Wind Down')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Test Myself')).toBeInTheDocument();
    expect(screen.getByText('Get Immersed')).toBeInTheDocument();
    expect(screen.getByText('Revisit')).toBeInTheDocument();
    expect(screen.getByText('Play Together')).toBeInTheDocument();
    expect(screen.getByText('Compete')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('renders session length options', () => {
    render(<RecommendationsPage />);
    expect(screen.getByText(/Short/)).toBeInTheDocument();
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
    expect(screen.getByText(/Long/)).toBeInTheDocument();
    expect(screen.getByText(/Marathon/)).toBeInTheDocument();
  });

  test('renders energy level buttons', () => {
    render(<RecommendationsPage />);
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('renders "Find My Game" button', () => {
    render(<RecommendationsPage />);
    expect(screen.getByText('🎮 Find My Game')).toBeInTheDocument();
  });

  test('displays results after API response', async () => {
    mockGet.mockResolvedValue([
      {
        id: 1,
        game_title: 'Stardew Valley',
        platform: 'PC',
        match_pct: 92,
        reasons: ['Chill vibes'],
        vibe_tags: 'relaxing,cozy',
      },
    ]);

    render(<RecommendationsPage />);
    fireEvent.click(screen.getByText('🎮 Find My Game'));

    await waitFor(() => {
      expect(screen.getByText('Stardew Valley')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('Chill vibes')).toBeInTheDocument();
      expect(screen.getByText('Your Picks')).toBeInTheDocument();
    });
  });

  test('displays empty state when no results', async () => {
    mockGet.mockResolvedValue([]);

    render(<RecommendationsPage />);
    fireEvent.click(screen.getByText('🎮 Find My Game'));

    await waitFor(() => {
      expect(screen.getByText(/No games matched/)).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    render(<RecommendationsPage />);
    fireEvent.click(screen.getByText('🎮 Find My Game'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
