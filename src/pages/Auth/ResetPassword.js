import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../api';
import './Auth.css';

const validatePasswordClient = (pw) => {
  if (!pw || pw.length < 12) return 'Password must be at least 12 characters';
  if (pw.length > 128) return 'Password is too long';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must include a digit';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a symbol';
  return null;
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is malformed. Request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const pwError = validatePasswordClient(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      // Send the user to /login after a short pause so they read the message.
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Could not reset your password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>PASSWORD UPDATED</h1>
            <p>Your password has been changed. Redirecting you to the login page…</p>
          </div>
          <div className="auth-footer">
            <p>
              <Link to="/login">Log in now</Link>
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
          <h1>CHOOSE A NEW PASSWORD</h1>
          <p>The link is valid for 15 minutes and can be used once.</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">NEW PASSWORD</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 12 characters"
                required
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <span className="input-hint">
              At least 12 chars, with upper/lowercase, digit, and symbol
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">CONFIRM NEW PASSWORD</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
