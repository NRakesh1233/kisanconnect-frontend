import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./navbar.css";
import "./common.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function Navbar({ menu = [], role }) {
  const navigate = useNavigate();
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFarmerNavbarProfile = async () => {
      try {
        const response = await api.get('/farmer/details');
        setFarmerProfile(response.data || {});
      } catch (err) {
        console.warn('Could not load farmer navbar profile:', err);
      }
    };
    if (localStorage.getItem("Authorization") || localStorage.getItem("token")) {
      fetchFarmerNavbarProfile();
    }
  }, []);

  // Helper to check all potential backend image property keys
  const getProfileImageSrc = (profileObj) => {
    if (!profileObj) return '';
    const imgProp = profileObj.profilePic || profileObj.profilePicture || profileObj.image || profileObj.photo || profileObj.avatar;
    
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getRoutePath = (item) => {
    const formatted = item.toLowerCase();
    if (formatted.includes("home")) return "/";
    if (formatted.includes("inventory")) return "/dashboard/products";
    if (formatted.includes("dashboard")) return "/dashboard";
    if (formatted.includes("orders")) return "/dashboard/orders";
    if (formatted.includes("login")) return "/login";
    if (formatted.includes("register")) return "/register";
    if (formatted.includes("about")) return "/";
    if (formatted.includes("profile")) return "/dashboard/profile";
    return "/";
  };

  const getRoleState = (item) => {
    const lower = item.toLowerCase();
    if (lower.includes("farmer")) return { role: "FARMER" };
    if (lower.includes("customer")) return { role: "CUSTOMER" };
    return {};
  };

  const getMenuIcon = (item) => {
    const lower = item.toLowerCase();
    if (lower.includes("home")) return "bi-house-door";
    if (lower.includes("inventory") || lower.includes("products")) return "bi-box-seam";
    if (lower.includes("dashboard")) return "bi-speedometer2";
    if (lower.includes("orders")) return "bi-receipt";
    if (lower.includes("about")) return "bi-info-circle";
    if (lower.includes("login")) return "bi-box-arrow-in-right";
    if (lower.includes("register")) return "bi-person-plus";
    return "bi-circle";
  };

  const profileImgUrl = getProfileImageSrc(farmerProfile);

  return (
    <>
      {/* 1. MOBILE TOP HEADER (Shows Brand Title & Profile/Logout on mobile) */}
      <div className="mobile-top-header d-flex d-lg-none align-items-center justify-content-between px-4 py-3 fixed-top shadow-sm">
        <NavLink to="/" end className="navbar-brand fw-extrabold text-decoration-none d-flex align-items-center gap-2">
          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-tree-fill fs-6"></i>
          </div>
          <span className="fs-6 text-dark fw-bold">Kisan<span className="text-success">Connect</span></span>
        </NavLink>

        <div className="d-flex align-items-center gap-2">
          <Link to="/dashboard/profile" className="text-decoration-none" title="Go to Profile">
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt="Profile"
                className="rounded-circle object-fit-cover border border-2 border-success shadow-sm"
                style={{ width: '36px', height: '36px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="bg-success text-white rounded-circle align-items-center justify-content-center fw-bold small shadow-sm" 
              style={{ width: '36px', height: '36px', display: profileImgUrl ? 'none' : 'flex' }}
            >
              {farmerProfile?.firstName ? farmerProfile.firstName.charAt(0).toUpperCase() : 'F'}
            </div>
          </Link>
          {localStorage.getItem("Authorization") && (
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVBAR (Floating Desktop Navbar & Transparent Bottom Dock for Mobile) */}
      <nav className={`dribbble-floating-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-glass-container d-flex align-items-center justify-content-between px-4 py-2">
          
          {/* Desktop Left: Brand / Logo */}
          <NavLink to="/" end className="navbar-brand fw-extrabold text-decoration-none d-none d-lg-flex align-items-center gap-2 brand-logo-link">
            <div className="logo-icon-wrapper bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
              <i className="bi bi-tree-fill fs-6"></i>
            </div>
            <span className="fs-5 text-dark fw-bold">Kisan<span className="text-success">Connect</span></span>
          </NavLink>

          {/* Center / Mobile: Menu Items wrapped in the glass menu pill container */}
          <div className="menu d-flex align-items-center gap-1 p-1 rounded-pill glass-menu-pill w-100 justify-content-around justify-content-lg-center">
            {menu.map((item, index) => {
              const path = getRoutePath(item);
              const stateData = getRoleState(item);
              const iconClass = getMenuIcon(item);

              if (item.toLowerCase().includes("about")) {
                return (
                  <a key={index} href="#differances" className="text-decoration-none menu-item-link px-3 py-2 rounded-pill position-relative">
                    <button className="menu-nav-btn bg-transparent border-0 d-flex flex-column flex-lg-row align-items-center gap-lg-2 cursor-pointer w-100">
                      <i className={`bi ${iconClass} fs-6`}></i>
                      <span className="menu-text fw-semibold small">{item}</span>
                    </button>
                  </a>
                );
              }

              const isExactDashboard = path === "/dashboard";

              return (
                <NavLink
                  key={index}
                  to={path}
                  end={isExactDashboard}
                  state={stateData}
                  className={({ isActive }) => 
                    `text-decoration-none menu-item-link px-3 py-2 rounded-pill position-relative transition-all ${isActive ? "active-menu-item" : "text-muted"}`
                  }
                >
                  <button className="menu-nav-btn bg-transparent border-0 d-flex flex-column flex-lg-row align-items-center gap-lg-2 cursor-pointer w-100">
                    <i className={`bi ${iconClass} fs-6`}></i>
                    <span className="menu-text fw-semibold small">{item}</span>
                  </button>
                </NavLink>
              );
            })}
          </div>

          {/* Desktop Right: Profile Icon & Logout */}
          <div className="features d-none d-lg-flex align-items-center gap-3">
            <NavLink to="/dashboard/profile" className="profile-avatar-wrapper position-relative text-decoration-none" title="Profile">
              <div className="avatar-ring p-1 rounded-circle transition-all d-flex align-items-center">
                {profileImgUrl ? (
                  <img
                    src={profileImgUrl}
                    alt="Profile"
                    className="rounded-circle object-fit-cover shadow-sm profile-img-hover"
                    style={{ width: '42px', height: '42px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="bi bi-person-circle fw-bold fs-3 text-success align-items-center justify-content-center" 
                  style={{ cursor: "pointer", display: profileImgUrl ? 'none' : 'flex', width: '42px', height: '42px' }}
                ></span>
              </div>
            </NavLink>
            {localStorage.getItem("Authorization") && (
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill fw-bold">
                Logout
              </button>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}