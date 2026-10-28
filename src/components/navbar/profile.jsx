import "./profile.css";
import { FarmerEarnings } from "../FarmerErning/FarmerEarning";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadDashboard, loadReviews, loadUserProfile } from "../../service";
import { Navbar } from "./navbar";
import moment from "moment";
import { 
  FaUserCircle, FaStar, FaLeaf, FaShoppingBasket, FaRupeeSign, 
  FaClipboardList, FaBell, FaCog, FaEdit, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTractor, FaSeedling, 
  FaAward, FaEye, FaArrowUp, FaClock 
} from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import AnalyticsSection from "../Analytics/analytics";

export default function FarmerProfile() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080";

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    products: [],
    orders: [],
    revenue: 12450,
    rating: 4.9
  });

  const [farmer, setFarmer] = useState({});

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
  return !isNaN(num) ? num.toFixed(1) : "4.9"; // Fallback to 4.9 if invalid
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

  const statistics = [
    {
      title: "Products",
      value: stats.products?.length || 142,
      icon: <FaLeaf />,
      color: "#3b6934"
    },
    {
      title: "Orders",
      value: stats.orders?.length || 124,
      icon: <FaShoppingBasket />,
      color: "#1b8f53"
    },
    {
      title: "Revenue",
      value: `₹${(stats.revenue || 12450).toLocaleString()}`,
      icon: <FaRupeeSign />,
      color: "#d97706"
    },
   {
  title: "Rating",
  value: getValidRating(stats?.rating),
  icon: <FaStar />,
  color: "#2563eb"
}
  ];
  // Safe rating parser helper


  return (
    <div className="farmer-profile-wrapper">
      <Navbar menu={["Dashboard", "Inventory", "Orders", "Profile"]} role="FARMER" />
      
      <div className="container-fluid farmer-page">
        <div className="row g-4">
          
          {/* ================= SIDEBAR ================= */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sidebar shadow-sm">
              <div className="sidebar-logo">
                <h1>KisanConnect</h1>
                <p>Premium Farm Management</p>
              </div>

              <div className="sidebar-profile">
                <div className="profile-image-container">
                  <div className="profile-image">
                    <img
                      src={farmer.profilePic ? `${BASE_URL}/uploads/profiles/${farmer.profilePic}` : "https://via.placeholder.com/100?text=Farmer"}
                      alt="Farmer"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Farmer"; }}
                    />
                  </div>
                  <div className="verified-badge">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                </div>
                <h2>{farmer.name || "Farmer Profile"}</h2>
                <div className="rating">
                  <span className="material-symbols-outlined filled">star</span>
                  <span className="rating-number">{getValidRating(stats?.rating) }</span>
                  <span className="review-count">({reviews?.length || 0} Reviews)</span>
                </div>
              </div>

              <nav className="sidebar-nav">
                <Link to="/dashboard">
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
                <a href="#">
                  <span className="material-symbols-outlined">settings</span> Settings
                </a>
                <a href="#" className="logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                  <span className="material-symbols-outlined">logout</span> Logout
                </a>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="col-lg-9 col-md-12 main-content">
            
            {/* Welcome Banner */}
            <div className="welcome-card glass-card mb-4">
              <div>
                <h1>Welcome Back, {farmer.name || "Farmer"}! 🌱</h1>
                <p>
                  Manage your products, monitor sales, respond to customer reviews, and grow your 
                  farming business seamlessly with KisanConnect.
                </p>
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

            {/* Farmer Personal Details */}
            <div className="glass-card mb-4 p-4" id="farmer-details">
              <div className="section-title mb-3">
                <h3>
                  <FaUserCircle className="text-success" /> Farmer Profile Details
                </h3>
              </div>
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaEnvelope className="detail-icon" />
                    <div>
                      <small>Email</small>
                      <h6>{farmer.email || 'Not provided'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <div>
                      <small>Mobile</small>
                      <h6>{farmer.mobileNumber || 'Not provided'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <div>
                      <small>Location</small>
                      <h6>{farmer.location || 'Chityal, Kurnool'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div>
                      <small>Member Since</small>
                      <h6>{farmer.createdAt ? moment(farmer.createdAt).format("DD MMM YYYY") : 'Active Member'}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaTractor className="detail-icon" />
                    <div>
                      <small>Farm Size</small>
                      <h6>10 Acres</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <FaSeedling className="detail-icon" />
                    <div>
                      <small>Experience</small>
                      <h6>5 Years</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="glass-card mb-4 p-4" id="analytics-section">
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
                  <p>Total visitors</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="performance-card h-100">
                  <div className="performance-icon blue"><FaAward /></div>
                  <h5>Customer Satisfaction</h5>
                  <h2>98%</h2>
                  <p>Positive reviews</p>
                </div>
              </div>
            </div>

            {/* Earnings & Product Performance */}
            <div className="glass-card mb-4 p-4" id="earnings-section">
              <div className="section-title mb-3">
                <h3><FaRupeeSign className="text-success" /> Earnings & Product Performance</h3>
              </div>
              <FarmerEarnings stats={stats} />
            </div>

            {/* Recent Orders Table */}
            <div className="glass-card mb-4 p-4" id="recent-orders">
              <div className="section-title mb-3">
                <h3><FaClipboardList className="text-success" /> Recent Orders</h3>
              </div>
              <div className="table-responsive mt-3">
                <table className="table align-middle table-hover">
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
                          <td>#{order.orderId}</td>
                          <td className="fw-medium">{order.customerName || 'Customer'}</td>
                          <td className="fw-bold text-success">₹{order.totalAmount}</td>
                          <td>
                            <span className={`status ${(order.orderStatus || 'pending').toLowerCase()}`}>
                              {order.orderStatus || 'Pending'}
                            </span>
                          </td>
                          <td>{moment(order.orderTime || new Date()).format("DD MMM YYYY, hh:mm A")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-3">No recent orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="glass-card mb-4 p-4" id="reviews-section">
              <div className="section-title mb-3">
                <h3><MdReviews className="text-success" /> Customer Reviews</h3>
              </div>
              <div className="row g-3 mt-2 review-cards-container">
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
                        <p>{review.comment || review.review || 'Great quality produce, highly recommended!'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No customer reviews yet.</p>
                )}
              </div>
            </div>

            {/* Bottom Utility Cards (Notifications & Settings) */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="glass-card h-100 p-4">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaBell className="text-success" /> Notifications
                  </h4>
                  <ul className="notify-list">
                    <li><FaCheckCircle /> New Order Received from Suresh</li>
                    <li><FaClock /> Low Stock Alert for Organic Tomatoes</li>
                    <li><FaStar /> New 5-Star Customer Review Added</li>
                  </ul>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="glass-card h-100 p-4">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaCog className="text-success" /> Settings & Preferences
                  </h4>
                  <div className="setting-item">
                    <span>Dark Mode</span>
                    <input type="checkbox" className="form-check-input" />
                  </div>
                  <div className="setting-item">
                    <span>Email Notifications</span>
                    <input type="checkbox" className="form-check-input" defaultChecked />
                  </div>
                  <div className="setting-item">
                    <span>SMS Alerts</span>
                    <input type="checkbox" className="form-check-input" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dashboard-footer text-center py-4">
              <h6>© 2026 KisanConnect</h6>
              <p className="text-muted small">Empowering Farmers Through Technology 🌱</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}