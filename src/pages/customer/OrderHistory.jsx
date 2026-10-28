import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OrderHistory.css';

export default function OrderHistory() {
  const { totalItemsCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomerOrders();
        setOrders(data || []);
      } catch (err) {
        console.warn('Failed to fetch customer orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((order) => {
      const status = (order.status || order.orderStatus || 'PENDING').toUpperCase();
      return status === activeTab;
    });
  }, [orders, activeTab]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <span className="order-badge badge-delivered">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="order-badge badge-shipped">SHIPPED</span>;
      case 'PACKING':
        return <span className="order-badge badge-packing">PACKING</span>;
      case 'CONFIRMED':
        return <span className="order-badge badge-confirmed">CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="order-badge badge-cancelled">CANCELLED</span>;
      case 'PENDING':
      default:
        return <span className="order-badge badge-pending">PENDING</span>;
    }
  };

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Packing', value: 'PACKING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  return (
    <div className="min-vh-100 bg-light d-flex flex-column customer-page">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-4 flex-grow-1 order-history-container">
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="fw-bold text-dark m-0">
            <i className="bi bi-box-seam text-success me-2"></i>My Orders
          </h4>
          <span className="text-muted small">Total Orders: {filteredOrders.length}</span>
        </div>

        {/* Status Filter Tabs */}
        <div className="order-tabs-scroll mb-4">
          <div className="d-flex gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`order-tab-pill ${isActive ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center rounded-4 shadow-sm" role="alert">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="custom-empty-state text-center py-5 bg-white">
            <div className="py-4">
              <i className="bi bi-basket text-muted display-4 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No orders found</h5>
              <p className="text-muted small mb-4">You have no orders matching the selected status filter.</p>
              {activeTab !== 'ALL' ? (
                <button onClick={() => setActiveTab('ALL')} className="btn btn-outline-success btn-sm px-4 rounded-pill">
                  View All Orders
                </button>
              ) : (
                <Link to="/customer/products" className="btn btn-success btn-sm px-4 py-2 rounded-pill">
                  Browse Products
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredOrders.map((order) => {
              const orderId = order.orderId || order.id;
              const orderStatus = order.status || order.orderStatus || 'PENDING';
              const orderItems = order.items || order.orderItems || [];
              const customerName = order.customerName || order.userName || 'Customer';
              const address = order.shippingAddress || order.address || 'Address not specified';
              const paymentMethod = order.paymentMethod || 'ONLINE';

              return (
                <div key={orderId} className="custom-order-card bg-white p-4">
                  <div className="row align-items-center g-4">
                    
                    {/* COLUMN 1: Order Meta & Address */}
                    <div className="col-12 col-lg-4 order-col-border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark small tracking-wide">ORDER #{orderId}</span>
                        {getStatusBadge(orderStatus)}
                      </div>
                      <h6 className="fw-bold text-dark mb-2 fs-6">{customerName}</h6>
                      <div className="text-muted small mb-2 d-flex align-items-start gap-1">
                        <i className="bi bi-geo-alt text-success mt-1 flex-shrink-0"></i>
                        <span>{address}</span>
                      </div>
                      <div className="text-success small fw-semibold">
                        <i className="bi bi-wallet2 me-1"></i> Paid via {paymentMethod}
                      </div>
                    </div>

                    {/* COLUMN 2: Product Harvest Items Summary */}
                    <div className="col-12 col-lg-4 order-col-border">
                      <span className="order-section-title">PRODUCT HARVEST ITEMS</span>
                      <div className="order-items-container my-2">
                        {orderItems.length > 0 ? (
                          orderItems.map((item, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                              <span className="text-dark small fw-medium">{item.productName || item.name || 'Product'}</span>
                              <div className="text-end small">
                                <span className="text-muted me-3">{item.quantity || 1} kg</span>
                                <span className="fw-bold text-dark">₹{item.price || item.totalPrice || '0'}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted small py-1">No items listed</div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 mt-1">
                        <span className="text-dark fw-bold small">Total Amount</span>
                        <span className="fw-bold text-success fs-5">₹{order.totalAmount || order.totalPrice || '0.00'}</span>
                      </div>
                    </div>

                    {/* COLUMN 3: Track Order Button */}
                    <div className="col-12 col-lg-4 text-center d-flex flex-column align-items-center justify-content-center">
                      <Link to={`/customer/orders/${orderId}`} className="btn btn-success px-4 py-3 rounded-pill fw-bold w-100 shadow-sm track-btn">
                        Track Your Order <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}