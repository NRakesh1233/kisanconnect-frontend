/**
 * Legacy service.js - Maintained for backwards compatibility.
 * Re-exports from centralized farmerService.
 */

import { farmerService } from './services/farmerService';

export const loadDashboard = farmerService.loadDashboard;
export const loadReviews = farmerService.loadReviews;
export const loadUserProfile = farmerService.loadUserProfile;
export const loadFarmerEarnings = farmerService.loadFarmerEarnings;

export default farmerService;
