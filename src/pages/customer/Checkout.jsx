import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import customerService from '../../services/customerService';
import RazorpayCheckoutButton from '../../components/common/RazorpayCheckoutButton';
import { formatCurrency } from '../../utils/formatters';

export const Checkout = () => {
  const { cartItems, cartSubtotal, totalItemsCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // New Address inline toggle / state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobileNumber: '',
    houseNo: '',
    street: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'HOME',
  });

  const deliveryFee = cartSubtotal > 0 ? 49 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  useEffect(() => {
    let isMounted = true;
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await customerService.getAddresses();
        const addressList = Array.isArray(data) ? data : [];
        if (isMounted) {
          setAddresses(addressList);
          if (addressList.length > 0) {
            setSelectedAddressId(addressList[0].addressId || addressList[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load delivery addresses:', err);
        if (isMounted) setAddresses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      await customerService.addAddress(newAddress);
      const updatedList = await customerService.getAddresses();
      setAddresses(updatedList || []);
      if (updatedList && updatedList.length > 0) {
        const newest = updatedList[updatedList.length - 1];
        setSelectedAddressId(newest.addressId || newest.id);
      }
      setShowAddAddress(false);
      setNewAddress({
        fullName: '',
        mobileNumber: '',
        houseNo: '',
        street: '',
        village: '',
        mandal: '',
        district: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'HOME',
      });
    } catch (err) {
      alert('Failed to save address. Please check all required fields.');
    }
  };

  const validateCheckout = () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address to proceed.');
      return false;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return false;
    }
    if (!cartItems[0]?.farmerId) {
      setError('Invalid farmer information in cart items.');
      return false;
    }
    return true;
  };

  const executeOrderCreation = async (method, transactionId = null) => {
    try {
      setSubmitting(true);
      setError(null);

      const orderPayload = {
        addressId: Number(selectedAddressId),
        farmerId: Number(cartItems[0]?.farmerId),
        paymentMethod: method,
        transactionId: transactionId,
        orderItems: cartItems.map((item) => ({
          productId: Number(item.id || item.productId),
          quantity: Number(item.quantity),
        })),
      };

      const response = await customerService.placeOrder(orderPayload);
      clearCart();
      const orderId = response?.orderId || response?.id || 'success';
      navigate(`/customer/orders/${orderId}`, { state: { orderSuccess: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to place order. Please verify stock availability and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrderCOD = (e) => {
    e?.preventDefault();
    if (!validateCheckout()) return;
    executeOrderCreation('COD');
  };

  const handleOnlinePaymentSuccess = (paymentDetails) => {
    executeOrderCreation('ONLINE', paymentDetails.razorpayPaymentId);
  };

  const selectedAddress = addresses.find(
    (addr) => String(addr.addressId || addr.id) === String(selectedAddressId)
  );

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="mb-4">
        <span className="kc-section-badge mb-1">
          <i className="bi bi-shield-lock"></i> Secure Gateway
        </span>
        <h2 className="fw-extrabold text-dark mb-0">Order Checkout</h2>
      </div>

      {error && (
        <div
          className="alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2 small"
          style={{ backgroundColor: 'var(--kc-crimson-red-subtle)', color: 'var(--kc-crimson-red)' }}
        >
          <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Address & Payment Selection */}
        <div className="col-lg-8">
          {/* 1. Address Selection */}
          <div className="kc-card p-4 mb-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <span className="kc-badge kc-badge-forest">1</span>
                <span>Select Delivery Destination</span>
              </h5>
              <button
                type="button"
                className="kc-btn kc-btn-outline kc-btn-sm"
                onClick={() => setShowAddAddress(!showAddAddress)}
              >
                <i className={`bi ${showAddAddress ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
                <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Inline Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleAddAddressSubmit} className="p-3 mb-4 rounded-4 border bg-light">
                <h6 className="fw-bold text-success mb-3">Add Delivery Address</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="kc-label small">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Recipient's Name"
                      className="kc-input"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="kc-label small">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      className="kc-input"
                      value={newAddress.mobileNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, mobileNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="kc-label small">House / Flat No.</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4-12/A"
                      className="kc-input"
                      value={newAddress.houseNo}
                      onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="kc-label small">Street / Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="Street name"
                      className="kc-input"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="kc-label small">City / Village</label>
                    <input
                      type="text"
                      required
                      className="kc-input"
                      value={newAddress.village}
                      onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="kc-label small">State</label>
                    <input
                      type="text"
                      required
                      className="kc-input"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="kc-label small">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="kc-input"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 text-end">
                  <button type="submit" className="kc-btn kc-btn-primary kc-btn-sm">
                    Save and Select Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards Radio List */}
            {loading ? (
              <div className="p-3 text-muted small">Loading addresses...</div>
            ) : addresses.length > 0 ? (
              <div className="d-flex flex-column gap-2.5">
                {addresses.map((addr) => {
                  const aid = addr.addressId || addr.id;
                  const isChecked = String(aid) === String(selectedAddressId);

                  return (
                    <label
                      key={aid}
                      className={`p-3 rounded-4 border d-flex align-items-start gap-3 cursor-pointer transition-all ${
                        isChecked ? 'border-success bg-white shadow-xs' : 'bg-light border-light'
                      }`}
                      style={{ cursor: 'pointer', borderWidth: isChecked ? '2px' : '1px' }}
                    >
                      <input
                        type="radio"
                        name="addressRadio"
                        className="form-check-input mt-1"
                        checked={isChecked}
                        onChange={() => setSelectedAddressId(aid)}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong className="text-dark">{addr.fullName}</strong>
                          <span className="badge kc-badge-cream" style={{ fontSize: '0.7rem' }}>
                            {addr.addressType || 'HOME'}
                          </span>
                        </div>
                        <p className="text-muted small mb-1">
                          {addr.houseNo}, {addr.street}, {addr.village}, {addr.district || ''}, {addr.state} - {addr.pincode}
                        </p>
                        <small className="text-muted">
                          <i className="bi bi-telephone text-success me-1"></i> {addr.mobileNumber}
                        </small>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded-4">
                <i className="bi bi-geo-alt text-muted fs-3 d-block mb-2"></i>
                <p className="text-muted small mb-2">No delivery addresses found on your account.</p>
                <button
                  type="button"
                  className="kc-btn kc-btn-primary kc-btn-sm"
                  onClick={() => setShowAddAddress(true)}
                >
                  Add Your First Address
                </button>
              </div>
            )}
          </div>

          {/* 2. Payment Method Selection */}
          <div className="kc-card p-4 shadow-sm">
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <span className="kc-badge kc-badge-forest">2</span>
              <span>Payment Option</span>
            </h5>

            <div className="row g-3 mb-4">
              {/* COD Option */}
              <div className="col-sm-6">
                <div
                  className={`p-3 rounded-4 border text-center cursor-pointer transition-all h-100 ${
                    paymentMethod === 'COD'
                      ? 'border-success bg-white shadow-xs'
                      : 'border-light bg-light'
                  }`}
                  onClick={() => setPaymentMethod('COD')}
                  style={{ cursor: 'pointer', borderWidth: paymentMethod === 'COD' ? '2px' : '1px' }}
                >
                  <div
                    className="rounded-circle d-inline-flex p-2.5 mb-2"
                    style={{ backgroundColor: 'var(--kc-fresh-green-light)', color: 'var(--kc-fresh-green)' }}
                  >
                    <i className="bi bi-cash-stack fs-4"></i>
                  </div>
                  <strong className="d-block small text-dark mb-1">Cash on Delivery</strong>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Pay cash upon harvest inspection
                  </span>
                </div>
              </div>

              {/* Online Payment (Razorpay) Option */}
              <div className="col-sm-6">
                <div
                  className={`p-3 rounded-4 border text-center cursor-pointer transition-all h-100 ${
                    paymentMethod === 'ONLINE'
                      ? 'border-success bg-white shadow-xs'
                      : 'border-light bg-light'
                  }`}
                  onClick={() => setPaymentMethod('ONLINE')}
                  style={{ cursor: 'pointer', borderWidth: paymentMethod === 'ONLINE' ? '2px' : '1px' }}
                >
                  <div
                    className="rounded-circle d-inline-flex p-2.5 mb-2"
                    style={{ backgroundColor: 'var(--kc-fresh-green-light)', color: 'var(--kc-fresh-green)' }}
                  >
                    <i className="bi bi-credit-card-2-front fs-4"></i>
                  </div>
                  <strong className="d-block small text-dark mb-1">UPI, Cards, NetBanking</strong>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Instant & secure via Razorpay
                  </span>
                </div>
              </div>
            </div>

            {/* Action Trigger based on selected Payment Method */}
            {paymentMethod === 'ONLINE' ? (
              <RazorpayCheckoutButton
                amountInRupees={grandTotal}
                customerDetails={{
                  fullName: selectedAddress?.fullName || user?.name || 'Customer',
                  email: user?.email || 'customer@kisanconnect.com',
                  mobileNumber: selectedAddress?.mobileNumber || user?.mobileNumber || '9999999999',
                }}
                disabled={!selectedAddressId || submitting}
                onSuccess={handleOnlinePaymentSuccess}
              />
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrderCOD}
                disabled={!selectedAddressId || submitting}
                className="kc-btn kc-btn-primary kc-btn-lg w-100 justify-content-center shadow-sm"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>Confirm Order ({formatCurrency(grandTotal)}) via COD</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Order Items Summary */}
        <div className="col-lg-4">
          <div className="kc-card p-4 shadow-sm sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold text-dark mb-3">Order Items ({totalItemsCount})</h5>

            <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom overflow-auto" style={{ maxHeight: '240px' }}>
              {cartItems.map((item) => (
                <div key={item.cartId || item.id} className="d-flex justify-content-between align-items-center small">
                  <div>
                    <strong className="d-block text-dark text-truncate" style={{ maxWidth: '180px' }}>
                      {item.name}
                    </strong>
                    <span className="text-muted">{item.quantity} {item.unit || 'kg'} × {formatCurrency(item.price)}</span>
                  </div>
                  <span className="fw-bold text-dark">
                    {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Subtotal</span>
              <span className="fw-bold text-dark">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="d-flex justify-content-between small text-muted mb-3 pb-3 border-bottom">
              <span>Delivery Logistics</span>
              <span className="fw-bold text-dark">
                {deliveryFee === 0 ? <span className="text-success">FREE</span> : formatCurrency(deliveryFee)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="fw-bold text-dark fs-6">Grand Total</span>
              <span className="display-6 fw-extrabold text-success mb-0" style={{ fontSize: '1.75rem' }}>
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--kc-cream)' }}>
              <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-patch-check-fill text-success me-1"></i>
                Dispatched directly from local farm gate in eco-packaging.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
