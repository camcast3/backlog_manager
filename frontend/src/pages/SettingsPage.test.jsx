import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../context/ThemeContext', () => ({
  THEMES: {
    dark: { label: 'Dark', Icon: () => <span>🌙</span>, vars: { '--bg': '#0f0f1a', '--surface': '#1a1a2e', '--accent': '#7c3aed', '--accent-light': '#a78bfa' } },
    light: { label: 'Light', Icon: () => <span>☀️</span>, vars: { '--bg': '#f5f5f5', '--surface': '#ffffff', '--accent': '#7c3aed', '--accent-light': '#7c3aed' } },
  },
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('../services/api', () => ({
  exportApi: {
    json: vi.fn().mockResolvedValue(undefined),
    csv: vi.fn().mockResolvedValue(undefined),
    importData: vi.fn().mockResolvedValue({ imported: 5, skipped: [] }),
  },
  steamApi: {
    status: vi.fn().mockResolvedValue({ configured: false }),
    resolve: vi.fn(),
    library: vi.fn(),
    importGames: vi.fn(),
  },
  bulkApi: {
    importGames: vi.fn(),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

vi.mock('react-icons/fa', () => ({
  FaFileExport: () => <span>export-icon</span>,
  FaFileImport: () => <span>import-icon</span>,
  FaSteam: () => <span>steam-icon</span>,
  FaCheck: () => <span>check-icon</span>,
  FaDownload: () => <span>download-icon</span>,
  FaTimes: () => <span>times-icon</span>,
  FaSearch: () => <span>search-icon</span>,
  FaExclamationTriangle: () => <span>warning-icon</span>,
  FaListUl: () => <span>list-icon</span>,
}));

import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  test('renders page title', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('renders Theme section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  test('renders theme options', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('renders export JSON button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Export Backlog (JSON)')).toBeInTheDocument();
  });

  test('renders export CSV button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Export Backlog (CSV)')).toBeInTheDocument();
  });

  test('renders import button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Import Backlog')).toBeInTheDocument();
  });

  test('renders Data Management section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  test('renders About section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders Tips section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Tips')).toBeInTheDocument();
  });

  test('shows active indicator for current theme', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('renders Steam Import section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Steam Import')).toBeInTheDocument();
  });

  test('renders Quick Bulk Add section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Quick Bulk Add')).toBeInTheDocument();
  });
});
