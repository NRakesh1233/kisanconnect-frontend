import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../../services/farmerService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, resolveProfileImageUrl } from '../../utils/formatters';

export const FarmerProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    profilePic: '',
    location: '',
    experience: '',
    farmSize: '',
    gender: 'Male',
    bio: '',
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileData, reviewsData] = await Promise.allSettled([
          farmerService.loadUserProfile(),
          farmerService.loadReviews(),
        ]);

        if (isMounted) {
          if (profileData.status === 'fulfilled' && profileData.value) {
            const p = profileData.value;
            setProfile({
              firstName: p.firstName || p.name?.split(' ')[0] || user?.name?.split(' ')[0] || '',
              lastName: p.lastName || p.name?.split(' ').slice(1).join(' ') || '',
              email: p.email || user?.email || '',
              mobileNumber: p.mobileNumber || p.phone || '',
              profilePic: p.profilePic || p.image || user?.profilePic || '',
              location: p.location || p.address || 'India',
              experience: p.experience || '8+ Years',
              farmSize: p.farmSize || '5 Acres',
              gender: p.gender || 'Male',
              bio: p.bio || 'Dedicated to organic farming practices and sustainable crop rotation.',
            });
          }

          if (reviewsData.status === 'fulfilled' && Array.isArray(reviewsData.value)) {
            setReviews(reviewsData.value);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer profile details:', err);
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
      setErrorNotice('');
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await farmerService.updateFarmerProfile(formData);
      const previewUrl = URL.createObjectURL(file);

      setProfile((prev) => ({ ...prev, profilePic: previewUrl }));
      updateUser({ profilePic: previewUrl });

      setSuccessNotice(
        typeof response === 'string' ? response : 'Profile photo updated successfully!'
      );
      setTimeout(() => setSuccessNotice(''), 4000);
    } catch (err) {
      console.error('Failed to upload farmer profile picture:', err);
      setErrorNotice('Failed to update profile photo. Please try again.');
    } finally {
      setUploadingPic(false);
    }
  };

  const profileImg = resolveProfileImageUrl(profile.profilePic || user?.profilePic);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted small fw-semibold">Loading farmer credentials...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* ========================================================
          1. FARMER PROFILE HERO BANNER
          ======================================================== */}
      <section
        className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, rgba(22, 61, 43, 0.95) 0%, rgba(30, 80, 56, 0.9) 100%), url('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(22, 61, 43, 0.15)',
        }}
      >
        <div className="row align-items-center g-4 position-relative z-1">
          <div className="col-auto">
            <div className="position-relative d-inline-block">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={profile.firstName}
                  className="rounded-circle object-fit-cover shadow-lg"
                  style={{ width: '96px', height: '96px', border: '3px solid var(--kc-fresh-green)' }}
                />
              ) : (
                <div
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-lg"
                  style={{ width: '96px', height: '96px', backgroundColor: 'var(--kc-fresh-green)', fontSize: '2rem' }}
                >
                  {(profile.firstName || 'F').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera Trigger */}
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 p-1.5 shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                title="Update Profile Photo"
                style={{ width: '32px', height: '32px' }}
              >
                {uploadingPic ? (
                  <span className="spinner-border spinner-border-sm text-success" role="status"></span>
                ) : (
                  <i className="bi bi-camera text-success fs-7"></i>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleProfilePicChange}
              />
            </div>
          </div>

          <div className="col">
            <span className="badge kc-badge-organic text-dark mb-2">
              <i className="bi bi-patch-check-fill me-1"></i> Verified Producer
            </span>
            <h2 className="fw-extrabold text-white mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-white-50 small mb-2">
              <i className="bi bi-geo-alt text-success me-1"></i> {profile.location} &bull;{' '}
              <i className="bi bi-award text-warning me-1"></i> {profile.experience} Growing Experience
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/dashboard/products" className="kc-btn kc-btn-fresh kc-btn-sm">
                <i className="bi bi-box-seam me-1"></i> View Harvests
              </Link>
              <Link to="/dashboard/earnings" className="kc-btn kc-btn-white kc-btn-sm text-success">
                <i className="bi bi-wallet2 me-1"></i> Earnings Breakdown
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {successNotice && (
        <div
          className="alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: 'var(--kc-fresh-green-subtle)', color: 'var(--kc-fresh-green)' }}
        >
          <i className="bi bi-check-circle-fill fs-5"></i>
          <span className="fw-semibold">{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div
          className="alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: 'var(--kc-crimson-red-subtle)', color: 'var(--kc-crimson-red)' }}
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Profile Navigation Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          type="button"
          className={`kc-btn kc-btn-sm ${activeTab === 'details' ? 'kc-btn-primary' : 'kc-btn-cream text-dark'}`}
          onClick={() => setActiveTab('details')}
        >
          <i className="bi bi-person me-1"></i> Account Details
        </button>
        <button
          type="button"
          className={`kc-btn kc-btn-sm ${activeTab === 'reviews' ? 'kc-btn-primary' : 'kc-btn-cream text-dark'}`}
          onClick={() => setActiveTab('reviews')}
        >
          <i className="bi bi-star me-1"></i> Customer Reviews ({reviews.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'details' ? (
        <div className="row g-4 mb-5">
          {/* Left: Farm Credentials */}
          <div className="col-lg-8">
            <div className="kc-card p-4 shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">Farm Stewardship Profile</h4>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="text-muted small d-block">Full Legal Name</label>
                  <strong className="text-dark fs-6">
                    {profile.firstName} {profile.lastName || ''}
                  </strong>
                </div>

                <div className="col-sm-6">
                  <label className="text-muted small d-block">Registered Email</label>
                  <strong className="text-dark fs-6">{profile.email || '—'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="text-muted small d-block">Direct Contact Number</label>
                  <strong className="text-dark fs-6">{profile.mobileNumber || '—'}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="text-muted small d-block">Gender</label>
                  <strong className="text-dark fs-6">{profile.gender}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="text-muted small d-block">Farm Location / Region</label>
                  <strong className="text-dark fs-6">{profile.location}</strong>
                </div>

                <div className="col-sm-6">
                  <label className="text-muted small d-block">Cultivation Area</label>
                  <strong className="text-dark fs-6">{profile.farmSize}</strong>
                </div>

                <div className="col-12">
                  <label className="text-muted small d-block">Farming Philosophy & Bio</label>
                  <p className="text-secondary small mb-0">{profile.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Assurance & Security */}
          <div className="col-lg-4">
            <div className="kc-card p-4 shadow-sm mb-4">
              <h5 className="fw-bold text-dark mb-3">Verified Partner Badge</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-success"
                  style={{ width: '48px', height: '48px', backgroundColor: 'var(--kc-fresh-green-subtle)' }}
                >
                  <i className="bi bi-shield-check fs-4"></i>
                </div>
                <div>
                  <strong className="text-dark d-block">Active Certification</strong>
                  <span className="text-muted small">KisanConnect Agricultural Trust</span>
                </div>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                Your produce undergoes periodic cold-chain audit and soil quality verifications to maintain buyer trust.
              </p>
            </div>

            <div className="kc-card p-4 shadow-sm text-center">
              <button
                type="button"
                onClick={logout}
                className="btn btn-outline-danger w-100 rounded-pill fw-semibold py-2"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sign Out of Farmer Cockpit
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* REVIEWS TAB */
        <div className="kc-card p-4 shadow-sm mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">Customer Reviews & Ratings</h4>
              <p className="text-muted small mb-0">
                Direct buyer feedback on your harvests across India.
              </p>
            </div>
            <span className="badge kc-badge-organic text-dark">{reviews.length} Total Reviews</span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-chat-heart text-muted display-5 d-block mb-2"></i>
              <h6 className="fw-bold text-dark">No customer reviews yet</h6>
              <p className="text-muted small mb-0">Customer feedback on dispatched orders will appear here.</p>
            </div>
          ) : (
            <div className="row g-3">
              {reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="col-md-6">
                  <div className="p-3.5 rounded-4 border h-100" style={{ backgroundColor: 'var(--kc-cream)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-dark">
                        {rev.customerName || rev.customerDetails?.name || 'Verified Buyer'}
                      </strong>
                      <div className="kc-stars small text-warning">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i
                            key={i}
                            className={`bi ${i < (rev.rating || 5) ? 'bi-star-fill' : 'bi-star'}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted small mb-2">{rev.comment || rev.review || 'Excellent fresh produce.'}</p>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                      <span>{rev.productName ? `Harvest: ${rev.productName}` : 'Produce Order'}</span>
                      {rev.createdAt && <span>{formatDate(rev.createdAt)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerProfile;
