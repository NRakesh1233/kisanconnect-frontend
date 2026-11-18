import api from './api';
import { RAZORPAY_KEY_ID } from '../utils/constants';

export const paymentService = {
  /**
   * Create Razorpay order on backend
   * @param {number} amountInRupees
   * @param {string} [receipt]
   * @returns {Promise<Object>} - { order_id, amount, currency }
   */
  createOrder: async (amountInRupees, receipt = `rcpt_${Date.now()}`) => {
    const amountInPaise = Math.round(amountInRupees * 100);
    const response = await api.post('/api/create-order', {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
    });
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   * @param {Object} verificationData - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * @returns {Promise<Object>} - { success: boolean }
   */
  verifyPayment: async (verificationData) => {
    const response = await api.post('/api/verify-payment', verificationData);
    return response.data;
  },

  /**
   * Open the Razorpay payment modal
   * @param {Object} options
   * @param {number} options.amountInRupees
   * @param {Object} options.customerDetails - { fullName, email, mobileNumber }
   * @param {Function} options.onSuccess - Callback on verified payment { razorpayPaymentId, razorpayOrderId }
   * @param {Function} [options.onError]
   * @param {Function} [options.onDismiss]
   */
  openRazorpayModal: async ({
    amountInRupees,
    customerDetails,
    onSuccess,
    onError,
    onDismiss,
  }) => {
    if (!window.Razorpay) {
      const err = new Error('Razorpay SDK failed to load. Please check your internet connection.');
      if (onError) onError(err);
      else alert(err.message);
      return;
    }

    try {
      // 1. Create order on backend
      const orderData = await paymentService.createOrder(amountInRupees);
      const { order_id, amount, currency } = orderData;

      // 2. Configure checkout options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency: currency || 'INR',
        name: 'KisanConnect',
        description: 'Secure Farm Order Payment',
        order_id,
        handler: async function (response) {
          try {
            // 3. Verify signature
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              onSuccess({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              });
            } else {
              const verifyErr = new Error('Payment verification failed on server.');
              if (onError) onError(verifyErr);
              else alert(verifyErr.message);
            }
          } catch (err) {
            console.error('Payment signature verification error:', err);
            if (onError) onError(err);
            else alert('Signature verification failed.');
          }
        },
        prefill: {
          name: customerDetails?.fullName || customerDetails?.name || 'Customer',
          email: customerDetails?.email || 'customer@kisanconnect.com',
          contact: customerDetails?.mobileNumber || customerDetails?.phone || '9999999999',
        },
        theme: {
          color: '#163D2B', // KisanConnect Forest Green
        },
        modal: {
          ondismiss: () => {
            if (onDismiss) onDismiss();
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        const failErr = new Error(response.error?.description || 'Payment Failed');
        if (onError) onError(failErr);
        else alert(`Payment Failed: ${failErr.message}`);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Failed to initiate Razorpay checkout:', err);
      if (onError) onError(err);
      else alert('Could not initiate payment. Please try again.');
    }
  },
};

export default paymentService;
