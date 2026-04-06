import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart2, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

const navItems = [
  {
    label: 'Overview',
    to: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Transactions',
    to: '/transactions',
    icon: ArrowLeftRight,
    exact: false,
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: BarChart2,
    exact: false,
  },
];

export default function Sidebar() {
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    close();
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop-visible' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside className={`sidebar-panel ${isOpen ? 'sidebar-panel-open' : ''}`} aria-label="Navigation">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">PayNest</span>
            <span className="sidebar-brand-sub">FINANCIAL SERVICES</span>
          </div>
          <button
            onClick={close}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Menu</p>
          <ul className="sidebar-nav-list">
            {navItems.map(({ label, to, icon: Icon, exact }) => {
              const isActive = exact
                ? location.pathname === to
                : location.pathname.startsWith(to);

              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                    onClick={close}
                  >
                    <span className={`sidebar-nav-icon ${isActive ? 'sidebar-nav-icon-active' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="sidebar-nav-text">{label}</span>
                    {isActive && <span className="sidebar-active-dot" />}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">
            <span className="sidebar-footer-dot" />
            <span className="sidebar-footer-text">Live Data</span>
          </div>
        </div>
      </aside>
    </>
  );
}
