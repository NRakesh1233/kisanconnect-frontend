/**
 * KisanConnect Data Formatters & Image Resolvers
 */

import moment from 'moment';
import { API_BASE_URL } from './constants';

/**
 * Format currency in Indian Rupees (INR)
 * @param {number|string} amount
 * @returns {string} e.g. "₹1,240.00"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format date string safely
 * @param {string|Date} date
 * @param {string} formatPattern e.g. "DD MMM YYYY, HH:mm"
 * @returns {string}
 */
export const formatDate = (date, formatPattern = 'DD MMM YYYY') => {
  if (!date) return 'N/A';
  const m = moment(date);
  return m.isValid() ? m.format(formatPattern) : 'N/A';
};

/**
 * Resolve profile picture URL safely across backend path variations
 * @param {string} imgProp
 * @returns {string}
 */
export const resolveProfileImageUrl = (imgProp) => {
  if (!imgProp) return '';
  if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) {
    return imgProp;
  }
  if (imgProp.includes('/uploads/')) {
    return `${API_BASE_URL}${imgProp}`;
  }
  return `${API_BASE_URL}/uploads/profiles/${imgProp}`;
};

/**
 * Resolve product image URL safely across backend path variations
 * @param {string} imgProp
 * @param {string} fallback
 * @returns {string}
 */
export const resolveProductImageUrl = (imgProp, fallback = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800') => {
  if (!imgProp) return fallback;
  if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) {
    return imgProp;
  }
  if (imgProp.includes('/uploads/')) {
    return `${API_BASE_URL}${imgProp}`;
  }
  return `${API_BASE_URL}/uploads/products/${imgProp}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
