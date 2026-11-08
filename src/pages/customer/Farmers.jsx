import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import gsap from 'gsap';
import './farmers.css';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Farmers() {
  const { totalItemsCount } = useCart();
  const [farmers, setFarmers] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchFarmersAndCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await farmerService.getAllFarmers();
        setFarmers(data || []);

        // Fetch active product counts for each farmer concurrently
        const countsMap = {};
        await Promise.all(
          (data || []).map(async (farmer) => {
            const farmerId = farmer.id || farmer.farmerId || farmer.Id;
            if (farmerId) {
              try {
                const products = await productService.getProductsByFarmer(farmerId);
                countsMap[farmerId] = Array.isArray(products) ? products.length : 0;
              } catch {
                countsMap[farmerId] = 0;
              }
            }
          })
        );
        setProductCounts(countsMap);
      } catch (err) {
        console.warn('Failed to fetch farmers list:', err);
        setError('Could not retrieve registered farmers at this moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmersAndCounts();
  }, []);

  // GSAP Stagger Entrance Animation when farmers load
  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.farmer-card-item');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
          }
        );
      }
    }
  }, [loading, farmers]);

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f6f9fc 0%, #eef4f1 100%)' }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{ marginTop: '80px' }}>
        <div className="mb-4">
          <h2 className="fw-extrabold text-dark mb-1">
            <i className="bi bi-people text-success me-2"></i>Our Local Farmers
          </h2>
          <p className="text-muted small">Connect directly with dedicated growers providing fresh, sustainable harvests.</p>
        </div>

        {loading ? (
          <div className="text-center py-5 glass-panel rounded-4">
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading local farmers...</span>
            </div>
            <p className="text-muted mt-3 fw-medium">Loading local agricultural partners...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 text-center my-4 py-4 bg-danger bg-opacity-15 text-danger fw-semibold" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
            {error}
          </div>
        ) : farmers.length === 0 ? (
          <div className="glass-panel card border-0 shadow-sm text-center py-5 rounded-4 bg-white">
            <div className="card-body py-5">
              <i className="bi bi-emoji-frown text-success display-4 d-block mb-3 opacity-50"></i>
              <h4 className="fw-bold text-dark">No farmers found</h4>
              <p className="text-muted small mb-0">Check back later as new agricultural partners join our network.</p>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {farmers.map((farmer) => {
              const farmerId = farmer.id || farmer.farmerId || farmer.Id;
              const farmerName = farmer.name || farmer.firstName ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Local Farmer';
              
              const rating = farmer.rating !== null && farmer.rating !== undefined ? Number(farmer.rating).toFixed(1) : '4.8';
              const productCount = productCounts[farmerId] !== undefined ? productCounts[farmerId] : 0;
              const profilePicSrc = getProfileImageSrc(farmer.profilePic || farmer.image);

              return (
                <div key={farmerId} className="col farmer-card-item">
                  <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column text-center position-relative transition-hover">
                    
                    {/* Top Row: Active Products Badge & ID */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-success bg-opacity-10 text-success px-3 py-1.5 fs-8 rounded-pill fw-semibold border border-success border-opacity-15">
                        <i className="bi bi-basket me-1"></i> {productCount} Active Products
                      </span>
                      <span className="text-muted fs-8 font-monospace">ID: #{farmerId}</span>
                    </div>

                    {/* Farmer Profile Picture */}
                    <div className="mx-auto mb-3 position-relative">
                      {profilePicSrc ? (
                        <img
                          src={profilePicSrc}
                          alt={farmerName}
                          className="rounded-circle object-fit-cover border border-2 border-success shadow-sm"
                          style={{ width: '90px', height: '90px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/90?text=Farmer';
                          }}
                        />
                      ) : (
                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm mx-auto" style={{ width: '90px', height: '90px' }}>
                          {farmerName ? farmerName.charAt(0).toUpperCase() : 'F'}
                        </div>
                      )}
                    </div>

                    {/* Farmer Name & Rating */}
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                      <h5 className="fw-bold text-dark mb-0">{farmerName}</h5>
                    </div>
                    
                    <div className="text-warning fs-8 fw-bold mb-2">
                      <i className="bi bi-star-fill me-1"></i> {rating} <span className="text-muted fw-normal">/ 5.0</span>
                    </div>
                    
                    <p className="text-muted fs-8 mb-2">
                      <i className="bi bi-geo-alt-fill text-success me-1"></i>
                      {farmer.mobileNumber ? `Phone: ${farmer.mobileNumber}` : 'Local Agricultural Region'}
                    </p>

                    <p className="text-muted fs-8 mt-1 mb-4 flex-grow-1 lh-base">
                      {farmer.bio || 'Committed to organic, chemical-free farming and delivering fresh produce straight from soil to doorstep.'}
                    </p>

                    {/* View Products Button */}
                    <Link
                      to={`/customer/products/farmer/${farmerId}`}
                      className="btn btn-outline-success btn-sm w-100 py-2.5 rounded-pill fw-bold shadow-hover"
                    >
                      View Products <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}