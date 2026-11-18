import React, { useState, useEffect, useMemo, useRef } from 'react';
import farmerService from '../../services/farmerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import gsap from 'gsap';

const STATUS_TABS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Packed', value: 'PACKED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackNotice, setFeedbackNotice] = useState({ type: '', message: '' });

  const containerRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getFarmerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
      setFeedbackNotice({
        type: 'danger',
        message: 'Could not load orders. Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialOrders = async () => {
      try {
        const data = await farmerService.getFarmerOrders();
        if (isMounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load farmer orders:', err);
        if (isMounted) {
          setFeedbackNotice({
            type: 'danger',
            message: 'Could not load orders. Please refresh the page.',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((ord) => {
      const st = (ord.orderStatus || ord.status || '').toUpperCase();
      return st === activeTab;
    });
  }, [orders, activeTab]);

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length };
    orders.forEach((ord) => {
      const st = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Handle Order Status Transition
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setActionLoadingId(`${orderId}-${newStatus}`);
      setFeedbackNotice({ type: '', message: '' });

      const response = await farmerService.updateOrderStatus(orderId, newStatus);

      setFeedbackNotice({
        type: 'success',
        message: typeof response === 'string' ? response : `Order #${orderId} marked as ${newStatus}!`,
      });

      // Refresh order list
      await fetchOrders();
      setTimeout(() => setFeedbackNotice({ type: '', message: '' }), 4000);
    } catch (err) {
      console.error(`Failed to update order #${orderId} to ${newStatus}:`, err);
      setFeedbackNotice({
        type: 'danger',
        message: err.response?.data?.message || `Failed to update order to ${newStatus}.`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // GSAP Entrance
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || loading || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.kc-order-card-item');
    if (cards.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, activeTab, filteredOrders]);

  return (
    <div ref={containerRef} className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-truck"></i> Fulfillment Pipeline
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Farmer Orders Management</h2>
          <p className="text-muted small mb-0">
            Accept incoming customer requests, pack farm-fresh produce, and track dispatches.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="kc-btn kc-btn-outline kc-btn-sm align-self-start align-self-sm-auto"
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Pipeline
        </button>
      </div>

      {/* Notice Banner */}
      {feedbackNotice.message && (
        <div
          className={`alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2 alert-${feedbackNotice.type}`}
        >
          <i
            className={`bi ${
              feedbackNotice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
            } fs-5`}
          ></i>
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = statusCounts[tab.value] || 0;

          return (
            <button
              key={tab.value}
              type="button"
              className={`kc-btn kc-btn-sm d-flex align-items-center gap-1.5 text-nowrap ${
                isActive ? 'kc-btn-primary' : 'kc-btn-cream text-dark'
              }`}
              onClick={() => setActiveTab(tab.value)}
              style={{ padding: '0.45rem 1.15rem' }}
            >
              <span>{tab.label}</span>
              <span
                className={`badge rounded-pill small ${
                  isActive ? 'bg-white text-success' : 'bg-light text-muted'
                }`}
                style={{ fontSize: '0.72rem' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 text-muted small fw-semibold">Accessing fulfillment orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-inbox text-muted display-4 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark">No {activeTab === 'ALL' ? '' : activeTab} Orders</h4>
          <p className="text-muted small mb-0">
            {activeTab === 'PENDING'
              ? 'You have fulfilled all pending requests. New customer orders will show here.'
              : `There are currently no orders in the ${activeTab.toLowerCase()} queue.`}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-5">
          {filteredOrders.map((ord) => {
            const orderId = ord.orderId || ord.id;
            const status = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
            const config = ORDER_STATUS_CONFIG[status] || {
              badgeClass: 'kc-badge-organic',
              label: status,
              icon: 'bi-clock',
            };

            const isAccepting = actionLoadingId === `${orderId}-ACCEPTED`;
            const isRejecting = actionLoadingId === `${orderId}-REJECTED`;
            const isShipping = actionLoadingId === `${orderId}-SHIPPED`;
            const isDelivering = actionLoadingId === `${orderId}-DELIVERED`;

            return (
              <div
                key={orderId}
                className="kc-card p-4 shadow-sm kc-order-card-item position-relative overflow-hidden"
              >
                <div className="row g-4 align-items-center">
                  {/* Left: Order Info & Items */}
                  <div className="col-lg-7">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h4 className="fw-extrabold text-dark mb-0 fs-5">Order #{orderId}</h4>
                      <span className={`badge ${config.badgeClass} rounded-pill`}>
                        <i className={`bi ${config.icon} me-1`}></i>
                        {config.label}
                      </span>
                      {ord.orderDate && (
                        <span className="text-muted small ms-auto" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatDate(ord.orderDate)}
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-muted small d-block">
                        <i className="bi bi-person text-success me-1"></i> Customer:{' '}
                        <strong className="text-dark">{ord.customerName || 'Direct Customer'}</strong>
                      </span>
                      {ord.address && (
                        <span className="text-muted small d-block">
                          <i className="bi bi-geo-alt text-success me-1"></i> Delivery:{' '}
                          <span className="text-secondary">{ord.address}</span>
                        </span>
                      )}
                    </div>

                    {/* Ordered Items List */}
                    <div
                      className="p-3 rounded-3"
                      style={{ backgroundColor: 'var(--kc-cream)' }}
                    >
                      <span className="text-muted small fw-semibold d-block mb-1" style={{ fontSize: '0.75rem' }}>
                        HARVEST PRODUCE REQUESTED
                      </span>
                      {Array.isArray(ord.orderItems) && ord.orderItems.length > 0 ? (
                        <div className="d-flex flex-column gap-1">
                          {ord.orderItems.map((it, idx) => (
                            <div key={idx} className="d-flex justify-content-between small">
                              <span className="text-dark fw-medium">
                                • {it.productName || it.name || 'Produce Item'}
                              </span>
                              <span className="text-muted">
                                {it.quantity} {it.unit || 'kg'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small">Standard harvest batch delivery</span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Amount & Stepper Info */}
                  <div className="col-lg-2 text-lg-center">
                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>
                      TOTAL REVENUE
                    </span>
                    <h3 className="fw-extrabold text-success mb-0 fs-4">
                      {formatCurrency(ord.totalAmount || ord.amount || 0)}
                    </h3>
                    <span className="badge bg-light text-muted small mt-1">
                      {ord.paymentMethod || 'Direct Payment'}
                    </span>
                  </div>

                  {/* Right: State Action Buttons */}
                  <div className="col-lg-3 text-lg-end">
                    <div className="d-flex flex-column gap-2 justify-content-center">
                      {/* PENDING State Transitions */}
                      {status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            disabled={Boolean(actionLoadingId)}
                            onClick={() => handleStatusChange(orderId, 'ACCEPTED')}
                            className="kc-btn kc-btn-primary kc-btn-sm w-100"
                          >
                            {isAccepting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Accepting...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2-circle me-1"></i> Accept Order
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(actionLoadingId)}
                            onClick={() => handleStatusChange(orderId, 'REJECTED')}
                            className="btn btn-outline-danger btn-sm rounded-pill w-100 fw-semibold"
                          >
                            {isRejecting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-x-circle me-1"></i> Reject Order
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {/* ACCEPTED State Transition */}
                      {status === 'ACCEPTED' && (
                        <button
                          type="button"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() => handleStatusChange(orderId, 'SHIPPED')}
                          className="kc-btn kc-btn-fresh kc-btn-sm w-100"
                        >
                          {isShipping ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Dispatching...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-seam me-1"></i> Mark as Shipped
                            </>
                          )}
                        </button>
                      )}

                      {/* PACKED State Transition (if supported) */}
                      {status === 'PACKED' && (
                        <button
                          type="button"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() => handleStatusChange(orderId, 'SHIPPED')}
                          className="kc-btn kc-btn-fresh kc-btn-sm w-100"
                        >
                          {isShipping ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Dispatching...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-seam me-1"></i> Mark as Shipped
                            </>
                          )}
                        </button>
                      )}

                      {/* SHIPPED State Transition */}
                      {status === 'SHIPPED' && (
                        <button
                          type="button"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() => handleStatusChange(orderId, 'DELIVERED')}
                          className="kc-btn kc-btn-primary kc-btn-sm w-100"
                        >
                          {isDelivering ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Completing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-patch-check-fill me-1"></i> Complete Delivery
                            </>
                          )}
                        </button>
                      )}

                      {/* Terminal States */}
                      {['DELIVERED', 'CANCELLED', 'REJECTED'].includes(status) && (
                        <div className="p-2 rounded-3 bg-light text-center">
                          <small className="text-muted fw-semibold">
                            <i className="bi bi-check-all me-1 text-success"></i> Order Finalized
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          FULL ORDER HISTORY AUDIT TABLE
          ======================================================== */}
      {orders.length > 0 && (
        <section className="kc-card p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="kc-section-badge mb-1">
                <i className="bi bi-journal-text"></i> Audit Log
              </span>
              <h4 className="fw-extrabold text-dark mb-0">Orders Audit Record</h4>
            </div>
            <span className="text-muted small">Total: {orders.length} Records</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: 'var(--kc-cream)', fontSize: '0.82rem' }}>
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Harvest Items</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {orders.map((ord) => {
                  const oid = ord.orderId || ord.id;
                  const st = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
                  const config = ORDER_STATUS_CONFIG[st] || {
                    badgeClass: 'kc-badge-organic',
                    label: st,
                    icon: 'bi-clock',
                  };

                  return (
                    <tr key={oid}>
                      <td className="px-3 fw-bold text-dark">#{oid}</td>
                      <td className="px-3">{ord.customerName || 'Customer'}</td>
                      <td className="px-3">
                        {Array.isArray(ord.orderItems) ? (
                          <span className="text-muted small">
                            {ord.orderItems.map((it) => `${it.productName} (${it.quantity}${it.unit || 'kg'})`).join(', ')}
                          </span>
                        ) : (
                          'Produce'
                        )}
                      </td>
                      <td className="px-3 fw-bold text-success">
                        {formatCurrency(ord.totalAmount || ord.amount || 0)}
                      </td>
                      <td className="px-3 text-muted small">{ord.address || '—'}</td>
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
        </section>
      )}
    </div>
  );
};

export default FarmerOrders;
