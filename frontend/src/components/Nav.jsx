/* Navigation sidebar – responsive with mobile hamburger */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

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
      </nav>
    </>
  );
}
