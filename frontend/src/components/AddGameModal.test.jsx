import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockAdd = vi.fn();

vi.mock('../services/api', () => ({
  gamesApi: {
    create: (...args) => mockCreate(...args),
  },
  backlogApi: {
    add: (...args) => mockAdd(...args),
  },
  searchApi: {
    games: vi.fn().mockResolvedValue({ results: [] }),
    status: vi.fn().mockResolvedValue({ igdb: false }),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('../hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('react-icons/fa', () => {
  const handler = (name) => (props) => <span data-testid={`icon-${name}`}>{name}</span>;
  return {
    FaTimes: handler('FaTimes'),
    FaCheck: handler('FaCheck'),
    FaDoorOpen: handler('FaDoorOpen'),
    FaSkull: handler('FaSkull'),
    FaBook: handler('FaBook'),
    FaTrophy: handler('FaTrophy'),
    FaCouch: handler('FaCouch'),
    FaUsers: handler('FaUsers'),
    FaCompass: handler('FaCompass'),
    FaPaintBrush: handler('FaPaintBrush'),
    FaGamepad: handler('FaGamepad'),
    FaFire: handler('FaFire'),
    FaMugHot: handler('FaMugHot'),
    FaCloudSun: handler('FaCloudSun'),
    FaHiking: handler('FaHiking'),
    FaBolt: handler('FaBolt'),
    FaSkullCrossbones: handler('FaSkullCrossbones'),
    FaHeart: handler('FaHeart'),
    FaMoon: handler('FaMoon'),
    FaMagic: handler('FaMagic'),
    FaCrown: handler('FaCrown'),
    FaSearch: handler('FaSearch'),
    FaExclamationTriangle: handler('FaExclamationTriangle'),
    FaLeaf: handler('FaLeaf'),
    FaLaugh: handler('FaLaugh'),
    FaCloudRain: handler('FaCloudRain'),
    FaClock: handler('FaClock'),
    FaRoute: handler('FaRoute'),
    FaCheckDouble: handler('FaCheckDouble'),
    FaMap: handler('FaMap'),
    FaStopwatch: handler('FaStopwatch'),
    FaCubes: handler('FaCubes'),
    FaUserFriends: handler('FaUserFriends'),
    FaMusic: handler('FaMusic'),
    FaCampground: handler('FaCampground'),
    FaRocket: handler('FaRocket'),
    FaHandshake: handler('FaHandshake'),
    FaClipboardList: handler('FaClipboardList'),
    FaSyncAlt: handler('FaSyncAlt'),
    FaTag: handler('FaTag'),
    FaScroll: handler('FaScroll'),
    FaFistRaised: handler('FaFistRaised'),
  };
});

import AddGameModal from './AddGameModal';

describe('AddGameModal', () => {
  const onClose = vi.fn();
  const onAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders step 1 with "Add Game" title', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    expect(screen.getByText('Add Game')).toBeInTheDocument();
  });

  test('shows game title input in step 1', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    expect(screen.getByPlaceholderText('e.g. Elden Ring')).toBeInTheDocument();
  });

  test('shows "Next: Vibe Interview" button', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    expect(screen.getByText('Next: Vibe Interview →')).toBeInTheDocument();
  });

  test('navigates to step 2 when title is filled', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    const titleInput = screen.getByPlaceholderText('e.g. Elden Ring');
    fireEvent.change(titleInput, { target: { value: 'Hollow Knight' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));
    expect(screen.getByText('Vibe Interview')).toBeInTheDocument();
  });

  test('step 2 shows multiple-choice vibe questions (not textareas)', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    const titleInput = screen.getByPlaceholderText('e.g. Elden Ring');
    fireEvent.change(titleInput, { target: { value: 'Hollow Knight' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    // Should show all 6 vibe questions as multiple-choice
    expect(screen.getByText('Why do you want to play this game?')).toBeInTheDocument();
    expect(screen.getByText('What energy level fits your mood?')).toBeInTheDocument();
    expect(screen.getByText('What atmosphere are you craving?')).toBeInTheDocument();
    expect(screen.getByText('How will you approach this game?')).toBeInTheDocument();
    expect(screen.getByText('How long are your typical play sessions?')).toBeInTheDocument();
    expect(screen.getByText('Why are you adding this game now?')).toBeInTheDocument();
  });

  test('step 2 shows answer choice buttons (not textareas)', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    // Should have clickable answer buttons, not textareas
    expect(screen.getByText('Escape into another world')).toBeInTheDocument();
    expect(screen.getByText('Test my skills on something hard')).toBeInTheDocument();
    expect(screen.getByText('Wind down and decompress')).toBeInTheDocument();
    expect(screen.getByText('Cozy blanket vibes — warm & safe')).toBeInTheDocument();
    expect(screen.getByText('Quick bursts (under 1 hr)')).toBeInTheDocument();

    // No textareas for vibe questions should exist (only personal notes)
    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBe(1); // only personal notes
  });

  test('clicking a vibe choice selects it (adds selected class)', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    const btn = screen.getByText('Escape into another world').closest('button');
    expect(btn.className).not.toContain('vibe-choice-selected');
    fireEvent.click(btn);
    expect(btn.className).toContain('vibe-choice-selected');
  });

  test('selecting a different answer deselects the previous one', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    const escapism = screen.getByText('Escape into another world').closest('button');
    const challenge = screen.getByText('Test my skills on something hard').closest('button');

    fireEvent.click(escapism);
    expect(escapism.className).toContain('vibe-choice-selected');

    fireEvent.click(challenge);
    expect(challenge.className).toContain('vibe-choice-selected');
    expect(escapism.className).not.toContain('vibe-choice-selected');
  });

  test('marks required questions with *', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    // Required questions (play_motivation, energy_level, session_length) should have *
    const requiredMarkers = document.querySelectorAll('span[style*="danger"]');
    expect(requiredMarkers.length).toBe(3);
  });

  test('submits with structured vibe_answers', async () => {
    mockCreate.mockResolvedValue({ id: 1, title: 'Test Game', platform: 'PS5' });
    mockAdd.mockResolvedValue({
      item: { id: 1, game_title: 'Test Game' },
      gamification: { newXp: 20, newLevel: 1, leveledUp: false, newAchievements: [] },
    });

    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test Game' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));

    // Answer required questions
    fireEvent.click(screen.getByText('Escape into another world'));
    fireEvent.click(screen.getByText('Cozy blanket vibes — warm & safe'));
    fireEvent.click(screen.getByText('A couple of hours'));

    fireEvent.click(screen.getByText('Add to Backlog'));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          vibe_answers: expect.arrayContaining([
            { question_id: 'play_motivation', answer_id: 'escapism' },
            { question_id: 'energy_level', answer_id: 'cozy' },
            { question_id: 'session_length', answer_id: 'medium' },
          ]),
        })
      );
    });
  });

  test('does NOT send interview_answers (old text format)', async () => {
    mockCreate.mockResolvedValue({ id: 1, title: 'Test', platform: 'PS5' });
    mockAdd.mockResolvedValue({
      item: { id: 1 },
      gamification: { newXp: 20, newLevel: 1, leveledUp: false, newAchievements: [] },
    });

    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));
    fireEvent.click(screen.getByText('Escape into another world'));
    fireEvent.click(screen.getByText('Cozy blanket vibes — warm & safe'));
    fireEvent.click(screen.getByText('A couple of hours'));
    fireEvent.click(screen.getByText('Add to Backlog'));

    await waitFor(() => {
      const call = mockAdd.mock.calls[0][0];
      expect(call).not.toHaveProperty('interview_answers');
      expect(call).toHaveProperty('vibe_answers');
    });
  });

  test('back button returns to step 1', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Elden Ring'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Next: Vibe Interview →'));
    expect(screen.getByText('Vibe Interview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('← Back'));
    expect(screen.getByText('Add Game')).toBeInTheDocument();
  });

  test('close button calls onClose', () => {
    render(<AddGameModal onClose={onClose} onAdded={onAdded} />);
    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
