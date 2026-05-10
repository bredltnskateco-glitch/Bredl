import React, { useState } from 'react';
import { FiSave, FiUser, FiLock, FiBell, FiGlobe, FiMail } from 'react-icons/fi';
import './SettingsPanel.css';

const SettingsPanel = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    storeName: 'Rufus Macba',
    storeEmail: 'contact@rufusmacba.com',
    storePhone: '+1 234 567 890',
    currency: 'USD',
    timezone: 'America/New_York',
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const sections = [
    { id: 'profile', label: 'Store Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'localization', label: 'Localization', icon: FiGlobe },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  return (
    <div className="settings-panel">
      {/* Settings Navigation */}
      <div className="settings-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <section.icon />
            {section.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {activeSection === 'profile' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Store Profile</h3>
              <p>Manage your store's basic information</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Store Name</label>
                <input 
                  type="text" 
                  name="storeName" 
                  value={settings.storeName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Store Email</label>
                <input 
                  type="email" 
                  name="storeEmail" 
                  value={settings.storeEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="storePhone" 
                  value={settings.storePhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button className="save-btn">
              <FiSave />
              Save Changes
            </button>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Notification Settings</h3>
              <p>Configure how you receive notifications</p>
            </div>
            
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Email Notifications</span>
                  <span className="toggle-desc">Receive important updates via email</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Order Notifications</span>
                  <span className="toggle-desc">Get notified when you receive new orders</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="orderNotifications"
                    checked={settings.orderNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Marketing Emails</span>
                  <span className="toggle-desc">Receive tips and product updates</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="marketingEmails"
                    checked={settings.marketingEmails}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <button className="save-btn">
              <FiSave />
              Save Changes
            </button>
          </div>
        )}

        {activeSection === 'localization' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Localization</h3>
              <p>Configure regional settings for your store</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Currency</label>
                <select name="currency" value={settings.currency} onChange={handleInputChange}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select name="timezone" value={settings.timezone} onChange={handleInputChange}>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                </select>
              </div>
            </div>

            <button className="save-btn">
              <FiSave />
              Save Changes
            </button>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Security Settings</h3>
              <p>Update your password and security preferences</p>
            </div>
            
            <div className="form-grid single">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={settings.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={settings.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button className="save-btn">
              <FiSave />
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
