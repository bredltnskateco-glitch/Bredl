import React, { useState } from 'react';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './AddToCart.css';

const AddToCart = ({ 
  product, 
  selectedSize = null, 
  selectedColor = null,
  showQuantity = false,
  variant = 'default' // 'default', 'small', 'icon-only'
}) => {
  const { addToCart, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart(product, selectedSize, selectedColor, quantity);
      setIsAdding(false);
      setIsAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 300);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (variant === 'icon-only') {
    return (
      <button 
        className={`add-to-cart-icon ${isAdded ? 'added' : ''} ${isAdding ? 'adding' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding}
        aria-label="Add to cart"
      >
        {isAdded ? <FiCheck size={18} /> : <FiShoppingCart size={18} />}
      </button>
    );
  }

  return (
    <div className={`add-to-cart-wrapper ${variant}`}>
      {showQuantity && (
        <div className="quantity-selector">
          <button 
            className="qty-btn" 
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="qty-display">{quantity}</span>
          <button className="qty-btn" onClick={incrementQuantity}>
            +
          </button>
        </div>
      )}
      
      <button 
        className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${isAdding ? 'adding' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding}
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
    </div>
  );
};

export default AddToCart;
