import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import { AuthContext } from './AuthContext';
import { ROLES } from '../utils/constants';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'kisanconnect_cart';

export const CartProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const role = auth?.role;
  const authLoading = auth?.loading;

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync cart items to localStorage for instant persistence
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Failed to sync kisanconnect_cart to localStorage:', err);
    }
  }, [cartItems]);

  // Fetch cart items from database ONLY when authenticated as a CUSTOMER
  const fetchCart = useCallback(async () => {
    // If auth state is still restoring, wait
    if (authLoading) return;

    // Verify token and role from both context and localStorage
    const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
    const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();

    // Do NOT call customer cart endpoint for unauthenticated users or non-customer roles (e.g. Farmers)
    if (!currentToken || currentRole !== ROLES.CUSTOMER) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await customerService.getCartProducts();
      const mappedItems = (data || []).map((item) => ({
        id: item.productId,
        productId: item.productId,
        cartId: item.cartId,
        name: item.productName,
        productName: item.productName,
        price: Number(item.productPrice) || Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.totalPrice) || 0,
        image: item.image || item.productImage,
        imageUrl: item.image || item.productImage,
        category: item.category,
        unit: item.unit || 'kg',
        availableStock: Number(item.availableStock) || 999,
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        farmerProfilePic: item.farmerProfilePic,
      }));
      setCartItems(mappedItems);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Gracefully handle unauthenticated/forbidden without throwing unhandled console errors
        console.info('Cart sync skipped: session unauthorized or role mismatch.');
      } else {
        console.warn('Could not fetch cart items:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, token, role]);

  // Sync cart whenever auth state finishes loading or when role changes
  useEffect(() => {
    if (!authLoading) {
      const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
      const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();

      if (currentToken && currentRole === ROLES.CUSTOMER) {
        fetchCart();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, token, role, fetchCart]);

  // Add item to cart (supports both guest localStorage and authenticated customer backend sync)
  const addToCart = async (product, quantity = 1) => {
    const prodPrice = Number(product.price) || Number(product.productPrice) || 0;
    const qty = Number(quantity) || 1;
    const prodId = product.productId || product.id;

    const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
    const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();
    const canSyncBackend = Boolean(currentToken && currentRole === ROLES.CUSTOMER);

    if (canSyncBackend) {
      try {
        const payload = {
          productId: prodId,
          cartPrice: prodPrice,
          quantity: qty,
          totalPrice: prodPrice * qty,
        };

        const response = await customerService.addToCart(payload);
        await fetchCart();
        return `${product.productName || product.name || 'Item'} ${response || 'added to cart'}!`;
      } catch (err) {
        console.error('Failed to add item to database cart:', err);
        throw err;
      }
    } else {
      // Local / guest mode: persist directly to localStorage
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex((it) => (it.productId || it.id) === prodId);
        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQty = (updated[existingIndex].quantity || 1) + qty;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            totalPrice: prodPrice * newQty,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: prodId,
              productId: prodId,
              cartId: `local-${Date.now()}`,
              name: product.productName || product.name,
              productName: product.productName || product.name,
              price: prodPrice,
              quantity: qty,
              totalPrice: prodPrice * qty,
              image: product.image || product.productImage,
              imageUrl: product.image || product.productImage,
              category: product.category,
              unit: product.unit || 'kg',
              availableStock: Number(product.stock || product.totalStock) || 999,
              farmerId: product.farmerId,
              farmerName: product.farmerName,
              farmerProfilePic: product.profilePic || product.farmerProfilePic,
            },
          ];
        }
      });
      return `${product.productName || product.name || 'Item'} added to cart!`;
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (cartId, newQuantity) => {
    const targetItem = cartItems.find((item) => item.cartId === cartId);
    if (!targetItem) return;

    if (newQuantity <= 0) {
      await removeFromCart(cartId);
      return;
    }

    const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
    const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();
    const canSyncBackend = Boolean(currentToken && currentRole === ROLES.CUSTOMER && !String(cartId).startsWith('local-'));

    if (canSyncBackend) {
      try {
        await customerService.updateCartQuantity(cartId, {
          productId: Number(targetItem.id || targetItem.productId) || 0,
          cartPrice: Number(targetItem.price) || 0,
          quantity: Number(newQuantity),
          totalPrice: (Number(targetItem.price) || 0) * Number(newQuantity),
        });
        await fetchCart();
      } catch (err) {
        console.error('Failed to update quantity in database:', err);
        throw err;
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: newQuantity, totalPrice: (Number(item.price) || 0) * newQuantity }
            : item
        )
      );
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
    const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();
    const canSyncBackend = Boolean(currentToken && currentRole === ROLES.CUSTOMER && !String(cartId).startsWith('local-'));

    if (canSyncBackend) {
      try {
        const response = await customerService.removeFromCart(cartId);
        await fetchCart();
        return response;
      } catch (err) {
        console.error('Failed to remove item from database:', err);
        throw err;
      }
    } else {
      setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
      return 'Item removed';
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    const currentToken = token || localStorage.getItem('Authorization') || localStorage.getItem('token');
    const currentRole = (role || localStorage.getItem('role') || '').toUpperCase();
    const canSyncBackend = Boolean(currentToken && currentRole === ROLES.CUSTOMER);

    if (canSyncBackend) {
      try {
        await customerService.clearCart();
      } catch (err) {
        console.warn('Backend clear cart error:', err);
      }
    }
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    cartSubtotal,
    fetchCart,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
