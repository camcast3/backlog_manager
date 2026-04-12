import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
    }}>
      <h1 style={{ fontSize: '2rem' }}>🎮 Backlog Manager</h1>
      <p style={{ color: 'var(--text-muted, #999)' }}>Sign in to manage your game backlog</p>
      <button
        onClick={login}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--accent, #6366f1)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Sign in with SSO
      </button>
    </div>
  );
}
