import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../../services/farmerService';
import productService from '../../services/productService';
import { resolveProfileImageUrl } from '../../utils/formatters';
import gsap from 'gsap';

export const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gridRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFarmersData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await farmerService.getAllFarmers();
        const farmersList = Array.isArray(data) ? data : [];

        if (isMounted) {
          setFarmers(farmersList);
        }

        // Fetch actual active product counts for each farmer concurrently
        const counts = {};
        await Promise.all(
          farmersList.map(async (farmer) => {
            const fid = farmer.id || farmer.farmerId;
            if (fid) {
              try {
                const prods = await productService.getProductsByFarmer(fid);
                counts[fid] = Array.isArray(prods) ? prods.length : 0;
              } catch {
                counts[fid] = 0;
              }
            }
          })
        );

        if (isMounted) {
          setProductCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load farmers list:', err);
        if (isMounted) setError('Could not load registered farmers at this moment.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFarmersData();
    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Stagger Entrance Animation
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || loading || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.kc-farmer-grid-item');
    if (cards.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, [loading, farmers]);

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="mb-5">
        <span className="kc-section-badge mb-1">
          <i className="bi bi-people"></i> Agricultural Stewards
        </span>
        <h2 className="fw-extrabold text-dark mb-1">Our Verified Farmers</h2>
        <p className="text-muted small mb-0">
          Connect directly with dedicated growers producing chemical-free, nutrient-rich harvests across India.
        </p>
      </div>

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="col-md-6 col-lg-4">
              <div className="kc-card p-4 placeholder-glow" style={{ height: '220px' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="placeholder rounded-circle" style={{ width: '60px', height: '60px' }}></div>
                  <div className="flex-grow-1">
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-5"></div>
                  </div>
                </div>
                <div className="placeholder col-12 mb-2"></div>
                <div className="placeholder col-9"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="kc-card p-5 text-center">
          <i className="bi bi-exclamation-triangle text-danger display-5 d-block mb-3"></i>
          <h5 className="fw-bold text-dark">{error}</h5>
          <button onClick={() => window.location.reload()} className="kc-btn kc-btn-outline kc-btn-sm mt-3">
            Retry Connection
          </button>
        </div>
      ) : farmers.length > 0 ? (
        <div className="row g-4" ref={gridRef}>
          {farmers.map((farmer) => {
            const fid = farmer.id || farmer.farmerId;
            const avatar = resolveProfileImageUrl(farmer.profilePic || farmer.image);
            const count = productCounts[fid] !== undefined ? productCounts[fid] : 0;

            return (
              <div key={fid} className="col-md-6 col-lg-4 kc-farmer-grid-item">
                <div className="kc-card p-4 h-100 d-flex flex-column shadow-sm">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={farmer.name}
                        className="rounded-circle object-fit-cover shadow-sm"
                        style={{ width: '64px', height: '64px', border: '2.5px solid var(--kc-fresh-green)' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://ui-avatars.com/api/?name=Farmer&background=EBF4ED&color=163D2B';
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '64px', height: '64px', backgroundColor: 'var(--kc-forest-green)', fontSize: '1.4rem' }}
                      >
                        {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h5 className="fw-bold text-dark mb-0 text-truncate">{farmer.name || 'Local Farmer'}</h5>
                      <span className="text-muted small d-block text-truncate">
                        <i className="bi bi-geo-alt text-success me-1"></i>
                        {farmer.village || farmer.district || farmer.location || 'Local Farm'}
                      </span>
                      {farmer.rating && (
                        <div className="d-flex align-items-center gap-1 mt-1 small">
                          <span className="kc-stars"><i className="bi bi-star-fill text-warning"></i></span>
                          <span className="fw-bold">{Number(farmer.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--kc-cream)' }}>
                    <span className="small text-muted">Active Harvests:</span>
                    <strong className="text-success">{count} {count === 1 ? 'Produce' : 'Produces'}</strong>
                  </div>

                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="badge kc-badge-organic small">Verified Farmer</span>
                    <Link
                      to={`/customer/products/farmer/${fid}`}
                      className="kc-btn kc-btn-sm kc-btn-primary text-decoration-none"
                    >
                      <span>Visit Storefront</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="kc-card p-5 text-center">
          <p className="text-muted mb-0">No farmers currently registered in directory.</p>
        </div>
      )}
    </div>
  );
};

export default Farmers;
