import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import RazorpayCheckoutButton from '../../components/payment/RazorpayCheckoutButton'; // Ensure this path matches where you saved the button
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Checkout() {
  const { cartItems, cartSubtotal, totalItemsCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const deliveryFee = cartSubtotal > 0 ? 49 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await customerService.getAddresses();
        setAddresses(data || []);
        if (data && data.length > 0) {
          setSelectedAddressId(data[0].addressId || data[0].id);
        }
      } catch (err) {
        console.warn('Failed to fetch addresses:', err);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Standard COD Order Submission
  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    if (!validateCheckout()) return;
    executeOrderCreation('COD');
  };

  // Online Payment Success Callback
  const handleOnlinePaymentSuccess = (paymentDetails) => {
    executeOrderCreation('ONLINE', paymentDetails.razorpayPaymentId);
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
        transactionId: transactionId, // Passing to backend if your DTO supports it
        orderItems: cartItems.map((item) => ({
          productId: Number(item.id),
          quantity: Number(item.quantity)
        }))
      };

      const response = await customerService.placeOrder(orderPayload);
      
      clearCart();
      const orderId = response?.orderId || response?.id || 'success';
      navigate(`/customer/orders/${orderId}`, { state: { orderSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please verify stock availability and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedAddressDetails = () => {
    return addresses.find(addr => String(addr.addressId || addr.id) === String(selectedAddressId));
  };

  if (cartItems.length === 0 && !submitting) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="container text-center py-5 my-auto" style={{marginTop:"100px"}}>
          <div className="card border-0 shadow-sm p-5 rounded-4 bg-white d-inline-block">
            <i className="bi bi-cart-x display-4 text-muted d-block mb-3"></i>
            <h4>No items to checkout</h4>
            <p className="text-muted">Your shopping cart is currently empty.</p>
            <Link to="/customer/products" className="btn btn-kisan-primary mt-2">
              Browse Products
            </Link>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{marginTop:"100px"}}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1">
        <h2 className="fw-bold text-dark mb-4">
          <i className="bi bi-shield-check text-success me-2"></i>Secure Order Checkout
        </h2>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            {/* Delivery Address Selection */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-geo-alt text-success me-2"></i>1. Select Delivery Address
                </h5>
                <Link to="/customer/addresses" className="btn btn-sm btn-outline-success">
                  + Add New Address
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="alert alert-warning mb-0 text-center">
                  No delivery addresses found. Please <Link to="/customer/addresses" className="fw-bold text-dark">add an address</Link> before checking out.
                </div>
              ) : (
                <div className="row g-3">
                  {addresses.map((addr) => {
                    const addrId = addr.addressId || addr.id;
                    const isSelected = String(selectedAddressId) === String(addrId);
                    return (
                      <div key={addrId} className="col-md-6">
                        <div
                          onClick={() => setSelectedAddressId(addrId)}
                          className={`card border p-3 h-100 rounded-3 transition-all ${
                            isSelected ? 'border-success bg-light shadow-sm' : 'border-light bg-white'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="deliveryAddressRadio"
                              id={`addr-${addrId}`}
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addrId)}
                            />
                            <label className="form-check-label fw-bold text-dark ms-1" htmlFor={`addr-${addrId}`}>
                              {addr.fullName} ({addr.addressType || 'HOME'})
                            </label>
                          </div>
                          <p className="text-muted fs-8 mt-2 mb-1">
                            {addr.fullAddress || `${addr.houseNo || ''}, ${addr.street}, ${addr.district}, ${addr.state} ${addr.pincode}`}
                          </p>
                          <small className="text-success fw-medium">
                            <i className="bi bi-telephone me-1"></i> {addr.mobileNumber}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="bi bi-wallet2 text-success me-2"></i>2. Choose Payment Method
              </h5>
              <div className="d-flex flex-column gap-3">
                <div className={`form-check p-3 border rounded-3 ${paymentMethod === 'COD' ? 'bg-light border-success' : ''}`}>
                  <input
                    className="form-check-input mt-1"
                    type="radio"
                    name="paymentMethod"
                    id="payCod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-bold text-dark d-block ms-2" htmlFor="payCod">
                    Cash on Delivery (COD)
                    <small className="text-muted fw-normal d-block">Pay with cash when your fresh harvest arrives at your doorstep.</small>
                  </label>
                </div>

                <div className={`form-check p-3 border rounded-3 ${paymentMethod === 'ONLINE' ? 'bg-light border-success' : ''}`}>
                  <input
                    className="form-check-input mt-1"
                    type="radio"
                    name="paymentMethod"
                    id="payOnline"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-bold text-dark d-block ms-2" htmlFor="payOnline">
                    Online Payment (UPI / NetBanking / Cards)
                    <small className="text-muted fw-normal d-block">Secure digital payment gateway integration.</small>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Review Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order Summary</h5>
              <div className="d-flex flex-column gap-2 mb-3 max-vh-25 overflow-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center fs-8">
                    <span className="text-muted text-truncate" style={{ maxWidth: '180px' }}>
                      {item.name} x {item.quantity} {item.unit}
                    </span>
                    <span className="fw-bold text-dark">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2 fs-7">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold text-dark">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 fs-7 pb-3 border-bottom">
                  <span className="text-muted">Delivery Charge</span>
                  <span className="fw-bold text-success">₹{deliveryFee}</span>
                </div>
                <div className="d-flex justify-content-between mb-4 fs-5 fw-bold">
                  <span className="text-dark">Total Amount</span>
                  <span className="text-success">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {paymentMethod === 'ONLINE' ? (
                <RazorpayCheckoutButton 
                  amountInRupees={grandTotal}
                  customerDetails={getSelectedAddressDetails()}
                  onSuccess={handleOnlinePaymentSuccess}
                  disabled={submitting || addresses.length === 0 || !selectedAddressId}
                />
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting || addresses.length === 0 || !selectedAddressId}
                  className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      <span>Place Order Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}