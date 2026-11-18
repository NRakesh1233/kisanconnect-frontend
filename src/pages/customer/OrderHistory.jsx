import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

const STATUS_TABS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Packed', value: 'PACKED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerService.getCustomerOrders();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Could not fetch customer orders:', err);
        if (isMounted) setError('Failed to retrieve order history.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((order) => {
      const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();
      return status === activeTab;
    });
  }, [orders, activeTab]);

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-clock-history"></i> Fulfillment Records
          </span>
          <h2 className="fw-extrabold text-dark mb-0">My Order History</h2>
        </div>
        <span className="text-muted small">Total Orders: {orders.length}</span>
      </div>

      {/* Status Filter Pills */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              className={`kc-btn kc-btn-sm ${isActive ? 'kc-btn-primary' : 'kc-btn-cream'}`}
              onClick={() => setActiveTab(tab.value)}
              style={{ padding: '0.45rem 1.15rem' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading orders...</span>
          </div>
          <p className="mt-2 text-muted small">Accessing order records...</p>
        </div>
      ) : error ? (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-exclamation-triangle text-danger display-5 d-block mb-3"></i>
          <h5 className="fw-bold text-dark">{error}</h5>
          <button onClick={() => window.location.reload()} className="kc-btn kc-btn-outline kc-btn-sm mt-3">
            Reload Orders
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="d-flex flex-column gap-3.5">
          {filteredOrders.map((ord) => {
            const oid = ord.orderId || ord.id;
            const statusUpper = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
            const config = ORDER_STATUS_CONFIG[statusUpper] || {
              label: statusUpper,
              badgeClass: 'kc-badge-forest',
              icon: 'bi-circle',
            };

            const itemsCount = ord.orderItems?.length || 0;
            const orderTotal = ord.totalAmount || ord.totalPrice || 0;

            return (
              <div key={oid} className="kc-card p-4 shadow-sm">
                <div className="row g-3 align-items-center">
                  {/* Order ID & Timing */}
                  <div className="col-md-3">
                    <span className="text-muted small d-block mb-1">Order #{oid}</span>
                    <strong className="text-dark d-block">
                      {ord.orderTime || ord.createdAt ? formatDate(ord.orderTime || ord.createdAt) : 'Recent Order'}
                    </strong>
                    <span className="badge kc-badge-cream mt-1" style={{ fontSize: '0.7rem' }}>
                      {ord.paymentMethod || 'COD'}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="col-md-4">
                    <span className="text-muted small d-block mb-1">Harvest Items ({itemsCount}):</span>
                    <ul className="list-unstyled mb-0 small text-dark d-flex flex-column gap-1">
                      {ord.orderItems?.slice(0, 3).map((it, idx) => (
                        <li key={idx} className="text-truncate">
                          • {it.productName || 'Harvest Item'} ({it.quantity || 1}kg)
                        </li>
                      ))}
                      {itemsCount > 3 && (
                        <li className="text-muted">+ {itemsCount - 3} more items</li>
                      )}
                    </ul>
                  </div>

                  {/* Status Badge & Total */}
                  <div className="col-md-3">
                    <span className="text-muted small d-block mb-1">Status:</span>
                    <span className={`badge ${config.badgeClass} mb-2`}>
                      <i className={`bi ${config.icon} me-1`}></i>
                      {config.label}
                    </span>
                    <span className="d-block fw-bold text-dark fs-5">
                      {formatCurrency(orderTotal)}
                    </span>
                  </div>

                  {/* Action Link */}
                  <div className="col-md-2 text-md-end">
                    <Link
                      to={`/customer/orders/${oid}`}
                      className="kc-btn kc-btn-outline kc-btn-sm text-decoration-none w-100 justify-content-center"
                    >
                      <span>Track Order</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-box-seam text-muted display-4 d-block mb-3 opacity-50"></i>
          <h5 className="fw-bold text-dark mb-1">No Orders in this Status</h5>
          <p className="text-muted small mb-3">
            {activeTab === 'ALL'
              ? 'You have not placed any orders yet. Fresh harvests are waiting for you in the marketplace!'
              : `No orders found currently in '${activeTab}' status.`}
          </p>
          <Link to="/customer/products" className="kc-btn kc-btn-primary kc-btn-sm d-inline-flex">
            Explore Marketplace
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
