import React, { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from './shopData';
import './ShopProductCard.css';

const ShopProductCard = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  // If the product needs a size/color choice, defer to QuickView so the user
  // can pick a variant. Otherwise add directly.
  const requiresVariant = (
    (product.sizes && product.sizes.length > 0) ||
    (product.shoeSize && product.shoeSize.length > 0) ||
    (product.colors && product.colors.length > 0)
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresVariant) {
      onQuickView(product);
      return;
    }
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 300);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <article
      className="shop-product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="product-link"
        onClick={handleQuickView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleQuickView(e);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Quick view ${product.name}`}
      >
        <div className="product-image-wrapper">
          <button
            type="button"
            className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <FiHeart />
          </button>
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {product.isNew && <span className="badge badge-new">NEW</span>}
          {product.salePrice && <span className="badge badge-sale">SALE</span>}
          {product.isPromo && <span className="badge badge-promo">PROMO</span>}
          <div className="product-quick-actions">
            <button
              type="button"
              className="quick-action-btn"
              onClick={handleQuickView}
            >
              Quick View
            </button>
            <button
              type="button"
              className={`quick-action-btn ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdded ? 'Added!' : isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
        <div className="product-info">
          <span className="product-brand">{product.brand}</span>
          <h3 className="product-name">{product.name}</h3>
          {product.colors && product.colors.length > 0 && (
            <div className="product-colors">
              {product.colors.slice(0, 3).map((color, index) => (
                <span key={index} className="color-dot" title={color}></span>
              ))}
              {product.colors.length > 3 && (
                <span className="more-colors">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
          <div className="product-prices">
            {product.salePrice ? (
              <>
                <span className="regular-price strikethrough">{formatPrice(product.price)}</span>
                <span className="sale-price">{formatPrice(product.salePrice)}</span>
              </>
            ) : (
              <span className="regular-price">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ShopProductCard;
