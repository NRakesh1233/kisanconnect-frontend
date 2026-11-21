/**
 * KisanConnect Global Application Constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kisanconnect-backend-latest.onrender.com';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TsQg6KVrN3WGS6';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  FARMER: 'FARMER',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Pending', badgeClass: 'kc-badge-warning', icon: 'bi-hourglass-split' },
  ACCEPTED: { label: 'Accepted', badgeClass: 'kc-badge-info', icon: 'bi-check-circle' },
  PACKED: { label: 'Packed', badgeClass: 'kc-badge-info', icon: 'bi-box-seam' },
  SHIPPED: { label: 'Shipped', badgeClass: 'kc-badge-info', icon: 'bi-truck' },
  DELIVERED: { label: 'Delivered', badgeClass: 'kc-badge-organic text-dark', icon: 'bi-patch-check-fill' },
  REJECTED: { label: 'Rejected', badgeClass: 'kc-badge-danger', icon: 'bi-x-circle' },
  CANCELLED: { label: 'Cancelled', badgeClass: 'kc-badge-danger', icon: 'bi-x-circle' },
};

export const PRODUCT_CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Organic Produce',
];

export const PAYMENT_METHODS = {
  COD: 'COD',
  ONLINE: 'ONLINE',
};
