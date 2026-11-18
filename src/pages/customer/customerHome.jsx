import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import productService from '../../services/productService';
import farmerService from '../../services/farmerService';
import { resolveProfileImageUrl } from '../../utils/formatters';

export const CustomerHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, farmerRes] = await Promise.allSettled([
          productService.getTop4Products(),
          farmerService.getAllFarmers(),
        ]);

        if (isMounted) {
          if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
            setFeaturedProducts(prodRes.value.slice(0, 4));
          }
          if (farmerRes.status === 'fulfilled' && Array.isArray(farmerRes.value)) {
            setFarmers(farmerRes.value.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load customer home dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="kc-container py-3">
      {/* ========================================================
          1. HERO BANNER
          ======================================================== */}
      <section
        className="rounded-4 p-4 p-md-5 mb-5 position-relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, rgba(22, 61, 43, 0.94) 0%, rgba(30, 80, 56, 0.88) 100%), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 12px 32px rgba(22, 61, 43, 0.15)',
        }}
      >
        <div className="row align-items-center g-4 position-relative z-1">
          <div className="col-lg-8">
            <span className="badge kc-badge-organic mb-3">
              <i className="bi bi-patch-check-fill"></i> Fresh Morning Harvests Available
            </span>
            <h1 className="display-6 fw-extrabold text-white mb-3">
              Direct from Soil to Your Kitchen.
            </h1>
            <p className="lead fs-6 text-white-50 mb-4" style={{ maxWidth: '600px' }}>
              Pesticide-free seasonal vegetables, naturally ripened fruits, and whole grains straight from verified Indian farmers.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/customer/products" className="kc-btn kc-btn-fresh kc-btn-lg">
                <span>Shop Marketplace</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/customer/farmers" className="kc-btn kc-btn-white kc-btn-lg">
                <i className="bi bi-people text-success"></i> Meet Local Farmers
              </Link>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block text-end">
            <div
              className="p-4 rounded-4 text-start d-inline-block"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                maxWidth: '280px',
              }}
            >
              <span className="kc-stars small d-block mb-1">
                <i className="bi bi-star-fill text-warning"></i> 4.9 Direct Rating
              </span>
              <p className="small text-white mb-2">
                "Pure crisp sweetness in every bite. Zero middleman markup."
              </p>
              <span className="text-white-50 small d-block" style={{ fontSize: '0.75rem' }}>
                Verified Family Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SEASONAL HIGHLIGHTS (Featured Products)
          ======================================================== */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span className="kc-section-badge mb-1">
              <i className="bi bi-stars"></i> Curated Today
            </span>
            <h3 className="fw-extrabold text-dark mb-0">Featured Seasonal Harvests</h3>
          </div>
          <Link to="/customer/products" className="kc-btn kc-btn-outline kc-btn-sm">
            <span>View All</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="col-6 col-lg-3">
                <div className="kc-card p-3 placeholder-glow" style={{ height: '320px' }}>
                  <div className="placeholder w-100 rounded-3 mb-3" style={{ height: '180px' }}></div>
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="row g-4">
            {featuredProducts.map((prod) => (
              <div key={prod.productId || prod.id} className="col-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        ) : (
          <div className="kc-card p-5 text-center">
            <p className="text-muted mb-0">No featured products currently in stock.</p>
          </div>
        )}
      </section>

      {/* ========================================================
          3. VERIFIED GROWERS PREVIEW
          ======================================================== */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span className="kc-section-badge mb-1">
              <i className="bi bi-shield-check"></i> Local Partners
            </span>
            <h3 className="fw-extrabold text-dark mb-0">Our Registered Farmers</h3>
          </div>
          <Link to="/customer/farmers" className="kc-btn kc-btn-outline kc-btn-sm">
            <span>Meet All Farmers</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <div className="row g-4">
          {farmers.map((farmer) => {
            const fid = farmer.id || farmer.farmerId;
            const avatar = resolveProfileImageUrl(farmer.profilePic || farmer.image);

            return (
              <div key={fid} className="col-md-4">
                <div className="kc-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={farmer.name}
                        className="rounded-circle object-fit-cover shadow-sm"
                        style={{ width: '56px', height: '56px', border: '2px solid var(--kc-fresh-green)' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '56px', height: '56px', backgroundColor: 'var(--kc-fresh-green)' }}
                      >
                        {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{farmer.name || 'Local Farmer'}</h5>
                      <span className="text-muted small">
                        <i className="bi bi-geo-alt text-success me-1"></i>
                        {farmer.village || farmer.district || farmer.location || 'Local Farm'}
                      </span>
                    </div>
                  </div>

                  <p className="small text-muted mb-4 flex-grow-1">
                    Dedicated to pesticide-free crop rotation and honest farm-to-table direct distribution.
                  </p>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="badge kc-badge-organic">
                      <i className="bi bi-check-circle-fill"></i> Certified Grower
                    </span>
                    <Link
                      to={`/customer/products/farmer/${fid}`}
                      className="kc-btn kc-btn-sm kc-btn-cream text-decoration-none"
                    >
                      Storefront <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
