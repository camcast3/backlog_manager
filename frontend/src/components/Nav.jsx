/* Navigation sidebar */
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/backlog', icon: '🎮', label: 'Backlog' },
  { to: '/games', icon: '📦', label: 'Game Library' },
  { to: '/progress', icon: '⭐', label: 'My Progress' },
];

const navStyle = {
  width: 220,
  minHeight: '100vh',
  background: 'var(--surface)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 0',
  flexShrink: 0,
};

const logoStyle = {
  fontSize: '1.25rem',
  fontWeight: 900,
  padding: '0 1.25rem 1.5rem',
  color: 'var(--accent-light)',
  borderBottom: '1px solid var(--border)',
  marginBottom: '1rem',
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.65rem 1.25rem',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  borderRadius: 0,
  transition: 'all 0.15s',
};

const activeLinkStyle = {
  ...linkStyle,
  background: 'var(--surface-alt)',
  color: 'var(--accent-light)',
  borderLeft: '3px solid var(--accent)',
};

export default function Nav() {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🎮 Backlog Manager</div>
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
