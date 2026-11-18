import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../../services/farmerService';
import { useAuth } from '../../hooks/useAuth';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency, resolveProfileImageUrl } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import gsap from 'gsap';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: [],
    orders: [],
    revenue: 0,
    rating: 0,
  });
  const [farmerInfo, setFarmerInfo] = useState({
    name: user?.name || 'Farmer',
    profilePic: user?.profilePic || '',
    quote: 'Direct from nature to households with care.',
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);

  // Animated metric counters using useCountUp
  const activeProductsCount = Array.isArray(stats.products) ? stats.products.length : (Number(stats.products) || 0);
  const totalOrdersCount = Array.isArray(stats.orders) ? stats.orders.length : (Number(stats.orders) || 0);
  const totalRevenueAmount = Number(stats.revenue) || 0;
  const ratingValue = Number(stats.rating) || 0;

  const [countProducts] = useCountUp(activeProductsCount, 1.0);
  const [countOrders] = useCountUp(totalOrdersCount, 1.2);
  const [countRevenue] = useCountUp(totalRevenueAmount, 1.5);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashResult, ordersResult, reviewsResult] = await Promise.allSettled([
          farmerService.loadDashboard(),
          farmerService.getFarmerOrders(),
          farmerService.loadReviews(),
        ]);

        if (isMounted) {
          if (dashResult.status === 'fulfilled' && Array.isArray(dashResult.value)) {
            const [dashData, farmData] = dashResult.value;
            if (dashData) setStats(dashData);
            if (farmData) setFarmerInfo(farmData);
          }

          if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)) {
            // Keep recent 5 orders
            setRecentOrders(ordersResult.value.slice(0, 5));
          }

          if (reviewsResult.status === 'fulfilled' && Array.isArray(reviewsResult.value)) {
            setRecentReviews(reviewsResult.value.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching farmer dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || loading || !containerRef.current) return;

    const statItems = containerRef.current.querySelectorAll('.kc-dash-stat-item');
    const cardItems = containerRef.current.querySelectorAll('.kc-dash-card-animate');

    if (statItems.length === 0 && cardItems.length === 0) return;

    const ctx = gsap.context(() => {
      if (statItems.length > 0) {
        gsap.from(statItems, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }
      if (cardItems.length > 0) {
        gsap.from(cardItems, {
          opacity: 0,
          y: 25,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          delay: 0.2,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const profileImg = resolveProfileImageUrl(farmerInfo?.profilePic || user?.profilePic);

  return (
    <div ref={containerRef} className="container-fluid p-0">
      {/* ========================================================
          1. HERO COCKPIT BANNER
          ======================================================== */}
      <section
        className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, rgba(22, 61, 43, 0.95) 0%, rgba(30, 80, 56, 0.9) 100%), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(22, 61, 43, 0.15)',
        }}
      >
        <div className="row align-items-center g-4 position-relative z-1">
          <div className="col-lg-8">
            <span className="badge kc-badge-organic mb-3">
              <i className="bi bi-patch-check-fill me-1"></i> Verified Agricultural Partner
            </span>
            <h1 className="display-6 fw-extrabold text-white mb-2">
              Welcome Back, {farmerInfo?.name || user?.name || 'Farmer'}!
            </h1>
            <p className="lead fs-6 text-white-50 mb-4" style={{ maxWidth: '620px' }}>
              {farmerInfo?.quote || 'Cultivating quality produce directly from nature to Indian households.'}
            </p>
            <div className="d-flex flex-wrap gap-2 gap-sm-3">
              <Link to="/dashboard/products/add" className="kc-btn kc-btn-fresh kc-btn-sm d-flex align-items-center gap-2">
                <i className="bi bi-plus-circle"></i>
                <span>Upload Harvest</span>
              </Link>
              <Link to="/dashboard/orders" className="kc-btn kc-btn-white kc-btn-sm d-flex align-items-center gap-2">
                <i className="bi bi-receipt text-success"></i>
                <span>Fulfill Orders</span>
              </Link>
              <Link to="/dashboard/earnings" className="kc-btn kc-btn-outline kc-btn-sm d-flex align-items-center gap-2 text-white border-white">
                <i className="bi bi-wallet2"></i>
                <span>Earnings Overview</span>
              </Link>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block text-end">
            <div
              className="p-3 rounded-4 d-inline-flex align-items-center gap-3 text-start"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={farmerInfo?.name || 'Farmer'}
                  className="rounded-circle object-fit-cover shadow-sm"
                  style={{ width: '64px', height: '64px', border: '3px solid var(--kc-fresh-green)' }}
                />
              ) : (
                <div
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: 'var(--kc-fresh-green)', fontSize: '1.5rem' }}
                >
                  {(farmerInfo?.name || user?.name || 'F').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-white-50 small d-block" style={{ fontSize: '0.75rem' }}>Active Hub</span>
                <strong className="text-white d-block">{farmerInfo?.name || 'Partner Farmer'}</strong>
                <span className="badge bg-success bg-opacity-75 small">Online & Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. METRIC STATS GRID (Subtle CountUp Animations)
          ======================================================== */}
      <section className="row g-3 mb-4">
        {/* Active Products */}
        <div className="col-6 col-lg-3 kc-dash-stat-item">
          <div className="kc-card p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Active Produce</span>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-success"
                style={{ width: '40px', height: '40px', backgroundColor: 'var(--kc-fresh-green-subtle)' }}
              >
                <i className="bi bi-box-seam fs-5"></i>
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">
              {loading ? (
                <span className="placeholder col-4"></span>
              ) : (
                countProducts
              )}
            </h3>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-check-circle text-success me-1"></i>Listed in Marketplace
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-6 col-lg-3 kc-dash-stat-item">
          <div className="kc-card p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Orders</span>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                style={{ width: '40px', height: '40px', backgroundColor: 'rgba(13, 110, 253, 0.1)' }}
              >
                <i className="bi bi-receipt fs-5"></i>
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">
              {loading ? (
                <span className="placeholder col-4"></span>
              ) : (
                countOrders
              )}
            </h3>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-arrow-repeat text-primary me-1"></i>Customer Dispatches
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-6 col-lg-3 kc-dash-stat-item">
          <div className="kc-card p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Revenue</span>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-success"
                style={{ width: '40px', height: '40px', backgroundColor: 'rgba(25, 135, 84, 0.1)' }}
              >
                <i className="bi bi-currency-rupee fs-5"></i>
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">
              {loading ? (
                <span className="placeholder col-6"></span>
              ) : (
                formatCurrency(countRevenue)
              )}
            </h3>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-graph-up-arrow text-success me-1"></i>Direct Farm Earnings
            </span>
          </div>
        </div>

        {/* Grower Rating */}
        <div className="col-6 col-lg-3 kc-dash-stat-item">
          <div className="kc-card p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Customer Trust</span>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-warning"
                style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 193, 7, 0.15)' }}
              >
                <i className="bi bi-star-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">
              {loading ? (
                <span className="placeholder col-3"></span>
              ) : (
                <>
                  {ratingValue > 0 ? ratingValue.toFixed(1) : '4.9'}
                  <span className="fs-6 text-muted fw-normal"> / 5.0</span>
                </>
              )}
            </h3>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-patch-check text-warning me-1"></i>Verified Direct Buyer Rating
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. MIDDLE SECTION: RECENT ORDERS & QUICK ACTIONS
          ======================================================== */}
      <div className="row g-4 mb-4">
        {/* Left Column: Recent Orders Fulfillment */}
        <div className="col-lg-8 kc-dash-card-animate">
          <div className="kc-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="kc-section-badge mb-1">
                  <i className="bi bi-truck"></i> Live Pipeline
                </span>
                <h4 className="fw-extrabold text-dark mb-0">Recent Customer Orders</h4>
              </div>
              <Link to="/dashboard/orders" className="kc-btn kc-btn-outline kc-btn-sm">
                <span>View All Orders</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success spinner-border-sm" role="status"></div>
                <p className="text-muted small mt-2">Loading recent orders...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: 'var(--kc-cream)', fontSize: '0.8rem' }}>
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Harvest Items</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.85rem' }}>
                    {recentOrders.map((ord) => {
                      const st = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
                      const config = ORDER_STATUS_CONFIG[st] || {
                        badgeClass: 'kc-badge-organic',
                        label: st,
                        icon: 'bi-clock',
                      };

                      return (
                        <tr key={ord.orderId || ord.id}>
                          <td className="px-3 fw-bold text-dark">#{ord.orderId || ord.id}</td>
                          <td className="px-3">{ord.customerName || 'Customer'}</td>
                          <td className="px-3">
                            {Array.isArray(ord.orderItems) && ord.orderItems.length > 0 ? (
                              <span className="text-muted">
                                {ord.orderItems.map((it) => it.productName || it.name).join(', ')}
                              </span>
                            ) : (
                              <span className="text-muted">Fresh Produce</span>
                            )}
                          </td>
                          <td className="px-3 fw-bold text-success">
                            {formatCurrency(ord.totalAmount || ord.amount || 0)}
                          </td>
                          <td className="px-3">
                            <span className={`badge ${config.badgeClass} rounded-pill`}>
                              <i className={`bi ${config.icon} me-1`}></i>
                              {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted display-6 d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No orders yet</h6>
                <p className="text-muted small mb-3">When customers order your produce, they will show up here.</p>
                <Link to="/dashboard/products/add" className="kc-btn kc-btn-primary kc-btn-sm">
                  Upload More Harvests
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Portal Navigation Tiles */}
        <div className="col-lg-4 kc-dash-card-animate">
          <div className="kc-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <span className="kc-section-badge mb-1">
                <i className="bi bi-grid"></i> Quick Actions
              </span>
              <h4 className="fw-extrabold text-dark mb-3">Hub Shortcuts</h4>

              <div className="d-flex flex-column gap-2 mb-4">
                <Link
                  to="/dashboard/products/add"
                  className="p-3 rounded-4 d-flex align-items-center justify-content-between text-decoration-none border transition-all"
                  style={{ backgroundColor: 'var(--kc-cream)', borderColor: 'var(--kc-border-subtle)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-success"
                      style={{ width: '42px', height: '42px', backgroundColor: 'var(--kc-fresh-green-subtle)' }}
                    >
                      <i className="bi bi-plus-lg fs-5"></i>
                    </div>
                    <div>
                      <strong className="text-dark d-block">Add New Product</strong>
                      <small className="text-muted">List morning harvest</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>

                <Link
                  to="/dashboard/products"
                  className="p-3 rounded-4 d-flex align-items-center justify-content-between text-decoration-none border transition-all"
                  style={{ backgroundColor: 'var(--kc-cream)', borderColor: 'var(--kc-border-subtle)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-warning"
                      style={{ width: '42px', height: '42px', backgroundColor: 'rgba(255, 193, 7, 0.15)' }}
                    >
                      <i className="bi bi-box-seam fs-5"></i>
                    </div>
                    <div>
                      <strong className="text-dark d-block">Inventory Manager</strong>
                      <small className="text-muted">Stock & price controls</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>

                <Link
                  to="/dashboard/orders"
                  className="p-3 rounded-4 d-flex align-items-center justify-content-between text-decoration-none border transition-all"
                  style={{ backgroundColor: 'var(--kc-cream)', borderColor: 'var(--kc-border-subtle)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                      style={{ width: '42px', height: '42px', backgroundColor: 'rgba(13, 110, 253, 0.1)' }}
                    >
                      <i className="bi bi-receipt fs-5"></i>
                    </div>
                    <div>
                      <strong className="text-dark d-block">Orders Fulfillment</strong>
                      <small className="text-muted">Accept, pack & ship</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>

                <Link
                  to="/dashboard/earnings"
                  className="p-3 rounded-4 d-flex align-items-center justify-content-between text-decoration-none border transition-all"
                  style={{ backgroundColor: 'var(--kc-cream)', borderColor: 'var(--kc-border-subtle)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-success"
                      style={{ width: '42px', height: '42px', backgroundColor: 'rgba(25, 135, 84, 0.1)' }}
                    >
                      <i className="bi bi-wallet2 fs-5"></i>
                    </div>
                    <div>
                      <strong className="text-dark d-block">Earnings Breakdown</strong>
                      <small className="text-muted">Per-product performance</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>
              </div>
            </div>

            {/* Farm Storage Standard Tip */}
            <div
              className="p-3 rounded-4 border-0 text-white"
              style={{ backgroundColor: 'var(--kc-forest-green)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-shield-check text-warning"></i>
                <small className="fw-bold">Cold-Storage Best Practice</small>
              </div>
              <p className="small text-white-50 mb-0" style={{ fontSize: '0.78rem' }}>
                Keep humidity at 85–90% for fresh greens to retain natural crispness prior to delivery hub pickup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. RECENT CUSTOMER REVIEWS (Real Backend Data)
          ======================================================== */}
      {recentReviews.length > 0 && (
        <section className="kc-dash-card-animate">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="kc-section-badge mb-1">
                <i className="bi bi-chat-quote"></i> Customer Voice
              </span>
              <h4 className="fw-extrabold text-dark mb-0">Recent Feedback on Your Produce</h4>
            </div>
            <Link to="/dashboard/profile" className="kc-btn kc-btn-outline kc-btn-sm">
              <span>View Profile</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {recentReviews.map((rev, idx) => (
              <div key={rev.id || idx} className="col-md-6 col-lg-3">
                <div className="kc-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="small text-dark text-truncate">
                      {rev.customerName || rev.customerDetails?.name || 'Verified Buyer'}
                    </strong>
                    <div className="kc-stars small text-warning">
                      <i className="bi bi-star-fill"></i> {rev.rating || 5}.0
                    </div>
                  </div>
                  <p className="text-muted small mb-2 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                    "{rev.comment || rev.review || 'Great quality fresh harvest.'}"
                  </p>
                  <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>
                    {rev.productName ? `Harvest: ${rev.productName}` : 'Marketplace Order'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FarmerDashboard;
