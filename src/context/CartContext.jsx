import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items from database
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('customer/cart/products');
      const mappedItems = (response.data || []).map((item) => ({
        id: item.productId,
        cartId: item.cartId,
        name: item.productName,
        price: Number(item.productPrice) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.totalPrice) || 0,
        image: item.image || item.productImage,
        imageUrl: item.image || item.productImage,
        category: item.category,
        unit: item.unit || 'kg',
        availableStock: Number(item.availableStock) || 999,
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        farmerProfilePic: item.farmerProfilePic
      }));
      setCartItems(mappedItems);
    } catch (err) {
      console.warn('Could not fetch database cart (user may need to login):', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      const payload = {
        productId: product.productId || product.id,
        cartPrice: Number(product.price) || 0,
        quantity: Number(quantity) || 1,
        totalPrice: (Number(product.price) || 0) * (Number(quantity) || 1)
      };

      const response = await api.post('customer/cart/add', payload);
      const msg = response.data;
      
      // Automatically refresh cart state
      await fetchCart();
      
      return `${product.productName || product.name} ${msg}!`;
    } catch (err) {
      console.error('Failed to add item to database cart:', err);
      alert('Failed to update cart on server.');
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    try {
      const product1 = cartItems.find(item => item.cartId === cartId);
      if (!product1) return;

      // If quantity is reduced to 0 or less, remove the item entirely from the cart
      if (newQuantity <= 0) {
        await removeFromCart(cartId);
        return;
      }

      await api.put(`customer/cart/update/quantity/${cartId}`, {
        productId: Number(product1.id) || 0,
        cartPrice: Number(product1.price) || 0,
        quantity: Number(newQuantity),
        totalPrice: (Number(product1.price) || 0) * (Number(newQuantity) || 1)
      });

      // Automatically refresh cart state
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity in database:', err);
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const response = await api.delete(`customer/cart/delete/${cartId}`);
      const msg = response.data;
      
      // Automatically refresh cart state
      await fetchCart();
      return msg;
    } catch (err) {
      console.error('Failed to remove item from database:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('customer/cart/delete/all');
      setCartItems([]);
    } catch (err) {
      console.error('Failed to clear database cart:', err);
    }
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        cartSubtotal,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};