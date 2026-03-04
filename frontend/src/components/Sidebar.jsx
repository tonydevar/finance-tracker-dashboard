import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Menu, X, TrendingUp } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
];

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TrendingUp size={22} />
            {!collapsed && <span className="sidebar-logo-text">FinTracker</span>}
          </div>
          <button className="sidebar-collapse-btn" onClick={toggle} aria-label="Toggle sidebar">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} className="sidebar-nav-icon" />
              {!collapsed && <span className="sidebar-nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
