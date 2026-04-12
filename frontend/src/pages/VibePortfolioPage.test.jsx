import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  backlogApi: {
    vibePortfolio: vi.fn().mockResolvedValue({
      total_profiled: 8,
      motivations: { escapism: 3, challenge: 2, story: 3 },
      emotional_tones: { heartwarming: 2, dark: 3, epic: 3 },
      play_styles: { main_story: 4, completionist: 2, explorer: 2 },
      energy_levels: { chill: 2, steady: 3, intense: 3 },
      mood_tags: {},
      dominant_motivation: 'escapism',
      dominant_tone: 'dark',
      dominant_energy: 'steady',
    }),
  },
}));

vi.mock('react-icons/fa', () => {
  const icon = (name) => () => <span>{name}</span>;
  return {
    FaDna: icon('FaDna'),
    FaDoorOpen: icon('FaDoorOpen'), FaSkull: icon('FaSkull'), FaBook: icon('FaBook'),
    FaTrophy: icon('FaTrophy'), FaCouch: icon('FaCouch'), FaUsers: icon('FaUsers'),
    FaCompass: icon('FaCompass'), FaPaintBrush: icon('FaPaintBrush'), FaGamepad: icon('FaGamepad'),
    FaFire: icon('FaFire'), FaHeart: icon('FaHeart'), FaMoon: icon('FaMoon'),
    FaMagic: icon('FaMagic'), FaCrown: icon('FaCrown'), FaSearch: icon('FaSearch'),
    FaExclamationTriangle: icon('FaExclamationTriangle'), FaLeaf: icon('FaLeaf'),
    FaLaugh: icon('FaLaugh'), FaCloudRain: icon('FaCloudRain'), FaClock: icon('FaClock'),
    FaRoute: icon('FaRoute'), FaCheckDouble: icon('FaCheckDouble'), FaMap: icon('FaMap'),
    FaStopwatch: icon('FaStopwatch'), FaCubes: icon('FaCubes'), FaUserFriends: icon('FaUserFriends'),
    FaMusic: icon('FaMusic'), FaMugHot: icon('FaMugHot'), FaCloudSun: icon('FaCloudSun'),
    FaHiking: icon('FaHiking'), FaBolt: icon('FaBolt'), FaSkullCrossbones: icon('FaSkullCrossbones'),
  };
});

vi.mock('recharts', () => ({
  RadarChart: ({ children }) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Cell: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

import VibePortfolioPage from './VibePortfolioPage';
import { backlogApi } from '../services/api';

describe('VibePortfolioPage', () => {
  test('shows loading text initially', () => {
    render(<VibePortfolioPage />);
    expect(screen.getByText(/Loading your Gamer DNA/)).toBeInTheDocument();
  });

  test('renders "My Gamer DNA" title after load', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText(/My Gamer DNA/)).toBeInTheDocument();
    });
  });

  test('shows personality summary with dominant values', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Your Gamer Identity')).toBeInTheDocument();
      expect(screen.getByText(/Based on 8 profiled games/)).toBeInTheDocument();
    });
  });

  test('shows motivation chart section', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Play Motivations')).toBeInTheDocument();
    });
  });

  test('shows emotional tones section', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Emotional Tones')).toBeInTheDocument();
    });
  });

  test('shows play styles section', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Play Styles')).toBeInTheDocument();
    });
  });

  test('shows energy profile section', async () => {
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Energy Profile')).toBeInTheDocument();
    });
  });

  test('shows empty state when no profiles', async () => {
    backlogApi.vibePortfolio.mockResolvedValueOnce({ total_profiled: 0, motivations: {}, emotional_tones: {}, play_styles: {}, energy_levels: {}, mood_tags: {} });
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText(/Add games to your backlog and answer the vibe questions/)).toBeInTheDocument();
    });
  });

  test('shows error message on API failure', async () => {
    backlogApi.vibePortfolio.mockRejectedValueOnce(new Error('Network error'));
    render(<VibePortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
