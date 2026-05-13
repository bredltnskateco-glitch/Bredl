import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartApi, ordersApi } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const STORAGE_KEY = 'bredl_cart';

// Products from the API have Mongo ObjectId strings (24 hex chars). Some pages
// still render from static frontend data (numeric ids), and the server can't
// look those up — skip the server round-trip for those and keep them in the
// local cart only.
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const isServerProductId = (id) => typeof id === 'string' && OBJECT_ID_RE.test(id);

const normalize = (item) => ({
  ...item,
  id: item.product || item.id,
  product: item.product || item.id,
  selectedSize: item.selectedSize ?? null,
  selectedColor: item.selectedColor ?? null,
  quantity: item.quantity ?? 1,
});

const sameItem = (a, b) =>
  String(a.id || a.product) === String(b.id || b.product) &&
  (a.selectedSize ?? null) === (b.selectedSize ?? null) &&
  (a.selectedColor ?? null) === (b.selectedColor ?? null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const lastUserIdRef = useRef(null);

  // Load from localStorage initially
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCartItems(JSON.parse(saved).map(normalize));
    } catch (_) {}
  }, []);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      } catch (_) {}
    }
  }, [cartItems, user]);

  // Sync with backend on login / merge guest cart
  useEffect(() => {
    const syncOnLogin = async () => {
      if (!user) {
        if (lastUserIdRef.current) {
          // Just logged out — clear in-memory cart
          setCartItems([]);
        }
        lastUserIdRef.current = null;
        return;
      }
      if (lastUserIdRef.current === user.id) return;
      lastUserIdRef.current = user.id;

      try {
        const guestRaw = localStorage.getItem(STORAGE_KEY);
        const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
        const payload = guestItems
          .filter((i) => i && (i.product || i.id))
          .map((i) => ({
            product: i.product || i.id,
            selectedSize: i.selectedSize ?? null,
            selectedColor: i.selectedColor ?? null,
            quantity: i.quantity || 1,
          }));

        const cart = payload.length
          ? await cartApi.merge(payload)
          : await cartApi.get();

        setCartItems((cart.items || []).map(normalize));
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Cart sync failed:', err);
      }
    };
    syncOnLogin();
  }, [user]);

  const addToCart = useCallback(async (product, selectedSize = null, selectedColor = null, quantity = 1) => {
    const productId = product.id || product._id;
    setIsCartOpen(true);

    if (user && isServerProductId(String(productId))) {
      try {
        const cart = await cartApi.add({
          productId,
          selectedSize,
          selectedColor,
          quantity,
        });
        setCartItems((cart.items || []).map(normalize));
        return;
      } catch (err) {
        console.error('Add to cart failed:', err);
      }
    }

    setCartItems((prev) => {
      const candidate = {
        ...product,
        id: productId,
        product: productId,
        name: product.name,
        image: product.image,
        price: product.salePrice ?? product.price ?? product.regularPrice,
        salePrice: product.salePrice ?? null,
        regularPrice: product.price ?? product.regularPrice ?? null,
        selectedSize,
        selectedColor,
        quantity,
        addedAt: new Date().toISOString(),
      };
      const idx = prev.findIndex((i) => sameItem(i, candidate));
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, candidate];
    });
  }, [user]);

  const removeFromCart = useCallback(async (productId, selectedSize = null, selectedColor = null) => {
    if (user && isServerProductId(String(productId))) {
      try {
        const cart = await cartApi.remove({ productId, selectedSize, selectedColor });
        setCartItems((cart.items || []).map(normalize));
        return;
      } catch (err) {
        console.error('Remove from cart failed:', err);
      }
    }
    setCartItems((prev) => prev.filter((i) => !sameItem(i, { id: productId, selectedSize, selectedColor })));
  }, [user]);

  const updateQuantity = useCallback(async (productId, selectedSize, selectedColor, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(productId, selectedSize, selectedColor);
    }
    if (user && isServerProductId(String(productId))) {
      try {
        const cart = await cartApi.update({
          productId, selectedSize, selectedColor, quantity: newQuantity,
        });
        setCartItems((cart.items || []).map(normalize));
        return;
      } catch (err) {
        console.error('Update quantity failed:', err);
      }
    }
    setCartItems((prev) => prev.map((i) =>
      sameItem(i, { id: productId, selectedSize, selectedColor })
        ? { ...i, quantity: newQuantity }
        : i,
    ));
  }, [user, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await cartApi.clear();
      } catch (err) {
        console.error('Clear cart failed:', err);
      }
    }
    setCartItems([]);
  }, [user]);

  const getCartTotal = () => cartItems.reduce((total, item) => {
    const price = item.salePrice || item.price || item.regularPrice || 0;
    return total + price * item.quantity;
  }, 0);

  const getCartItemsCount = () => cartItems.reduce((c, i) => c + i.quantity, 0);

  const isInCart = (productId) => cartItems.some((i) => String(i.id) === String(productId));

  const checkout = useCallback(async (payload = {}) => {
    if (!user) throw new Error('You must be logged in to checkout');
    const items = cartItems
      .map((i) => ({
        product: i.product || i.id,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      }))
      .filter((i) => isServerProductId(String(i.product)));
    if (items.length === 0) {
      throw new Error('Your cart has no checkout-eligible items.');
    }
    const created = await ordersApi.create({ items, ...payload });
    setCartItems([]);
    return created;
  }, [user, cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      getCartTotal,
      getCartItemsCount,
      isInCart,
      openCart,
      closeCart,
      toggleCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
