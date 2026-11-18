import React, { useState } from 'react';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

export const RazorpayCheckoutButton = ({
  amountInRupees = 0,
  customerDetails = {},
  onSuccess,
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      await paymentService.openRazorpayModal({
        amountInRupees,
        customerDetails,
        onSuccess: (paymentData) => {
          setLoading(false);
          if (onSuccess) onSuccess(paymentData);
        },
        onError: (err) => {
          setLoading(false);
          alert(err.message || 'Payment initiation failed. Please try again.');
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      setLoading(false);
      console.error('Payment execution error:', err);
      alert('Could not initiate payment. Please try again.');
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`kc-btn kc-btn-primary kc-btn-lg w-100 ${className}`}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Connecting Gateway...</span>
        </>
      ) : (
        <>
          <i className="bi bi-shield-lock-fill"></i>
          <span>Pay {formatCurrency(amountInRupees)} Securely</span>
        </>
      )}
    </button>
  );
};

export default RazorpayCheckoutButton;
