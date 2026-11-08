import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './productCard.css';
// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [alertMsg, setAlertMsg] = useState('');
  const [isJustAdded, setIsJustAdded] = useState(false);
  const cardRef = useRef(null);
  const btnRef = useRef(null);

  if (!product) return null;

  // Destructure exact fields from your ProductsResponse DTO
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
    harvestDate,
    expiryDate,
    farmerId,
    farmerName = 'Local Farmer',
    profilePic,
    avgRating = 0,
    reviewCount = 0
  } = product;

  // Use availableStock prioritizing 'stock' or 'totalStock'
  const availableStock = stock !== undefined ? stock : (totalStock !== undefined ? totalStock : 0);
  const isOutOfStock = availableStock <= 0;

  // Check if item already exists in cart context to persist state
  const isInCart = cartItems?.some(item => item.id === productId || item.productId === productId);

  // Choose the best available image source
  const displayImage = image || 'https://via.placeholder.com/300x200?text=Fresh+Produce';

  const getProfileImageSrc = (imgProp) => {
    if (!imgProp) return '';
    if (imgProp.startsWith('blob:') || imgProp.startsWith('http://') || imgProp.startsWith('https://')) return imgProp;
    if (imgProp.includes('/uploads/')) return `${BASE_URL}${imgProp}`;
    return `${BASE_URL}/uploads/profiles/${imgProp}`;
  };

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const cartProduct = {
      id: productId,
      name: productName,
      price: price,
      unit: unit,
      imageUrl: displayImage,
      farmerId: farmerId,
      farmerName: farmerName,
      availableStock: availableStock
    };

    const msg = addToCart(cartProduct, 1);
    setAlertMsg(msg || 'Added to cart!');
    setIsJustAdded(true);

    // GSAP Button Pop Animation on click
    if (btnRef.current) {
      gsap.fromTo(btnRef.current, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    }

    setTimeout(() => setAlertMsg(''), 2500);
  };

  return (
    <div ref={cardRef} className="card h-100 border-0 glass-product-card position-relative overflow-hidden rounded-4 shadow-sm transition-hover">
      {/* Stock Status Badge */}
      {isOutOfStock ? (
        <span className="position-absolute top-0 start-0 bg-danger text-white px-3.5 py-1 fs-8 fw-bold rounded-end-pill z-2 shadow-sm">
          <i className="bi bi-x-circle me-1"></i>Out of Stock
        </span>
      ) : availableStock <= 5 ? (
        <span className="position-absolute top-0 start-0 bg-warning text-dark px-3.5 py-1 fs-8 fw-bold rounded-end-pill z-2 shadow-sm">
          <i className="bi bi-exclamation-triangle me-1"></i>Low Stock ({availableStock} {unit})
        </span>
      ) : (
        <span className="position-absolute top-0 start-0 bg-success text-white px-3.5 py-1 fs-8 fw-bold rounded-end-pill z-2 shadow-sm">
          <i className="bi bi-check-circle me-1"></i>In Stock
        </span>
      )}

      {/* Product Image Container with Zoom Effect */}
      <div className="product-img-wrapper position-relative bg-light text-center overflow-hidden" style={{ height: '210px' }}>
        <Link to={`/customer/products/${productId}`}>
          <img
            src={displayImage}
            alt={productName}
            className="w-100 h-100 object-fit-cover product-img-zoom transition-transform"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Fresh+Produce';
            }}
          />
        </Link>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-3.5 pt-3">
        {/* Category & Rating Row */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          {category && (
            <span className="badge category-pill text-success bg-success bg-opacity-10 border border-success border-opacity-25 fs-8 px-2.5 py-1 rounded-pill fw-semibold">
              {category}
            </span>
          )}
          {avgRating > 0 && (
            <div className="d-flex align-items-center text-warning fs-8 fw-bold bg-warning bg-opacity-10 px-2.5 py-1 rounded-pill">
              <i className="bi bi-star-fill me-1"></i>
              <span>{avgRating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="text-muted ms-1">({reviewCount})</span>}
            </div>
          )}
        </div>

        {/* Product Title */}
        <h5 className="card-title text-dark fw-bold mb-1 fs-6 text-truncate">
          <Link to={`/customer/products/${productId}`} className="text-decoration-none text-dark product-title-link">
            {productName}
          </Link>
        </h5>

        {/* Description snippet */}
        {description && (
          <p className="text-muted fs-8 mb-2 text-truncate" style={{ maxHeight: '2.4em', overflow: 'hidden' }}>
            {description}
          </p>
        )}

        {/* Harvest & Expiry Dates Info Box */}
        {(harvestDate || expiryDate) && (
          <div className="text-muted fs-8 mb-2 p-2 rounded-3  bg-opacity-5 border border-success border-opacity-10 d-flex flex-column gap-1">
            {harvestDate && (
              <div className="d-flex align-items-center gap-1 text-success fw-medium">
                <i className="bi bi-calendar-check"></i>
                <span>Harvested: {harvestDate}</span>
              </div>
            )}
            {expiryDate && (
              <div className="d-flex align-items-center gap-1 text-danger fw-medium">
                <i className="bi bi-calendar-x"></i>
                <span>Best Before: {expiryDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Farmer Profile Info Row */}
        <div className="d-flex align-items-center gap-2 mt-1 mb-3 pt-2 border-top border-light">
          {profilePic ? (
            <img
              src={getProfileImageSrc(profilePic)}
              alt={farmerName}
              className="rounded-circle object-fit-cover border border-success shadow-sm"
              style={{ width: '32px', height: '32px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fs-8 fw-bold shadow-sm" style={{ width: '32px', height: '32px' }}>
              {farmerName ? farmerName.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
            </div>
          )}
          <div className="text-truncate fs-8">
            <span className="text-muted d-block" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Cultivated by</span>
            {farmerId ? (
              <Link to={`/customer/products/farmer/${farmerId}`} className="text-decoration-none text-dark fw-semibold text-truncate farmer-link">
                {farmerName}
              </Link>
            ) : (
              <span className="text-dark fw-semibold">{farmerName}</span>
            )}
          </div>
        </div>

        {/* Price & Dynamic Action Button */}
        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
          <div>
            <span className="fs-5 fw-extrabold text-success">₹{price}</span>
            <span className="text-muted fs-8"> / {unit || "units"}</span>
          </div>

          <div ref={btnRef}>
            {isInCart || isJustAdded ? (
              <Link
                to="/customer/cart"
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1.5 px-3 rounded-pill fw-bold shadow-hover transition-all animate-scale-up"
                title="View item in cart"
              >
                <i className="bi bi-cart-check-fill fs-6 text-success"></i>
                <span>View in Cart</span>
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`btn btn-sm ${
                  isOutOfStock ? 'btn-secondary' : 'btn-success'
                } d-flex align-items-center gap-1.5 px-3.5 rounded-pill fw-bold shadow-hover transition-all`}
                title={isOutOfStock ? 'Item is out of stock' : 'Add item to cart'}
              >
                <i className="bi bi-cart-plus fs-6"></i>
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast Feedback Alert */}
        {alertMsg && (
          <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success fs-8 py-1 px-2 mt-2 mb-0 text-center rounded-pill animate-fade-in fw-semibold" role="alert">
            <i className="bi bi-check-circle-fill me-1"></i>{alertMsg}
          </div>
        )}
      </div>
    </div>
  );
}