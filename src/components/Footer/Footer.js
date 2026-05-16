import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { newsletterApi, brandsApi, categoriesApi } from '../../api';
import { useSettings } from '../../context/SettingsContext';
import './Footer.css';

const FALLBACK_BRAND_LINKS = [
  { name: 'BREDL', to: '/shop?brand=Bredl' },
  { name: 'NIKE SB', to: '/shop?brand=Nike%20SB' },
  { name: 'VANS', to: '/shop?brand=Vans' },
  { name: 'PALACE', to: '/shop?brand=Palace' },
  { name: 'SPITFIRE', to: '/shop?brand=Spitfire' },
];

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [brandLinks, setBrandLinks] = useState(FALLBACK_BRAND_LINKS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await brandsApi.featuredList();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setBrandLinks(data.map((b) => ({
            name: (b.name || '').toUpperCase(),
            to: b.href || `/shop?brand=${encodeURIComponent((b.name || '').toLowerCase().replace(/\s+/g, '-'))}`,
          })));
        }
      } catch (_err) {
        // keep fallback list
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Top-level shop categories are pulled from the same /categories endpoint
  // the header uses, so the footer never lists slugs that don't exist server-side.
  const [shopCategories, setShopCategories] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (cancelled || !Array.isArray(data)) return;
        setShopCategories(data.slice(0, 5).map((c) => ({
          name: (c.name || c.slug || '').toUpperCase(),
          to: `/shop/${c.slug}`,
        })));
      } catch (_err) {
        // leave empty — section will hide
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const footerLinks = {
    enlaces: [
      { name: 'TERMS', to: '/terms' },
      { name: 'PRIVACY', to: '/privacy' },
      { name: 'SHOP ALL', to: '/shop' },
    ],
    brands: brandLinks,
    categories: shopCategories,
  };

  const socials = settings?.socials || {};
  const social = [
    { Icon: FiInstagram, label: 'Instagram', href: socials.instagram },
    { Icon: FiFacebook, label: 'Facebook', href: socials.facebook },
    { Icon: FiTwitter, label: 'Twitter', href: socials.twitter },
    { Icon: FiYoutube, label: 'YouTube', href: socials.youtube },
  ].filter((s) => s.href);

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
            <h2 className="footer-logo">{settings?.storeName || 'BREDL'}</h2>
            <p className="footer-description">
              {settings?.storeTagline || 'Your local skate shop in Barcelona since 2010. Premium skate gear, shoes, and clothing from the best brands.'}
            </p>
            {(settings?.storeEmail || settings?.storePhone || settings?.storeAddress) && (
              <ul className="footer-contact">
                {settings?.storeAddress && <li>{settings.storeAddress}</li>}
                {settings?.storeEmail && (
                  <li><a href={`mailto:${settings.storeEmail}`}>{settings.storeEmail}</a></li>
                )}
                {settings?.storePhone && (
                  <li><a href={`tel:${settings.storePhone}`}>{settings.storePhone}</a></li>
                )}
              </ul>
            )}
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
            Copyright © {new Date().getFullYear()}, {settings?.storeName || 'BREDL'}. All rights reserved.
          </p>
          <div className="payment-methods">
            <span className="payment-text">Cash on delivery · Bank transfer · Flouci</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
