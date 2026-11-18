import React, { createContext, useContext, useState, useEffect } from 'react';

export const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = 'kisan_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (err) {
      console.warn('Failed to persist wishlist to localStorage:', err);
    }
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    const id = product.productId || product.id;
    if (!id) return;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => (item.productId || item.id) === id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item.productId || item.id) !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item.productId || item.id) === productId);
  };

  const toggleWishlist = (product) => {
    const id = product.productId || product.id;
    if (isInWishlist(id)) {
      removeFromWishlist(id);
      return false; // Removed
    } else {
      addToWishlist(product);
      return true; // Added
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
