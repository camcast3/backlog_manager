import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  analyticsApi: {
    backlogHealth: vi.fn().mockResolvedValue({
      remaining: 15,
      monthly_completion_rate: 3,
      estimated_months: 5,
      estimated_hours: 120,
    }),
    statusDist: vi.fn().mockResolvedValue([
      { status: 'playing', count: 5 },
      { status: 'completed', count: 10 },
    ]),
    completionTrends: vi.fn().mockResolvedValue([
      { month: '2024-01', count: 3 },
    ]),
    genreBreakdown: vi.fn().mockResolvedValue([
      { genre: 'RPG', count: 8 },
    ]),
    platformDist: vi.fn().mockResolvedValue([
      { platform: 'PC', count: 12 },
    ]),
    vibeMap: vi.fn().mockResolvedValue([
      { vibe_intensity: 'chill', count: 4 },
    ]),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div>{children}</div>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Legend: () => null,
}));

import AnalyticsPage from './AnalyticsPage';

describe('AnalyticsPage', () => {
  test('renders loading spinner initially', () => {
    const { container } = render(<AnalyticsPage />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders page title after loading', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  test('renders backlog health stats after loading', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Remaining')).toBeInTheDocument();
      expect(screen.getByText('3/mo')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('5mo')).toBeInTheDocument();
      expect(screen.getByText('120h')).toBeInTheDocument();
    });
  });

  test('renders chart section headings after loading', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Completion Timeline')).toBeInTheDocument();
      expect(screen.getByText('Genre Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Platform Distribution')).toBeInTheDocument();
      expect(screen.getByText('Vibe Intensity Map')).toBeInTheDocument();
    });
  });

  test('renders chart components after loading', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(2);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
    });
  });
});
