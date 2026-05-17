import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import '../../components/GoogleSignInButton/GoogleSignInButton.css';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // MFA challenge step
  const [mfaCode, setMfaCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  const { login, pendingMfa, verifyMfaLogin, cancelMfaLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    if (result.mfaRequired) {
      // Stay on this page; MFA form will be shown via pendingMfa.
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    if (result.user.role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const payload = useBackup ? { backupCode } : { code: mfaCode };
    const result = await verifyMfaLogin(payload);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.user.role === 'admin') navigate('/admin');
    else navigate('/');
  };

  // ---------- MFA challenge view ----------
  if (pendingMfa) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>TWO-FACTOR CODE</h1>
            <p>Enter the 6-digit code from your authenticator app for {pendingMfa.email}.</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleMfaSubmit}>
            {!useBackup ? (
              <div className="form-group">
                <label htmlFor="mfaCode">AUTHENTICATOR CODE</label>
                <input
                  type="text"
                  id="mfaCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123 456"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="backupCode">BACKUP CODE</label>
                <input
                  type="text"
                  id="backupCode"
                  autoComplete="one-time-code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="abcde-12345"
                  required
                  autoFocus
                  disabled={isLoading}
                />
                <span className="input-hint">Each backup code can be used once.</span>
              </div>
            )}

            <button
              type="submit"
              className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'VERIFYING...' : 'VERIFY'}
            </button>

            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => { setUseBackup((v) => !v); setError(''); }}
              disabled={isLoading}
            >
              {useBackup ? 'Use authenticator code' : 'Use a backup code'}
            </button>

            <button
              type="button"
              className="auth-btn link"
              onClick={() => { cancelMfaLogin(); setMfaCode(''); setBackupCode(''); }}
              disabled={isLoading}
              style={{ marginTop: 8 }}
            >
              Cancel and go back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- Password view ----------
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>WELCOME BACK</h1>
          <p>Log in to your account to continue.</p>
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <GoogleSignInButton
            label="signin_with"
            onError={(msg) => setError(msg)}
            onSuccess={(signedIn) => {
              navigate(signedIn?.role === 'admin' ? '/admin' : '/');
            }}
          />
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
