import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import api from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CustomerHome.css'; // Dedicated stylesheet for glassmorphism & Dribbble styles

export default function CustomerHome() {
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch products and farmers concurrently
        const [prodRes, farmerRes] = await Promise.allSettled([
          api.get('/public/products/top4'),
          api.get('/public/user/farmers/all')
        ]);

        if (prodRes.status === 'fulfilled') {
          setFeaturedProducts(prodRes.value.data?.slice(0, 4) || []);
        }
        if (farmerRes.status === 'fulfilled') {
          setFarmers(farmerRes.value.data?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Failed to load home dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);



  return (
    <div className="min-vh-100 d-flex flex-column customer-home-wrapper" style={{ marginTop: '80px' }}>
      {/* Navbar Integration */}
      <CustomerNavbar cartCount={totalItemsCount} />

      {/* Hero Section with Glassmorphism & Animated Glow */}
      <section className="hero-section position-relative overflow-hidden py-5 px-3 px-lg-5 mb-5">
        <div className="hero-glow-blob blob-1"></div>
        <div className="hero-glow-blob blob-2"></div>

        <div className="container position-relative z-index-1 py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-center text-lg-start">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-success bg-opacity-10 text-success fw-semibold mb-3 animate-fade-in">
                <i className="bi bi-stars"></i> Direct From Farm to Your Table
              </div>
              <h1 className="display-4 fw-extrabold text-dark mb-4 lh-base">
                Fresh Organic Produce From <span className="text-gradient-success">Local Farmers</span>
              </h1>
              <p className="lead text-muted mb-4">
                Explore a wide range of pesticide-free grains, seasonal vegetables, and farm-fresh fruits. Support local agricultural communities while eating healthy.
              </p>
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                <Link to="/customer/products" className="btn btn-success btn-lg rounded-pill px-4 fw-bold shadow-hover">
                  Explore Products <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/customer/farmers" className="btn btn-outline-dark btn-lg rounded-pill px-4 fw-semibold glass-btn">
                  Meet Our Farmers
                </Link>
              </div>

              {/* Quick Trust Metrics */}
              <div className="row mt-5 pt-3 g-4 text-start border-top border-light">
                <div className="col-4">
                  <h3 className="fw-bold text-success mb-0">100%</h3>
                  <p className="text-muted small mb-0">Organic & Natural</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold text-success mb-0">50+</h3>
                  <p className="text-muted small mb-0">Verified Farmers</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold text-success mb-0">24/7</h3>
                  <p className="text-muted small mb-0">Direct Support</p>
                </div>
              </div>
            </div>

            {/* Dribbble Style Floating Glass Feature Card */}
            <div className="col-lg-5">
              <div className="hero-glass-card p-4 rounded-4 shadow-lg position-relative float-animation">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-basket2-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Harvest of the Day</h6>
                    <small className="text-muted">Freshly harvested this morning</small>
                  </div>
                </div>
                <div className="bg-light rounded-3 p-3 mb-3 text-center position-relative overflow-hidden">
                  <div className="badge bg-danger position-absolute top-0 end-0 m-2">Best Seller</div>
                  <i className="bi bi-tree-fill display-1 text-success opacity-75 py-3"></i>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">Organic Tomatoes</span>
                    <h5 className="fw-bold text-success mb-0">₹40 / kg</h5>
                  </div>
                  <Link to="/customer/products" className="btn btn-sm btn-dark rounded-pill px-3">
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="container flex-grow-1 pb-5" style={{ maxWidth: '1200px' }}>
        
        {/* Category Shortcut Pills */}
        <div className="row mb-5 text-center g-3">
          {['All Products', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Dairy & Honey'].map((cat, idx) => (
            <div className="col-6 col-md-4 col-lg-2 mx-auto" key={idx}>
              <div className="glass-category-card p-3 rounded-4 shadow-sm h-100 cursor-pointer transition-hover">
                <i className={`bi ${idx === 0 ? 'bi-grid-fill' : idx === 1 ? 'bi-flower1' : idx === 2 ? 'bi-apple' : idx === 3 ? 'bi-box-seam' : 'bi-cup-hot'} fs-3 text-success mb-2 d-block`}></i>
                <span className="fw-semibold text-dark small">{cat}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Products Section */}
    <section className="mb-5">
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 className="fw-extrabold text-dark m-0">Featured Fresh Products</h3>
      <p className="text-muted small m-0">Handpicked items directly from verified organic farmers</p>
    </div>
    <Link to="/customer/products" className="text-success fw-bold text-decoration-none hover-link">
      View All <i className="bi bi-arrow-right"></i>
    </Link>
  </div>

  <div className="row g-4">
    {loading ? (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    ) : featuredProducts.length === 0 ? (
      <div className="text-center py-5 text-muted glass-card rounded-4 p-4">
        <p className="mb-0">No featured products available at the moment.</p>
      </div>
    ) : (
      featuredProducts.map((product) => (
        /* Added col-6 for mobile 2-column layout and col-lg-3 for desktop 4-column layout */
        <div key={product.id} className="col-6 col-md-4 col-lg-3 mb-4">
          <ProductCard product={product} />
        </div>
      ))
    )}
  </div>
</section>

        {/* Meet Our Farmers Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-extrabold text-dark m-0">Meet Our Local Farmers</h3>
              <p className="text-muted small m-0">The hardworking hands behind your healthy food</p>
            </div>
            <Link to="/customer/farmers" className="text-success fw-bold text-decoration-none hover-link">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {farmers.length === 0 ? (
              <div className="text-center py-4 text-muted glass-card rounded-4 p-4 col-12">
                <p className="mb-0">Farmers profiles loading...</p>
              </div>
            ) : (
              farmers.map((farmer, idx) => (
                <div className="col-md-4" key={farmer.id || idx}>
                  <div className="glass-farmer-card rounded-4 p-4 text-center shadow-sm h-100">
                    <img 
                      src={farmer.profilePic ?farmer.profilePic : 'https://via.placeholder.com/90?text=Farmer'} 
                      alt={farmer.name} 
                      className="rounded-circle border border-3 border-success shadow-sm mb-3 object-fit-cover"
                      style={{ width: '90px', height: '90px' }}
                    />
                    <h5 className="fw-bold text-dark mb-1">{farmer.name || 'Local Farmer'}</h5>
                    <p className="text-muted small mb-2"><i className="bi bi-geo-alt-fill text-success me-1"></i>{farmer.location || 'Kurnool District'}</p>
                    <div className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill mb-3">
                      <i className="bi bi-patch-check-fill me-1"></i> Verified Producer
                    </div>
                    <Link to="/customer/farmers" className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold">
                      View Farm Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Promotional Dribbble Style Banner */}
        <section className="promo-banner-card rounded-4 p-5 text-white position-relative overflow-hidden shadow-lg mb-4">
          <div className="position-relative z-index-1 max-w-500">
            <span className="badge bg-light text-success fw-bold mb-3 px-3 py-2 rounded-pill">Special Initiative</span>
            <h2 className="fw-extrabold mb-3">Empowering Local Agriculture Together</h2>
            <p className="lead mb-4 opacity-75">Every purchase you make goes directly toward supporting sustainable farming practices and fair wages for local rural growers.</p>
            <Link to="/customer/products" className="btn btn-light text-success fw-bold px-4 py-2 rounded-pill shadow">
              Start Shopping Now
            </Link>
          </div>
        </section>

      </main>

      {/* Footer Integration */}
      <CustomerFooter />
    </div>
  );
}