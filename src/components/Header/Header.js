import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiShoppingBag, FiHeart, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './Header.css';

const Header = ({ isVisible = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);
  
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { openCart, getCartItemsCount } = useCart();
  const { openWishlist, wishlistCount } = useWishlist();
  const navigate = useNavigate();
  
  const cartItemsCount = getCartItemsCount();

  const handleUserMouseEnter = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current);
    }
    setUserDropdownOpen(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setUserDropdownOpen(false);
    }, 200);
  };

  const navItems = [
    { 
      name: 'STREETWEAR', 
      link: '/shop/streetwear',
      dropdown: {
        categories: ['T-Shirts & Tops', 'Hoodies', 'Sweatshirts', 'Jackets', 'Pants', 'Jeans', 'Shorts', 'Shirts', 'Sweaters'],
        brands: ['Carhartt WIP', 'Dickies', 'Gramicci', 'Patagonia', 'Nike ACG', 'adidas Originals', 'A.LAB', 'Dravus'],
        featured: 'NEW ARRIVALS'
      }
    },
    { 
      name: 'SHOES', 
      link: '/shop/shoes',
      dropdown: {
        categories: ['Skate Shoes', 'Sneakers', 'Winter Shoes', 'Sandals', 'Shoe Accessories'],
        brands: ['Nike SB', 'adidas Skateboarding', 'Vans', 'New Balance Numeric', 'Converse', 'DC', 'Globe', 'Osiris'],
        featured: 'BEST SELLERS'
      }
    },
    { 
      name: 'ACCESSORIES', 
      link: '/shop/accessories',
      dropdown: {
        categories: ['Beanies', 'Caps', 'Backpacks', 'Bags', 'Sunglasses', 'Wallets', 'Belts', 'Socks', 'Watches'],
        brands: ['Carhartt WIP', 'Dickies', 'Nixon', 'Herschel', 'Thrasher', 'Santa Cruz', 'Got Bag'],
        featured: 'TRENDING NOW'
      }
    },
    { 
      name: 'SKATE', 
      link: '/shop/skate',
      dropdown: {
        categories: ['Skateboard Decks', 'Complete Skateboards', 'Trucks', 'Wheels', 'Bearings', 'Griptape', 'Hardware', 'Skate Tools', 'Protective Gear'],
        brands: ['Hockey Skateboards', 'Santa Cruz', 'Polar Skate', 'DGK', 'Zero', 'Sour Solution', 'Spitfire', 'Independent', 'Bones'],
        featured: 'PRO SETUPS'
      }
    },
    { 
      name: 'SURF', 
      link: '/shop/surf',
      dropdown: {
        categories: ['Surfboards', 'Wetsuits', 'Boardshorts', 'Rash Guards', 'Surf Accessories', 'Fins', 'Leashes', 'Surf Wax'],
        brands: ['Rip Curl', 'Billabong', 'Quiksilver', 'Hurley', 'RVCA', 'Volcom', "O'Neill", 'Vissla'],
        featured: 'WETSUIT GUIDE'
      }
    },
    { 
      name: 'SNOWBOARD', 
      link: '/shop/snowboard',
      dropdown: {
        categories: ['Snowboards', 'Snowboard Boots', 'Bindings', 'Snowboard Jackets', 'Snowboard Pants', 'Goggles', 'Helmets', 'Gloves'],
        brands: ['Burton', 'Volcom', 'Jones', 'Ride', 'Union', 'ThirtyTwo', 'Anon', 'Oakley'],
        featured: 'WINTER GEAR'
      }
    },
    { 
      name: 'BRANDS', 
      link: '/shop',
      dropdown: {
        categories: ['All Brands A-Z', 'Top Brands', 'New Brands', 'Exclusive Brands'],
        brands: ['Nike SB', 'adidas', 'Carhartt WIP', 'Patagonia', 'Vans', 'Dickies', 'The North Face', 'Volcom', 'Burton', 'Santa Cruz'],
        featured: 'BRAND SPOTLIGHT'
      }
    },
    { 
      name: 'SALE', 
      link: '/shop', 
      isSale: true,
      dropdown: {
        categories: ['All Sale Items', 'Streetwear Sale', 'Shoes Sale', 'Accessories Sale', 'Skate Sale', 'Snowboard Sale'],
        brands: ['Up to 30% Off', 'Up to 50% Off', 'Up to 70% Off', 'Last Chance'],
        featured: 'BEST DEALS'
      }
    },
  ];

  const handleMouseEnter = (index) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Component for animated text with rolling letters
  const RollingText = ({ text }) => {
    return (
      <span className="rolling-text">
        <span className="rolling-text-inner">
          {text.split('').map((char, index) => (
            <span key={index} className="rolling-char" style={{ transitionDelay: `${index * 0.02}s` }}>
              {char}
            </span>
          ))}
        </span>
        <span className="rolling-text-inner rolling-text-hover">
          {text.split('').map((char, index) => (
            <span key={index} className="rolling-char" style={{ transitionDelay: `${index * 0.02}s` }}>
              {char}
            </span>
          ))}
        </span>
      </span>
    );
  };

  return (
    <header className={`header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src="/Logo.png" alt="Rufus Macba" className="logo-image" />
          </Link>
        </div>

        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item, index) => (
              <li 
                key={index} 
                className={`nav-item ${activeDropdown === index ? 'dropdown-active' : ''}`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={item.link || '/shop'} className={`nav-link ${item.isSale ? 'sale-link' : ''}`}>
                  <RollingText text={item.name} />
                </Link>
                {item.dropdown && activeDropdown === index && (
                  <div 
                    className="mega-dropdown"
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="dropdown-inner">
                      <div className="dropdown-column">
                        <h4 className="dropdown-title">Categories</h4>
                        <ul className="dropdown-list">
                          {item.dropdown.categories.map((cat, catIndex) => (
                            <li key={catIndex}>
                              <Link to={`/shop/${cat.toLowerCase().replace(/\s+/g, '-')}`}>{cat}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="dropdown-column">
                        <h4 className="dropdown-title">Top Brands</h4>
                        <ul className="dropdown-list">
                          {item.dropdown.brands.map((brand, brandIndex) => (
                            <li key={brandIndex}>
                              <Link to={`/shop?brand=${brand.toLowerCase().replace(/\s+/g, '-')}`}>{brand}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="dropdown-column dropdown-featured">
                        <div className="featured-box">
                          <span className="featured-label">{item.dropdown.featured}</span>
                          <Link to={`/shop`} className="featured-link">
                            Shop Now →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button className="action-btn" aria-label="Wishlist" onClick={openWishlist}>
            <FiHeart size={18} />
            {wishlistCount > 0 && (
              <span className="wishlist-badge">{wishlistCount}</span>
            )}
          </button>
          
          {/* User Account - Shows dropdown when logged in */}
          {isAuthenticated() ? (
            <div 
              className={`user-account-wrapper ${userDropdownOpen ? 'dropdown-active' : ''}`}
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <button className="action-btn user-btn" aria-label="My Account">
                <span className="user-avatar-small">
                  {user?.firstName?.charAt(0)}
                </span>
              </button>
              
              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-greeting">Hello, {user?.firstName}!</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                  <div className="user-dropdown-menu">
                    <Link to="/account" className="user-dropdown-item">
                      <FiUser size={16} />
                      My Account
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className="user-dropdown-item admin-link">
                        <FiSettings size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/orders" className="user-dropdown-item">
                      <FiShoppingBag size={16} />
                      My Orders
                    </Link>
                    <Link to="/account/settings" className="user-dropdown-item">
                      <FiSettings size={16} />
                      Settings
                    </Link>
                    <button 
                      className="user-dropdown-item logout"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="action-btn" aria-label="My Account">
              <FiUser size={18} />
            </Link>
          )}
          
          <button onClick={openCart} className="action-btn cart-btn" aria-label="Shopping Basket">
            <FiShoppingBag size={18} />
            {cartItemsCount > 0 && (
              <span className="cart-count">{cartItemsCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
