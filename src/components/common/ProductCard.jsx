import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCurrency, resolveProductImageUrl, resolveProfileImageUrl } from '../../utils/formatters';
import gsap from 'gsap';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const cardRef = useRef(null);

  // GSAP subtle entrance animation
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || !cardRef.current || !product) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [product]);

  if (!product) return null;

  // Destructure exact fields from your ProductsResponse DTO
  const {
    productId,
    id,
    productName,
    name,
    price,
    stock = 0,
    totalStock,
    unit = 'kg',
    category,
    image,
    productImage,
    farmerId,
    farmerName = 'Local Farmer',
    profilePic,
    organic = false,
    avgRating = 0,
    reviewCount = 0,
  } = product;

  const actualId = productId || id;
  const displayName = productName || name || 'Fresh Produce';
  const availableStock = stock !== undefined ? stock : totalStock !== undefined ? totalStock : 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 10;
  const isInCart = cartItems?.some((item) => (item.productId || item.id) === actualId);
  const isFavorite = isInWishlist(actualId);
  const imgUrl = resolveProductImageUrl(image || productImage);
  const farmerAvatar = resolveProfileImageUrl(profilePic);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;

    try {
      setAdding(true);
      await addToCart(product, 1);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div ref={cardRef} className="kc-product-card">
      {/* Floating Badges */}
      <div className="kc-card-badges">
        {organic && (
          <span className="kc-badge kc-badge-organic">
            <i className="bi bi-patch-check-fill"></i> Organic
          </span>
        )}
        {isOutOfStock ? (
          <span className="kc-badge kc-badge-danger">Out of Stock</span>
        ) : isLowStock ? (
          <span className="kc-badge kc-badge-warning">Only {availableStock} {unit} Left</span>
        ) : null}
      </div>

      {/* Wishlist Heart Toggle */}
      <button
        type="button"
        className={`kc-card-wishlist-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleWishlistToggle}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
      </button>

      {/* Product Image Link */}
      <Link to={`/customer/products/${actualId}`} className="kc-card-img-wrapper">
        <img
          src={imgUrl}
          alt={displayName}
          className="kc-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800';
          }}
        />
      </Link>

      {/* Body */}
      <div className="kc-card-body">
        {category && <span className="kc-card-category">{category}</span>}

        <Link to={`/customer/products/${actualId}`} className="kc-card-title" title={displayName}>
          {displayName}
        </Link>

        {/* Farmer Provenance Pill */}
        {farmerId && (
          <Link
            to={`/customer/products/farmer/${farmerId}`}
            className="kc-card-farmer"
            title={`View ${farmerName}'s storefront`}
          >
            {farmerAvatar ? (
              <img src={farmerAvatar} alt={farmerName} />
            ) : (
              <i className="bi bi-person-fill text-success" style={{ fontSize: '0.75rem' }}></i>
            )}
            <span>{farmerName}</span>
          </Link>
        )}

        {/* Rating */}
        {avgRating > 0 && (
          <div className="d-flex align-items-center gap-1 mb-2">
            <span className="kc-stars small">
              <i className="bi bi-star-fill"></i>
            </span>
            <span className="small fw-bold text-dark">{Number(avgRating).toFixed(1)}</span>
            {reviewCount > 0 && <span className="small text-muted">({reviewCount})</span>}
          </div>
        )}

        {/* Footer: Price & Add to Cart */}
        <div className="kc-card-footer">
          <div className="kc-card-price">
            <span className="kc-price-amount">{formatCurrency(price)}</span>
            <span className="kc-price-unit">per {unit}</span>
          </div>

          <button
            type="button"
            className={`kc-btn kc-btn-sm ${
              isOutOfStock
                ? 'kc-btn-cream disabled'
                : addedNotice
                ? 'kc-btn-fresh'
                : isInCart
                ? 'kc-btn-outline'
                : 'kc-btn-primary'
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
          >
            {adding ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : addedNotice ? (
              <>
                <i className="bi bi-check-lg"></i> Added
              </>
            ) : isInCart ? (
              <>
                <i className="bi bi-bag-check"></i> In Cart
              </>
            ) : (
              <>
                <i className="bi bi-bag-plus"></i> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
