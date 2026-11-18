import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'kisanconnect_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync cart items to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Failed to sync kisanconnect_cart to localStorage:', err);
    }
  }, [cartItems]);

  // Fetch cart items from database
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('Authorization') || localStorage.getItem('token');
    if (!token) {
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
      console.warn('Could not fetch cart items (user may need to login):', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      const prodPrice = Number(product.price) || Number(product.productPrice) || 0;
      const qty = Number(quantity) || 1;

      const payload = {
        productId: product.productId || product.id,
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
  };

  // Update item quantity in cart
  const updateQuantity = async (cartId, newQuantity) => {
    try {
      const targetItem = cartItems.find((item) => item.cartId === cartId);
      if (!targetItem) return;

      if (newQuantity <= 0) {
        await removeFromCart(cartId);
        return;
      }

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
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    try {
      const response = await customerService.removeFromCart(cartId);
      await fetchCart();
      return response;
    } catch (err) {
      console.error('Failed to remove item from database:', err);
      throw err;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await customerService.clearCart();
      setCartItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear database cart:', err);
      throw err;
    }
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
