import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../navbar/navbar.css';
import '../navbar/common.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function CustomerNavbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavbarProfile = async () => {
      try {
        const response = await api.get('/customer/profile');
        setCustomer(response.data || {});
      } catch (err) {
        console.warn('Could not load navbar profile:', err);
      }
    };
    fetchNavbarProfile();
  }, []);

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  const menuItems = [
    { name: "Home", path: "/customer/home", icon: "bi-house-door", exact: true },
    { name: "Products", path: "/customer/products", icon: "bi-box-seam" },
    { name: "Farmers", path: "/customer/farmers", icon: "bi-people" },
    { name: "Orders", path: "/customer/orders", icon: "bi-receipt" },
    { name: "Cart", path: "/customer/cart", icon: "bi-cart3", badge: cartCount }
  ];

  return (
    <>
      {/* 1. MOBILE TOP HEADER (Shows Brand Title & Profile Picture on phones) */}
      <div className="mobile-top-header d-flex d-lg-none align-items-center justify-content-between px-4 py-3 fixed-top shadow-sm">
        <NavLink to="/customer/home" end className="navbar-brand fw-extrabold text-decoration-none d-flex align-items-center gap-2">
          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-tree-fill fs-6"></i>
          </div>
          <span className="fs-6 text-dark fw-bold">Kisan<span className="text-success">Connect</span></span>
        </NavLink>

        <Link to="/customer/profile" className="text-decoration-none" title="Go to Profile">
          {customer?.profilePic || customer?.image ? (
            <img
              src={getProfileImageSrc(customer?.profilePic || customer?.image)}
              alt="Profile"
              className="rounded-circle object-fit-cover border border-2 border-success shadow-sm"
              style={{ width: '36px', height: '36px' }}
            />
          ) : (
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-sm" style={{ width: '36px', height: '36px' }}>
              {customer?.firstName ? customer.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </Link>
      </div>

      {/* 2. MAIN NAVBAR (Floating Desktop Navbar & Bottom Dock for Mobile) */}
      <nav className={`dribbble-floating-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-glass-container d-flex align-items-center justify-content-between px-3 px-lg-4 py-2">
          
          {/* Desktop Left: Brand / Logo */}
          <NavLink to="/customer/home" end className="navbar-brand fw-extrabold text-decoration-none d-none d-lg-flex align-items-center gap-2 brand-logo-link">
            <div className="logo-icon-wrapper bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
              <i className="bi bi-tree-fill fs-6"></i>
            </div>
            <span className="fs-5 text-dark fw-bold">Kisan<span className="text-success">Connect</span></span>
          </NavLink>

          {/* Center/Mobile: Menu Items */}
          <div className="menu d-flex align-items-center gap-1 p-1 rounded-pill glass-menu-pill w-100 justify-content-around justify-content-lg-center" id="menu">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => 
                  `text-decoration-none menu-item-link px-2 px-lg-3 py-2 rounded-pill position-relative transition-all ${isActive ? "active-menu-item text-success fw-bold" : "text-muted"}`
                }
              >
                <button className="menu-nav-btn bg-transparent border-0 d-flex flex-column flex-lg-row align-items-center gap-lg-2 cursor-pointer w-100">
                  <i className={`bi ${item.icon} fs-6`}></i>
                  <span className="menu-text fw-semibold small">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate-pulse" style={{ fontSize: '9px' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </NavLink>
            ))}
          </div>

          {/* Desktop Right: Profile Picture */}
          <div className="features d-none d-lg-flex align-items-center gap-3">
            <Link to="/customer/profile" className="profile-avatar-wrapper position-relative text-decoration-none" title="Go to Profile">
              <div className="avatar-ring p-1 rounded-circle transition-all">
                <img
                  src={getProfileImageSrc(customer?.profilePic || customer?.image)}
                  alt="Profile"
                  className="rounded-circle object-fit-cover shadow-sm profile-img-hover"
                  style={{ width: '42px', height: '42px' }}
                />
              </div>
            </Link>
          </div>

        </div>
      </nav>
    </>
  );
}