import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Server always responds with success to prevent user enumeration; we
      // still flip to the confirmation view on a 2xx response.
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send the reset email. Try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>CHECK YOUR EMAIL</h1>
            <p>
              If an account exists for <strong>{email}</strong>, we just sent it a
              password reset link. The link expires in 15 minutes and can be used once.
            </p>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/login">Return to login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>FORGOT PASSWORD</h1>
          <p>Enter the email on your account and we'll send you a reset link.</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered it?{' '}
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
