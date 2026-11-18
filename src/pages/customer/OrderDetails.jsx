import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import customerService from '../../services/customerService';
import { formatCurrency, formatDate, resolveProductImageUrl } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

export const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track review form state per order item: { [oid]: { rating, comment, open } }
  const [activeReviewBoxes, setActiveReviewBoxes] = useState({});
  const [reviewForms, setReviewForms] = useState({});
  const [existingReviewsMap, setExistingReviewsMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

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

        // Fetch existing review for each item if backend provides order items
        if (data?.orderItems && data.orderItems.length > 0) {
          const reviewMap = {};
          for (const item of data.orderItems) {
            const oid = item.orderItemId || item.OrderItemId || item.id;
            try {
              const res = await customerService.getOrderItemReview(oid);
              if (res) reviewMap[oid] = res;
            } catch {
              // No existing review found for item
            }
          }
          setExistingReviewsMap(reviewMap);
        }
      } else {
        setError('No valid order reference found.');
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

  const toggleReviewForm = (oid, existingReview) => {
    setActiveReviewBoxes((prev) => ({ ...prev, [oid]: !prev[oid] }));
    if (!reviewForms[oid]) {
      setReviewForms((prev) => ({
        ...prev,
        [oid]: {
          rating: existingReview?.rating || 5,
          comment: existingReview?.comment || existingReview?.review || '',
        },
      }));
    }
  };

  const handleReviewFieldChange = (oid, field, value) => {
    setReviewForms((prev) => ({
      ...prev,
      [oid]: {
        ...prev[oid],
        [field]: value,
      },
    }));
  };

  const submitReview = async (oid, hasReviewed) => {
    const current = reviewForms[oid];
    if (!current || !current.comment.trim()) {
      alert('Please write a brief feedback comment for your review.');
      return;
    }

    try {
      setSubmittingId(oid);
      const payload = {
        OrderItemId: Number(oid),
        rating: Number(current.rating),
        review: current.comment,
      };

      if (hasReviewed) {
        await customerService.updateProductReview(payload);
        alert('Review updated successfully!');
      } else {
        await customerService.addProductReview(payload);
        alert('Thank you! Your harvest review has been submitted.');
      }

      setActiveReviewBoxes((prev) => ({ ...prev, [oid]: false }));
      await fetchOrderDetails();
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err.response?.data?.message || 'Could not save review. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
          <span className="visually-hidden">Loading tracking info...</span>
        </div>
        <p className="mt-3 text-muted small">Loading order fulfillment details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="kc-card p-5 d-inline-block shadow-sm" style={{ maxWidth: '480px' }}>
          <i className="bi bi-receipt text-muted display-4 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark mb-2">Order Not Found</h4>
          <p className="text-muted small mb-4">{error || 'Could not locate the requested order.'}</p>
          <Link to="/customer/orders" className="kc-btn kc-btn-primary kc-btn-sm">
            View Order History
          </Link>
        </div>
      </div>
    );
  }

  const actualId = order.orderId || order.id;
  const statusUpper = (order.orderStatus || order.status || 'PENDING').toUpperCase();
  const config = ORDER_STATUS_CONFIG[statusUpper] || {
    label: statusUpper,
    badgeClass: 'kc-badge-forest',
    icon: 'bi-circle',
  };

  // Status Stepper Flags
  const isAccepted = ['ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(statusUpper);
  const isPacked = ['PACKED', 'SHIPPED', 'DELIVERED'].includes(statusUpper);
  const isShipped = ['SHIPPED', 'DELIVERED'].includes(statusUpper);
  const isDelivered = statusUpper === 'DELIVERED';

  return (
    <div className="kc-container py-4">
      {/* Just Placed Success Banner */}
      {isJustPlaced && (
        <div
          className="alert border-0 shadow-sm p-4 rounded-4 mb-4 text-center"
          style={{ backgroundColor: 'var(--kc-fresh-green-light)', color: 'var(--kc-forest-green)' }}
        >
          <i className="bi bi-check-circle-fill display-5 text-success d-block mb-2"></i>
          <h4 className="fw-bold mb-1">Order Placed Successfully!</h4>
          <p className="small mb-0 opacity-85">
            Your fresh harvest order has been received and routed directly to the grower.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <span className="text-muted small d-block">Order Reference</span>
          <h3 className="fw-extrabold text-dark mb-0">#{actualId}</h3>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className={`badge ${config.badgeClass} fs-6 px-3 py-2`}>
            <i className={`bi ${config.icon} me-1`}></i>
            {config.label}
          </span>
          <Link to="/customer/orders" className="kc-btn kc-btn-cream kc-btn-sm">
            <i className="bi bi-arrow-left"></i> All Orders
          </Link>
        </div>
      </div>

      {/* Fulfillment Stepper */}
      <div className="kc-card p-4 mb-4 shadow-sm">
        <h6 className="fw-bold text-dark mb-4">Tracking Timeline</h6>
        <div className="d-flex justify-content-between position-relative px-2">
          {/* Step 1: Placed */}
          <div className="text-center flex-fill">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-2 shadow-sm"
              style={{ width: '38px', height: '38px', backgroundColor: 'var(--kc-fresh-green)' }}
            >
              <i className="bi bi-check-lg"></i>
            </div>
            <strong className="d-block small text-dark">Placed</strong>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              {formatDate(order.orderTime || order.createdAt)}
            </span>
          </div>

          {/* Step 2: Accepted */}
          <div className="text-center flex-fill">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                isAccepted ? 'bg-success text-white' : 'bg-light text-muted border'
              }`}
              style={{ width: '38px', height: '38px' }}
            >
              <i className={`bi ${isAccepted ? 'bi-check-lg' : 'bi-check'}`}></i>
            </div>
            <strong className={`d-block small ${isAccepted ? 'text-dark' : 'text-muted'}`}>
              Accepted
            </strong>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>By Grower</span>
          </div>

          {/* Step 3: Packed */}
          <div className="text-center flex-fill">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                isPacked ? 'bg-success text-white' : 'bg-light text-muted border'
              }`}
              style={{ width: '38px', height: '38px' }}
            >
              <i className={`bi ${isPacked ? 'bi-check-lg' : 'bi-box-seam'}`}></i>
            </div>
            <strong className={`d-block small ${isPacked ? 'text-dark' : 'text-muted'}`}>
              Packed
            </strong>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Eco-Ventilated</span>
          </div>

          {/* Step 4: Shipped */}
          <div className="text-center flex-fill">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                isShipped ? 'bg-success text-white' : 'bg-light text-muted border'
              }`}
              style={{ width: '38px', height: '38px' }}
            >
              <i className={`bi ${isShipped ? 'bi-check-lg' : 'bi-truck'}`}></i>
            </div>
            <strong className={`d-block small ${isShipped ? 'text-dark' : 'text-muted'}`}>
              Shipped
            </strong>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>In Transit</span>
          </div>

          {/* Step 5: Delivered */}
          <div className="text-center flex-fill">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                isDelivered ? 'bg-success text-white' : 'bg-light text-muted border'
              }`}
              style={{ width: '38px', height: '38px' }}
            >
              <i className={`bi ${isDelivered ? 'bi-patch-check-fill' : 'bi-house'}`}></i>
            </div>
            <strong className={`d-block small ${isDelivered ? 'text-dark' : 'text-muted'}`}>
              Delivered
            </strong>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Soil to Table</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Order Items & Review Action */}
        <div className="col-lg-8">
          <div className="kc-card p-4 shadow-sm mb-4">
            <h5 className="fw-bold text-dark mb-4">Purchased Harvest Items</h5>

            <div className="d-flex flex-column gap-3">
              {order.orderItems?.map((item) => {
                const oid = item.orderItemId || item.OrderItemId || item.id;
                const existingReview = existingReviewsMap[oid];
                const formOpen = activeReviewBoxes[oid];
                const formVal = reviewForms[oid] || { rating: 5, comment: '' };
                const itemImg = resolveProductImageUrl(item.productImage || item.image);

                return (
                  <div key={oid} className="p-3 rounded-4 border bg-light">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={itemImg}
                          alt={item.productName}
                          className="rounded-3 object-fit-cover shadow-xs"
                          style={{ width: '64px', height: '64px' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300';
                          }}
                        />
                        <div>
                          <h6 className="fw-bold text-dark mb-1">{item.productName}</h6>
                          <span className="small text-muted">
                            Quantity: {item.quantity} kg • {formatCurrency(item.price || item.productPrice || 0)}/kg
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                        <span className="fw-bold text-dark fs-6">
                          {formatCurrency(Number(item.price || item.productPrice || 0) * Number(item.quantity || 1))}
                        </span>

                        <button
                          type="button"
                          className="kc-btn kc-btn-cream kc-btn-sm"
                          onClick={() => toggleReviewForm(oid, existingReview)}
                        >
                          <i className="bi bi-star me-1 text-warning"></i>
                          <span>{existingReview ? 'Edit Review' : 'Rate Produce'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Review Form Drawer */}
                    {formOpen && (
                      <div className="mt-3 pt-3 border-top bg-white p-3 rounded-3">
                        <h6 className="fw-bold text-dark small mb-2">
                          {existingReview ? 'Update Your Rating' : 'Leave Feedback for this Item'}
                        </h6>

                        {/* Rating Radio Buttons */}
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="small text-muted me-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="btn btn-sm btn-link p-0 text-decoration-none"
                              onClick={() => handleReviewFieldChange(oid, 'rating', star)}
                            >
                              <i
                                className={`bi ${star <= formVal.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'} fs-5`}
                              ></i>
                            </button>
                          ))}
                        </div>

                        {/* Comment Input */}
                        <div className="mb-3">
                          <textarea
                            className="kc-textarea"
                            rows={2}
                            placeholder="How fresh was the produce? Share your thoughts..."
                            value={formVal.comment}
                            onChange={(e) => handleReviewFieldChange(oid, 'comment', e.target.value)}
                          />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-muted"
                            onClick={() => toggleReviewForm(oid, existingReview)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="kc-btn kc-btn-primary kc-btn-sm"
                            disabled={submittingId === oid}
                            onClick={() => submitReview(oid, Boolean(existingReview))}
                          >
                            {submittingId === oid ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Details & Payment Receipt */}
        <div className="col-lg-4">
          <div className="kc-card p-4 shadow-sm mb-4">
            <h5 className="fw-bold text-dark mb-3">Delivery Address</h5>
            {order.address || order.deliveryAddress ? (
              <div className="small text-muted">
                <strong className="d-block text-dark mb-1">
                  {order.address?.fullName || order.customerName || 'Customer'}
                </strong>
                <p className="mb-1">
                  {order.address?.houseNo || ''} {order.address?.street || ''}, {order.address?.village || ''}
                </p>
                <p className="mb-2">
                  {order.address?.district || ''}, {order.address?.state || ''} - {order.address?.pincode || ''}
                </p>
                <span className="d-block">
                  <i className="bi bi-telephone text-success me-1"></i>
                  {order.address?.mobileNumber || order.mobileNumber || 'Provided during checkout'}
                </span>
              </div>
            ) : (
              <p className="small text-muted mb-0">Delivery address confirmed with order fulfillment.</p>
            )}
          </div>

          <div className="kc-card p-4 shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Payment Receipt</h5>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Method:</span>
              <strong className="text-dark">{order.paymentMethod || 'COD'}</strong>
            </div>
            {order.transactionId && (
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Transaction Ref:</span>
                <span className="font-monospace text-truncate" style={{ maxWidth: '140px' }}>
                  {order.transactionId}
                </span>
              </div>
            )}
            <hr className="my-2" />
            <div className="d-flex justify-content-between align-items-baseline">
              <span className="fw-bold text-dark">Total Settled:</span>
              <span className="fs-5 fw-extrabold text-success">
                {formatCurrency(order.totalAmount || order.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
