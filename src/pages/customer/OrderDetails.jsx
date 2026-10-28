import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OrderHistory.css'

const BASE_URL = "http://localhost:8080";

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
      <div className="min-vh-100 bg-light d-flex flex-column">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 my-auto">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-2 text-muted">Loading order tracking info...</p>
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
    <div className="min-vh-100 bg-light d-flex flex-column" style={{ marginTop: "100px" }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-4 py-lg-5 flex-grow-1">
        {isJustPlaced && (
          <div className="alert alert-success shadow-sm p-3 p-md-4 rounded-4 mb-4 text-center animate-fade-in" role="alert">
            <i className="bi bi-check-circle-fill display-5 text-success d-block mb-2"></i>
            <h4 className="fw-bold text-dark fs-5 fs-md-4">Order Placed Successfully!</h4>
            <p className="text-muted mb-0 small">Your order has been sent directly to the farmer. Thank you for supporting local agriculture!</p>
          </div>
        )}

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
          <h2 className="fw-bold text-dark mb-0 fs-5 fs-md-4">
            <i className="bi bi-file-text text-success me-2"></i>Order Details #{order?.orderId || order?.id || orderId}
          </h2>
          <Link to="/customer/orders" className="btn btn-outline-secondary btn-sm align-self-start align-self-sm-auto">
            <i className="bi bi-arrow-left me-1"></i> Back to Orders
          </Link>
        </div>

        {error && !order ? (
          <div className="alert alert-danger shadow-sm text-center p-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Items & Flipkart Style Step Tracker */}
            <div className="col-12 col-lg-8">
              
              {/* Flipkart Style Order Tracker */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom fs-6 fs-md-5">
                  Order Status & Tracking <span className="badge bg-success ms-2 fs-7">{order?.orderStatus || 'PENDING'}</span>
                </h5>
                
                <div className="order-track-container px-3 py-2">
                  <div className="order-track-steps">
                    
                    {/* Step 1: Placed */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isPlacedActive ? 'completed' : ''}`}>
                        <i className="bi bi-check-lg"></i>
                      </div>
                      <div className="order-track-text">
                        <span className="fw-bold text-dark d-block">Order Placed</span>
                        <small className="text-muted">We have received your order</small>
                      </div>
                    </div>

                    {/* Step 2: Confirmed */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isConfirmedActive ? 'completed' : ''}`}>
                        <i className="bi bi-box-seam"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block ${isConfirmedActive ? 'text-dark' : 'text-muted'}`}>Confirmed / Accepted</span>
                        <small className="text-muted">Farmer verified order</small>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isShippedActive ? 'completed' : ''}`}>
                        <i className="bi bi-truck"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block ${isShippedActive ? 'text-dark' : 'text-muted'}`}>Shipped</span>
                        <small className="text-muted">On the way to destination</small>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="order-track-step">
                      <div className={`order-track-icon ${isDeliveredActive ? 'completed' : ''}`}>
                        <i className="bi bi-house-door-fill"></i>
                      </div>
                      <div className="order-track-text">
                        <span className={`fw-bold d-block ${isDeliveredActive ? 'text-dark' : 'text-muted'}`}>Delivered</span>
                        <small className="text-muted">Successfully delivered</small>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom fs-6 fs-md-5">Ordered Harvest Items</h5>

                <div className="d-flex flex-column gap-3">
                  {order?.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, idx) => {
                      const oid = item.orderItemId || item.OrderItemId || item.id;
                      const itemPrice = Number(item.price) || 0;
                      const itemQty = Number(item.quantity) || 1;
                      const itemTotal = itemPrice * itemQty;
                      const prodId = item.productId || item.id;
                      
                      const existingReviewsMapVal = existingReviewsMap || {};
                      const existingReview = existingReviewsMapVal[oid] || null;
                      const hasReviewed = !!existingReview;

                      const isReviewOpen = activeReviewBox[oid];
                      const currentItemReview = reviewForm[oid] || { 
                        rating: existingReview?.rating || 5, 
                        comment: existingReview?.comment || existingReview?.review || '' 
                      };

                      return (
                        <div key={idx} className="border-bottom pb-3">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            {/* Left Side: Product Image & Details */}
                            <div className="d-flex align-items-start align-items-sm-center gap-3">
                              <img
                                src={getProductImageSrc(item.productImage || item.image || item.imageUrl)}
                                alt={item.productName || 'Product'}
                                className="rounded-3 object-fit-cover border flex-shrink-0"
                                style={{ width: '60px', height: '60px' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/60?text=Produce';
                                }}
                              />
                              <div>
                                <h6 className="fw-bold text-dark mb-1 fs-6">{item.productName || `Product #${prodId}`}</h6>
                                <small className="text-muted d-block">Qty: {item.quantity} {item.unit || 'units'}</small>
                                <small className="text-success fw-medium">₹{itemPrice} each</small>
                                
                                {hasReviewed && !isReviewOpen && (
                                  <div className="mt-1">
                                    <span className="badge bg-light text-primary border border-primary fs-9 px-2 py-1">
                                      <i className="bi bi-star-fill text-warning me-1"></i>
                                      Rated {existingReview.rating}/5 - "{existingReview.comment || existingReview.review}"
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Side: Total Price & Review Trigger */}
                            <div className="d-flex flex-row flex-sm-column justify-content-between align-items-center align-items-sm-end gap-2 mt-2 mt-sm-0">
                              <span className="fw-bold text-success fs-6">₹{itemTotal.toFixed(2)}</span>
                              
                              {isDelivered && (
                                <button 
                                  className={`btn btn-sm rounded-pill px-3 py-1 fs-8 ${hasReviewed ? 'btn-outline-primary' : 'btn-outline-success'}`}
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
                            <div className="mt-3 p-3 bg-light rounded-4 border animate-fade-in">
                              <h6 className="fw-bold text-success fs-7 mb-2">
                                {hasReviewed ? 'Update Your Review for' : 'Rate & Review'} {item.productName}
                              </h6>
                              
                              <div className="mb-2">
                                <label className="form-label fs-8 text-muted mb-1">Rating</label>
                                <select 
                                  className="form-select form-select-sm"
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

                              <div className="mb-2">
                                <label className="form-label fs-8 text-muted mb-1">Your Comment</label>
                                <textarea 
                                  className="form-control form-control-sm"
                                  rows="2"
                                  placeholder="Share your experience with this harvest item..."
                                  value={currentItemReview.comment}
                                  onChange={(e) => handleReviewChange(oid, 'comment', e.target.value)}
                                ></textarea>
                              </div>

                              <div className="text-end">
                                <button 
                                  className="btn btn-success btn-sm rounded-pill px-4 py-1"
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
                    <p className="text-muted fs-7">Item details are loading or unavailable.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Delivery Address & Summary */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom fs-6 fs-md-5">Payment & Delivery</h5>
                
                <p className="text-muted fs-7 mb-2">
                  <strong>Payment Method:</strong> {order?.paymentMethod || 'COD'}
                </p>
                <p className="text-muted fs-7 mb-3">
                  <strong>Total Amount:</strong> <span className="text-success fw-bold fs-6">₹{order?.totalAmount || order?.grandTotal || '0.00'}</span>
                </p>

                <h6 className="fw-bold text-dark fs-7 mt-3">Delivery Address:</h6>
                <p className="text-muted fs-8 mb-0">
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