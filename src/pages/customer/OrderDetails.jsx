import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import gsap from 'gsap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OrderHistory.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const { totalItemsCount } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State tracked by OrderItemId (oid)
  const [activeReviewBox, setActiveReviewBox] = useState({});
  const [reviewForm, setReviewForm] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  
  // Store fetched existing reviews { [oid]: reviewObject }
  const [existingReviewsMap, setExistingReviewsMap] = useState({});

  const containerRef = useRef(null);
  const isJustPlaced = location.state?.orderSuccess || orderId === 'success';

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      let targetId = orderId;

      if (!targetId || targetId === 'success') {
        const orders = await customerService.getCustomerOrders();
        if (orders && orders.length > 0) {
          targetId = orders[0].orderId || orders[0].id;
        }
      }

      if (targetId && targetId !== 'success') {
        const data = await customerService.getOrderById(targetId);
        setOrder(data);

        // Fetch existing reviews for each order item asynchronously
        if (data?.orderItems && data.orderItems.length > 0) {
          const token = localStorage.getItem("Authorization");
          const reviewMap = {};

          for (const item of data.orderItems) {
            const oid = item.orderItemId || item.OrderItemId || item.id;
            try {
              const res = await axios.get(`${BASE_URL}/customer/reviews/orderItem/${oid}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.data) {
                reviewMap[oid] = res.data;
              }
            } catch (err) {
              console.log(`No review found for item ${oid}`);
            }
          }
          setExistingReviewsMap(reviewMap);
        }

      } else {
        setError('No valid order ID found.');
      }
    } catch (err) {
      console.warn('Failed to fetch order details:', err);
      setError('Could not retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (!loading && order && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [loading, order]);

  const getProductImageSrc = (imgProp) => {
    if (!imgProp) return 'https://via.placeholder.com/60?text=Produce';
    if (imgProp.startsWith('http://') || imgProp.startsWith('https://')) {
      return imgProp;
    }
    if (imgProp.includes('/uploads/')) {
      return `${BASE_URL}${imgProp}`;
    }
    return `${BASE_URL}/uploads/products/${imgProp}`;
  };

  const toggleReviewBox = (oid, existingReview) => {
    setActiveReviewBox(prev => ({ ...prev, [oid]: !prev[oid] }));
    
    if (!reviewForm[oid]) {
      setReviewForm(prev => ({
        ...prev,
        [oid]: {
          rating: existingReview?.rating || 5,
          comment: existingReview?.comment || existingReview?.review || ''
        }
      }));
    }
  };

  const handleReviewChange = (oid, field, value) => {
    setReviewForm(prev => ({
      ...prev,
      [oid]: {
        ...prev[oid],
        [field]: value
      }
    }));
  };

  const submitReview = async (oid, hasReviewed) => {
    const currentReview = reviewForm[oid];
    if (!currentReview || !currentReview.comment.trim()) {
      alert("Please write a short comment for your review.");
      return;
    }

    try {
      setSubmittingId(oid);
      const payload = {
        OrderItemId: Number(oid),
        rating: Number(currentReview.rating),
        review: currentReview.comment
      };

      const token = localStorage.getItem("Authorization");
      const endpoint = hasReviewed 
        ? `${BASE_URL}/customer/order/product/review/update` 
        : `${BASE_URL}/customer/order/product/review/add`;

      const res = hasReviewed
        ? await axios.put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

      alert(res.data || (hasReviewed ? "Review updated successfully!" : "Review submitted successfully!"));
      setActiveReviewBox(prev => ({ ...prev, [oid]: false }));
      fetchOrderDetails(); 
    } catch (err) {
      console.error("Failed to save review:", err);
      alert(err.response?.data?.message || "Failed to save review. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #eef4f1 100%)' }}>
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 my-auto" style={{ marginTop: "100px" }}>
          <div className="spinner-border text-success" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading order tracking info...</span>
          </div>
          <p className="mt-3 text-muted small fw-medium">Loading order details...</p>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const isDelivered = order?.orderStatus?.toUpperCase() === 'DELIVERED';
  const statusUpper = order?.orderStatus?.toUpperCase() || 'PENDING';

  const isPlacedActive = true;
  const isConfirmedActive = ['ACCEPTED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(statusUpper);
  const isShippedActive = ['SHIPPED', 'DELIVERED'].includes(statusUpper);
  const isDeliveredActive = statusUpper === 'DELIVERED';

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #eef4f1 100%)' }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-4 py-lg-5 flex-grow-1" ref={containerRef} style={{ marginTop: "80px" }}>
        {isJustPlaced && (
          <div className="glass-panel alert border-0 shadow-sm p-4 rounded-4 mb-4 text-center bg-white animate-fade-in" role="alert">
            <i className="bi bi-check-circle-fill display-5 text-success d-block mb-2"></i>
            <h4 className="fw-bold text-dark fs-5">Order Placed Successfully!</h4>
            <p className="text-muted mb-0 small">Your order has been sent directly to the farmer. Thank you for supporting local agriculture!</p>
          </div>
        )}

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
          <h2 className="fw-extrabold text-dark mb-0 fs-5 fs-md-4">
            <i className="bi bi-file-text text-success me-2"></i>Order Details <span className="text-muted fs-6">#{order?.orderId || order?.id || orderId}</span>
          </h2>
          <Link to="/customer/orders" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold fs-8 align-self-start align-self-sm-auto shadow-hover">
            <i className="bi bi-arrow-left me-1"></i> Back to Orders
          </Link>
        </div>

        {error && !order ? (
          <div className="glass-panel alert border-0 shadow-sm text-center p-5 rounded-4 bg-white" role="alert">
            <i className="bi bi-exclamation-circle text-danger fs-3 d-block mb-2"></i>
            <span className="text-dark fw-semibold">{error}</span>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Items & Step Tracker */}
            <div className="col-12 col-lg-8">
              
              {/* Order Tracker Card */}
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
                  <h5 className="fw-bold text-dark mb-0 fs-6">Order Status & Tracking</h5>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill fs-8 fw-bold">
                    {order?.orderStatus || 'PENDING'}
                  </span>
                </div>
                
                <div className="order-track-container px-2 py-2">
                  <div className="order-track-steps">
                    
                    {/* Step 1: Placed */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isPlacedActive ? 'completed' : ''}`}>
                        <i className="bi bi-check-lg"></i>
                      </div>
                      <div className="order-track-text">
                        <span className="fw-bold text-dark d-block fs-8">Order Placed</span>
                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>Received</small>
                      </div>
                    </div>

                    {/* Step 2: Confirmed */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isConfirmedActive ? 'completed' : ''}`}>
                        <i className="bi bi-box-seam"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block fs-8 ${isConfirmedActive ? 'text-dark' : 'text-muted'}`}>Confirmed</span>
                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>Accepted</small>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isShippedActive ? 'completed' : ''}`}>
                        <i className="bi bi-truck"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block fs-8 ${isShippedActive ? 'text-dark' : 'text-muted'}`}>Shipped</span>
                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>On the way</small>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isDeliveredActive ? 'completed' : ''}`}>
                        <i className="bi bi-house-door-fill"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block fs-8 ${isDeliveredActive ? 'text-dark' : 'text-muted'}`}>Delivered</span>
                        <small className="text-muted" style={{ fontSize: '0.65rem' }}>Completed</small>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Order Items List Card */}
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom border-light fs-6">Ordered Harvest Items</h5>

                <div className="d-flex flex-column gap-3">
                  {order?.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, idx) => {
                      const oid = item.orderItemId || item.OrderItemId || item.id;
                      const itemPrice = Number(item.price) || 0;
                      const itemQty = Number(item.quantity) || 1;
                      const itemTotal = itemPrice * itemQty;
                      const prodId = item.productId || item.id;
                      
                      const existingReview = existingReviewsMap[oid] || null;
                      const hasReviewed = !!existingReview;
                      const isReviewOpen = activeReviewBox[oid];
                      const currentItemReview = reviewForm[oid] || { 
                        rating: existingReview?.rating || 5, 
                        comment: existingReview?.comment || existingReview?.review || '' 
                      };

                      return (
                        <div key={idx} className="border-bottom border-light pb-3 last-no-border">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            
                            {/* Product Info */}
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={getProductImageSrc(item.productImage || item.image || item.imageUrl)}
                                alt={item.productName || 'Product'}
                                className="rounded-3 object-fit-cover border shadow-sm flex-shrink-0"
                                style={{ width: '65px', height: '65px' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/65?text=Produce';
                                }}
                              />
                              <div>
                                <h6 className="fw-bold text-dark mb-1 fs-7">{item.productName || `Product #${prodId}`}</h6>
                                <small className="text-muted d-block fs-8">Qty: {item.quantity} {item.unit || 'units'}</small>
                                <small className="text-success fw-semibold fs-8">₹{itemPrice} each</small>
                                
                                {hasReviewed && !isReviewOpen && (
                                  <div className="mt-1">
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fs-9 px-2 py-0.5 rounded-pill">
                                      <i className="bi bi-star-fill text-warning me-1"></i>
                                      Rated {existingReview.rating}/5 - "{existingReview.comment || existingReview.review}"
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price & Review Action */}
                            <div className="d-flex flex-row flex-sm-column justify-content-between align-items-center align-items-sm-end gap-2">
                              <span className="fw-extrabold text-success fs-6">₹{itemTotal.toFixed(2)}</span>
                              
                              {isDelivered && (
                                <button 
                                  className={`btn btn-sm rounded-pill px-3 py-1 fs-8 fw-semibold ${hasReviewed ? 'btn-outline-dark' : 'btn-outline-success'}`}
                                  onClick={() => toggleReviewBox(oid, existingReview)}
                                >
                                  <i className={`bi ${hasReviewed ? 'bi-pencil-square' : 'bi-star-fill'} me-1`}></i>
                                  {isReviewOpen ? 'Close' : (hasReviewed ? 'Update Review' : 'Write Review')}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Review Form Section */}
                          {isReviewOpen && (
                            <div className="mt-3 p-3 bg-white rounded-4 border border-success border-opacity-25 shadow-sm animate-fade-in">
                              <h6 className="fw-bold text-success fs-8 mb-2">
                                {hasReviewed ? 'Update Your Review for' : 'Rate & Review'} {item.productName}
                              </h6>
                              
                              <div className="mb-2">
                                <label className="form-label fs-8 text-muted mb-1">Rating</label>
                                <select 
                                  className="form-select form-select-sm rounded-pill px-3 shadow-none border"
                                  value={currentItemReview.rating}
                                  onChange={(e) => handleReviewChange(oid, 'rating', e.target.value)}
                                >
                                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                                  <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                                  <option value="3">⭐⭐⭐ (3 - Average)</option>
                                  <option value="2">⭐⭐ (2 - Poor)</option>
                                  <option value="1">⭐ (1 - Terrible)</option>
                                </select>
                              </div>

                              <div className="mb-3">
                                <label className="form-label fs-8 text-muted mb-1">Your Comment</label>
                                <textarea 
                                  className="form-control form-control-sm rounded-3 shadow-none border"
                                  rows="2"
                                  placeholder="Share your experience with this harvest item..."
                                  value={currentItemReview.comment}
                                  onChange={(e) => handleReviewChange(oid, 'comment', e.target.value)}
                                ></textarea>
                              </div>

                              <div className="text-end">
                                <button 
                                  className="btn btn-success btn-sm rounded-pill px-4 py-1 fw-bold fs-8 shadow-hover"
                                  disabled={submittingId === oid}
                                  onClick={() => submitReview(oid, hasReviewed)}
                                >
                                  {submittingId === oid ? 'Submitting...' : (hasReviewed ? 'Update Review' : 'Post Review')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted fs-8">Item details are loading or unavailable.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Delivery Address & Summary */}
            <div className="col-12 col-lg-4">
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom border-light fs-6">Payment & Summary</h5>
                
                <div className="d-flex justify-content-between mb-2 fs-8 text-muted">
                  <span>Payment Method:</span>
                  <span className="fw-bold text-dark">{order?.paymentMethod || 'COD'}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 fs-8 text-muted pb-2 border-bottom border-light">
                  <span>Total Amount:</span>
                  <span className="text-success fw-extrabold fs-6">₹{order?.totalAmount || order?.grandTotal || '0.00'}</span>
                </div>

                <h6 className="fw-bold text-dark fs-8 text-uppercase tracking-wider mb-1">Delivery Address</h6>
                <p className="text-muted fs-8 mb-0 lh-base">
                  {order?.shippingAddress || order?.address || 'Saved delivery address details.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}