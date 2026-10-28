import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { farmerService } from '../../services/farmerService';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BASE_URL = "http://localhost:8080";

export default function Farmers() {
  const { totalItemsCount } = useCart();
  const [farmers, setFarmers] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmersAndCounts = async () => {
      try {
        setLoading(true);
        const data = await farmerService.getAllFarmers();
      
        setFarmers(data || []);

        // Fetch active product counts for each farmer concurrently
        const countsMap = {};
        await Promise.all(
          (data || []).map(async (farmer) => {
            console.log(farmer.Id)
            const farmerId = farmer.Id || farmer.farmerId;
            if (farmerId) {
              try {
                const products = await productService.getProductsByFarmer(farmerId);
                
                countsMap[farmerId] = Array.isArray(products) ? products.length : 0;
                console.log('products fram',products.length)
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

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return 'https://via.placeholder.com/100?text=Farmer';
    if (imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{marginTop:"100px"}}>
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-people text-success me-2"></i>Our Local Farmers
          </h2>
          <p className="text-muted">Connect directly with dedicated growers providing fresh, sustainable harvests.</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="text-muted mt-2">Loading local farmers...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            {error}
          </div>
        ) : farmers.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5 rounded-4 bg-white">
            <div className="card-body py-5">
              <i className="bi bi-emoji-frown text-muted display-3 d-block mb-3"></i>
              <h4 className="fw-bold text-dark">No farmers found</h4>
              <p className="text-muted mb-0">Check back later as new agricultural partners join our network.</p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {farmers.map((farmer) => {
              // Note: Using 'id' matching UserResponse DTO field
              const farmerId = farmer.id || farmer.farmerId;
              const farmerName = farmer.name || 'Local Farmer';
              
              // Reading rating directly from the updated UserResponse DTO
              const rating = farmer.rating !== null && farmer.rating !== undefined ? Number(farmer.rating).toFixed(1) : '4.8';
              const productCount = productCounts[farmer.Id] !== undefined ? productCounts[farmerId] : 0;

              return (
                <div key={farmerId} className="col">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column text-center position-relative w-100">
                    
                    {/* Active Products Badge */}
                    {
                       

                    }
                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 fs-8 align-self-start mb-2">
                      <i className="bi bi-basket me-1"></i> {productCounts[farmer.Id]} Active Products
                    </span>

                    {/* Farmer Profile Picture */}
                    <div className="mx-auto mb-3 mt-1">
                      <img
                        src={getProfileImageSrc(farmer.profilePic)}
                        alt={farmerName}
                        className="rounded-circle object-fit-cover border shadow-sm"
                        style={{ width: '90px', height: '90px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/90?text=Farmer';
                        }}
                      />
                    </div>
<small> id:#{farmer.Id}</small>
                    {/* Farmer Name & Rating */}
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <h5 className="fw-bold text-dark mb-1">{farmerName}</h5>
                      <span className="text-dark px-1 py-1 fs-8 fw-medium">
                        <i className="bi bi-star-fill me-1 text-warning"></i> {rating} / 5.0
                      </span>
                    </div>
                    
                    <p className="text-muted fs-8 mb-2">
                      <i className="bi bi-geo-alt-fill text-success me-1"></i>
                      {farmer.mobileNumber ? `Phone: ${farmer.mobileNumber}` : 'Local Agricultural Region'}
                    </p>

                    <p className="text-muted fs-8 mt-2 mb-4 flex-grow-1">
                      {farmer.bio || 'Committed to organic, chemical-free farming and delivering fresh produce straight from soil to doorstep.'}
                    </p>

                    {/* View Products Button */}
                    <Link
                      to={`/customer/products/farmer/${farmer.Id}`}
                      className="btn btn-outline-success btn-sm w-100 py-2 rounded-pill fw-medium"
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