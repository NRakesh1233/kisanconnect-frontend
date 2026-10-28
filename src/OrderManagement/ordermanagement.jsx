import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar/navbar";
import axios from "axios";
import "./Orders.css";

const BASE_URL = "http://localhost:8080";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [byStatus, setByStatus] = useState({
    PENDING: [],
    ACCEPTED: [],
    REJECTED: [],
    PACKED: [],
    SHIPPED: [],
    DELIVERED: [],
    CANCELLED: []
  });

  useEffect(() => {
    if (localStorage.getItem("role") !== "FARMER") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
    loadOrdersByStatus();
  }, []);

  const loadOrdersByStatus = () => {
    ["PENDING", "ACCEPTED", "REJECTED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].forEach((st) => {
      axios.get(`${BASE_URL}/farmer/Orders/bystatus/${st}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("Authorization")}` }
      })
      .then((res) => {
        setByStatus((prev) => ({
          ...prev,
          [st]: res.data || []
        }));
      })
      .catch((err) => {
        console.error(`Error fetching status ${st}:`, err);
      });
    });
  };

  const loadOrders = () => {
    axios.get(`${BASE_URL}/farmer/Orders/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("Authorization")}` }
    })
    .then((res) => {
      setOrders(res.data || []);
    })
    .catch((error) => {
      console.error("Error loading all orders:", error);
    });
  };

  const changeStatus = (newStatus, id) => {
    axios.put(`${BASE_URL}/farmer/order/status?id=${id}&status=${newStatus}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("Authorization")}` }
    })
    .then((res) => {
      alert(res.data || "Order status updated successfully!");
      loadOrders();
      loadOrdersByStatus();
    })
    .catch((error) => {
      alert(error.response?.data?.message || "Failed to update status.");
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'pending-status';
      case 'ACCEPTED': return 'accepted-status';
      case 'SHIPPED': return 'shipped-status';
      case 'DELIVERED': return 'delivered-status';
      case 'REJECTED': case 'CANCELLED': return 'cancelled-status';
      default: return 'pending-status';
    }
  };

  const currentList = byStatus[activeTab] || [];

  return (
    <div className="container-fluid w-100 p-0">
       <Navbar menu={["Dashboard", "Inventory", "Orders", "Profile"]} role="FARMER" />
    <main className="orders-page">

      {/* ================= HEADER ================= */}
      <header className="orders-header">
        <div>
          <h1>Farmer Order Management</h1>
          <p>Seamlessly track, manage, and fulfill farm-fresh produce orders.</p>
        </div>
        <button className="export-btn" onClick={() => alert('Exporting CSV feature enabled!')}>
          <span className="material-symbols-outlined">download</span>
          Export CSV
        </button>
      </header>

      {/* ================= STATISTICS GRID ================= */}
      <section className="stats-grid">
        <div className="stat-card pending" onClick={() => setActiveTab("PENDING")} style={{ cursor: 'pointer' }}>
          <span>Pending Orders</span>
          <h2>{byStatus?.PENDING?.length || 0}</h2>
        </div>
        <div className="stat-card accepted" onClick={() => setActiveTab("ACCEPTED")} style={{ cursor: 'pointer' }}>
          <span>Accepted</span>
          <h2>{byStatus?.ACCEPTED?.length || 0}</h2>
        </div>
        <div className="stat-card shipped" onClick={() => setActiveTab("SHIPPED")} style={{ cursor: 'pointer' }}>
          <span>Shipped</span>
          <h2>{byStatus?.SHIPPED?.length || 0}</h2>
        </div>
        <div className="stat-card delivered" onClick={() => setActiveTab("DELIVERED")} style={{ cursor: 'pointer' }}>
          <span>Delivered</span>
          <h2>{byStatus?.DELIVERED?.length || 0}</h2>
        </div>
        <div className="stat-card cancelled" onClick={() => setActiveTab("CANCELLED")} style={{ cursor: 'pointer' }}>
          <span>Cancelled</span>
          <h2>{byStatus?.CANCELLED?.length || 0}</h2>
        </div>
        <div className="stat-card rejected" onClick={() => setActiveTab("REJECTED")} style={{ cursor: 'pointer' }}>
          <span>Rejected</span>
          <h2>{byStatus?.REJECTED?.length || 0}</h2>
        </div>
      </section>

      {/* ================= STATUS FILTER TABS ================= */}
      <div className="status-tabs mb-4">
        {["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="badge-count">({byStatus[tab]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* ================= ORDER CARDS LIST ================= */}
      <section className="orders-list">
        {currentList.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5 rounded-4 bg-white">
            <div className="card-body py-5">
              <span className="material-symbols-outlined display-3 text-muted mb-3">inbox</span>
              <h4 className="fw-bold text-dark">No {activeTab.toLowerCase()} orders found</h4>
              <p className="text-muted mb-0">Orders matching this status will appear here automatically.</p>
            </div>
          </div>
        ) : (
          currentList.map((order) => (
            <div key={order.orderId} className={`order-card ${order.orderStatus?.toLowerCase()}-card`}>
              {/* LEFT: Customer & Status */}
              <div className="order-left">
                <div className="order-top">
                  <div>
                    <small className="text-muted fw-bold">ORDER #{order.orderId}</small>
                    <h3>{order.customerName || 'Valued Customer'}</h3>
                  </div>
                  <span className={`status ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="customer-info">
                  <div className="info-row">
                    <span className="material-symbols-outlined text-success">location_on</span>
                    <p>{order.address || 'Delivery address provided.'}</p>
                  </div>
                  <div className="info-row">
                    <span className="material-symbols-outlined success-icon">payments</span>
                    <p className="payment-success">
                      {order.paymentMethod ? `Paid via ${order.paymentMethod}` : `Payment ${order.paymentStatus || 'Pending'}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* CENTER: Product Items */}
              <div className="order-center">
                <p className="title">Product Harvest Items</p>
                <ul>
                  {order.orderItems?.map((item, idx) => (
                    <li key={idx}>
                      <span>{item.productName}</span>
                      <strong>{item.quantity} {item.unit || 'kg'}</strong>
                      <strong>₹{item.price}</strong>
                    </li>
                  ))}
                </ul>
                <div className="total-section">
                  <span>Total Amount</span>
                  <h3>₹{order.totalAmount}</h3>
                </div>
              </div>

              {/* RIGHT: Stepper & Action Buttons */}
              <div className="order-right">
                <div className="stepper">
                  <div className={`step ${['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) ? 'active' : ''}`}>
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div className={`step ${['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) ? 'active' : ''}`}>
                    2
                  </div>
                  <div className={`step ${['SHIPPED', 'DELIVERED'].includes(order.orderStatus) ? 'active' : ''}`}>
                    3
                  </div>
                  <div className={`step ${order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                    4
                  </div>
                </div>

                {/* Conditional Action Buttons based on Status */}
                <div className="action-buttons">
                  {order.orderStatus === 'PENDING' && (
                    <>
                      <button className="accept-btn" onClick={() => changeStatus("ACCEPTED", order.orderId)}>
                        Accept Order
                      </button>
                      <button className="reject-btn" onClick={() => changeStatus("REJECTED", order.orderId)}>
                        Reject
                      </button>
                    </>
                  )}

                  {order.orderStatus === 'ACCEPTED' && (
                    <button className="packed-btn" onClick={() => changeStatus("SHIPPED", order.orderId)}>
                      <span className="material-symbols-outlined">inventory_2</span> Mark Shipped
                    </button>
                  )}

                  {order.orderStatus === 'SHIPPED' && (
                    <button className="complete-btn" onClick={() => changeStatus("DELIVERED", order.orderId)}>
                      <span className="material-symbols-outlined">verified</span> Complete Order
                    </button>
                  )}

                  {['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.orderStatus) && (
                    <span className="text-muted fw-bold text-center py-2 fs-7 w-100">
                      No further actions required
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ================= ORDER HISTORY TABLE ================= */}
      <section className="orders-list order-history shadow-sm bg-white rounded-4 p-4 mt-5">
        <h3 className="fw-bold text-dark mb-3">Order History Log</h3>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">No order history available.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.orderId}>
                    <td>#{ord.orderId}</td>
                    <td className="fw-medium">{ord.customerName || 'Customer'}</td>
                    <td>
                      <ul className="list-unstyled mb-0 fs-8" style={{listStyleType:"none"}}>
                        {ord.orderItems?.map((it, i) => (
                          <li key={i}>• {it.productName} ({it.quantity} {it.unit || 'kg'})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="fw-bold text-success">₹{ord.totalAmount}</td>
                    <td className="text-muted fs-8">{ord.address}</td>
                    <td>
                      <span className={`status ${getStatusBadgeClass(ord.orderStatus)}`}>
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
    </main>
    </div>
  );
}