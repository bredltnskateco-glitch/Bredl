import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { newsletterApi } from '../../api';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const footerLinks = {
    enlaces: [
      { name: 'POLICY', to: '/shop' },
      { name: 'OUR STORE', to: '/shop' },
      { name: 'SEARCH', to: '/shop' },
    ],
    brands: [
      { name: 'BREDL', to: '/shop?brand=bredl' },
      { name: 'NIKE SB', to: '/shop?brand=nike-sb' },
      { name: 'ADIDAS', to: '/shop?brand=adidas' },
      { name: 'VANS PRO', to: '/shop?brand=vans' },
      { name: 'PALACE', to: '/shop?brand=palace' },
    ],
    categories: [
      { name: 'NEW ARRIVALS', to: '/shop' },
      { name: 'CLOTHING', to: '/shop/streetwear' },
      { name: 'SHOES', to: '/shop/shoes' },
      { name: 'HARDWARE', to: '/shop/skate' },
      { name: 'SALES', to: '/shop' },
    ],
  };

  const social = [
    { Icon: FiInstagram, label: 'Instagram', href: 'https://www.instagram.com' },
    { Icon: FiFacebook, label: 'Facebook', href: 'https://www.facebook.com' },
    { Icon: FiTwitter, label: 'Twitter', href: 'https://twitter.com' },
    { Icon: FiYoutube, label: 'YouTube', href: 'https://www.youtube.com' },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setMessage('');
    try {
      await newsletterApi.subscribe(email.trim());
      setStatus('success');
      setMessage('Subscribed — check your inbox.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed. Please try again.');
    }
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
              {social.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="social-link"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-heading">Links</h3>
              <ul className="footer-list">
                {footerLinks.enlaces.map((item, index) => (
                  <li key={index}>
                    <Link to={item.to} className="footer-link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Top Brands</h3>
              <ul className="footer-list">
                {footerLinks.brands.map((item, index) => (
                  <li key={index}>
                    <Link to={item.to} className="footer-link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Categories</h3>
              <ul className="footer-list">
                {footerLinks.categories.map((item, index) => (
                  <li key={index}>
                    <Link to={item.to} className="footer-link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Newsletter</h3>
              <p className="footer-newsletter-text">
                Stay updated with news offers and special releases by subscribing to our newsletter!
              </p>
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Email"
                  className="footer-newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
                <button
                  type="submit"
                  className="footer-newsletter-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? '...' : 'SUBSCRIBE'}
                </button>
                {message && (
                  <span
                    className={`footer-newsletter-msg ${status === 'error' ? 'error' : 'ok'}`}
                  >
                    {message}
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            Copyright © {new Date().getFullYear()}, BREDL Macba. All rights reserved.
          </p>
          <div className="payment-methods">
            <span className="payment-text">Visa · Mastercard · PayPal · Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
