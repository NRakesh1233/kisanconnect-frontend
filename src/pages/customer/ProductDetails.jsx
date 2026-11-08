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
import './OrderHistory.css';
gsap.registerPlugin(ScrollTrigger);
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItemsCount } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [alertMsg, setAlertMsg] = useState('');

  const containerRef = useRef(null);
  const reviewsRef = useRef(null);
  const recommendedRef = useRef(null);

  // Fetch product details, reviews, and recommended products list
  useEffect(() => {
    const fetchProductDetailsAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, reviewsData, allProductsData] = await Promise.all([
          productService.getProductById(id),
          fetch(`${BASE_URL}/public/reviews/product/${id}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []),
          productService.getAllProducts().catch(() => [])
        ]);

        setProduct(productData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

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

          setRecommendedProducts(filtered.slice(0, 4));
        }
      } catch (err) {
        setError('Failed to load product details. The item may no longer exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetailsAndReviews();
    window.scrollTo(0, 0);
  }, [id]);

  // GSAP Smooth Entrance Animation
  useEffect(() => {
    if (!loading && product && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [loading, product]);

  // GSAP ScrollTrigger for Reviews & Recommendations
  useEffect(() => {
    if (!loading && reviewsRef.current) {
      gsap.fromTo(
        reviewsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: reviewsRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    if (!loading && recommendedProducts.length > 0 && recommendedRef.current) {
      gsap.fromTo(
        recommendedRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: recommendedRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }, [loading, recommendedProducts, reviews]);

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #eef4f1 100%)' }}>
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="text-center py-5 my-auto" style={{ marginTop: "100px" }}>
          <div className="spinner-border text-success" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading product details...</span>
          </div>
          <p className="mt-3 text-muted small fw-medium">Loading product showcase...</p>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #eef4f1 100%)' }}>
        <CustomerNavbar cartCount={totalItemsCount} />
        <div className="container text-center py-5 my-auto" style={{ marginTop: "100px" }}>
          <div className="glass-panel card border-0 shadow-sm p-5 rounded-4 d-inline-block bg-white">
            <i className="bi bi-exclamation-circle display-4 text-muted d-block mb-3 opacity-50"></i>
            <h4 className="fw-bold text-dark">Product Not Found</h4>
            <p className="text-muted small mb-3">{error || 'The requested product could not be retrieved.'}</p>
            <button onClick={() => navigate('/customer/products')} className="btn btn-dark rounded-pill px-4 btn-sm fw-bold">
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
    setAlertMsg(msg || 'Successfully added to cart!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #eef4f1 100%)' }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" ref={containerRef} style={{ marginTop: "80px" }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 fs-8">
            <li className="breadcrumb-item"><Link to="/customer/home" className="text-muted text-decoration-none fw-medium">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/customer/products" className="text-muted text-decoration-none fw-medium">Products</Link></li>
            <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">{productName}</li>
          </ol>
        </nav>

        {/* Main Product Showcase Section */}
        <div className="row g-5 align-items-center mb-5">
          {/* Product Image Column with Hover Zoom */}
          <div className="col-lg-6">
            <div className="glass-panel card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3">
              <div className="product-details-img-wrapper position-relative overflow-hidden rounded-3 bg-light" style={{ height: '420px' }}>
                <img
                  src={displayImage}
                  alt={productName}
                  className="w-100 h-100 object-fit-cover product-details-zoom"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x400?text=Fresh+Produce';
                  }}
                />
                {isOutOfStock ? (
                  <span className="position-absolute top-0 start-0 bg-dark text-white px-3.5 py-1.5 fs-8 fw-bold rounded-end-pill m-3 shadow-sm">
                    Out of Stock
                  </span>
                ) : (
                  <span className="position-absolute top-0 start-0 bg-success text-white px-3.5 py-1.5 fs-8 fw-bold rounded-end-pill m-3 shadow-sm">
                    In Stock ({availableStock} {unit})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details & Purchase Column */}
          <div className="col-lg-6">
            <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
              {category && (
                <span className="badge bg-success bg-opacity-10 text-success fs-8 px-3 py-1 mb-3 align-self-start rounded-pill fw-semibold">
                  {category}
                </span>
              )}

              <h1 className="fw-extrabold text-dark mb-2 fs-3">{productName}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-3 text-warning fw-bold fs-8">
                <div className="d-flex align-items-center">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.floor(avgRating) ? '-fill' : ''} me-1`}></i>
                  ))}
                </div>
                <span>{avgRating > 0 ? avgRating.toFixed(1) : '4.8'}</span>
                <span className="text-muted fw-normal ms-1">({reviews.length || reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-4 pb-3 border-bottom border-light">
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fs-2 fw-extrabold text-success">₹{(price * quantity).toFixed(2)}</span>
                  <span className="text-muted fs-7 fw-medium">
                    (₹{price} / {unit})
                  </span>
                </div>
                {quantity > 1 && (
                  <small className="text-muted fw-semibold d-block mt-1 fs-8">
                    Total for {quantity} {unit}s
                  </small>
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-1 text-uppercase fs-8 tracking-wider">About Product</h6>
                  <p className="text-muted lh-base small mb-0">{description}</p>
                </div>
              )}

              {/* Harvest & Expiry Dates */}
              {(harvestDate || expiryDate) && (
                <div className="row g-2 mb-4">
                  {harvestDate && (
                    <div className="col-sm-6">
                      <div className="p-2.5 rounded-3 bg-light border border-black border-opacity-10 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-check text-success fs-5"></i>
                        <div>
                          <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.65rem' }}>Harvested</small>
                          <span className="fw-semibold text-dark fs-8">{harvestDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {expiryDate && (
                    <div className="col-sm-6">
                      <div className="p-2.5 rounded-3 bg-light border border-black border-opacity-10 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-x text-muted fs-5"></i>
                        <div>
                          <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.65rem' }}>Best Before</small>
                          <span className="fw-semibold text-dark fs-8">{expiryDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Farmer Storefront Link Box */}
              <div className="p-3 rounded-3 bg-white border border-black border-opacity-10 mb-4 d-flex align-items-center justify-content-between shadow-sm">
                <div className="d-flex align-items-center gap-3">
                  {profilePic ? (
                    <img
                      src={getProfileImageSrc(profilePic)}
                      alt={farmerName}
                      className="rounded-circle object-fit-cover border shadow-sm"
                      style={{ width: '45px', height: '45px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '45px', height: '45px' }}>
                      {farmerName ? farmerName.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Cultivated By</small>
                    <span className="fw-bold text-dark fs-6">{farmerName}</span>
                  </div>
                </div>
                {farmerId && (
                  <Link to={`/customer/products/farmer/${farmerId}`} className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-bold fs-8">
                    Store <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                )}
              </div>

              {/* Quantity Selector & Add to Cart */}
              {!isOutOfStock && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <label className="fw-bold text-secondary fs-8 text-uppercase">Quantity:</label>
                  
                  <div className="d-flex align-items-center border rounded-pill overflow-hidden bg-light shadow-sm" style={{ width: '130px' }}>
                    <button 
                      className="btn btn-sm text-dark fw-bold px-3 py-1.5 border-0 rounded-0 bg-transparent" 
                      onClick={() => handleQuantityChange(-1)} 
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>

                    <div className="flex-grow-1 text-center fw-bold text-dark fs-6 bg-transparent py-1">
                      {quantity}
                    </div>

                    <button 
                      className="btn btn-sm text-dark fw-bold px-3 py-1.5 border-0 rounded-0 bg-transparent" 
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
                  className={`btn btn-lg ${isOutOfStock ? 'btn-secondary' : 'btn-success'} d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold shadow-hover`}
                >
                  <i className="bi bi-cart-plus fs-5"></i>
                  <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>

              {/* Alert Feedback */}
              {alertMsg && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success mt-3 mb-0 text-center py-2 fs-8 rounded-pill fw-semibold animate-fade-in" role="alert">
                  <i className="bi bi-check-circle-fill me-1"></i> {alertMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section ref={reviewsRef} className="mt-5 pt-4 border-top border-light">
          <div className="mb-4">
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 fs-5">
              <i className="bi bi-chat-quote text-success"></i> Customer Reviews
            </h4>
            <p className="text-muted small mb-0">Verified feedback from community buyers.</p>
          </div>

          {reviews.length === 0 ? (
            <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <p className="text-muted small mb-0 py-3">No reviews available for this product yet.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {reviews.map((rev, index) => (
                <div key={rev.id || index} className="col">
                  <div className="glass-panel card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold fs-8 shadow-sm" style={{ width: '32px', height: '32px' }}>
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0 fs-8">{rev.userName || 'Verified Buyer'}</h6>
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>{rev.date || 'Recent Purchase'}</small>
                        </div>
                      </div>
                      <div className="text-warning fs-8 fw-bold bg-warning bg-opacity-10 px-2.5 py-0.5 rounded-pill">
                        <i className="bi bi-star-fill me-1"></i> {rev.rating || 5}.0
                      </div>
                    </div>
                    <p className="text-muted small mb-0 mt-2 lh-base">
                      "{rev.comment || rev.reviewText || 'Excellent quality and farm-fresh taste! Highly recommended.'}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <section ref={recommendedRef} className="mt-5 pt-4 border-top border-light">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold text-dark mb-1 fs-5">
                  <i className="bi bi-stars text-warning me-2"></i>You May Also Like
                </h4>
                <p className="text-muted small mb-0">Similar fresh produce items.</p>
              </div>
              <Link to="/customer/products" className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-semibold fs-8">
                View All <i className="bi bi-arrow-right ms-1"></i>
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