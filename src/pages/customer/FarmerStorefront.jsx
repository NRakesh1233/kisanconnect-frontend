import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import ProductCard from '../../components/customer/ProductCard';
import { farmerService } from '../../services/farmerService';
import { useCart } from '../../context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'bootstrap-icons/font/bootstrap-icons.css';

gsap.registerPlugin(ScrollTrigger);
const BASE_URL = "http://localhost:8080";
export default function FarmerStorefront() {
  const { fid } = useParams();
  const { totalItemsCount } = useCart();

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [farmerData, productsData] = await Promise.all([
          farmerService.getFarmerById(fid),
          farmerService.getProductsByFarmer(fid)
        ]);

        setFarmer(farmerData);
        setProducts(productsData || []);
      } catch (err) {
        setError('Failed to load farmer storefront. Please check if the farmer ID is valid.');
      } finally {
        setLoading(false);
      }
    };

    fetchStorefrontData();
  }, [fid]);

  // GSAP Smooth Header Entrance Animation
  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 mt-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading storefront...</span>
          </div>
          <p className="mt-3 text-muted">Visiting the farmer's fields...</p>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-vh-100 bg-light">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="container text-center py-5">
          <div className="alert alert-danger shadow-sm p-4 rounded-4 d-inline-block">
            <i className="bi bi-person-x-fill display-4 text-danger d-block mb-2"></i>
            <h4>Storefront Not Found</h4>
            <p className="text-muted">{error || 'Could not retrieve farmer profile.'}</p>
            <Link to="/customer/farmers" className="btn btn-kisan-primary mt-2">
              Explore All Farmers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    name = 'Local Farmer',
    profilePic,
    bio = 'Committed to organic and sustainable farming practices.',
    location = 'Local Agricultural Region',
    phone,
    email,
    verified = true
  } = farmer;

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{marginTop:"100px"}}> 
        {/* Farmer Header Profile Banner */}
        <div ref={headerRef} className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5 text-white" style={{ backgroundColor: 'var(--kisan-forest-green, #1b4d3e)' }}>
          <div className="card-body p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-md-3 text-center">
                {profilePic ? (
                  <img
                      src={`${BASE_URL}/uploads/profiles/${profilePic}`}
                    alt={name}
                    className="rounded-circle object-fit-cover border border-3 border-success shadow"
                    style={{ width: '130px', height: '130px' }}
                  />
                ) : (
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold display-4 shadow mx-auto" style={{ width: '130px', height: '130px' }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="col-md-9">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h2 className="fw-bold mb-0">{name}</h2>
                  {verified && (
                    <span className="badge bg-success text-white fs-8 px-2 py-1 shadow-sm d-flex align-items-center gap-1">
                      <i className="bi bi-patch-check-fill"></i> Verified Farmer
                    </span>
                  )}
                </div>

                <p className="text-light opacity-85 mb-2 fs-7">
                  <i className="bi bi-geo-alt-fill text-warning me-1"></i> {location}
                </p>

                <p className="text-light opacity-90 fs-6 mb-3">{bio}</p>

                <div className="d-flex flex-wrap gap-3 text-light fs-8 opacity-75">
                  {phone && <span><i className="bi bi-telephone me-1"></i> {phone}</span>}
                  {email && <span><i className="bi bi-envelope me-1"></i> {email}</span>}
                  <span><i className="bi bi-basket me-1"></i> {products.length} Products Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Products Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">
              <i className="bi bi-shop text-success me-2"></i> Harvests by {name}
            </h4>
            <span className="text-muted fs-7">Showing {products.length} items</span>
          </div>

          {products.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5 rounded-4">
              <div className="card-body">
                <i className="bi bi-box2 text-muted display-4 d-block mb-3"></i>
                <h5 className="fw-bold text-dark">No active products</h5>
                <p className="text-muted">This farmer has not listed any produce at the moment. Check back soon!</p>
              </div>
            </div>
          ) : (
            <div ref={gridRef} className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {products.map((product) => (
                <div key={product.productId || product.id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}