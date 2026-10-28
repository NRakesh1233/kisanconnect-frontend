import React, { useState } from 'react';
import api from '../../services/api'; // Uses your pre-configured axios instance pointing to http://localhost:8080

export default function RazorpayCheckoutButton({ amountInRupees, customerDetails, onSuccess, disabled }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled) return;
    setLoading(true);

    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order in Backend (Amount in Paise)
      const amountInPaise = Math.round(amountInRupees * 100);
      const orderResponse = await api.post('/api/create-order', {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      });

      const { order_id, amount, currency } = orderResponse.data;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: amount,
        currency: currency,
        name: "KisanConnect",
        description: "Secure Order Payment",
        order_id: order_id,
        handler: async function (response) {
          // 3. Verify Payment Signature
          try {
            const verificationResponse = await api.post('/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.data.success) {
              // 4. Trigger the parent component's order creation
              onSuccess({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id
              });
            } else {
              alert('Payment verification failed on the server.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Signature verification failed.');
          }
        },
        prefill: {
          name: customerDetails?.fullName || "Customer",
          email:  customerDetails?.email||"customer@kisanconnect.com",
          contact: customerDetails?.mobileNumber || "9999999999"
        },
        theme: {
          color: "#3b6934" // KisanConnect Green
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handlePayment} 
      disabled={loading || disabled}
      className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Connecting Gateway...</span>
        </>
      ) : (
        <>
          <i className="bi bi-shield-lock-fill"></i>
          <span>Pay ₹{amountInRupees.toFixed(2)} Securely</span>
        </>
      )}
    </button>
  );
}