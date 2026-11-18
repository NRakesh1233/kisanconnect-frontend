import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import { useCart } from '../../hooks/useCart';
import productService from '../../services/productService';
import { formatCurrency, resolveProductImageUrl } from '../../utils/formatters';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItemsCount, cartSubtotal } = useCart();
  const navigate = useNavigate();

  const [farmerProducts, setFarmerProducts] = useState([]);
  const [warningMsg, setWarningMsg] = useState('');

  const deliveryFee = cartSubtotal > 0 ? 49 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  // Check unique farmer IDs from cart items
  const uniqueFarmerIds = [...new Set(cartItems.map((item) => item.farmerId).filter(Boolean))];
  const hasMultipleFarmers = uniqueFarmerIds.length > 1;

  // Set warning banner if multiple farmers detected
  useEffect(() => {
    if (hasMultipleFarmers) {
      setWarningMsg(
        '⚠️ Your cart contains produce from different farmers. In order to optimize dispatch logistics, please checkout or clear items from one farmer before adding items from another.'
      );
    } else {
      setWarningMsg('');
    }
  }, [hasMultipleFarmers, cartItems]);

  // Fetch other products from the same farmer present in the cart
  useEffect(() => {
    let isMounted = true;
    const fetchMoreFromFarmer = async () => {
      const farmerId = uniqueFarmerIds[0];
      if (!cartItems || cartItems.length === 0 || uniqueFarmerIds.length !== 1 || !farmerId) {
        if (isMounted) setFarmerProducts([]);
        return;
      }

      try {
        const allFarmerProducts = await productService.getProductsByFarmer(farmerId);
        if (!isMounted) return;

        // Filter out items already in the cart
        const cartProductIds = new Set(cartItems.map((item) => item.productId || item.id));
        const filteredSuggestions = (allFarmerProducts || []).filter(
          (prod) => !cartProductIds.has(prod.productId || prod.id)
        );

        setFarmerProducts(filteredSuggestions.slice(0, 4));
      } catch (err) {
        console.warn('Could not load other farmer products:', err);
        if (isMounted) setFarmerProducts([]);
      }
    };

    fetchMoreFromFarmer();
    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-basket"></i> Your Basket
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Shopping Cart</h2>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
          >
            <i className="bi bi-trash me-1"></i> Clear Cart
          </button>
        )}
      </div>

      {/* Multi-Farmer Warning Alert */}
      {warningMsg && (
        <div
          className="alert border-0 shadow-sm p-3.5 rounded-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          role="alert"
          style={{ backgroundColor: 'var(--kc-amber-gold-subtle)', color: 'var(--kc-amber-gold)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
            <span className="small fw-semibold">{warningMsg}</span>
          </div>
          <button
            onClick={clearCart}
            className="kc-btn kc-btn-sm kc-btn-outline align-self-start align-self-md-auto text-nowrap"
          >
            Clear Other Items
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="kc-card p-5 text-center shadow-sm my-4">
          <i className="bi bi-cart-x text-muted display-3 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark mb-2">Your Cart is Currently Empty</h4>
          <p className="text-muted small mb-4">
            Discover crisp, nutrient-dense organic harvests direct from local farm stewards.
          </p>
          <Link to="/customer/products" className="kc-btn kc-btn-primary kc-btn-sm d-inline-flex">
            Browse Fresh Harvests
          </Link>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="kc-card p-3 p-md-4 shadow-sm">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item) => {
                  const itemId = item.cartId || item.productId || item.id;
                  const itemImg = resolveProductImageUrl(item.image || item.imageUrl || item.productImage);
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const lineTotal = price * qty;

                  return (
                    <div
                      key={itemId}
                      className="p-3 rounded-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 border"
                      style={{ backgroundColor: 'var(--kc-cream)', borderColor: 'var(--kc-beige)' }}
                    >
                      {/* Image & Title */}
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="rounded-3 object-fit-cover shadow-xs flex-shrink-0"
                          style={{ width: '70px', height: '70px', border: '1px solid var(--kc-beige)' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300';
                          }}
                        />
                        <div>
                          <h6 className="fw-bold text-dark mb-1">{item.name || 'Produce Item'}</h6>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <span>{formatCurrency(price)} / {item.unit || 'kg'}</span>
                            {item.farmerName && (
                              <span className="badge kc-badge-cream" style={{ fontSize: '0.7rem' }}>
                                Grower: {item.farmerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stepper, Line Total, Remove */}
                      <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 ms-auto ms-sm-0">
                        {/* Stepper */}
                        <div
                          className="d-flex align-items-center border rounded-pill bg-white px-2 py-1"
                          style={{ borderColor: 'var(--kc-beige)' }}
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                            onClick={() => updateQuantity(item.cartId, qty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <i className="bi bi-dash-lg"></i>
                          </button>
                          <span className="fw-bold px-2 small">{qty}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                            onClick={() => updateQuantity(item.cartId, qty + 1)}
                            disabled={qty >= (item.availableStock || 99)}
                            aria-label="Increase quantity"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-end" style={{ minWidth: '85px' }}>
                          <span className="fw-extrabold text-dark d-block">
                            {formatCurrency(lineTotal)}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          className="btn btn-link text-danger p-1 text-decoration-none"
                          onClick={() => removeFromCart(item.cartId)}
                          title="Remove item"
                        >
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="col-lg-4">
            <div className="kc-card p-4 shadow-sm sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="fw-bold text-dark">{formatCurrency(cartSubtotal)}</span>
              </div>

              <div className="d-flex justify-content-between small text-muted mb-3 pb-3 border-bottom">
                <span>Direct Dispatch & Logistics</span>
                <span className="fw-bold text-dark">
                  {deliveryFee === 0 ? <span className="text-success">FREE</span> : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fw-bold text-dark fs-6">Grand Total</span>
                <span className="display-6 fw-extrabold text-success mb-0" style={{ fontSize: '1.8rem' }}>
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                type="button"
                className="kc-btn kc-btn-primary kc-btn-lg w-100 justify-content-center shadow-sm"
                onClick={() => navigate('/customer/checkout')}
                disabled={hasMultipleFarmers}
              >
                <span>Proceed to Checkout</span>
                <i className="bi bi-arrow-right"></i>
              </button>

              <div className="mt-3 text-center">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-shield-check text-success me-1"></i>
                  100% Secure Checkout powered by Razorpay
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Same-Farmer Recommendations (if available) */}
      {farmerProducts.length > 0 && (
        <section className="mt-5">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="kc-section-badge mb-1">Combine Shipment</span>
              <h4 className="fw-extrabold text-dark mb-0">More from the Same Farm</h4>
            </div>
          </div>

          <div className="row g-4">
            {farmerProducts.map((prod) => (
              <div key={prod.productId || prod.id} className="col-6 col-md-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;
