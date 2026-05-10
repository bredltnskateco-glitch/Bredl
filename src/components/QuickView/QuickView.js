import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX, FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiCheck, FiShoppingCart, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './QuickView.css';

const QuickView = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { addToCart } = useCart();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return `${price.toFixed(2).replace('.', ',')} TND`;
  };

  const images = product.images && product.images.length > 0 
    ? [product.image, ...product.images] 
    : [product.image, product.hoverImage].filter(Boolean);

  const sizes = product.shoeSize || product.sizes || [];
  const colors = product.colors || [];

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      return; // Could add error state here
    }
    
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, selectedSize, selectedColor, quantity);
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 400);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const getProductSpecs = () => {
    const specs = [];
    if (product.deckWidth) specs.push({ label: 'Width', value: product.deckWidth });
    if (product.deckLength) specs.push({ label: 'Length', value: product.deckLength });
    if (product.wheelbase) specs.push({ label: 'Wheelbase', value: product.wheelbase });
    if (product.concave) specs.push({ label: 'Concave', value: product.concave });
    if (product.material) specs.push({ label: 'Material', value: product.material });
    if (product.wheelSize) specs.push({ label: 'Wheel Size', value: product.wheelSize });
    if (product.durometer) specs.push({ label: 'Durometer', value: product.durometer });
    if (product.boardLength) specs.push({ label: 'Length', value: product.boardLength });
    if (product.boardVolume) specs.push({ label: 'Volume', value: product.boardVolume });
    if (product.finSetup) specs.push({ label: 'Fin Setup', value: product.finSetup });
    if (product.flex) specs.push({ label: 'Flex', value: product.flex });
    return specs;
  };

  const specs = getProductSpecs();
  const hasDiscount = product.salePrice && product.price;
  const currentPrice = product.salePrice || product.price || product.regularPrice;
  const originalPrice = product.price || product.regularPrice;

  return ReactDOM.createPortal(
    <>
      <div className="quickview-overlay" onClick={onClose} />
      <div className="quickview-modal">
        <button className="quickview-close" onClick={onClose}>
          <FiX size={24} />
        </button>

        <div className="quickview-content">
          {/* Image Gallery */}
          <div className="quickview-gallery">
            <div className="gallery-main">
              <img 
                src={images[selectedImage]} 
                alt={product.name} 
                className="gallery-main-image"
              />
              {images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage}>
                    <FiChevronLeft size={24} />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage}>
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}
              {hasDiscount && (
                <span className="quickview-badge sale">
                  -{Math.round((1 - product.salePrice / originalPrice) * 100)}%
                </span>
              )}
              {product.isNew && (
                <span className="quickview-badge new">NEW</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`gallery-thumb ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="quickview-details">
            <div className="quickview-header">
              {product.brand && <span className="product-brand">{product.brand}</span>}
              <h2 className="product-title">{product.name}</h2>
              <div className="product-price-row">
                {hasDiscount ? (
                  <>
                    <span className="price-original">{formatPrice(originalPrice)}</span>
                    <span className="price-sale">{formatPrice(product.salePrice)}</span>
                  </>
                ) : (
                  <span className="price-current">{formatPrice(currentPrice)}</span>
                )}
              </div>
            </div>

            {/* Product Specs */}
            {specs.length > 0 && (
              <div className="product-specs">
                {specs.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="option-group">
                <div className="option-header">
                  <span className="option-label">
                    {product.shoeSize ? 'Size (EU)' : 'Size'}
                  </span>
                  {selectedSize && <span className="option-selected">{selectedSize}</span>}
                </div>
                <div className="size-options">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="option-group">
                <div className="option-header">
                  <span className="option-label">Color</span>
                  {selectedColor && <span className="option-selected">{selectedColor}</span>}
                </div>
                <div className="color-options">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      <span className="color-name">{color}</span>
                      {selectedColor === color && <FiCheck size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="quickview-actions">
              <div className="quantity-selector">
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-display">{quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              <button 
                className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding || (sizes.length > 0 && !selectedSize)}
              >
                {isAdding ? (
                  <span className="btn-content">
                    <span className="spinner"></span>
                    Adding...
                  </span>
                ) : isAdded ? (
                  <span className="btn-content">
                    <FiCheck size={18} />
                    Added to Cart
                  </span>
                ) : (
                  <span className="btn-content">
                    <FiShoppingCart size={18} />
                    Add to Cart
                  </span>
                )}
              </button>

              <button 
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <FiHeart size={20} />
              </button>
            </div>

            {/* Quick Info */}
            <div className="quick-info">
              <div className="info-item">
                <FiTruck size={16} />
                <span>Free shipping over 200 TND</span>
              </div>
              <div className="info-item">
                <FiRefreshCw size={16} />
                <span>30-day easy returns</span>
              </div>
              <div className="info-item">
                <FiShield size={16} />
                <span>Secure checkout</span>
              </div>
            </div>

            {/* Description Preview */}
            {product.description && (
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            )}

            <button className="view-full-details">
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default QuickView;
