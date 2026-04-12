/* Navigation sidebar – responsive with mobile hamburger */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/recommend', label: 'What to Play?' },
  { to: '/backlog', label: 'Backlog' },
  { to: '/games', label: 'Game Library' },
  { to: '/progress', label: 'Progress' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, authEnabled, logout } = useAuth();

  // Close sidebar on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {open && (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      )}

      <nav className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">Backlog Manager</div>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
            }
          >
            <span>{label}</span>
          </NavLink>
        ))}

        {authEnabled && user && (
          <div style={{
            marginTop: 'auto',
            padding: '1rem',
            borderTop: '1px solid var(--border, #333)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt=""
                style={{ width: 28, height: 28, borderRadius: '50%' }}
              />
            )}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
              {user.display_name || user.email || 'User'}
            </span>
            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
