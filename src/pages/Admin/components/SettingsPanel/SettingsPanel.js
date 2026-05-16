import React, { useEffect, useState, useCallback } from 'react';
import {
  FiSave, FiUser, FiBell, FiGlobe, FiSpeaker, FiShield, FiAlertTriangle,
} from 'react-icons/fi';
import { settingsApi } from '../../../../api';
import { useSettings } from '../../../../context/SettingsContext';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from '../Toast/Toast';
import './SettingsPanel.css';

const EMPTY = {
  storeName: '',
  storeTagline: '',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  currency: 'TND',
  timezone: 'Europe/Madrid',
  socials: { instagram: '', facebook: '', twitter: '', youtube: '' },
  announcement: { enabled: false, text: '', href: '' },
  notifications: { emailEnabled: true, orderEnabled: true, marketingEnabled: false },
};

const merge = (incoming) => ({
  ...EMPTY,
  ...incoming,
  socials: { ...EMPTY.socials, ...(incoming?.socials || {}) },
  announcement: { ...EMPTY.announcement, ...(incoming?.announcement || {}) },
  notifications: { ...EMPTY.notifications, ...(incoming?.notifications || {}) },
});

const SettingsPanel = () => {
  const { user } = useAuth();
  const { refresh } = useSettings();
  const [activeSection, setActiveSection] = useState('profile');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.adminGet();
        if (!cancelled) setForm(merge(data));
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback((path, value) => {
    setForm((prev) => {
      if (!path.includes('.')) return { ...prev, [path]: value };
      const [parent, child] = path.split('.');
      return { ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } };
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    update(name, type === 'checkbox' ? checked : value);
  };

  const save = async (sectionLabel) => {
    setSaving(true);
    try {
      await settingsApi.save(form);
      await refresh();
      toast.success(`${sectionLabel} saved`);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Store Profile', icon: FiUser },
    { id: 'announcement', label: 'Announcement', icon: FiSpeaker },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'localization', label: 'Localization', icon: FiGlobe },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  if (loading) return <p>Loading settings…</p>;

  const mfaEnabled = user?.mfaEnabled;

  return (
    <div className="settings-panel">
      <div className="settings-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <section.icon />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">
        {!mfaEnabled && (
          <div className="settings-mfa-hint" role="alert">
            <FiAlertTriangle />
            <span>
              Saving requires MFA on your admin account. Enable it in the Security (MFA) tab first.
            </span>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Store Profile</h3>
              <p>These values drive the storefront footer, copyright line, and contact info.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" name="storeName" value={form.storeName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Store Email</label>
                <input type="email" name="storeEmail" value={form.storeEmail} onChange={handleChange} placeholder="contact@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="storePhone" value={form.storePhone} onChange={handleChange} placeholder="+216 ..." />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="storeAddress" value={form.storeAddress} onChange={handleChange} placeholder="Street, City, Country" />
              </div>
              <div className="form-group settings-grid-span">
                <label>Tagline (footer description)</label>
                <textarea name="storeTagline" value={form.storeTagline} onChange={handleChange} rows={3} />
              </div>
            </div>

            <div className="section-header" style={{ marginTop: 16 }}>
              <h3>Social Links</h3>
              <p>Used by the footer social icons. Leave a field blank to hide that icon.</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Instagram</label>
                <input type="url" name="socials.instagram" value={form.socials.instagram} onChange={handleChange} placeholder="https://www.instagram.com/..." />
              </div>
              <div className="form-group">
                <label>Facebook</label>
                <input type="url" name="socials.facebook" value={form.socials.facebook} onChange={handleChange} placeholder="https://www.facebook.com/..." />
              </div>
              <div className="form-group">
                <label>Twitter / X</label>
                <input type="url" name="socials.twitter" value={form.socials.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
              </div>
              <div className="form-group">
                <label>YouTube</label>
                <input type="url" name="socials.youtube" value={form.socials.youtube} onChange={handleChange} placeholder="https://www.youtube.com/..." />
              </div>
            </div>

            <button className="save-btn" onClick={() => save('Store profile')} disabled={saving}>
              <FiSave />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeSection === 'announcement' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Announcement Bar</h3>
              <p>The thin black bar above the navbar on every public page. Use it for promos, free-shipping thresholds, or seasonal messages.</p>
            </div>

            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Show announcement bar</span>
                  <span className="toggle-desc">When off, the bar is hidden site-wide.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="announcement.enabled"
                    checked={!!form.announcement.enabled}
                    onChange={handleChange}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <div className="form-grid single">
              <div className="form-group">
                <label>Text</label>
                <input
                  type="text"
                  name="announcement.text"
                  value={form.announcement.text}
                  onChange={handleChange}
                  maxLength={280}
                  placeholder="Free shipping on orders over 100 euros"
                />
              </div>
              <div className="form-group">
                <label>Link (optional)</label>
                <input
                  type="url"
                  name="announcement.href"
                  value={form.announcement.href}
                  onChange={handleChange}
                  placeholder="/shop or https://..."
                />
              </div>
            </div>

            <button className="save-btn" onClick={() => save('Announcement')} disabled={saving}>
              <FiSave />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Notification Settings</h3>
              <p>Toggle store-level email notifications.</p>
            </div>

            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Email Notifications</span>
                  <span className="toggle-desc">Master switch for all store emails.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="notifications.emailEnabled"
                    checked={!!form.notifications.emailEnabled}
                    onChange={handleChange}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Order Notifications</span>
                  <span className="toggle-desc">Get notified when a new order arrives.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="notifications.orderEnabled"
                    checked={!!form.notifications.orderEnabled}
                    onChange={handleChange}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Marketing Emails</span>
                  <span className="toggle-desc">Tips and product updates for your subscribers.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="notifications.marketingEnabled"
                    checked={!!form.notifications.marketingEnabled}
                    onChange={handleChange}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <button className="save-btn" onClick={() => save('Notifications')} disabled={saving}>
              <FiSave />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeSection === 'localization' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Localization</h3>
              <p>Currency and timezone used across the storefront and admin reports.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange}>
                  <option value="TND">TND - Tunisian Dinar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select name="timezone" value={form.timezone} onChange={handleChange}>
                  <option value="Europe/Madrid">Europe / Madrid</option>
                  <option value="Africa/Tunis">Africa / Tunis</option>
                  <option value="Europe/London">Europe / London</option>
                  <option value="Europe/Paris">Europe / Paris</option>
                  <option value="America/New_York">America / New York</option>
                </select>
              </div>
            </div>

            <button className="save-btn" onClick={() => save('Localization')} disabled={saving}>
              <FiSave />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Security</h3>
              <p>
                Account password and MFA are managed in dedicated tabs. Visit
                <strong> Security (MFA)</strong> for two-factor authentication, or update your
                password from your account profile.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
