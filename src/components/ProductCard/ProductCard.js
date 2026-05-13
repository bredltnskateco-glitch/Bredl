import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import QuickView from '../QuickView/QuickView';
import { FiHeart } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price) => {
    return `${price.toFixed(2).replace('.', ',')} TND`;
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 300);
  };

  // Get category-specific specs to display
  const getProductSpecs = () => {
    const specs = [];
    
    // Skateboard deck specs
    if (product.deckWidth) specs.push(product.deckWidth);
    if (product.concave) specs.push(product.concave);
    
    // Skateboard wheels specs
    if (product.wheelSize) specs.push(product.wheelSize);
    if (product.durometer) specs.push(product.durometer);
    
    // Skateboard trucks specs
    if (product.truckSize) specs.push(product.truckSize);
    
    // Surf specs
    if (product.boardLength && product.category === 'surf') specs.push(product.boardLength);
    if (product.finSetup) specs.push(product.finSetup);
    
    // Snowboard specs
    if (product.boardLength && product.category === 'snowboard') specs.push(product.boardLength);
    if (product.flex) specs.push(`Flex: ${product.flex}`);
    
    // Shoe sizes display
    if (product.shoeSize && product.shoeSize.length > 0) {
      specs.push(`EU ${product.shoeSize[0]}-${product.shoeSize[product.shoeSize.length - 1]}`);
    }
    
    // Clothing sizes display
    if (product.sizes && product.sizes.length > 0 && !product.shoeSize) {
      specs.push(product.sizes.join(' / '));
    }
    
    return specs;
  };

  const specs = getProductSpecs();

  const openQuickView = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowQuickView(true);
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openQuickView();
    }
  };

  return (
    <article
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="product-link"
        onClick={openQuickView}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Quick view ${product.name}`}
      >
        <div className="product-image-wrapper">
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {product.isOnSale && (
            <span className="sale-badge">SALE</span>
          )}
          {product.isNew && (
            <span className="new-badge">NEW</span>
          )}
          <button
            type="button"
            className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart />
          </button>
          <div className="product-actions">
            <button
              className="quick-view-btn"
              type="button"
              onClick={openQuickView}
            >
              <span>Quick View</span>
            </button>
            <button
              className={`quick-add-btn ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
            >
              {isAdded ? 'Added' : isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          {specs.length > 0 && (
            <div className="product-specs">
              {specs.slice(0, 3).map((spec, index) => (
                <span key={index} className="spec-tag">{spec}</span>
              ))}
            </div>
          )}
          <div className="product-prices">
            {product.isOnSale || product.salePrice ? (
              <>
                <span className="regular-price strikethrough">
                  {formatPrice(product.regularPrice || product.price)}
                </span>
                <span className="sale-price">
                  {formatPrice(product.salePrice)}
                </span>
              </>
            ) : (
              <span className="regular-price">
                {formatPrice(product.regularPrice || product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </article>
  );
};

export default ProductCard;
