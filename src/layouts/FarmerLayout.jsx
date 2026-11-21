import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { resolveProfileImageUrl } from '../utils/formatters';

export const FarmerLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  const profileImg = resolveProfileImageUrl(user?.profilePic || user?.image);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--kc-cream)' }}>
      {/* Sidebar (Fixed Desktop / Drawer Mobile) */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 d-flex flex-column min-vh-100"
        style={{
          marginLeft: '0',
          transition: 'margin var(--kc-transition-normal)',
        }}
      >
        <style>{`
          @media (min-width: 992px) {
            .kc-farmer-main-canvas {
              margin-left: 260px !important;
            }
          }
        `}</style>

        <div className="kc-farmer-main-canvas flex-grow-1 d-flex flex-column">
          {/* Farmer Top Header */}
          <header
            className="d-flex align-items-center justify-content-between px-3 px-lg-4 py-3 sticky-top"
            style={{
              backgroundColor: 'rgba(248, 246, 239, 0.95)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--kc-border-subtle)',
              zIndex: 1010,
            }}
          >
            {/* Mobile Hamburger & Title */}
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="kc-icon-btn d-lg-none"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar menu"
              >
                <i className="bi bi-list fs-5"></i>
              </button>

              <div>
                <span className="badge kc-badge-organic text-dark d-none d-sm-inline-flex mb-1">
                  <i className="bi bi-patch-check-fill me-1"></i> Active Harvest Hub
                </span>
                <h5 className="fw-bold text-dark mb-0 d-none d-sm-block">Farmer Management Portal</h5>
              </div>
            </div>

            {/* Topbar Actions */}
            <div className="d-flex align-items-center gap-3">
              <Link to="/dashboard/products/add" className="kc-btn kc-btn-primary kc-btn-sm d-flex align-items-center gap-1">
                <i className="bi bi-plus-circle"></i>
                <span className="d-none d-sm-inline">Upload Harvest</span>
              </Link>

              <Link to="/dashboard/profile" className="text-decoration-none">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt="Farmer"
                    className="rounded-circle object-fit-cover shadow-sm"
                    style={{ width: '38px', height: '38px', border: '2px solid var(--kc-fresh-green)' }}
                  />
                ) : (
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '38px', height: '38px', backgroundColor: 'var(--kc-forest-green)' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                )}
              </Link>
            </div>
          </header>

          {/* Page Canvas */}
          <main className="p-3 p-lg-4 flex-grow-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default FarmerLayout;
