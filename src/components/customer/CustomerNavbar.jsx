import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../navbar/navbar.css';
import '../navbar/common.css';

const BASE_URL = "http://localhost:8080";

export default function CustomerNavbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

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
    if (!imgProp) return 'https://via.placeholder.com/40?text=User';
    if (imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
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
    <div className="navbar d-flex">
      {/* Left: Brand / Logo */}
      <NavLink to="/customer/home" end className="navbar-brand fw-bold text-decoration-none">
        <i className="bi bi-tree-fill me-1"></i> KisanConnect
      </NavLink>

      {/* Center: Menu Items (Desktop inline, Mobile bottom dock) */}
      <div className="menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `text-decoration-none menu-item-link ${isActive ? "active-menu-item" : ""}`
            }
          >
            <button className="menu-nav-btn position-relative">
              <i className={`bi ${item.icon} mobile-icon`}></i>
              <span className="menu-text">{item.name}</span>
              {item.badge > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          </NavLink>
        ))}
      </div>

      {/* Right: Direct Profile Link with Picture */}
      <div className="features">
        <Link to="/customer/profile" className="d-flex align-items-center text-decoration-none" title="Go to Profile">
          <img
            src={getProfileImageSrc(customer?.profilePic || customer?.image)}
            alt="Profile"
            className="rounded-circle object-fit-cover border shadow-sm"
            style={{ width: '38px', height: '38px' }}
          />
        </Link>
      </div>
    </div>
  );
}