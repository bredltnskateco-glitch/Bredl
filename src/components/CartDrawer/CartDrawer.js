import React, { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiShoppingBag, FiTrash2, FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount,
    clearCart,
    checkout,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [checkoutError, setCheckoutError] = useState('');

  const formatPrice = (price) => {
    return `${price.toFixed(2).replace('.', ',')} TND`;
  };

  const itemCount = getCartItemsCount();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoMessage('Promo codes are not active yet. Stay tuned!');
    setTimeout(() => setPromoMessage(''), 3500);
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    if (!isAuthenticated()) {
      closeCart();
      navigate('/login');
      return;
    }
    setCheckoutState('processing');
    try {
      await checkout();
      setCheckoutState('success');
      setTimeout(() => {
        setCheckoutState('idle');
        closeCart();
      }, 2000);
    } catch (err) {
      setCheckoutState('idle');
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} />
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>
            <FiShoppingBag />
            Cart
            {itemCount > 0 && <span className="cart-count-badge">{itemCount}</span>}
          </h2>
          <button className="cart-close-btn" onClick={closeCart}>
            <FiX size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FiShoppingBag size={48} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Discover our latest collection and find something you'll love.</p>
            <button className="continue-shopping-btn" onClick={closeCart}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    {item.brand && <span className="cart-item-brand">{item.brand}</span>}
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-variants">
                      {item.selectedSize && (
                        <span className="variant">
                          <span className="variant-label">Size:</span> {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="variant">
                          <span className="variant-label">Color:</span> {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="cart-item-price">
                      {item.salePrice && item.price && (
                        <span className="original-price">{formatPrice(item.price)}</span>
                      )}
                      {formatPrice(item.salePrice || item.price || item.regularPrice)}
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(
                            item.id, 
                            item.selectedSize, 
                            item.selectedColor, 
                            item.quantity - 1
                          )}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(
                            item.id, 
                            item.selectedSize, 
                            item.selectedColor, 
                            item.quantity + 1
                          )}
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="clear-cart-btn" onClick={clearCart}>
                Clear all items
              </button>
              
              <div className="promo-section">
                <form className="promo-input-wrapper" onSubmit={handleApplyPromo}>
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit" className="promo-apply-btn">Apply</button>
                </form>
                {promoMessage && (
                  <p className="promo-message">{promoMessage}</p>
                )}
              </div>

              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span className="subtotal-amount">{formatPrice(getCartTotal())}</span>
              </div>
              
              <p className="shipping-note">Shipping & taxes calculated at checkout</p>

              {checkoutError && (
                <p className="checkout-error">{checkoutError}</p>
              )}

              <button
                type="button"
                className={`checkout-btn ${checkoutState}`}
                onClick={handleCheckout}
                disabled={checkoutState === 'processing'}
              >
                {checkoutState === 'processing' ? (
                  <>Processing...</>
                ) : checkoutState === 'success' ? (
                  <>
                    <FiCheckCircle size={18} /> Order Placed
                  </>
                ) : (
                  <>
                    {isAuthenticated() ? 'Place Order' : 'Sign in to Checkout'}{' '}
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>

              <button type="button" className="continue-btn" onClick={closeCart}>
                Continue Shopping
              </button>

              <div className="trust-badges">
                <div className="trust-badge">
                  <FiShield size={14} />
                  <span>Secure</span>
                </div>
                <div className="trust-badge">
                  <FiTruck size={14} />
                  <span>Fast Delivery</span>
                </div>
                <div className="trust-badge">
                  <FiRefreshCw size={14} />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
