import React, { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiShoppingBag, FiTrash2, FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
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
    clearCart 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');

  const formatPrice = (price) => {
    return `${price.toFixed(2).replace('.', ',')} TND`;
  };

  const itemCount = getCartItemsCount();

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
                <div className="promo-input-wrapper">
                  <input 
                    type="text" 
                    className="promo-input"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button className="promo-apply-btn">Apply</button>
                </div>
              </div>

              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span className="subtotal-amount">{formatPrice(getCartTotal())}</span>
              </div>
              
              <p className="shipping-note">Shipping & taxes calculated at checkout</p>
              
              <Link to="/checkout" className="checkout-btn" onClick={closeCart}>
                Checkout <FiArrowRight size={18} />
              </Link>
              
              <button className="continue-btn" onClick={closeCart}>
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
