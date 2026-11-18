import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import farmerService from '../../services/farmerService';
import { resolveProfileImageUrl } from '../../utils/formatters';

export const FarmerStorefront = () => {
  const { fid } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [farmerData, productsData] = await Promise.allSettled([
          farmerService.getFarmerById(fid),
          farmerService.getProductsByFarmer(fid),
        ]);

        if (isMounted) {
          if (farmerData.status === 'fulfilled' && farmerData.value) {
            setFarmer(farmerData.value);
          } else {
            setError('Farmer storefront could not be located.');
          }

          if (productsData.status === 'fulfilled' && Array.isArray(productsData.value)) {
            setProducts(productsData.value);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer storefront:', err);
        if (isMounted) setError('Could not load farmer storefront.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStorefrontData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [fid]);

  if (loading) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Visiting farm fields...</span>
        </div>
        <p className="mt-3 text-muted small fw-semibold">Loading farm storefront...</p>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="kc-card p-5 d-inline-block shadow-sm" style={{ maxWidth: '480px' }}>
          <i className="bi bi-person-x text-muted display-4 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark mb-2">Storefront Not Found</h4>
          <p className="text-muted small mb-4">{error || 'Could not retrieve farmer profile.'}</p>
          <Link to="/customer/farmers" className="kc-btn kc-btn-primary kc-btn-sm">
            View All Farmers
          </Link>
        </div>
      </div>
    );
  }

  const {
    name = 'Local Farmer',
    profilePic,
    image,
    bio = 'Committed to organic, chemical-free agricultural stewardship.',
    village,
    district,
    state,
    location = 'Local Agricultural Region',
    rating = 4.9,
  } = farmer;

  const avatar = resolveProfileImageUrl(profilePic || image);
  const locationDisplay = village || district ? `${village || ''}, ${district || ''}, ${state || ''}`.replace(/^, |, $/g, '') : location;

  return (
    <div className="kc-container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link to="/customer/home" className="text-muted text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/customer/farmers" className="text-muted text-decoration-none">Farmers</Link>
          </li>
          <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
            {name}
          </li>
        </ol>
      </nav>

      {/* Farmer Hero Profile Banner */}
      <div
        className="rounded-4 p-4 p-md-5 mb-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: `linear-gradient(135deg, rgba(22, 61, 43, 0.95) 0%, rgba(30, 80, 56, 0.9) 100%), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="row align-items-center g-4 position-relative z-1">
          <div className="col-auto">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="rounded-circle object-fit-cover shadow-lg"
                style={{ width: '100px', height: '100px', border: '3.5px solid var(--kc-white)' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=Farmer&background=EBF4ED&color=163D2B';
                }}
              />
            ) : (
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-lg"
                style={{ width: '100px', height: '100px', backgroundColor: 'var(--kc-fresh-green)', fontSize: '2.4rem' }}
              >
                {name ? name.charAt(0).toUpperCase() : 'F'}
              </div>
            )}
          </div>

          <div className="col">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h2 className="fw-extrabold text-white mb-0">{name}</h2>
              <span className="badge kc-badge-organic small">
                <i className="bi bi-patch-check-fill me-1"></i> Certified Producer
              </span>
            </div>

            <p className="text-white-50 small mb-2">
              <i className="bi bi-geo-alt-fill text-success me-1"></i> {locationDisplay}
            </p>

            <p className="lead fs-6 text-white-50 mb-0" style={{ maxWidth: '640px' }}>
              {bio}
            </p>
          </div>

          <div className="col-lg-auto text-lg-end">
            <div
              className="p-3 rounded-3 d-inline-block text-start"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)' }}
            >
              <div className="small text-white-50 mb-1">Store Rating</div>
              <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5">
                <i className="bi bi-star-fill"></i>
                <span className="text-white">{Number(rating).toFixed(1)}</span>
                <span className="text-white-50 fs-6">/5.0</span>
              </div>
              <small className="text-white-50 d-block mt-1">{products.length} Active Harvests</small>
            </div>
          </div>
        </div>
      </div>

      {/* Available Harvests Section */}
      <div className="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <span className="kc-section-badge mb-1">Fresh Batches</span>
          <h3 className="fw-extrabold text-dark mb-0">Harvests by {name}</h3>
        </div>
        <span className="text-muted small">{products.length} items available</span>
      </div>

      {products.length > 0 ? (
        <div className="row g-4">
          {products.map((prod) => (
            <div key={prod.productId || prod.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      ) : (
        <div className="kc-card p-5 text-center">
          <i className="bi bi-basket text-muted display-4 d-block mb-3 opacity-50"></i>
          <h5 className="fw-bold text-dark">No Active Harvests Listed</h5>
          <p className="text-muted small">This farmer currently has no produce in stock. Please check back soon.</p>
        </div>
      )}
    </div>
  );
};

export default FarmerStorefront;
