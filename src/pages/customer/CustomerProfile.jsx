import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, resolveProfileImageUrl } from '../../utils/formatters';

export const CustomerProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'reviews'
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: 'Male',
    profilePic: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileData, addressData, reviewData] = await Promise.allSettled([
          customerService.getProfile(),
          customerService.getAddresses(),
          customerService.getCustomerReviews(),
        ]);

        if (isMounted) {
          if (profileData.status === 'fulfilled' && profileData.value) {
            const p = profileData.value;
            setProfile({
              firstName: p.firstName || p.name?.split(' ')[0] || '',
              lastName: p.lastName || p.name?.split(' ').slice(1).join(' ') || '',
              email: p.email || '',
              mobileNumber: p.mobileNumber || p.phone || '',
              gender: p.gender || 'Male',
              profilePic: p.profilePic || p.image || '',
            });
          }

          if (addressData.status === 'fulfilled' && Array.isArray(addressData.value)) {
            setAddresses(addressData.value);
          }

          if (reviewData.status === 'fulfilled' && Array.isArray(reviewData.value)) {
            setReviews(reviewData.value);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setUploadingPic(true);
      setErrorMsg('');
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await customerService.updateProfilePhoto(formData);
      const previewUrl = URL.createObjectURL(file);

      setProfile((prev) => ({ ...prev, profilePic: previewUrl }));
      updateUser({ profilePic: previewUrl });

      setSuccessMsg(typeof response === 'string' ? response : 'Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setErrorMsg('Failed to upload profile photo. Please try again.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarUrl = resolveProfileImageUrl(profile.profilePic || user?.profilePic);

  if (loading) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted small fw-semibold">Loading your account profile...</p>
      </div>
    );
  }

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="mb-4">
        <span className="kc-section-badge mb-1">
          <i className="bi bi-person"></i> Account Portal
        </span>
        <h2 className="fw-extrabold text-dark mb-0">Customer Account Profile</h2>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 rounded-4 small py-2.5 px-3 mb-4 shadow-sm">
          <i className="bi bi-check-circle-fill me-1"></i> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger border-0 rounded-4 small py-2.5 px-3 mb-4 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Profile Card & Navigation Tabs */}
        <div className="col-lg-4">
          <div className="kc-card p-4 text-center shadow-sm mb-4">
            {/* Avatar with Upload Badge */}
            <div className="position-relative d-inline-block mx-auto mb-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="rounded-circle object-fit-cover shadow-sm"
                  style={{ width: '110px', height: '110px', border: '3.5px solid var(--kc-fresh-green)' }}
                />
              ) : (
                <div
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '110px', height: '110px', backgroundColor: 'var(--kc-forest-green)', fontSize: '2.5rem' }}
                >
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}

              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 shadow-sm border"
                style={{ width: '34px', height: '34px', padding: 0 }}
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                disabled={uploadingPic}
              >
                {uploadingPic ? (
                  <span className="spinner-border spinner-border-sm text-success" role="status"></span>
                ) : (
                  <i className="bi bi-camera-fill text-success"></i>
                )}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                onChange={handleProfilePicChange}
              />
            </div>

            <h5 className="fw-bold text-dark mb-0">
              {profile.firstName} {profile.lastName}
            </h5>
            <span className="text-muted small d-block mb-3">{profile.email}</span>

            <span className="badge kc-badge-organic text-dark mb-4">Verified Customer</span>

            {/* Quick Navigation List */}
            <div className="d-flex flex-column gap-2 text-start pt-3 border-top">
              <button
                className={`kc-btn kc-btn-sm w-100 justify-content-start ${
                  activeTab === 'profile' ? 'kc-btn-primary' : 'kc-btn-cream'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person-lines-fill me-2"></i> Account Details
              </button>

              <button
                className={`kc-btn kc-btn-sm w-100 justify-content-start ${
                  activeTab === 'addresses' ? 'kc-btn-primary' : 'kc-btn-cream'
                }`}
                onClick={() => setActiveTab('addresses')}
              >
                <i className="bi bi-geo-alt me-2"></i> Saved Addresses ({addresses.length})
              </button>

              <button
                className={`kc-btn kc-btn-sm w-100 justify-content-start ${
                  activeTab === 'reviews' ? 'kc-btn-primary' : 'kc-btn-cream'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="bi bi-star me-2"></i> My Reviews ({reviews.length})
              </button>

              <button
                className="kc-btn kc-btn-sm kc-btn-cream w-100 justify-content-start text-danger mt-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View Canvas */}
        <div className="col-lg-8">
          {/* 1. Account Details Tab */}
          {activeTab === 'profile' && (
            <div className="kc-card p-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom">Personal Information</h5>
              <div className="row g-4">
                <div className="col-sm-6">
                  <label className="kc-label small text-muted">First Name</label>
                  <strong className="d-block text-dark fs-6">{profile.firstName || 'Not specified'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="kc-label small text-muted">Last Name</label>
                  <strong className="d-block text-dark fs-6">{profile.lastName || 'Not specified'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="kc-label small text-muted">Email Address</label>
                  <strong className="d-block text-dark fs-6">{profile.email || 'Not specified'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="kc-label small text-muted">Mobile Phone</label>
                  <strong className="d-block text-dark fs-6">{profile.mobileNumber || 'Not specified'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="kc-label small text-muted">Gender</label>
                  <strong className="d-block text-dark fs-6">{profile.gender || 'Not specified'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="kc-label small text-muted">Account Classification</label>
                  <span className="badge kc-badge-organic text-dark">CUSTOMER</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="kc-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h5 className="fw-bold text-dark mb-0">Saved Delivery Addresses</h5>
                <button
                  type="button"
                  className="kc-btn kc-btn-primary kc-btn-sm"
                  onClick={() => navigate('/customer/addresses')}
                >
                  Manage Addresses
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {addresses.map((addr) => (
                    <div key={addr.addressId || addr.id} className="p-3 rounded-4 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{addr.fullName}</strong>
                        <span className="badge kc-badge-cream">{addr.addressType || 'HOME'}</span>
                      </div>
                      <p className="text-muted small mb-1">
                        {addr.houseNo}, {addr.street}, {addr.village}, {addr.district || ''}, {addr.state} - {addr.pincode}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-telephone text-success me-1"></i> {addr.mobileNumber}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">No saved addresses found.</div>
              )}
            </div>
          )}

          {/* 3. Customer Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="kc-card p-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom">My Harvest Reviews</h5>

              {reviews.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev, idx) => (
                    <div key={rev.id || rev.reviewId || idx} className="p-3 rounded-4 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-dark">{rev.productName || 'Harvest Item'}</strong>
                        <div className="kc-stars small">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i
                              key={i}
                              className={`bi ${i < (rev.rating || 5) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-muted small mb-1">{rev.comment || rev.review || 'Great quality.'}</p>
                      {rev.createdAt && (
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {formatDate(rev.createdAt)}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  You haven't submitted any product reviews yet. Reviews can be submitted from your order details page!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
