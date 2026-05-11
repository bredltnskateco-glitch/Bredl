import React, { useState } from 'react';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../../../context/AuthContext';
import { mfaApi } from '../../../../api';
import './MfaPanel.css';

const MfaPanel = () => {
  const { user, refresh } = useAuth();
  const [enrollment, setEnrollment] = useState(null); // { secret, otpauth, qrDataUrl }
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [regenPassword, setRegenPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const startSetup = async () => {
    setBusy(true);
    setError('');
    setBackupCodes(null);
    try {
      const data = await mfaApi.setup();
      setEnrollment(data);
    } catch (err) {
      setError(err.message || 'Failed to start MFA setup');
    } finally {
      setBusy(false);
    }
  };

  const cancelSetup = () => {
    setEnrollment(null);
    setCode('');
    setError('');
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await mfaApi.enable(code.replace(/\s/g, ''));
      setBackupCodes(res.backupCodes);
      setEnrollment(null);
      setCode('');
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not enable MFA');
    } finally {
      setBusy(false);
    }
  };

  const disableMfa = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await mfaApi.disable({ password: disablePassword, code: disableCode });
      setDisablePassword('');
      setDisableCode('');
      setBackupCodes(null);
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not disable MFA');
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await mfaApi.regenerateBackupCodes(regenPassword);
      setBackupCodes(res.backupCodes);
      setRegenPassword('');
    } catch (err) {
      setError(err.message || 'Could not regenerate backup codes');
    } finally {
      setBusy(false);
    }
  };

  const copyCodes = async () => {
    if (!backupCodes) return;
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
    } catch (_) { /* clipboard may be denied */ }
  };

  return (
    <div className="mfa-panel">
      <div className="mfa-header">
        <FiShield className="mfa-header-icon" />
        <div>
          <h2>Two-factor authentication</h2>
          <p>
            Status:{' '}
            <strong className={user?.mfaEnabled ? 'mfa-on' : 'mfa-off'}>
              {user?.mfaEnabled ? 'ENABLED' : 'NOT ENABLED'}
            </strong>
          </p>
        </div>
      </div>

      {user?.role === 'admin' && !user.mfaEnabled && (
        <div className="mfa-warning">
          <FiAlertTriangle />
          <span>MFA is required for admins to perform any write actions. Enable it now.</span>
        </div>
      )}

      {error && (
        <div className="mfa-error">
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* Setup / enable flow */}
      {!user?.mfaEnabled && (
        <div className="mfa-section">
          <h3>Enroll a new device</h3>
          {!enrollment && (
            <button className="mfa-btn primary" onClick={startSetup} disabled={busy}>
              {busy ? 'Loading…' : 'Start MFA setup'}
            </button>
          )}

          {enrollment && (
            <form className="mfa-enroll" onSubmit={confirmEnable}>
              <ol className="mfa-steps">
                <li>
                  Open Google Authenticator, Authy, or 1Password and add a new account.
                </li>
                <li>
                  Scan this QR code, or enter the secret manually.
                  <div className="mfa-qr-wrap">
                    <img src={enrollment.qrDataUrl} alt="MFA QR code" className="mfa-qr" />
                  </div>
                  <div className="mfa-secret">
                    <code>{enrollment.secret}</code>
                  </div>
                </li>
                <li>
                  Enter the 6-digit code your app shows to confirm.
                  <div className="mfa-code-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      maxLength={7}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123 456"
                      required
                      autoFocus
                    />
                    <button type="submit" className="mfa-btn primary" disabled={busy}>
                      {busy ? 'Enabling…' : 'Enable MFA'}
                    </button>
                    <button type="button" className="mfa-btn ghost" onClick={cancelSetup} disabled={busy}>
                      Cancel
                    </button>
                  </div>
                </li>
              </ol>
            </form>
          )}
        </div>
      )}

      {/* Backup codes display (shown once after enable / regenerate) */}
      {backupCodes && (
        <div className="mfa-section mfa-backup-section">
          <h3><FiCheckCircle /> Backup codes — store these now</h3>
          <p>Each code can be used once if you lose access to your authenticator. They are shown only this time.</p>
          <ul className="mfa-backup-list">
            {backupCodes.map((c) => (<li key={c}><code>{c}</code></li>))}
          </ul>
          <button className="mfa-btn ghost" onClick={copyCodes}>
            <FiCopy /> Copy all
          </button>
        </div>
      )}

      {/* Disable + regenerate */}
      {user?.mfaEnabled && (
        <>
          <div className="mfa-section">
            <h3>Disable MFA</h3>
            <p>Disabling weakens your account. Re-enable it as soon as possible.</p>
            <form className="mfa-form-grid" onSubmit={disableMfa}>
              <label>
                Password
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                />
              </label>
              <label>
                Current TOTP code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="123 456"
                  required
                />
              </label>
              <button type="submit" className="mfa-btn danger" disabled={busy}>
                {busy ? 'Working…' : 'Disable MFA'}
              </button>
            </form>
          </div>

          <div className="mfa-section">
            <h3><FiRefreshCw /> Regenerate backup codes</h3>
            <p>Invalidates the old codes immediately.</p>
            <form className="mfa-form-grid" onSubmit={regenerate}>
              <label>
                Password
                <input
                  type="password"
                  value={regenPassword}
                  onChange={(e) => setRegenPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="mfa-btn primary" disabled={busy}>
                {busy ? 'Working…' : 'Regenerate codes'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default MfaPanel;
