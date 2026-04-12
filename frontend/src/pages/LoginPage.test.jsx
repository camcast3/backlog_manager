import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, authEnabled: true, loading: false, login: mockLogin, logout: vi.fn() }),
}));

import LoginPage from './LoginPage';

describe('LoginPage', () => {
  test('renders the app title', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Backlog Manager/)).toBeInTheDocument();
  });

  test('renders sign-in prompt text', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in to manage your game backlog')).toBeInTheDocument();
  });

  test('renders login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in with SSO')).toBeInTheDocument();
  });

  test('calls login when button is clicked', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign in with SSO'));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });
});
