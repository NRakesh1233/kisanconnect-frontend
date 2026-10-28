import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import ProductCard from '../../components/customer/ProductCard';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'bootstrap-icons/font/bootstrap-icons.css';

gsap.registerPlugin(ScrollTrigger);
const BASE_URL = "http://localhost:8080";
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItemsCount } = useCart();

  const [product, setProduct] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [alertMsg, setAlertMsg] = useState('');

  const containerRef = useRef(null);
  const recommendedRef = useRef(null);

  // Fetch product details & recommended products list
  useEffect(() => {
    const fetchProductDetailsAndRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, allProductsData] = await Promise.all([
          productService.getProductById(id),
          productService.getAllProducts().catch(() => [])
        ]);

        setProduct(productData);

        // Filter recommended products (same category or same farmer, excluding current product)
        if (allProductsData && allProductsData.length > 0) {
          const filtered = allProductsData.filter((item) => {
            const itemId = item.productId || item.id;
            const currentId = productData.productId || productData.id;
            if (itemId === currentId) return false;

            const sameCategory =
              item.category && productData.category && item.category.toLowerCase() === productData.category.toLowerCase();
            const sameFarmer =
              item.farmerId && productData.farmerId && item.farmerId === productData.farmerId;

            return sameCategory || sameFarmer;
          });

          // Limit to 4 recommended items
          setRecommendedProducts(filtered.slice(0, 4));
        }
      } catch (err) {
        setError('Failed to load product details. The item may no longer exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetailsAndRecommendations();
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [id]);

  // GSAP Smooth Entrance Animation
  useEffect(() => {
    console.log('GSAP Animation Triggered: loading:', loading, 'quantity:', quantity);
    if (!loading && product && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [loading, product]);

  // GSAP ScrollTrigger for Recommendations Section
  useEffect(() => {
    if (!loading && recommendedProducts.length > 0 && recommendedRef.current) {
      gsap.fromTo(
        recommendedRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: recommendedRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }, [loading, recommendedProducts]);

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column" >
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 my-auto" style={{marginTop:"100px"}}>
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading product details...</span>
          </div>
          <p className="mt-3 text-muted">Fetching fresh product information...</p>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column">
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="container text-center py-5 my-auto"  style={{marginTop:"100px"}}>
          <div className="alert alert-danger shadow-sm p-4 rounded-4 d-inline-block">
            <i className="bi bi-exclamation-triangle-fill display-4 text-danger d-block mb-2"></i>
            <h4>Product Not Found</h4>
            <p className="text-muted">{error || 'The requested product could not be retrieved.'}</p>
            <button onClick={() => navigate('/customer/products')} className="btn btn-kisan-primary mt-2">
              Back to Catalog
            </button>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const {
    productId,
    productName,
    price,
    stock = 0,
    totalStock,
    unit = 'kg',
    category,
    description,
    image,
    productImage,
    harvestDate,
    expiryDate,
    farmerId,
    farmerName = 'Local Farmer',
    profilePic,
    avgRating = 0,
    reviewCount = 0
  } = product;

  const availableStock = stock !== undefined ? stock : (totalStock !== undefined ? totalStock : 0);
  const isOutOfStock = availableStock <= 0;
  const displayImage = productImage || image || 'https://via.placeholder.com/500x400?text=Fresh+Produce';

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > availableStock) return availableStock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItem = {
      id: productId || id,
      name: productName,
      price: price,
      unit: unit,
      imageUrl: displayImage,
      farmerId: farmerId,
      farmerName: farmerName,
      availableStock: availableStock
    };

    const msg = addToCart(cartItem, quantity);
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" ref={containerRef} style={{marginTop:"100px"}}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/customer/home" className="text-success text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/customer/products" className="text-success text-decoration-none">Products</Link></li>
            <li className="breadcrumb-item active text-dark" aria-current="page">{productName}</li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="row g-5 align-items-start mb-5">
          {/* Product Image Column */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-2">
              <div className="position-relative overflow-hidden rounded-3" style={{ height: '400px' }}>
                <img
                               src={`${BASE_URL}/uploads/products/${image}`}

                  alt={productName}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x400?text=Fresh+Produce';
                  }}
                />
                {isOutOfStock ? (
                  <span className="position-absolute top-0 start-0 bg-danger text-white px-3 py-1 fs-7 fw-bold rounded-end-pill m-3 shadow">
                    Out of Stock
                  </span>
                ) : (
                  <span className="position-absolute top-0 start-0 bg-success text-white px-3 py-1 fs-7 fw-bold rounded-end-pill m-3 shadow">
                    In Stock ({availableStock} {unit})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              {category && (
                <span className="badge bg-light text-success border border-success fs-7 px-3 py-1 mb-2 align-self-start">
                  {category}
                </span>
              )}

              <h1 className="fw-bold text-dark mb-2">{productName}</h1>

              {/* Rating */}
              {avgRating > 0 && (
                <div className="d-flex align-items-center gap-2 mb-3 text-warning fw-bold">
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < Math.floor(avgRating) ? '-fill' : ''} me-1`}></i>
                    ))}
                  </div>
                  <span>{avgRating.toFixed(1)}</span>
                  {reviewCount > 0 && <span className="text-muted fw-normal">({reviewCount} customer reviews)</span>}
                </div>
              )}

              {/* Price */}
              {/* Price & Dynamic Total Cost */}
<div className="mb-4">
  <div className="d-flex align-items-baseline gap-2">
    <span className="fs-2 fw-bold text-success">₹{(price * quantity).toFixed(2)}</span>
    <span className="text-muted fs-7">
      (₹{price} / {unit})
    </span>
  </div>
  {quantity > 1 && (
    <small className="text-muted d-block mt-1">
      Total for {quantity} {unit}s
    </small>
  )}
</div>

              {/* Description */}
              {description && (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-1">Description</h6>
                  <p className="text-muted lh-base">{description}</p>
                </div>
              )}

              {/* Harvest & Expiry Dates */}
              {(harvestDate || expiryDate) && (
                <div className="row g-2 mb-4">
                  {harvestDate && (
                    <div className="col-sm-6">
                      <div className="p-2 rounded-3 bg-light border border-success border-opacity-25 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-check text-success fs-5"></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Harvest Date</small>
                          <span className="fw-semibold text-dark fs-8">{harvestDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {expiryDate && (
                    <div className="col-sm-6">
                      <div className="p-2 rounded-3 bg-light border border-danger border-opacity-25 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-x text-danger fs-5"></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Best Before</small>
                          <span className="fw-semibold text-dark fs-8">{expiryDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Farmer Storefront Link Box */}
              <div className="p-3 rounded-3 bg-kisan-light border border-success border-opacity-25 mb-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  {profilePic ? (
                    <img
                                src={`${BASE_URL}/uploads/profiles/${profilePic}`}
                      alt={farmerName}
                      className="rounded-circle object-fit-cover border border-success shadow-sm"
                      style={{ width: '45px', height: '45px' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '45px', height: '45px' }}>
                      {farmerName ? farmerName.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Cultivated & Sold By</small>
                    <span className="fw-bold text-dark fs-6">{farmerName}</span>
                  </div>
                </div>
                {farmerId && (
                  <Link to={`/customer/farmer/${farmerId}`} className="btn btn-sm btn-outline-success">
                    View Storefront <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                )}
              </div>
{/* Quantity Selector & Add to Cart */}
{!isOutOfStock && (
  <div className="d-flex align-items-center gap-3 mb-4">
    <label className="fw-medium text-secondary fs-7 mb-0">Quantity ({unit}):</label>
    
    <div className="d-flex align-items-center border border-success rounded-3 overflow-hidden bg-white shadow-sm" style={{ width: '140px' }}>
      <button 
        className="btn btn-sm btn-light text-success fw-bold px-3 py-2 border-0 rounded-0" 
        onClick={() => handleQuantityChange(-1)} 
        disabled={quantity <= 1}
      >
        <i className="bi bi-dash"></i>
      </button>

      <div className="flex-grow-1 text-center fw-bold text-dark fs-6 bg-white py-1">
        {quantity}
      </div>

      <button 
        className="btn btn-sm btn-light text-success fw-bold px-3 py-2 border-0 rounded-0" 
        onClick={() => handleQuantityChange(1)} 
        disabled={quantity >= availableStock}
      >
        <i className="bi bi-plus"></i>
      </button>
    </div>
  </div>
)}
              <div className="d-grid gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`btn btn-lg ${isOutOfStock ? 'btn-secondary' : 'btn-kisan-primary'} d-flex align-items-center justify-content-center gap-2 shadow-sm`}
                >
                  <i className="bi bi-cart-plus fs-5"></i>
                  <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>

              {/* Alert Feedback */}
              {alertMsg && (
                <div className="alert alert-success mt-3 mb-0 text-center py-2 fs-8 animate-fade-in" role="alert">
                  {alertMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <section ref={recommendedRef} className="mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold text-dark mb-1">
                  <i className="bi bi-stars text-warning me-2"></i>You May Also Like
                </h4>
                <p className="text-muted fs-7 mb-0">Similar fresh produce from this category or farmer.</p>
              </div>
              <Link to="/customer/products" className="btn btn-sm btn-outline-success">
                View All Products <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
              {recommendedProducts.map((recProduct) => (
                <div key={recProduct.productId || recProduct.id} className="col">
                  <ProductCard product={recProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}