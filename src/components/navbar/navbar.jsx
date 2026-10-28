import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";
import "./common.css";

export function Navbar({ menu = [], role }) {
  const navigate = useNavigate();

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

  return (
    <div className="navbar d-flex">
      {/* Left: Brand / Logo */}
      <NavLink to="/" end className="navbar-brand fw-bold text-decoration-none">
        KisanConnect
      </NavLink>

      {/* Center: Menu Items */}
      <div className="menu">
        {menu.map((item, index) => {
          const path = getRoutePath(item);
          const stateData = getRoleState(item);
          const iconClass = getMenuIcon(item);

          if (item.toLowerCase().includes("about")) {
            return (
              <a key={index} href="#differances" className="text-decoration-none menu-item-link">
                <button className="menu-nav-btn">
                  <i className={`bi ${iconClass} mobile-icon`}></i>
                  <span className="menu-text">{item}</span>
                </button>
              </a>
            );
          }

          // Check if it's the exact root dashboard path so 'end' can be applied
          const isExactDashboard = path === "/dashboard";

          return (
            <NavLink
              key={index}
              to={path}
              end={isExactDashboard} // CRITICAL: Prevents dashboard from staying active on sub-pages
              state={stateData}
              className={({ isActive }) => 
                `text-decoration-none menu-item-link ${isActive ? "active-menu-item" : ""}`
              }
            >
              <button className="menu-nav-btn">
                <i className={`bi ${iconClass} mobile-icon`}></i>
                <span className="menu-text">{item}</span>
              </button>
            </NavLink>
          );
        })}
      </div>

      {/* Right: Profile Icon & Logout */}
      <div className="features">
        <NavLink to="/dashboard/profile" className="text-success text-decoration-none" title="Profile">
          <span className="bi bi-person-circle fw-bold fs-3" style={{ cursor: "pointer" }}></span>
        </NavLink>
        {localStorage.getItem("Authorization") && (
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}