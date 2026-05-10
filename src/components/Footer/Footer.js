import React from 'react';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const footerLinks = {
    enlaces: [
      { name: 'POLICY', link: '#policy' },
      { name: 'OUR STORE', link: '#store' },
      { name: 'SEARCH', link: '#search' },
    ],
    brands: [
      { name: 'BREDL', link: '#BREDL' },
      { name: 'NIKE SB', link: '#nike-sb' },
      { name: 'ADIDAS', link: '#adidas' },
      { name: 'VANS PRO', link: '#vans' },
      { name: 'PALACE', link: '#palace' },
    ],
    categories: [
      { name: 'NEW ARRIVALS', link: '#new-arrivals' },
      { name: 'CLOTHING', link: '#clothing' },
      { name: 'SHOES', link: '#shoes' },
      { name: 'HARDWARE', link: '#hardware' },
      { name: 'SALES', link: '#sales' },
    ],
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h2 className="footer-logo">BREDL</h2>
            <p className="footer-description">
              Your local skate shop in Barcelona since 2010. 
              Premium skate gear, shoes, and clothing from the best brands.
            </p>
            <div className="footer-social">
              <a href="#instagram" className="social-link" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="#facebook" className="social-link" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="#twitter" className="social-link" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="#youtube" className="social-link" aria-label="YouTube">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-heading">Enlaces</h3>
              <ul className="footer-list">
                {footerLinks.enlaces.map((item, index) => (
                  <li key={index}>
                    <a href={item.link} className="footer-link">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Top Brands</h3>
              <ul className="footer-list">
                {footerLinks.brands.map((item, index) => (
                  <li key={index}>
                    <a href={item.link} className="footer-link">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Categories</h3>
              <ul className="footer-list">
                {footerLinks.categories.map((item, index) => (
                  <li key={index}>
                    <a href={item.link} className="footer-link">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Newsletter</h3>
              <p className="footer-newsletter-text">
                Stay updated with news offers and special releases by subscribing to our newsletter!
              </p>
              <form className="footer-newsletter-form">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn">
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            Copyright © 2026, BREDL Macba. All rights reserved.
          </p>
          <div className="payment-methods">
            <span className="payment-icon">💳</span>
            <span className="payment-text">Visa, Mastercard, PayPal, Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
