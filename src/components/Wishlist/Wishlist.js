import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../pages/Shop/shopData';
import './Wishlist.css';

const Wishlist = () => {
  const {
    wishlistItems,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => addToCart(item));
    clearWishlist();
  };

  const handleStartShopping = () => {
    closeWishlist();
    navigate('/shop');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`wishlist-overlay ${isWishlistOpen ? 'active' : ''}`}
        onClick={closeWishlist}
      />
      
      {/* Wishlist Drawer */}
      <div className={`wishlist-drawer ${isWishlistOpen ? 'open' : ''}`}>
        <div className="wishlist-header">
          <div className="wishlist-title">
            <FiHeart className="wishlist-icon" />
            <h2>My Wishlist</h2>
            <span className="wishlist-count">({wishlistItems.length})</span>
          </div>
          <button className="wishlist-close" onClick={closeWishlist}>
            <FiX />
          </button>
        </div>

        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-empty">
              <FiHeart className="empty-icon" />
              <h3>Your wishlist is empty</h3>
              <p>Save items you love by clicking the heart icon</p>
              <button type="button" className="continue-shopping-btn" onClick={handleStartShopping}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="wishlist-items">
                {wishlistItems.map(item => (
                  <li key={item.id} className="wishlist-item">
                    <div className="wishlist-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="wishlist-item-details">
                      <span className="wishlist-item-brand">{item.brand}</span>
                      <h4 className="wishlist-item-name">{item.name}</h4>
                      <div className="wishlist-item-price">
                        {item.salePrice ? (
                          <>
                            <span className="original-price">{formatPrice(item.price)}</span>
                            <span className="sale-price">{formatPrice(item.salePrice)}</span>
                          </>
                        ) : (
                          <span>{formatPrice(item.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="wishlist-item-actions">
                      <button 
                        className="move-to-cart-btn"
                        onClick={() => handleMoveToCart(item)}
                        title="Move to Cart"
                      >
                        <FiShoppingBag />
                      </button>
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="wishlist-footer">
                <button 
                  className="move-all-btn"
                  onClick={handleMoveAllToCart}
                >
                  <FiShoppingBag />
                  Move All to Cart
                </button>
                <button 
                  className="clear-wishlist-btn"
                  onClick={clearWishlist}
                >
                  Clear Wishlist
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
