import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { wishlistApi } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'rufus_wishlist';

const normalize = (item) => ({
  ...item,
  id: item.product || item.id,
  product: item.product || item.id,
});

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWishlistItems(JSON.parse(saved).map(normalize));
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
      } catch (_) {}
    }
  }, [wishlistItems, user]);

  useEffect(() => {
    const sync = async () => {
      if (!user) {
        if (lastUserIdRef.current) setWishlistItems([]);
        lastUserIdRef.current = null;
        return;
      }
      if (lastUserIdRef.current === user.id) return;
      lastUserIdRef.current = user.id;

      try {
        const guestRaw = localStorage.getItem(STORAGE_KEY);
        const guest = guestRaw ? JSON.parse(guestRaw) : [];
        const payload = guest
          .filter((i) => i && (i.product || i.id))
          .map((i) => ({ product: i.product || i.id }));

        const list = payload.length
          ? await wishlistApi.merge(payload)
          : await wishlistApi.get();

        setWishlistItems((list.items || []).map(normalize));
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Wishlist sync failed:', err);
      }
    };
    sync();
  }, [user]);

  const addToWishlist = useCallback(async (product) => {
    const productId = product.id || product._id;
    if (user) {
      try {
        const list = await wishlistApi.add(productId);
        setWishlistItems((list.items || []).map(normalize));
        return;
      } catch (err) {
        console.error('Add to wishlist failed:', err);
      }
    }
    setWishlistItems((prev) => {
      if (prev.find((i) => String(i.id) === String(productId))) return prev;
      return [...prev, normalize({ ...product, id: productId, product: productId })];
    });
  }, [user]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (user) {
      try {
        const list = await wishlistApi.remove(productId);
        setWishlistItems((list.items || []).map(normalize));
        return;
      } catch (err) {
        console.error('Remove from wishlist failed:', err);
      }
    }
    setWishlistItems((prev) => prev.filter((i) => String(i.id) !== String(productId)));
  }, [user]);

  const isInWishlist = (productId) =>
    wishlistItems.some((i) => String(i.id) === String(productId));

  const toggleWishlist = (product) => {
    const productId = product.id || product._id;
    if (isInWishlist(productId)) removeFromWishlist(productId);
    else addToWishlist(product);
  };

  const clearWishlist = useCallback(async () => {
    if (user) {
      try {
        await wishlistApi.clear();
      } catch (_) {}
    }
    setWishlistItems([]);
  }, [user]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount: wishlistItems.length,
      isWishlistOpen,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      openWishlist,
      closeWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

export default WishlistContext;
