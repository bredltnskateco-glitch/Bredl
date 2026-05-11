import React, { useState } from 'react';
import { newsletterApi } from '../../api';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await newsletterApi.subscribe(email);
      setStatus('success');
      setMessage('Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter-container">
        <h2 className="newsletter-title">Subscribe to our Newsletter</h2>
        <p className="newsletter-subtitle">
          Offers, new products and launching. Directly to your device screen
        </p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="newsletter-input"
          />
          <button
            type="submit"
            className="newsletter-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '...' : 'SUBSCRIBE'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: 12, color: status === 'error' ? '#c00' : 'inherit' }}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
