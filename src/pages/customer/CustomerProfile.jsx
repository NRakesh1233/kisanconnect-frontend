import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import moment from 'moment';
import api from '../../services/api';
import './customerProfile.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function CustomerProfile() {
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'addresses', 'reviews'
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: 'Male',
    profilePic: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await customerService.getCustomerProfile?.() || await customerService.getProfile?.();
        if (profileData) {
          setProfile({
            firstName: profileData.firstName || profileData.name?.split(' ')[0] || '',
            lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || '',
            email: profileData.email || '',
            mobileNumber: profileData.mobileNumber || profileData.phone || '',
            gender: profileData.gender || 'Male',
            profilePic: profileData.profilePic || profileData.image || ''
          });
        }

        const addressData = await customerService.getAddresses();
        setAddresses(addressData || []);

        if (customerService.getCustomerReviews) {
          const reviewData = await customerService.getCustomerReviews();
          setReviews(reviewData || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.warn('Failed to load profile details:', err);
        setError('Could not load user profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile picture file selection
  const handleProfilePicChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setError('');
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await api.post('/customer/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Local preview blob update for instantaneous feedback
      const previewUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, profilePic: previewUrl }));

      setSuccessMsg(response.data || 'Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (customerService.updateProfile) {
        await customerService.updateProfile(profile);
      }
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Failed to update profile changes.');
    }
  };

  const handleStartEditReview = (rev) => {
    const revId = rev.reviewId || rev.id;
    setEditingReviewId(revId);
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || rev.reviewText || '');
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleUpdateReview = async (revId) => {
    try {
      setError(null);
      const payload = {
        rating: Number(editRating),
        comment: editComment
      };

      if (customerService.updateReview) {
        await customerService.updateReview(revId, payload);
      }

      setReviews(prev => prev.map(r => {
        const currentId = r.reviewId || r.id;
        if (currentId === revId) {
          return { ...r, rating: Number(editRating), comment: editComment, reviewText: editComment };
        }
        return r;
      }));

      setEditingReviewId(null);
      setSuccessMsg('Review updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update review:', err);
      setError('Failed to update review. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 my-auto" style={{ marginTop: '100px' }}>
          <div className="spinner-border text-success" role="status"></div>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column customer-page" style={{ marginTop: '90px', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef4f1 100%)' }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{ maxWidth: '1200px' }}>
        {successMsg && (
          <div className="alert alert-success border-0 shadow-sm rounded-4 mb-4 text-success bg-success bg-opacity-15 fw-semibold" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 bg-danger bg-opacity-10 text-danger fw-semibold" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        <div className="row g-4">
          {/* Left Sidebar Menu / Mobile Horizontal Tabs Container */}
          <div className="col-lg-3">
            
            {/* User Greeting Box with Editable Glassmorphism Profile Picture */}
            <div className="glass-panel card border-0 shadow-sm rounded-4 p-3 bg-white mb-3 d-flex flex-row align-items-center gap-3 transition-all">
              <div className="position-relative cursor-pointer" title="Click to change profile picture" onClick={() => document.getElementById('profilePicInput').click()}>
                {profile.profilePic ? (
                  <img 
                    src={getProfileImageSrc(profile.profilePic)} 
                    alt="Profile" 
                    className="rounded-circle border border-2 border-success object-fit-cover shadow-sm"
                    style={{ width: '54px', height: '54px' }}
                  />
                ) : (
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 border border-2 border-success border-opacity-25" style={{ width: '54px', height: '54px' }}>
                    {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow" style={{ width: '20px', height: '20px', fontSize: '10px' }}>
                  <i className="bi bi-camera-fill"></i>
                </span>
              </div>

              {/* Hidden File Input */}
              <input 
                type="file" 
                id="profilePicInput" 
                className="d-none" 
                accept="image/*"
                onChange={handleProfilePicChange}
              />

              <div className="overflow-hidden">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Welcome back,</span>
                <h6 className="fw-bold text-dark text-truncate mb-0">{profile.firstName || 'Customer'} {profile.lastName}</h6>
              </div>
            </div>

            {/* Desktop Sidebar & Mobile Horizontal Scrollable Nav */}
            <div className="profile-nav-container">
              <div className="glass-panel card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div 
                  className="list-group list-group-flush flex-row flex-lg-column p-1 gap-1 gap-lg-0"
                  style={{
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    whiteSpace: 'nowrap',
                    scrollbarWidth: 'none'
                  }}
                >
                  <style>{`
                    .profile-nav-container .list-group::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  
                  <div 
                    onClick={() => navigate('/customer/orders')}
                    className="list-group-item list-group-item-action rounded-pill rounded-lg-0 d-flex justify-content-between align-items-center py-3 px-3 fw-bold text-dark text-nowrap border-0 transition-hover"
                    style={{ cursor: 'pointer' }}
                  >
                    <span><i className="bi bi-box-seam text-success me-2 me-lg-3"></i>MY ORDERS</span>
                    <i className="bi bi-chevron-right text-muted small d-none d-lg-inline"></i>
                  </div>

                  <div className="list-group-item bg-transparent text-muted fw-bold py-2 px-3 d-none d-lg-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>
                    Account Settings
                  </div>

                  <button 
                    onClick={() => setActiveSection('profile')}
                    className={`list-group-item list-group-item-action rounded-pill rounded-lg-0 py-3 px-3 border-0 fw-medium text-nowrap transition-hover ${activeSection === 'profile' ? 'text-success bg-success bg-opacity-10 fw-bold border-start-lg border-success border-4' : 'text-dark bg-transparent'}`}
                  >
                    <i className="bi bi-person-gear me-2 d-lg-none"></i>Profile Information
                  </button>

                  <button 
                    onClick={() => setActiveSection('addresses')}
                    className={`list-group-item list-group-item-action rounded-pill rounded-lg-0 py-3 px-3 border-0 fw-medium text-nowrap transition-hover ${activeSection === 'addresses' ? 'text-success bg-success bg-opacity-10 fw-bold border-start-lg border-success border-4' : 'text-dark bg-transparent'}`}
                  >
                    <i className="bi bi-geo-alt me-2 d-lg-none"></i>Manage Addresses
                  </button>

                  <div className="list-group-item bg-transparent text-muted fw-bold py-2 px-3 mt-1 d-none d-lg-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>
                    Payments
                  </div>
                  <div className="list-group-item text-muted py-3 px-3 bg-transparent small d-none d-lg-block border-0">
                    <div className="d-flex justify-content-between">
                      <span>Gift Cards</span>
                      <span className="text-success fw-bold">₹0</span>
                    </div>
                  </div>

                  <div className="list-group-item bg-transparent text-muted fw-bold py-2 px-3 mt-1 d-none d-lg-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>
                    My Stuff
                  </div>
                  <button 
                    onClick={() => setActiveSection('reviews')}
                    className={`list-group-item list-group-item-action rounded-pill rounded-lg-0 py-3 px-3 border-0 fw-medium text-start text-nowrap transition-hover ${activeSection === 'reviews' ? 'text-success bg-success bg-opacity-10 fw-bold border-start-lg border-success border-4' : 'text-dark bg-transparent'}`}
                  >
                    <i className="bi bi-star me-2 d-lg-none"></i>My Reviews & Ratings
                  </button>

                  {/* Logout Option */}
                  <div 
                    onClick={handleLogout}
                    className="list-group-item list-group-item-action rounded-pill rounded-lg-0 py-3 px-3 border-0 fw-bold text-danger text-nowrap bg-transparent transition-hover"
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-box-arrow-right me-2 me-lg-3"></i>Logout
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Right Content Panel */}
          <div className="col-lg-9">
            
            {/* SECTION 1: PROFILE INFORMATION */}
            {activeSection === 'profile' && (
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <h4 className="fw-extrabold text-dark m-0">Personal Information</h4>
                    <p className="text-muted small m-0">Manage your account details and preferences</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="btn btn-sm btn-outline-success px-4 rounded-pill fw-bold shadow-hover"
                  >
                    {isEditing ? 'Cancel' : <><i className="bi bi-pencil-square me-1"></i> Edit Profile</>}
                  </button>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        className="form-control rounded-pill px-3 py-2 bg-light border-0 shadow-none" 
                        value={profile.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        className="form-control rounded-pill px-3 py-2 bg-light border-0 shadow-none" 
                        value={profile.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold d-block">Your Gender</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="gender" 
                          id="genderMale" 
                          value="Male"
                          checked={profile.gender.toLowerCase() === 'male'}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label text-dark fw-medium" htmlFor="genderMale">Male</label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="gender" 
                          id="genderFemale" 
                          value="Female"
                          checked={profile.gender.toLowerCase() === 'female'}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label text-dark fw-medium" htmlFor="genderFemale">Female</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      className="form-control rounded-pill px-3 py-2 bg-light border-0 shadow-none" 
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Mobile Number</label>
                    <input 
                      type="text" 
                      name="mobileNumber"
                      className="form-control rounded-pill px-3 py-2 bg-light border-0 shadow-none" 
                      value={profile.mobileNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {isEditing && (
                    <button type="submit" className="btn btn-success px-5 rounded-pill fw-bold shadow-hover py-2 mt-2">
                      Save Changes
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* SECTION 2: MANAGE ADDRESSES */}
            {activeSection === 'addresses' && (
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <h4 className="fw-extrabold text-dark m-0">Manage Addresses</h4>
                    <p className="text-muted small m-0">Saved delivery locations for your orders</p>
                  </div>
                  <Link to="/customer/addresses" className="btn btn-sm btn-success px-4 rounded-pill fw-bold shadow-hover">
                    + Add New Address
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-geo display-4 d-block mb-3 text-success opacity-50"></i>
                    <h6 className="fw-bold text-dark">No saved addresses found</h6>
                    <p className="small text-muted">Add a delivery address to speed up your checkout process.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map((addr) => {
                      const addrId = addr.addressId || addr.id;
                      return (
                        <div key={addrId} className="border-0 rounded-4 p-4 bg-light position-relative shadow-sm transition-hover">
                          <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">{addr.addressType || 'HOME'}</span>
                          <h6 className="fw-bold text-dark mb-1">{addr.fullName} <span className="text-success ms-2 fw-semibold small"><i className="bi bi-telephone me-1"></i>{addr.mobileNumber}</span></h6>
                          <p className="text-muted small mb-0 lh-base">
                            {addr.fullAddress || `${addr.houseNo || ''}, ${addr.street}, ${addr.district}, ${addr.state} - ${addr.pincode}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: MY REVIEWS & RATINGS */}
            {activeSection === 'reviews' && (
              <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <h4 className="fw-extrabold text-dark m-0">My Reviews & Ratings</h4>
                    <p className="text-muted small m-0">Feedback you've shared for purchased farm products</p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-star display-4 d-block mb-3 text-warning"></i>
                    <h6 className="fw-bold text-dark">No reviews written yet</h6>
                    <p className="small text-muted">Your product ratings and reviews will appear here once you share your feedback.</p>
                    <Link to="/customer/orders" className="btn btn-outline-success btn-sm rounded-pill px-4 mt-2 fw-bold">
                      View My Orders
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {reviews.map((rev, index) => {
                      const revId = rev.reviewId || rev.id;
                      const isBeingEdited = editingReviewId === revId;
                      const productName = rev.product?.productName || rev.productName || 'Product';
                      const productImage = rev.product?.image || rev.productImage || '';

                      return (
                        <div key={revId || index} className="border-0 rounded-4 p-4 bg-light shadow-sm transition-hover">
                          <div className="d-flex gap-3 align-items-start">
                            <img 
                              src={productImage ? (productImage.startsWith('http') ? productImage : `${BASE_URL}/uploads/products/${productImage}`) : 'https://via.placeholder.com/60?text=Item'}
                              alt={productName}
                              className="rounded-3 border bg-white object-fit-cover shadow-sm"
                              style={{ width: '65px', height: '65px' }}
                            />

                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-success px-2.5 py-1 rounded-pill">
                                    <i className="bi bi-star-fill me-1"></i>
                                    {isBeingEdited ? editRating : (rev.rating || 5)} / 5
                                  </span>
                                  <span className="fw-bold text-dark">{productName}</span>
                                </div>
                                {!isBeingEdited && (
                                  <button 
                                    onClick={() => handleStartEditReview(rev)}
                                    className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-pill fw-medium"
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    <i className="bi bi-pencil me-1"></i> Edit
                                  </button>
                                )}
                              </div>

                              {isBeingEdited ? (
                                <div className="mt-3 bg-white p-3.5 rounded-4 border shadow-sm">
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Rating (1 to 5)</label>
                                    <select 
                                      className="form-select form-select-sm rounded-pill px-3"
                                      value={editRating}
                                      onChange={(e) => setEditRating(e.target.value)}
                                    >
                                      <option value="5">5 - Excellent</option>
                                      <option value="4">4 - Good</option>
                                      <option value="3">3 - Average</option>
                                      <option value="2">2 - Poor</option>
                                      <option value="1">1 - Terrible</option>
                                    </select>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Review Comment</label>
                                    <textarea 
                                      className="form-control rounded-4 p-3 border-0 bg-light shadow-none"
                                      rows="3"
                                      value={editComment}
                                      onChange={(e) => setEditComment(e.target.value)}
                                    ></textarea>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button 
                                      onClick={() => handleUpdateReview(revId)} 
                                      className="btn btn-sm btn-success px-4 rounded-pill fw-bold"
                                    >
                                      Save Review
                                    </button>
                                    <button 
                                      onClick={handleCancelEditReview} 
                                      className="btn btn-sm btn-outline-secondary px-4 rounded-pill"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-muted small mb-2">{rev.comment || rev.reviewText || 'No comment provided.'}</p>
                                  <small className="text-muted opacity-75" style={{ fontSize: '0.75rem' }}>Reviewed on {rev.date ? moment(rev.date).format("DD/MMM/YYYY") : (rev.createdAt ? moment(rev.createdAt).format("DD/MMM/YYYY") : 'Recent')}</small>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}