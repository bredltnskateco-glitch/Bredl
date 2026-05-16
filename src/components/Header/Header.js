import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiShoppingBag, FiHeart, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { categoriesApi } from '../../api';
import './Header.css';

const Header = ({ isVisible = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [adminCategories, setAdminCategories] = useState([]);
  const dropdownTimeoutRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (!cancelled && Array.isArray(data)) setAdminCategories(data);
      } catch (err) {
        // Header should not break if categories fail to load
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { openCart, getCartItemsCount } = useCart();
  const { openWishlist, wishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    return undefined;
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileExpanded(null);
  };
  
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

  // Navbar is fully driven by the categories API. Adding a category in admin
  // adds a top-level item; adding a subcategory populates the hover dropdown.
  const navItems = useMemo(() => adminCategories.map((c) => ({
    name: (c.name || c.slug || '').toUpperCase(),
    link: `/shop/${c.slug}`,
    parentSlug: c.slug,
    dropdown: (c.subcategories && c.subcategories.length > 0)
      ? { items: c.subcategories.map((s) => ({ name: s.name, slug: s.slug })) }
      : null,
  })), [adminCategories]);

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
          <Link to="/" onClick={closeMenu}>
            <img src="/Logo.png" alt="Rufus Macba" className="logo-image" />
          </Link>
        </div>

        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {menuOpen && (
          <div
            className="nav-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Primary">
          <ul className="nav-list">
            {navItems.map((item, index) => {
              const isExpanded = mobileExpanded === index;
              return (
                <li
                  key={item.parentSlug || index}
                  className={`nav-item ${activeDropdown === index ? 'dropdown-active' : ''} ${isExpanded ? 'mobile-expanded' : ''}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="nav-link-row">
                    <Link
                      to={item.link || '/shop'}
                      className="nav-link"
                      onClick={closeMenu}
                    >
                      <RollingText text={item.name} />
                    </Link>
                    {item.dropdown && (
                      <button
                        type="button"
                        className={`nav-expand ${isExpanded ? 'open' : ''}`}
                        onClick={() => setMobileExpanded(isExpanded ? null : index)}
                        aria-label={`Toggle ${item.name} subnav`}
                        aria-expanded={isExpanded}
                      >
                        <FiChevronDown />
                      </button>
                    )}
                  </div>
                  {item.dropdown && (activeDropdown === index || isExpanded) && (
                    <div
                      className="mega-dropdown"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="dropdown-inner">
                        <div className="dropdown-column">
                          <ul className="dropdown-list">
                            {item.dropdown.items.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  to={`/shop/${item.parentSlug}?subcategory=${sub.slug}`}
                                  onClick={closeMenu}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
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
              <button
                className="action-btn user-btn"
                aria-label="My Account"
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
                onClick={() => setUserDropdownOpen((open) => !open)}
              >
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
                    {isAdmin() ? (
                      <Link
                        to="/admin"
                        className="user-dropdown-item admin-link"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FiSettings size={16} />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="user-dropdown-item"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openCart();
                        }}
                      >
                        <FiShoppingBag size={16} />
                        View Cart
                      </button>
                    )}
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openWishlist();
                      }}
                    >
                      <FiHeart size={16} />
                      My Wishlist
                    </button>
                    <button
                      type="button"
                      className="user-dropdown-item logout"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
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
