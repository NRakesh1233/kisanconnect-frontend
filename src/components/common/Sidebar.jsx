import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { resolveProfileImageUrl } from '../../utils/formatters';
import './Sidebar.css';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileImg = resolveProfileImageUrl(user?.profilePic || user?.image);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: 'bi-grid-1x2', exact: true },
    { label: 'Harvest Inventory', path: '/dashboard/products', icon: 'bi-box-seam' },
    { label: 'Orders Hub', path: '/dashboard/orders', icon: 'bi-receipt' },
    { label: 'Upload Produce', path: '/dashboard/products/add', icon: 'bi-plus-circle' },
    { label: 'Earnings', path: '/dashboard/earnings', icon: 'bi-wallet2' },
    { label: 'Farm Profile', path: '/dashboard/profile', icon: 'bi-person-badge' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="kc-sidebar-mobile-backdrop d-lg-none"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`kc-sidebar-wrapper ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/dashboard" className="kc-sidebar-brand" onClick={() => setMobileOpen?.(false)}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: '36px', height: '36px', backgroundColor: 'var(--kc-fresh-green)' }}
            >
              <i className="bi bi-flower2"></i>
            </div>
            <div>
              <span className="d-block lh-1">KisanConnect</span>
              <small className="text-white-50 fw-normal" style={{ fontSize: '0.72rem' }}>
                Farmer Cockpit
              </small>
            </div>
          </Link>
          <button
            className="btn btn-sm text-white d-lg-none p-1"
            onClick={() => setMobileOpen(false)}
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="kc-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `kc-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen?.(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="kc-sidebar-footer">
          <div className="kc-sidebar-user-card mb-2">
            {profileImg ? (
              <img
                src={profileImg}
                alt="Farmer"
                className="rounded-circle object-fit-cover"
                style={{ width: '40px', height: '40px', border: '2px solid var(--kc-fresh-green)' }}
              />
            ) : (
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', backgroundColor: 'var(--kc-fresh-green)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
              </div>
            )}
            <div className="overflow-hidden me-auto">
              <span className="d-block text-white fw-bold small text-truncate">
                {user?.name || 'Verified Farmer'}
              </span>
              <small className="text-white-50 d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                Active Grower
              </small>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="kc-btn kc-btn-cream kc-btn-sm w-100 justify-content-center text-danger"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
