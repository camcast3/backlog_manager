import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  NavLink: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, authEnabled: false, loading: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock('react-icons/fa', () => ({
  FaBars: () => <span data-testid="icon-bars">bars</span>,
  FaTimes: () => <span data-testid="icon-times">times</span>,
  FaSignOutAlt: () => <span data-testid="icon-signout">signout</span>,
}));

import Nav from './Nav';

describe('Nav', () => {
  test('renders all nav links', () => {
    render(<Nav />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('What to Play?')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Game Library')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('renders correct link hrefs', () => {
    render(<Nav />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Backlog').closest('a')).toHaveAttribute('href', '/backlog');
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/analytics');
  });

  test('renders sidebar logo', () => {
    render(<Nav />);
    expect(screen.getByText('Backlog Manager')).toBeInTheDocument();
  });

  test('hamburger button toggles sidebar', () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText('Toggle navigation');
    expect(hamburger).toBeInTheDocument();

    // Initially shows bars icon
    expect(screen.getByTestId('icon-bars')).toBeInTheDocument();

    // Click to open
    fireEvent.click(hamburger);
    expect(screen.getByTestId('icon-times')).toBeInTheDocument();

    // Click to close
    fireEvent.click(hamburger);
    expect(screen.getByTestId('icon-bars')).toBeInTheDocument();
  });

  test('does not show logout when auth is disabled', () => {
    render(<Nav />);
    expect(screen.queryByTestId('icon-signout')).not.toBeInTheDocument();
  });
});
