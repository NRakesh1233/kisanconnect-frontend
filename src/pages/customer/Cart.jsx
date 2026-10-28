import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import ProductCard from '../../components/customer/ProductCard';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BASE_URL = "http://localhost:8080";

export default function Cart() {
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
      setWarningMsg('⚠️ Your cart contains products from different farmers. Please checkout or clear items from one farmer before adding products from another farmer.');
    } else {
      setWarningMsg('');
    }
  }, [hasMultipleFarmers, cartItems]);

  // Fetch other products from the same farmer present in the cart (guarded against undefined)
  useEffect(() => {
    let isMounted = true;

    const fetchMoreFromFarmer = async () => {
      const farmerId = uniqueFarmerIds[0];
      if (!cartItems || cartItems.length === 0 || uniqueFarmerIds.length !== 1 || !farmerId) {
        if (isMounted) setFarmerProducts([]);
        return;
      }

      try {
        const allFarmerProducts = await productService.getProductsByFarmer(farmerId).catch(() => []);
             console.log('Fetched products from farmer:', allFarmerProducts);
        if (!isMounted) return;

        // Filter out items already in the cart
        const cartProductIds = new Set(cartItems.map((item) => item.id));
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

  // Helper to safely format image source
  const getProductImageSrc = (item) => {
    const imgProp = item.imageUrl || item.image;
    if (!imgProp) return 'https://via.placeholder.com/80?text=Produce';
    if (imgProp.startsWith('http://') || imgProp.startsWith('https://')) {
      return imgProp;
    }
    if (imgProp.includes('/uploads/')) {
      return `${BASE_URL}${imgProp}`;
    }
    return `${BASE_URL}/uploads/products/${imgProp}`;
  };
console.log('Farmer products:', farmerProducts);
console.log('farmer ids:', uniqueFarmerIds);
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{marginTop:"100px"}}>
        <h2 className="fw-bold text-dark mb-4">
          <i className="bi bi-cart3 text-success me-2"></i>Shopping Cart
        </h2>

        {/* Multi-Farmer Warning Alert */}
        {warningMsg && (
          <div className="alert alert-warning shadow-sm border-warning mb-4 d-flex align-items-center justify-content-between" role="alert">
            <div><i className="bi bi-exclamation-triangle-fill me-2"></i>{warningMsg}</div>
            <button onClick={clearCart} className="btn btn-sm btn-outline-dark fw-bold text-nowrap ms-3">
              Clear Cart
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5 rounded-4 bg-white">
            <div className="card-body py-5">
              <i className="bi bi-cart-x text-muted display-3 d-block mb-3"></i>
              <h4 className="fw-bold text-dark">Your cart is empty</h4>
              <p className="text-muted mb-4">Explore our fresh agricultural catalog and add some farm-fresh produce!</p>
              <Link to="/customer/products" className="btn btn-kisan-primary px-4 py-2">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="row g-4 mb-5">
              {/* Cart Items List */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <h5 className="fw-bold text-dark mb-0">Cart Items ({totalItemsCount})</h5>
                    <button onClick={clearCart} className="btn btn-outline-danger btn-sm">
                      <i className="bi bi-trash me-1"></i> Clear Cart
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {cartItems.map((item) => {
                      const currentQty = Number(item.quantity) || 1;
                      const currentPrice = Number(item.price) || 0;
                      const itemTotal = currentPrice * currentQty;

                      return (
                        <div key={item.cartId || item.id} className="p-3 rounded-3 border bg-light d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
                          {/* Product Image */}
                          <img
                            src={getProductImageSrc(item)}
                            alt={item.name}
                            className="rounded-3 object-fit-cover"
                            style={{ width: '80px', height: '80px' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80?text=Produce';
                            }}
                          />

                          {/* Product Details */}
                          <div className="flex-grow-1">
                            <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                            <small className="text-muted d-block mb-1">
                              Farmer: <span className="text-dark fw-medium">{item.farmerName || 'Local Farmer'}</span>
                            </small>
                            <span className="fw-bold text-success">₹{currentPrice} / {item.unit || 'kg'}</span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="d-flex align-items-center border rounded bg-white" style={{ width: '120px' }}>
                            <button
                              className="btn btn-sm btn-light text-success px-2 py-1 border-0"
                              onClick={() => updateQuantity(item.cartId, currentQty - 1)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <div className="flex-grow-1 text-center fw-bold text-dark fs-7">
                              {currentQty}
                            </div>
                            <button
                              className="btn btn-sm btn-light text-success px-2 py-1 border-0"
                              onClick={() => updateQuantity(item.cartId, currentQty + 1)}
                              disabled={currentQty >= (item.availableStock || 999)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-end" style={{ minWidth: '90px' }}>
                            <span className="fw-bold text-dark d-block">₹{itemTotal.toFixed(2)}</span>
                          </div>

                          {/* Remove Button */}
                          <button
                            className="btn btn-outline-danger btn-sm border-0"
                            onClick={() => removeFromCart(item.cartId)}
                            title="Remove item"
                          >
                            <i className="bi bi-trash fs-5"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cart Summary Card */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order Summary</h5>

                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold text-dark">₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-3 fs-7 pb-3 border-bottom">
                    <span className="text-muted">Delivery Charge</span>
                    <span className="fw-bold text-success">₹{deliveryFee}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-4 fs-5 fw-bold">
                    <span className="text-dark">Grand Total</span>
                    <span className="text-success">₹{grandTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (hasMultipleFarmers) {
                        alert('You cannot checkout with products from multiple farmers in the same order. Please keep products from only one farmer.');
                        return;
                      }
                      navigate('/customer/checkout');
                    }}
                    disabled={hasMultipleFarmers}
                    className={`btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm ${
                      hasMultipleFarmers ? 'btn-secondary' : 'btn-success'
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* More Products from the Same Farmer */}
            {farmerProducts.length > 0 && !hasMultipleFarmers && (
              <section className="mt-5 pt-4 border-top">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">
                      <i className="bi bi-shop text-success me-2"></i>More Fresh Produce from this Farmer
                    </h4>
                    <p className="text-muted fs-7 mb-0">Add more items from the same farmer to your current order.</p>
                  </div>
                </div>

                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
                  {farmerProducts.map((prod) => (
                    <div key={prod.productId || prod.id} className="col">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}