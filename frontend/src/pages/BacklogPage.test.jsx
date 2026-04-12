import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  backlogApi: {
    list: vi.fn().mockResolvedValue({
      items: [
        { id: 1, game_title: 'Zelda TOTK', status: 'want_to_play', platform: 'Switch', genre: 'Action', vibe_intensity: 'moderate', cover_image_url: null, release_year: 2023, hltb_main_story: 50, vibe_tags: [], priority: 80 },
        { id: 2, game_title: 'Hades', status: 'want_to_play', platform: 'PC', genre: 'Roguelike', vibe_intensity: 'intense', cover_image_url: null, release_year: 2020, hltb_main_story: 20, vibe_tags: [], priority: 60 },
      ],
      hasMore: false,
    }),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('react-icons/fa', () => ({
  FaPen: () => <span>FaPen</span>,
  FaTimes: () => <span>FaTimes</span>,
  FaGripVertical: () => <span>FaGripVertical</span>,
  FaQuoteLeft: () => <span>FaQuoteLeft</span>,
}));

vi.mock('@dnd-kit/core',() => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: () => [],
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (arr) => arr,
}));
vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

vi.mock('../components/AddGameModal', () => ({ default: () => null }));
vi.mock('../components/EditGameModal', () => ({ default: () => null }));
vi.mock('../components/GamePicker', () => ({ default: () => null }));
vi.mock('../components/SessionLogger', () => ({ default: () => null }));
vi.mock('../components/CompletionCelebration', () => ({ default: () => null }));
vi.mock('../components/StatusBadge', () => ({ default: ({ status }) => <span>{status}</span> }));
vi.mock('../components/VibeBadge', () => ({ default: () => null }));
vi.mock('../components/HltbInfo', () => ({ default: () => null }));

import BacklogPage from './BacklogPage';
import { backlogApi } from '../services/api';

describe('BacklogPage', () => {
  test('shows loading spinner initially', () => {
    const { container } = render(<BacklogPage />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders "My Backlog" title after load', async () => {
    render(<BacklogPage />);
    await waitFor(() => {
      expect(screen.getByText('My Backlog')).toBeInTheDocument();
    });
  });

  test('renders filter controls (status, platform, sort dropdowns)', async () => {
    render(<BacklogPage />);
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Want to Play')).toBeInTheDocument();
      expect(screen.getByText('Playing')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Dropped')).toBeInTheDocument();
      expect(screen.getByText('On Hold')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort order')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by platform')).toBeInTheDocument();
    });
  });

  test('shows game cards', async () => {
    render(<BacklogPage />);
    await waitFor(() => {
      expect(screen.getByText('Zelda TOTK')).toBeInTheDocument();
      expect(screen.getByText('Hades')).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    backlogApi.list.mockResolvedValueOnce({ items: [], hasMore: false });
    render(<BacklogPage />);
    await waitFor(() => {
      expect(screen.getByText(/No games here yet/)).toBeInTheDocument();
    });
  });

  test('shows "+ Add Game" button', async () => {
    render(<BacklogPage />);
    await waitFor(() => {
      expect(screen.getByText('+ Add Game')).toBeInTheDocument();
    });
  });
});
