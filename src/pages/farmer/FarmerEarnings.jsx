import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../../services/farmerService';
import { formatCurrency, formatDate, resolveProductImageUrl, resolveProfileImageUrl } from '../../utils/formatters';

export const FarmerEarnings = () => {
  const [products, setProducts] = useState([]);
  const [overallRevenue, setOverallRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [productEarnings, setProductEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const reviewsRef = useRef(null);

  // 1. Load Farmer Dashboard for Products & Overall Revenue
  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashData] = await farmerService.loadDashboard();
        if (isMounted && dashData) {
          const prods = Array.isArray(dashData.products) ? dashData.products : [];
          setProducts(prods);
          setOverallRevenue(Number(dashData.revenue) || 0);
        }
      } catch (err) {
        console.error('Failed to load farmer products for earnings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentProduct = products[currentPage] || null;

  // 2. Fetch specific product earnings from real backend endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchEarnings = async () => {
      const pid = currentProduct?.productId || currentProduct?.id;
      if (!pid) {
        setProductEarnings(null);
        return;
      }

      try {
        setLoadingEarnings(true);
        const earnings = await farmerService.loadFarmerEarnings(pid);
        if (isMounted) {
          setProductEarnings(earnings);
        }
      } catch (err) {
        console.warn(`Could not load earnings for product #${pid}:`, err);
        if (isMounted) setProductEarnings(null);
      } finally {
        if (isMounted) setLoadingEarnings(false);
      }
    };

    fetchEarnings();
    if (reviewsRef.current) {
      reviewsRef.current.scrollTop = 0;
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage, currentProduct]);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted small fw-semibold">Loading product earnings analysis...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container-fluid p-0">
        <div className="kc-card p-5 text-center shadow-sm my-4">
          <i className="bi bi-wallet2 text-muted display-4 d-block mb-3 opacity-50"></i>
          <h3 className="fw-bold text-dark">No Products Uploaded Yet</h3>
          <p className="text-muted small mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
            Upload your first harvest batch to start tracking per-crop sales, inventory turnover, and earnings.
          </p>
          <Link to="/dashboard/products/add" className="kc-btn kc-btn-primary kc-btn-sm">
            <i className="bi bi-plus-circle me-1"></i> Upload First Harvest
          </Link>
        </div>
      </div>
    );
  }

  const pid = currentProduct?.productId || currentProduct?.id;
  const price = Number(currentProduct?.price) || 0;
  const stock = Number(currentProduct?.stock) || 0;
  const totalStock = Number(currentProduct?.totalStock) || stock;
  const soldQuantity = Math.max(0, totalStock - stock);
  const soldPercent = totalStock > 0 ? Math.round((soldQuantity / totalStock) * 100) : 0;
  const estimatedRevenue = price * soldQuantity;
  const productImage = resolveProductImageUrl(currentProduct?.productImage || currentProduct?.image);

  const reviewsList = Array.isArray(productEarnings?.reviews) ? productEarnings.reviews : [];

  return (
    <div className="container-fluid p-0">
      {/* ========================================================
          1. HEADER & OVERVIEW
          ======================================================== */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-wallet2"></i> Financial Performance
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Product Earnings Breakdown</h2>
          <p className="text-muted small mb-0">
            Track individual crop sales, stock depletion, and real customer ratings.
          </p>
        </div>

        {/* Global Revenue Pill */}
        <div
          className="p-3 rounded-4 d-flex align-items-center gap-3 border shadow-sm"
          style={{ backgroundColor: 'var(--kc-white)', borderColor: 'var(--kc-border-subtle)' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-success"
            style={{ width: '42px', height: '42px', backgroundColor: 'var(--kc-fresh-green-subtle)' }}
          >
            <i className="bi bi-cash-stack fs-5"></i>
          </div>
          <div>
            <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>
              TOTAL RECORDED REVENUE
            </span>
            <strong className="text-success fs-5">{formatCurrency(overallRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. PRODUCT SELECTOR TOOLBAR
          ======================================================== */}
      <div
        className="kc-card p-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 shadow-sm"
        style={{ backgroundColor: 'var(--kc-white)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Viewing Crop:</span>
          <strong className="text-dark">
            {currentPage + 1} of {products.length}
          </strong>
          <span className="badge bg-light text-success fw-bold ms-2">
            {currentProduct?.productName}
          </span>
        </div>

        {/* Pagination Stepper */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="kc-btn kc-btn-outline kc-btn-sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          >
            <i className="bi bi-chevron-left me-1"></i> Previous Crop
          </button>
          <button
            type="button"
            className="kc-btn kc-btn-outline kc-btn-sm"
            disabled={currentPage >= products.length - 1}
            onClick={() => setCurrentPage((prev) => Math.min(products.length - 1, prev + 1))}
          >
            Next Crop <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>

      {/* ========================================================
          3. MAIN EARNINGS ANALYSIS GRID
          ======================================================== */}
      <div className="row g-4 mb-5">
        {/* Left Column: Product Identity & Stock Depletion */}
        <div className="col-lg-4">
          <div className="kc-card p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
              <div
                className="rounded-4 overflow-hidden position-relative mb-3 shadow-sm"
                style={{ height: '220px', backgroundColor: 'var(--kc-beige)' }}
              >
                <img
                  src={productImage}
                  alt={currentProduct?.productName}
                  className="w-100 h-100 object-fit-cover"
                />
                <span className="badge kc-badge-organic text-dark position-absolute top-0 start-0 m-3 shadow-sm">
                  ID: #{pid}
                </span>
                {currentProduct?.organic && (
                  <span className="badge bg-success position-absolute top-0 end-0 m-3 shadow-sm">
                    Organic
                  </span>
                )}
              </div>

              <span className="badge bg-light text-success small mb-1">{currentProduct?.category}</span>
              <h3 className="fw-extrabold text-dark fs-5 mb-2">{currentProduct?.productName}</h3>

              {/* Harvest Timeline */}
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--kc-cream)' }}>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Harvest Date:</span>
                  <strong className="text-dark">
                    {currentProduct?.harvestDate ? formatDate(currentProduct.harvestDate) : '—'}
                  </strong>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Best Before:</span>
                  <strong className="text-dark">
                    {currentProduct?.expiryDate ? formatDate(currentProduct.expiryDate) : '—'}
                  </strong>
                </div>
              </div>

              {/* Stock Depletion Progress */}
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted fw-semibold">Harvest Stock Depletion</span>
                  <strong className="text-success">{soldPercent}% Sold</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${soldPercent}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  <span>{soldQuantity} {currentProduct?.unit || 'kg'} Dispatched</span>
                  <span>{stock} {currentProduct?.unit || 'kg'} Left</span>
                </div>
              </div>
            </div>

            <Link
              to={`/dashboard/products/update/${pid}`}
              className="kc-btn kc-btn-outline kc-btn-sm w-100 text-center mt-3"
            >
              <i className="bi bi-pencil-square me-1"></i> Edit Crop Details
            </Link>
          </div>
        </div>

        {/* Middle Column: Performance Metrics */}
        <div className="col-lg-5">
          <div className="kc-card p-4 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="fw-bold text-dark mb-0">Performance Overview</h4>
                <p className="text-muted small mb-0">Sales and inventory financial indicators</p>
              </div>
              <i className="bi bi-graph-up text-success fs-4"></i>
            </div>

            {/* Metrics 2x3 Grid */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Total Harvest Added
                  </span>
                  <strong className="text-dark fs-6">{totalStock} {currentProduct?.unit || 'kg'}</strong>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Remaining Inventory
                  </span>
                  <strong className="text-dark fs-6">{stock} {currentProduct?.unit || 'kg'}</strong>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Quantity Sold
                  </span>
                  <strong className="text-success fs-6">{soldQuantity} {currentProduct?.unit || 'kg'}</strong>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Listing Price
                  </span>
                  <strong className="text-dark fs-6">
                    {formatCurrency(price)}/{currentProduct?.unit || 'kg'}
                  </strong>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Total Orders Containing Crop
                  </span>
                  <strong className="text-dark fs-6">
                    {loadingEarnings ? '...' : (productEarnings?.ordersCount || 0)}
                  </strong>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                    Average Rating
                  </span>
                  <strong className="text-warning fs-6">
                    <i className="bi bi-star-fill me-1"></i>
                    {loadingEarnings
                      ? '...'
                      : productEarnings?.rating
                      ? productEarnings.rating.toFixed(1)
                      : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Sales Revenue Box */}
            <div
              className="p-4 rounded-4 text-white mb-3"
              style={{ backgroundColor: 'var(--kc-forest-green)' }}
            >
              <span className="text-white-50 small d-block" style={{ fontSize: '0.78rem' }}>
                ESTIMATED PRODUCT SALES REVENUE
              </span>
              <h2 className="display-6 fw-extrabold text-white mb-1">
                {formatCurrency(estimatedRevenue)}
              </h2>
              <small className="text-white-50">
                Calculated as: {price} ₹ &times; {soldQuantity} {currentProduct?.unit || 'kg'} sold
              </small>
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small">
              <i className="bi bi-info-circle text-success"></i>
              <span>Live payout reconciliations are settled weekly through direct account transfer.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Feedback on this Harvest */}
        <div className="col-lg-3">
          <div className="kc-card p-4 shadow-sm h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Harvest Reviews</h5>
              <span className="badge kc-badge-organic text-dark">{reviewsList.length}</span>
            </div>

            <div
              ref={reviewsRef}
              className="flex-grow-1 overflow-auto pe-1"
              style={{ maxHeight: '420px' }}
            >
              {loadingEarnings ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                </div>
              ) : reviewsList.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-chat-heart text-muted display-6 d-block mb-2"></i>
                  <p className="text-muted small mb-0">No reviews recorded yet for this harvest.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviewsList.map((rev, idx) => {
                    const reviewerImg = resolveProfileImageUrl(
                      rev.customerDetails?.profilePic || rev.profilePic
                    );

                    return (
                      <div
                        key={rev.id || idx}
                        className="p-3 rounded-3 border"
                        style={{ backgroundColor: 'var(--kc-cream)' }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {reviewerImg ? (
                            <img
                              src={reviewerImg}
                              alt="Reviewer"
                              className="rounded-circle object-fit-cover"
                              style={{ width: '28px', height: '28px' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle text-white small d-flex align-items-center justify-content-center"
                              style={{ width: '28px', height: '28px', backgroundColor: 'var(--kc-fresh-green)', fontSize: '0.75rem' }}
                            >
                              {(rev.customerDetails?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden me-auto">
                            <strong className="small text-dark d-block text-truncate">
                              {rev.customerDetails?.name || rev.name || 'Verified Customer'}
                            </strong>
                          </div>
                          <div className="kc-stars small text-warning">
                            <i className="bi bi-star-fill"></i> {rev.rating || 5}
                          </div>
                        </div>

                        <p className="text-secondary small mb-1" style={{ fontSize: '0.78rem' }}>
                          "{rev.comment || rev.review || 'Excellent harvest quality.'}"
                        </p>

                        {rev.createdAt && (
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {formatDate(rev.createdAt)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
