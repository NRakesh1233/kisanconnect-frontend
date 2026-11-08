import "./profile.css";
import { FarmerEarnings } from "../FarmerErning/FarmerEarning";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadDashboard, loadReviews, loadUserProfile } from "../../service";
import api from "../../services/api";
import { Navbar } from "./navbar";

import moment from "moment";
import { 
  FaUserCircle, FaStar, FaLeaf, FaShoppingBasket, FaRupeeSign, 
  FaClipboardList, FaBell, FaCog, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTractor, FaSeedling, 
  FaAward, FaEye, FaArrowUp, FaClock, FaCamera, FaChevronRight 
} from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import AnalyticsSection from "../Analytics/analytics";

export default function FarmerProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    products: [],
    orders: [],
    revenue: 12450,
    rating: 4.9
  });

  const [farmer, setFarmer] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('farmer_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('farmer_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('farmer_dark_mode', 'false');
    }
  }, [darkMode]);

  async function fetchDashboard() {
    try {
      const [a] = await loadDashboard();
      if (a) setStats(a);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }

  const getValidRating = (ratingVal) => {
    const num = parseFloat(ratingVal);
    return !isNaN(num) ? num.toFixed(1) : "4.9";
  };

  async function fetchReviews() {
    try {
      const resReviews = await loadReviews();
      if (resReviews) setReviews(resReviews);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  }

  async function fetchUserProfile() {
    try {
      const profile = await loadUserProfile();
      if (profile) setFarmer(profile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }

  useEffect(() => {
    fetchUserProfile();
    fetchDashboard();
    fetchReviews();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setError('');
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await api.post('/farmer/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedProfile = await loadUserProfile();
      if (updatedProfile) {
        setFarmer(updatedProfile);
      } else {
        const previewUrl = URL.createObjectURL(file);
        setFarmer(prev => ({ ...prev, profilePic: previewUrl }));
      }

      setSuccessMsg(response.data || 'Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
    }
  };

  const statistics = [
    { title: "Products", value: stats.products?.length || 142, icon: <FaLeaf />, color: "linear-gradient(135deg, #10b981, #059669)" },
    { title: "Orders", value: stats.orders?.length || 124, icon: <FaShoppingBasket />, color: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
    { title: "Revenue", value: `₹${(stats.revenue || 12450).toLocaleString()}`, icon: <FaRupeeSign />, color: "linear-gradient(135deg, #f59e0b, #d97706)" },
    { title: "Rating", value: getValidRating(stats?.rating), icon: <FaStar />, color: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }
  ];

  return (
    <div className="farmer-profile-wrapper">
      <Navbar menu={["Dashboard", "Inventory", "Orders", "Profile"]} role="FARMER" />
      
      <div className="container-fluid farmer-page">
        <div className="row g-4">
          
          {/* ================= SIDEBAR (Desktop) ================= */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sidebar shadow-sm">
              <div className="sidebar-logo">
                <h1>KisanConnect</h1>
                <p>Agri-Intelligence Portal</p>
              </div>

              <div className="sidebar-profile">
                <div className="profile-image-container" onClick={() => fileInputRef.current.click()} title="Click to change profile picture">
                  <div className="profile-image">
                    <img
                      src={farmer.profilePic || "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=150"}
                      alt="Farmer"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=150"; }}
                    />
                  </div>
                  <span className="camera-badge">
                    <FaCamera />
                  </span>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />

                <div className="verified-badge">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <h2>{farmer.name || "Farmer Profile"}</h2>
                <div className="rating">
                  <span className="material-symbols-outlined filled">star</span>
                  <span className="rating-number">{getValidRating(stats?.rating)}</span>
                  <span className="review-count">({reviews?.length || 0})</span>
                </div>
              </div>

              <nav className="sidebar-nav">
                <Link to="/dashboard" className="active">
                  <span className="material-symbols-outlined filled">dashboard</span> Dashboard
                </Link>
                <Link to="/dashboard/products">
                  <span className="material-symbols-outlined">inventory_2</span> My Products
                </Link>
                <Link to="/dashboard/orders">
                  <span className="material-symbols-outlined">shopping_bag</span> Orders
                </Link>
                <a href="#analytics-section">
                  <span className="material-symbols-outlined">monitoring</span> Analytics
                </a>
                <a href="#reviews-section">
                  <span className="material-symbols-outlined">reviews</span> Reviews
                </a>
                <a href="#earnings-section">
                  <span className="material-symbols-outlined">payments</span> Earnings
                </a>
              </nav>

              <div className="sidebar-bottom">
                <a href="#settings">
                  <span className="material-symbols-outlined">settings</span> Settings
                </a>
                <a href="#logout" className="logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                  <span className="material-symbols-outlined">logout</span> Logout
                </a>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="col-lg-9 col-md-12 main-content">

            {/* ================= MOBILE PROFILE & HORIZONTAL NAV ================= */}
            <div className="d-lg-none glass-card mb-4 p-3 mobile-profile-box">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="profile-image-container flex-shrink-0" onClick={() => mobileFileInputRef.current.click()} style={{ width: '68px', height: '68px' }}>
                  <div className="profile-image w-100 h-100">
                    <img
                      src={farmer.profilePic || "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=150"}
                      alt="Farmer"
                      className="w-100 h-100 object-fit-cover rounded-circle"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=150"; }}
                    />
                  </div>
                  <span className="camera-badge-sm">
                    <FaCamera size={10} />
                  </span>
                </div>

                <input 
                  type="file" 
                  ref={mobileFileInputRef} 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-1">
                    <h4 className="mb-0 fw-bold text-dark fs-5">{farmer.name || "Farmer Profile"}</h4>
                    <span className="material-symbols-outlined text-success fs-6" title="Verified Producer">verified</span>
                  </div>
                  <div className="rating justify-content-start mt-1">
                    <span className="material-symbols-outlined filled text-success fs-6">star</span>
                    <span className="rating-number">{getValidRating(stats?.rating)}</span>
                    <span className="review-count">({reviews?.length || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Scrollable Menu for Mobile */}
              <div className="mobile-horizontal-nav">
                <Link to="/dashboard" className="mobile-nav-pill active">
                  <span className="material-symbols-outlined">dashboard</span> Dashboard
                </Link>
                <Link to="/dashboard/products" className="mobile-nav-pill">
                  <span className="material-symbols-outlined">inventory_2</span> Products
                </Link>
                <Link to="/dashboard/orders" className="mobile-nav-pill">
                  <span className="material-symbols-outlined">shopping_bag</span> Orders
                </Link>
                <a href="#analytics-section" className="mobile-nav-pill">
                  <span className="material-symbols-outlined">monitoring</span> Analytics
                </a>
                <a href="#reviews-section" className="mobile-nav-pill">
                  <span className="material-symbols-outlined">reviews</span> Reviews
                </a>
                <a href="#earnings-section" className="mobile-nav-pill">
                  <span className="material-symbols-outlined">payments</span> Earnings
                </a>
                <a href="#logout" className="mobile-nav-pill text-danger logout-pill" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                  <span className="material-symbols-outlined">logout</span> Logout
                </a>
              </div>
            </div>
            
            {successMsg && (
              <div className="alert alert-success shadow-sm mb-3 d-flex align-items-center" role="alert">
                <FaCheckCircle className="me-2 flex-shrink-0" /> <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger shadow-sm mb-3" role="alert">
                {error}
              </div>
            )}

            {/* Welcome Banner */}
          {/* Welcome Banner */}
            <div className="welcome-banner-card mb-4">
              <div className="welcome-banner-glow"></div>
              <div className="welcome-banner-content">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <span className="welcome-super-label">PRODUCER DASHBOARD</span>
                    <h1>Welcome back, {farmer.name?.split(" ")[0] || "Farmer"}</h1>
                    <p className="mb-0">
                      Your harvests are reaching more conscious buyers today. Track your real-time yield analytics, recent direct orders, and customer ratings below.
                    </p>
                  </div>
                  <div className="welcome-live-badge">
                    <span className="badge-pulse-dot"></span>
                    <span>Live Ecosystem Hub</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="row g-3 mb-4">
              {statistics.map((item, index) => (
                <div className="col-xl-3 col-md-6 col-6" key={index}>
                  <div className="stats-card h-100">
                    <div className="stats-icon" style={{ background: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <h2>{item.value}</h2>
                      <p>{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Farmer Personal Details (2 Columns on Mobile & Desktop) */}
            <div className="glass-card mb-4 p-3 p-md-4" id="farmer-details">
              <div className="section-title mb-3">
                <h3>
                  <FaUserCircle className="text-success" /> Producer Overview
                </h3>
                <span className="text-muted small">Verified Details</span>
              </div>
              <div className="row g-2 g-md-3 mt-1">
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaEnvelope /></div>
                    <div className="detail-text-wrap">
                      <small>Email Address</small>
                      <h6>{farmer.email || 'Not provided'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaPhone /></div>
                    <div className="detail-text-wrap">
                      <small>Mobile Number</small>
                      <h6>{farmer.mobileNumber || '+91 ••••• •••••'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaMapMarkerAlt /></div>
                    <div className="detail-text-wrap">
                      <small>Farm Region</small>
                      <h6>{farmer.location || 'Chityal, Kurnool'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaCalendarAlt /></div>
                    <div className="detail-text-wrap">
                      <small>Member Since</small>
                      <h6>{farmer.createdAt ? moment(farmer.createdAt).format("DD MMM YYYY") : 'Active Member'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaTractor /></div>
                    <div className="detail-text-wrap">
                      <small>Cultivation Area</small>
                      <h6>10 Acres</h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="detail-item">
                    <div className="detail-icon"><FaSeedling /></div>
                    <div className="detail-text-wrap">
                      <small>Farming Experience</small>
                      <h6>5 Years</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="glass-card mb-4 p-3 p-md-4" id="analytics-section">
              <AnalyticsSection />
            </div>

            {/* Performance Metric Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="performance-card h-100">
                  <div className="performance-icon green"><FaArrowUp /></div>
                  <h5>Sales Growth</h5>
                  <h2>+24%</h2>
                  <p>Compared to last month</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="performance-card h-100">
                  <div className="performance-icon orange"><FaEye /></div>
                  <h5>Profile Views</h5>
                  <h2>12.4K</h2>
                  <p>Total conscious buyers</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="performance-card h-100">
                  <div className="performance-icon blue"><FaAward /></div>
                  <h5>Satisfaction Index</h5>
                  <h2>98%</h2>
                  <p>5-star feedback ratio</p>
                </div>
              </div>
            </div>

            {/* Earnings & Product Performance */}
            <div className="glass-card mb-4 p-3 p-md-4" id="earnings-section">
              <div className="section-title mb-3">
                <h3><FaRupeeSign className="text-success" /> Earnings & Yield Analytics</h3>
              </div>
              <FarmerEarnings stats={stats} />
            </div>

            {/* Recent Orders Table */}
            <div className="glass-card mb-4 p-3 p-md-4" id="recent-orders">
              <div className="section-title mb-3 d-flex justify-content-between align-items-center">
                <h3><FaClipboardList className="text-success" /> Recent Orders</h3>
                <Link to="/dashboard/orders" className="text-success text-decoration-none small fw-bold d-flex align-items-center gap-1">
                  View All <FaChevronRight size={10} />
                </Link>
              </div>
              <div className="table-responsive mt-2">
                <table className="table align-middle table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.orders?.length > 0 ? (
                      stats.orders.slice(0, 5).map((order) => (
                        <tr key={order.orderId}>
                          <td className="fw-semibold">#{order.orderId}</td>
                          <td className="fw-medium">{order.customerName || 'Valued Buyer'}</td>
                          <td className="fw-bold text-success">₹{order.totalAmount}</td>
                          <td>
                            <span className={`status ${(order.orderStatus || 'pending').toLowerCase()}`}>
                              {order.orderStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="text-muted small">{moment(order.orderTime || new Date()).format("DD MMM, hh:mm A")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">No recent orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="glass-card mb-4 p-3 p-md-4" id="reviews-section">
              <div className="section-title mb-3">
                <h3><MdReviews className="text-success" /> Customer Reviews</h3>
              </div>
              <div className="row g-3 mt-1 review-cards-container">
                {reviews?.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div className="col-md-6 col-lg-4" key={review.id || idx}>
                      <div className="review-card h-100">
                        <div className="review-header">
                          <FaUserCircle className="review-avatar" />
                          <div>
                            <h6>{review.customer || 'Valued Buyer'}</h6>
                            <small>{review.date ? moment(review.date).format("DD MMM YYYY") : 'Recent'}</small>
                          </div>
                        </div>
                        <div className="stars">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                        <p>{review.comment || review.review || 'Great quality produce, farm fresh and delivered on time!'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center text-muted py-4">No customer reviews yet.</div>
                )}
              </div>
            </div>

            {/* Bottom Utility Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="glass-card h-100 p-4">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 fs-5">
                    <FaBell className="text-success" /> Recent Activity
                  </h4>
                  <ul className="notify-list">
                    <li><FaCheckCircle className="text-success" /> New Order Received from Suresh</li>
                    <li><FaClock className="text-warning" /> Low Stock Alert: Organic Tomatoes</li>
                    <li><FaStar className="text-primary" /> New 5-Star Customer Review Added</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="glass-card h-100 p-4">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 fs-5">
                    <FaCog className="text-success" /> Quick Preferences
                  </h4>
                  <div className="setting-item">
                    <span>Dark UI Mode</span>
                    <input 
                      type="checkbox" 
                      className="form-check-input shadow-none" 
                      role="switch" 
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  </div>
                  <div className="setting-item">
                    <span>Instant Push Alerts</span>
                    <input type="checkbox" className="form-check-input shadow-none" role="switch" defaultChecked />
                  </div>
                  <div className="setting-item">
                    <span>SMS Order Broadcast</span>
                    <input type="checkbox" className="form-check-input shadow-none" role="switch" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dashboard-footer text-center py-4">
              <h6 className="fw-bold text-secondary mb-1">© 2026 KisanConnect Ecosystem</h6>
              <p className="text-muted small mb-0">Empowering Sustainable Farmers Through Direct-to-Consumer Technology 🌱</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}