import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import ProductCard from '../../components/customer/ProductCard';
import { productService } from '../../services/productService';
import { farmerService } from '../../services/farmerService';
import { useCart } from '../../context/CartContext';


const BASE_URL = "http://localhost:8080";

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
        const [productsRes, farmersRes] = await Promise.all([
          productService.getAllProducts ? productService.getAllProducts() : productService.getProductsByFarmer ? productService.getAllProducts() : [],
          farmerService.getAllFarmers().catch(() => [])
        ]);

        // Fallback or slice top items
        const prods = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
        setFeaturedProducts(prods.slice(0, 4));

        const fams = Array.isArray(farmersRes) ? farmersRes : (farmersRes.data || []);
        setFarmers(fams.slice(0, 3));
      } catch (err) {
        console.warn('Failed to load home dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

const categories = [
    { name: 'Vegetables', icon: 'bi-tree', query: 'Vegetables', bg: 'bg-success bg-opacity-15 text-success' },
    { name: 'Fruits', icon: 'bi-apple', query: 'Fruits', bg: 'bg-warning bg-opacity-15 text-warning' },
    { name: 'Grains & Pulses', icon: 'bi-layers', query: 'Grains', bg: 'bg-info bg-opacity-15 text-info' },
    { name: 'Organic Dairy', icon: 'bi-cup-straw', query: 'Dairy', bg: 'bg-primary bg-opacity-15 text-primary' }
  ];

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return 'https://via.placeholder.com/80?text=Farmer';
    if (imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{marginTop:"130px"}}>
      <CustomerNavbar cartCount={totalItemsCount} />

      {/* Hero Section */}
      <section className="bg-success text-white py-5 mb-5 shadow-sm rounded-4 container">
        <div className="row align-items-center py-4 px-3">
          <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
            <span className="badge bg-white text-success px-3 py-2 rounded-pill fw-bold mb-3">
              <i className="bi bi-shield-check me-1"></i> 100% Direct From Local Farms
            </span>
            <h1 className="display-4 fw-bold mb-3">Fresh Harvests Straight to Your Doorstep</h1>
            <p className="lead mb-4 text-white-50">
              Support local growers, explore chemical-free organic produce, and enjoy transparent pricing without middlemen.
            </p>
            <div className="d-flex justify-content-center justify-content-lg-start gap-3">
              <Link to="/customer/products" className="btn btn-light text-success btn-lg px-4 fw-bold shadow-sm">
                Browse Catalog <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <Link to="/customer/farmers" className="btn btn-outline-light btn-lg px-4 fw-bold">
                Meet Farmers
              </Link>
            </div>
          </div>
          <div className="col-lg-5 text-center">
            <div className="p-4 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-25 shadow-lg">
              <i className="bi bi-tree display-1 text-light mb-2 d-block"></i>
              <h3 className="fw-bold mb-1">KisanConnect Ecosystem</h3>
              <p className="text-white-50 fs-7 mb-0">Empowering farmers and nourishing communities with wholesome produce.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container flex-grow-1 pb-5">
        {/* Categories Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-grid text-success me-2"></i>Explore Categories
            </h3>
            <Link to="/customer/products" className="text-success fw-bold text-decoration-none fs-7">
              View All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-md-4 g-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="col">
                <div
                  onClick={() => navigate(`/customer/products?category=${cat.query}`)}
                  className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100 cursor-pointer hover-shadow transition-all"
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center fs-3`} style={{ width: '60px', height: '60px' }}>
                    <i className={`bi ${cat.icon} text-success`}></i>
                  </div>
                  <h6 className="fw-bold text-dark mb-0">{cat.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">
                <i className="bi bi-basket text-success me-2"></i>Fresh Harvests Available Now
              </h3>
              <p className="text-muted fs-7 mb-0">Handpicked organic produce harvested directly by verified farmers.</p>
            </div>
            <Link to="/customer/products" className="btn btn-outline-success btn-sm rounded-pill px-3">
              View All Products
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-4 rounded-4 bg-white">
              <p className="text-muted mb-0">No featured products currently available.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
              {featuredProducts.map((prod) => (
                <div key={prod.productId || prod.id} className="col">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Meet Our Farmers Preview */}
        <section className="mb-5 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">
                <i className="bi bi-people text-success me-2"></i>Meet Our Dedicated Farmers
              </h3>
              <p className="text-muted fs-7 mb-0">Get to know the hardworking growers behind your food.</p>
            </div>
            <Link to="/customer/farmers" className="btn btn-outline-success btn-sm rounded-pill px-3">
              Explore All Farmers
            </Link>
          </div>

          {farmers.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-4 rounded-4 bg-white">
              <p className="text-muted mb-0">Farmer profiles loading...</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {farmers.map((farmer) => {
                const farmerId = farmer.id || farmer.farmerId;
                const farmerName = farmer.name || 'Local Farmer';
                const rating = farmer.rating ? Number(farmer.rating).toFixed(1) : '4.8';

                return (
                  <div key={farmerId} className="col">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center d-flex flex-column">
                      <div className="mx-auto mb-3">
                        <img
                          src={getProfileImageSrc(farmer.profilePic)}
                          alt={farmerName}
                          className="rounded-circle object-fit-cover border shadow-sm"
                          style={{ width: '80px', height: '80px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80?text=Farmer';
                          }}
                        />
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{farmerName}</h5>
                      <span className="text-warning fs-8 mb-2">
                        <i className="bi bi-star-fill me-1"></i> {rating} / 5.0
                      </span>
                      <p className="text-muted fs-8 mb-4 flex-grow-1">
                        {farmer.bio || 'Dedicated to organic and sustainable agricultural practices.'}
                      </p>
                      <Link
                         to={`/customer/products/farmer/${farmer.Id}`}
                        className="btn btn-outline-success btn-sm rounded-pill"
                      >
                        View Their Harvest <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Why Choose KisanConnect Banner */}
        <section className="card border-0 shadow-sm rounded-4 bg-white p-5 text-center my-5">
          <h3 className="fw-bold text-dark mb-3">Why Choose KisanConnect?</h3>
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <i className="bi bi-truck display-5 text-success mb-2 d-block"></i>
              <h5 className="fw-bold text-dark">Direct Farm Delivery</h5>
              <p className="text-muted fs-7 mb-0">Harvested fresh and shipped promptly from local farms to your home.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-shield-check display-5 text-success mb-2 d-block"></i>
              <h5 className="fw-bold text-dark">Verified Growers</h5>
              <p className="text-muted fs-7 mb-0">Every farmer on our platform is verified for quality and safety standards.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-cash-coin display-5 text-success mb-2 d-block"></i>
              <h5 className="fw-bold text-dark">Fair Farmer Pricing</h5>
              <p className="text-muted fs-7 mb-0">Farmers earn fair compensation for their hard work without unfair middlemen markups.</p>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
