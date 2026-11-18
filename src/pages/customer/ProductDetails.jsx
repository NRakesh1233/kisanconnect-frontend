import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import productService from '../../services/productService';
import {
  formatCurrency,
  formatDate,
  resolveProductImageUrl,
  resolveProfileImageUrl,
} from '../../utils/formatters';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState(false);

  // Fetch product details, reviews, and recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, reviewsData, allProductsData] = await Promise.allSettled([
          productService.getProductById(id),
          productService.getProductReviews(id),
          productService.getAllProducts(),
        ]);

        if (isMounted) {
          if (productData.status === 'fulfilled' && productData.value) {
            setProduct(productData.value);

            // Compute recommendations matching same category or farmer
            if (allProductsData.status === 'fulfilled' && Array.isArray(allProductsData.value)) {
              const currentId = productData.value.productId || productData.value.id;
              const currentCat = productData.value.category?.toLowerCase();
              const currentFarmer = productData.value.farmerId;

              const filtered = allProductsData.value.filter((item) => {
                const itemId = item.productId || item.id;
                if (itemId === currentId) return false;
                const matchesCat = item.category && item.category.toLowerCase() === currentCat;
                const matchesFarmer = item.farmerId && item.farmerId === currentFarmer;
                return matchesCat || matchesFarmer;
              });

              setRecommendedProducts(filtered.slice(0, 4));
            }
          } else {
            setError('Product not found or has been unlisted.');
          }

          if (reviewsData.status === 'fulfilled' && Array.isArray(reviewsData.value)) {
            setReviews(reviewsData.value);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        if (isMounted) setError('Could not load product details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading produce...</span>
        </div>
        <p className="mt-3 text-muted small fw-semibold">Inspecting harvest details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="kc-container py-5 text-center my-5">
        <div className="kc-card p-5 d-inline-block shadow-sm" style={{ maxWidth: '480px' }}>
          <i className="bi bi-basket text-muted display-4 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark mb-2">Product Not Available</h4>
          <p className="text-muted small mb-4">{error || 'The requested product could not be found.'}</p>
          <button onClick={() => navigate('/customer/products')} className="kc-btn kc-btn-primary kc-btn-sm">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const {
    productId,
    productName,
    name,
    price = 0,
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
    organic = false,
    avgRating = 0,
    reviewCount = 0,
  } = product;

  const actualId = productId || id;
  const displayName = productName || name || 'Fresh Produce';
  const availableStock = stock !== undefined ? stock : totalStock !== undefined ? totalStock : 0;
  const isOutOfStock = availableStock <= 0;
  const isFavorite = isInWishlist(actualId);
  const imgUrl = resolveProductImageUrl(image || productImage);
  const farmerAvatar = resolveProfileImageUrl(profilePic);

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      setCartSuccessNotice(true);
      setTimeout(() => setCartSuccessNotice(false), 2500);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="kc-container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link to="/customer/home" className="text-muted text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/customer/products" className="text-muted text-decoration-none">Marketplace</Link>
          </li>
          {category && (
            <li className="breadcrumb-item text-capitalize text-muted">{category}</li>
          )}
          <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
            {displayName}
          </li>
        </ol>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="kc-card p-4 p-md-5 mb-5 shadow-sm">
        <div className="row g-4 g-lg-5 align-items-center">
          {/* Left: Product Image */}
          <div className="col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--kc-cream)' }}>
              <img
                src={imgUrl}
                alt={displayName}
                className="w-100 object-fit-cover"
                style={{ maxHeight: '460px', minHeight: '320px' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800';
                }}
              />

              {/* Badges on Image */}
              <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2">
                {organic && (
                  <span className="kc-badge kc-badge-organic">
                    <i className="bi bi-patch-check-fill"></i> 100% Organic
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="kc-badge kc-badge-danger">Out of Stock</span>
                ) : availableStock <= 10 ? (
                  <span className="kc-badge kc-badge-warning">Low Stock ({availableStock} {unit})</span>
                ) : null}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                className={`kc-card-wishlist-btn position-absolute top-0 end-0 m-3 ${isFavorite ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="col-lg-6">
            {category && (
              <span className="kc-card-category d-inline-block mb-1">{category}</span>
            )}
            <h1 className="fw-extrabold text-dark mb-2" style={{ fontSize: '2.2rem' }}>
              {displayName}
            </h1>

            {/* Rating Summary */}
            {avgRating > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="kc-stars">
                  <i className="bi bi-star-fill"></i>
                </span>
                <span className="fw-bold text-dark">{Number(avgRating).toFixed(1)}</span>
                <span className="text-muted small">({reviewCount} customer reviews)</span>
              </div>
            )}

            {/* Price Row */}
            <div className="d-flex align-items-baseline gap-2 mb-4 pb-3 border-bottom">
              <span className="display-6 fw-extrabold text-success mb-0">
                {formatCurrency(price)}
              </span>
              <span className="text-muted fs-6">/ {unit}</span>
            </div>

            {/* Description */}
            <p className="text-muted mb-4 leading-relaxed" style={{ fontSize: '0.96rem' }}>
              {description || 'Freshly harvested organic produce cultivated with natural care. Free from harmful pesticides and synthetic agents.'}
            </p>

            {/* Farm Origin Pill */}
            {farmerId && (
              <div className="p-3 rounded-3 mb-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--kc-cream)', border: '1px solid var(--kc-beige)' }}>
                <div className="d-flex align-items-center gap-3">
                  {farmerAvatar ? (
                    <img
                      src={farmerAvatar}
                      alt={farmerName}
                      className="rounded-circle object-fit-cover shadow-sm"
                      style={{ width: '46px', height: '46px', border: '2px solid var(--kc-fresh-green)' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '46px', height: '46px', backgroundColor: 'var(--kc-fresh-green)' }}
                    >
                      {farmerName ? farmerName.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Grown by Verified Partner</small>
                    <strong className="text-dark d-block">{farmerName}</strong>
                  </div>
                </div>

                <Link to={`/customer/products/farmer/${farmerId}`} className="kc-btn kc-btn-outline kc-btn-sm text-decoration-none">
                  Visit Farm <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            )}

            {/* Dates (if provided by backend) */}
            {(harvestDate || expiryDate) && (
              <div className="row g-2 mb-4 small text-muted">
                {harvestDate && (
                  <div className="col-6">
                    <span className="d-block text-secondary">Harvest Date:</span>
                    <strong className="text-dark">{formatDate(harvestDate)}</strong>
                  </div>
                )}
                {expiryDate && (
                  <div className="col-6">
                    <span className="d-block text-secondary">Best Before:</span>
                    <strong className="text-dark">{formatDate(expiryDate)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="d-flex align-items-center gap-3 mb-3">
              {/* Stepper */}
              <div className="d-flex align-items-center border rounded-pill bg-white p-1" style={{ borderColor: 'var(--kc-beige)' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-dark p-0 px-3 text-decoration-none"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  disabled={isOutOfStock}
                >
                  <i className="bi bi-dash-lg"></i>
                </button>
                <span className="fw-bold px-2" style={{ minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-dark p-0 px-3 text-decoration-none"
                  onClick={() => setQuantity((prev) => Math.min(prev + 1, availableStock || 99))}
                  disabled={isOutOfStock || quantity >= availableStock}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                className={`kc-btn kc-btn-lg flex-grow-1 ${
                  isOutOfStock ? 'kc-btn-cream disabled' : cartSuccessNotice ? 'kc-btn-fresh' : 'kc-btn-primary'
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    <span>Updating Cart...</span>
                  </>
                ) : cartSuccessNotice ? (
                  <>
                    <i className="bi bi-check-lg"></i>
                    <span>Added to Cart!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <i className="bi bi-bag-plus"></i>
                    <span>Add {quantity} {unit} to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Stock Availability Indicator */}
            {!isOutOfStock && (
              <small className="text-success fw-semibold d-block">
                <i className="bi bi-check-circle-fill me-1"></i> Ready for dispatch ({availableStock} {unit} in stock)
              </small>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          CUSTOMER REVIEWS (From Real Backend Endpoint)
          ======================================================== */}
      <section className="mb-5">
        <h4 className="fw-extrabold text-dark mb-4">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h4>

        {reviews.length > 0 ? (
          <div className="row g-3">
            {reviews.map((rev, idx) => (
              <div key={rev.id || rev.reviewId || idx} className="col-md-6">
                <div className="kc-card p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">{rev.customerName || rev.name || 'Verified Buyer'}</strong>
                    <div className="kc-stars small">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`bi ${i < (rev.rating || 5) ? 'bi-star-fill' : 'bi-star'} text-warning`}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted small mb-1">{rev.comment || rev.review || 'Excellent fresh produce.'}</p>
                  {rev.createdAt && (
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {formatDate(rev.createdAt)}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="kc-card p-4 text-center">
            <p className="text-muted mb-0 small">No customer reviews recorded yet for this harvest.</p>
          </div>
        )}
      </section>

      {/* ========================================================
          RECOMMENDED HARVESTS
          ======================================================== */}
      {recommendedProducts.length > 0 && (
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="kc-section-badge mb-1">
                <i className="bi bi-stars"></i> More Like This
              </span>
              <h4 className="fw-extrabold text-dark mb-0">You Might Also Like</h4>
            </div>
          </div>

          <div className="row g-4">
            {recommendedProducts.map((prod) => (
              <div key={prod.productId || prod.id} className="col-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
