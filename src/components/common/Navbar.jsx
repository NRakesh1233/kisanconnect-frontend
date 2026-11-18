import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { ROLES } from '../../utils/constants';
import { resolveProfileImageUrl } from '../../utils/formatters';
import './Navbar.css';

export const Navbar = () => {
  const { user, role, isAuthenticated, isFarmer, isCustomer, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const profileImg = resolveProfileImageUrl(user?.profilePic || user?.image);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Navigation Items per Role
  const renderNavLinks = () => {
    if (isFarmer) {
      return (
        <>
          <NavLink to="/dashboard" end className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </NavLink>
          <NavLink to="/dashboard/products" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-box-seam"></i> Inventory
          </NavLink>
          <NavLink to="/dashboard/orders" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-receipt"></i> Orders
          </NavLink>
          <NavLink to="/dashboard/products/add" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-plus-circle"></i> Add Harvest
          </NavLink>
        </>
      );
    }

    if (isCustomer) {
      return (
        <>
          <NavLink to="/customer/home" end className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-house-door"></i> Home
          </NavLink>
          <NavLink to="/customer/products" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid"></i> Marketplace
          </NavLink>
          <NavLink to="/customer/farmers" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-people"></i> Farmers
          </NavLink>
          <NavLink to="/customer/orders" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-receipt-cutoff"></i> My Orders
          </NavLink>
        </>
      );
    }

    // Guest / Public Links
    return (
      <>
        <NavLink to="/" end className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
          Marketplace
        </NavLink>
        <NavLink to="/products/farmer" className={({ isActive }) => `kc-nav-link ${isActive ? 'active' : ''}`}>
          Our Farmers
        </NavLink>
      </>
    );
  };

  return (
    <header className={`kc-navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <div className="kc-container kc-navbar-container">
        
        {/* Brand Logo */}
        <Link to={isFarmer ? '/dashboard' : isCustomer ? '/customer/home' : '/'} className="kc-navbar-brand">
          <div className="kc-brand-icon">
            <i className="bi bi-flower2"></i>
          </div>
          <span>
            Kisan<span className="kc-brand-accent">Connect</span>
          </span>
          {isFarmer && <span className="kc-badge kc-badge-forest ms-2 d-none d-md-inline-flex">Farmer Partner</span>}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="kc-nav-links d-none d-lg-flex">
          {renderNavLinks()}
        </nav>

        {/* Actions Right */}
        <div className="kc-nav-actions">
          {/* Customer Specific Icons (Cart & Wishlist) */}
          {(!isAuthenticated || isCustomer) && (
            <>
              {isCustomer && (
                <Link to="/customer/cart" className="kc-icon-btn d-none d-sm-flex" title="Wishlist">
                  <i className="bi bi-heart"></i>
                  {wishlistCount > 0 && <span className="kc-badge-counter">{wishlistCount}</span>}
                </Link>
              )}

              <Link to="/customer/cart" className="kc-icon-btn" title="Shopping Cart">
                <i className="bi bi-bag"></i>
                {totalItemsCount > 0 && <span className="kc-badge-counter">{totalItemsCount}</span>}
              </Link>
            </>
          )}

          {/* User Profile Dropdown or Auth Buttons */}
          {isAuthenticated ? (
            <div className="dropdown position-relative">
              <button
                className="kc-avatar-btn dropdown-toggle border-0"
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profileImg ? (
                  <img src={profileImg} alt="Avatar" className="kc-avatar-img" />
                ) : (
                  <div className="kc-avatar-initials">{userInitial}</div>
                )}
                <span className="d-none d-md-inline fw-semibold small text-dark">
                  {user?.name?.split(' ')[0] || (isFarmer ? 'Farmer' : 'Customer')}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="kc-dropdown-menu dropdown-menu-end show position-absolute end-0 shadow-lg"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <p className="fw-bold mb-0 text-dark small">{user?.name || 'User Account'}</p>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {role} Account
                    </span>
                  </div>

                  {isCustomer && (
                    <>
                      <Link to="/customer/profile" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-person text-success"></i> My Profile
                      </Link>
                      <Link to="/customer/orders" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-bag-check text-success"></i> My Orders
                      </Link>
                      <Link to="/customer/addresses" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-geo-alt text-success"></i> Saved Addresses
                      </Link>
                    </>
                  )}

                  {isFarmer && (
                    <>
                      <Link to="/dashboard/profile" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-person text-success"></i> Farm Profile
                      </Link>
                      <Link to="/dashboard/orders" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-receipt text-success"></i> Farmer Orders
                      </Link>
                      <Link to="/dashboard/products" className="kc-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-box-seam text-success"></i> Inventory Hub
                      </Link>
                    </>
                  )}

                  <hr className="my-1 border-light" />
                  <button onClick={handleLogout} className="kc-dropdown-item danger">
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="kc-btn kc-btn-cream kc-btn-sm d-none d-sm-inline-flex">
                Sign In
              </Link>
              <Link to="/register" className="kc-btn kc-btn-primary kc-btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="kc-icon-btn d-lg-none"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-lg-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="position-absolute end-0 top-0 h-100 p-4 kc-mobile-drawer shadow-lg"
            style={{ width: '80%', maxWidth: '320px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <span className="fw-bold fs-5 text-dark">Menu</span>
              <button className="btn-close" onClick={() => setMobileMenuOpen(false)}></button>
            </div>

            <div className="d-flex flex-column mb-4" onClick={() => setMobileMenuOpen(false)}>
              {renderNavLinks()}
            </div>

            {!isAuthenticated ? (
              <div className="d-flex flex-column gap-2 mt-auto pt-4 border-top">
                <Link to="/login" className="kc-btn kc-btn-outline w-100" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="kc-btn kc-btn-primary w-100" onClick={() => setMobileMenuOpen(false)}>
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-top">
                <button onClick={handleLogout} className="kc-btn kc-btn-cream w-100 text-danger justify-content-center">
                  <i className="bi bi-box-arrow-right me-2"></i> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
