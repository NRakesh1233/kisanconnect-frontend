import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../navbar/navbar";
import { loadDashboard, loadReviews } from "../../service";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdReviews } from "react-icons/md";
import { FaUserCircle, FaStar, FaArrowUp, FaLeaf, FaBoxOpen, FaShoppingBag, FaWallet } from "react-icons/fa";
import moment from "moment";
import "./dashboard.css";

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080";

  const [stats, setStats] = useState({
    products: [],
    orders: [],
    revenue: 14500,
    rating: 4.9
  });

  const [farmer, setFarmer] = useState({
    name: "Rakesh",
    profilePic: "",
    quote: "Cultivating quality produce directly from nature to households."
  });

  const [reviews, setReviews] = useState([]);

  // GSAP animation refs
  const containerRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("role") !== "FARMER") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashData, farmData] = await loadDashboard();
        if (dashData) setStats(dashData);
        if (farmData) setFarmer(farmData);
      } catch (err) {
        console.warn("Using default fallback data");
      }
    }
    async function fetchRev() {
      const revs = await loadReviews().catch(() => []);
      setReviews(revs || []);
    }

    fetchData();
    fetchRev();

    // GSAP ScrollTrigger & Entrance animations
    const ctx = gsap.context(() => {
      gsap.from(".dash-hero-card", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".stat-box", {
        scrollTrigger: {
          trigger: ".stats-grid-new",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      gsap.from(".content-card-animate", {
        scrollTrigger: {
          trigger: ".dashboard-sections-grid",
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="dashboard-wrapper">
      <Navbar menu={["Dashboard", "Inventory", "Orders", "Profile"]} role="FARMER" />

      <div className="dashboard-main-container">
        
        {/* ================= HERO BANNER ================= */}
        <section className="dash-hero-card">
          <div className="dash-hero-content">
            <span className="badge-pill-green mb-3 d-inline-flex align-items-center gap-1">
              <FaLeaf /> Verified Agricultural Partner
            </span>
            <h1 className="display-5 fw-bold text-white mb-2">Welcome Back, {farmer.name}!</h1>
            <p className="text-white-50 lead mb-4">{farmer.quote}</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="products/add" className="btn btn-light text-success fw-bold rounded-pill px-4 py-2 shadow-sm">
                <i className="bi bi-plus-circle me-1"></i> Upload Harvest
              </Link>
              <Link to="orders" className="btn btn-outline-light fw-bold rounded-pill px-4 py-2">
                Manage Orders
              </Link>
            </div>
          </div>
         <div className="dash-hero-img-box">
  <img
    src={farmer?.profilePic || "https://ui-avatars.com/api/?name=Farmer&background=e8f5e9&color=2e7d32&size=400"}
    alt="Farmer Profile"
    className="rounded-circle shadow-lg object-fit-cover border border-3 border-white"
    style={{ width: "130px", height: "130px" }}
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "https://ui-avatars.com/api/?name=Farmer&background=e8f5e9&color=2e7d32&size=400";
    }}
  />
</div>
        </section>

        {/* ================= METRICS STATISTICS GRID ================= */}
     
<section className="stats-grid-new">
  <div className="stat-box">
    <div className="stat-icon-wrapper bg-success-subtle text-success"><FaBoxOpen /></div>
    <div>
      <p className="text-muted small mb-1 fw-medium">Active Products</p>
      <h3 className="fw-bold mb-0">{Number.isFinite(Number(stats.products?.length)) ? Number(stats.products.length) : 0}</h3>
      <small className="text-success fw-bold"><FaArrowUp /> +12% this month</small>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon-wrapper bg-warning-subtle text-warning"><FaShoppingBag /></div>
    <div>
      <p className="text-muted small mb-1 fw-medium">Total Orders</p>
      <h3 className="fw-bold mb-0">{Number.isFinite(Number(stats.orders?.length)) ? Number(stats.orders.length) : 0}</h3>
      <small className="text-success fw-bold"><FaArrowUp /> +8% today</small>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon-wrapper bg-primary-subtle text-primary"><FaWallet /></div>
    <div>
      <p className="text-muted small mb-1 fw-medium">Total Revenue</p>
      <h3 className="fw-bold mb-0">₹{Number.isFinite(Number(stats.revenue)) ? Number(stats.revenue) : 0}</h3>
      <small className="text-success fw-bold"><FaArrowUp /> +21% payout</small>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon-wrapper bg-danger-subtle text-danger"><FaStar /></div>
    <div>
      <p className="text-muted small mb-1 fw-medium">Customer Rating</p>
      <h3 className="fw-bold mb-0">
        {Number.isFinite(Number(stats.rating)) && stats.rating !== null && stats.rating !== undefined && stats.rating !== ""
          ? Number(stats.rating.toFixed(1))
          : 0} <span className="fs-6 text-muted">/5.0</span>
      </h3>
      <small className="text-success fw-bold">Top Tier Producer</small>
    </div>
  </div>
</section>


        {/* ================= MIDDLE BALANCED SECTIONS ================= */}
        <section className="dashboard-sections-grid">
          
          {/* Left Column: Quick Actions & Operations Status */}
          <div className="d-flex flex-column gap-4">
            
            {/* Quick Navigation Cards */}
            <div className="content-card-animate custom-dash-card">
              <h4 className="fw-bold mb-3 text-dark">Quick Portal Access</h4>
              <div className="quick-action-grid">
                <Link to="products/add" className="quick-tile">
                  <span className="material-symbols-outlined text-success">upload_file</span>
                  <span>Add Product</span>
                </Link>
                <Link to="orders" className="quick-tile">
                  <span className="material-symbols-outlined text-primary">orders</span>
                  <span>View Orders</span>
                </Link>
                <Link to="products" className="quick-tile">
                  <span className="material-symbols-outlined text-warning">inventory</span>
                  <span>Inventory</span>
                </Link>
                <Link to="profile" className="quick-tile">
                  <span className="material-symbols-outlined text-danger">manage_accounts</span>
                  <span>My Profile</span>
                </Link>
              </div>
            </div>

            {/* Farm Health & Operations */}
            <div className="content-card-animate custom-dash-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark mb-0">🌾 Farm & Storage Operations</h4>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold">Active Hub</span>
              </div>
              <p className="text-muted small mb-4">
                Regional cold-storage and dispatch hubs report optimal humidity and standard handling conditions for your current batches.
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded-4 border-0">
                    <small className="text-muted d-block mb-1">Soil Health Index</small>
                    <h5 className="fw-bold text-success mb-0">94% Optimal</h5>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded-4 border-0">
                    <small className="text-muted d-block mb-1">Fulfillment Rate</small>
                    <h5 className="fw-bold text-success mb-0">98.5% Speed</h5>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Notifications & Harvest Tips */}
          <div className="d-flex flex-column gap-4">
            
            {/* Notifications */}
            <div className="content-card-animate custom-dash-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark mb-0">Notifications</h4>
                <span className="badge bg-success rounded-pill px-3">3 New</span>
              </div>
              <div className="notification-list">
                <div className="notification-item">
                  <span className="material-symbols-outlined text-success fs-3">shopping_cart</span>
                  <div>
                    <h6 className="fw-bold mb-1">New Harvest Order</h6>
                    <p className="text-muted small mb-0">Customer requested 5kg Organic Wheat.</p>
                    <small className="text-muted fs-8">10 mins ago</small>
                  </div>
                </div>
                <div className="notification-item">
                  <span className="material-symbols-outlined text-primary fs-3">payments</span>
                  <div>
                    <h6 className="fw-bold mb-1">Payout Settled</h6>
                    <p className="text-muted small mb-0">Weekly direct deposit successfully credited.</p>
                    <small className="text-muted fs-8">2 hours ago</small>
                  </div>
                </div>
                <div className="notification-item">
                  <span className="material-symbols-outlined text-warning fs-3">warning</span>
                  <div>
                    <h6 className="fw-bold mb-1">Stock Threshold Alert</h6>
                    <p className="text-muted small mb-0">Tomatoes inventory dropping below 10kg.</p>
                    <small className="text-muted fs-8">Yesterday</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Harvest Tips */}
            <div className="content-card-animate custom-dash-card bg-success text-white">
              <h4 className="fw-bold mb-3"><i className="bi bi-flower2 me-2"></i> Seasonal Harvest Guide</h4>
              <ul className="list-unstyled mb-0 small opacity-90 d-flex flex-col gap-2">
                <li className="py-1 border-bottom border-white border-opacity-25">🌱 Maintain moisture control during early morning watering cycles.</li>
                <li className="py-1 border-bottom border-white border-opacity-25">📦 Pack leafy greens with ventilated eco-wraps to retain crisp freshness.</li>
                <li className="py-1">☀️ Review localized weather forecast prior to scheduling bulk packaging.</li>
              </ul>
            </div>

          </div>

        </section>

        {/* ================= RECENT ORDERS TABLE ================= */}
        <section className="content-card-animate custom-dash-card mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">Recent Customer Orders</h4>
            <Link to="orders" className="btn btn-outline-success btn-sm rounded-pill px-3">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Timestamp</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.orders?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No recent orders found.</td>
                  </tr>
                ) : (
                  stats?.orders?.map((ord) => (
                    <tr key={ord.orderId}>
                      <td className="fw-bold text-success">#{ord.orderId}</td>
                      <td>{ord.customerName || 'Valued Buyer'}</td>
                      <td>
                        <ul className="list-unstyled mb-0 small text-muted">
                          {ord.orderItems?.map((it, i) => (
                            <li key={i}>• {it.productName} ({it.quantity}kg)</li>
                          ))}
                        </ul>
                      </td>
                      <td className="small text-muted">{ord.orderTime ? moment(ord.orderTime).format("DD MMM, HH:mm") : "Recent"}</td>
                      <td className="fw-bold">₹{ord.totalAmount}</td>
                      <td>
                        <span className={` px-3 py-2 rounded-pill ${
                          ord.orderStatus === 'ACCEPTED' ? 'bg-primary' :
                          ord.orderStatus=== 'PENDING' ? 'bg-warning text-dark' : 'bg-success'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}