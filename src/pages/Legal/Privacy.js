import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import './Legal.css';

const Privacy = () => {
  const { settings } = useSettings();
  const storeName = settings?.storeName || 'Our store';
  const contactEmail = settings?.storeEmail || 'support@example.com';

  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: January 2026</p>

      <p>
        This policy explains what personal data {storeName} collects when you use
        the site, why we collect it, and the choices you have.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>Account details you provide: name, email, phone, shipping address.</li>
        <li>Order history and payment method selection.</li>
        <li>Newsletter subscription status (if you opt in).</li>
        <li>Basic technical data: device, browser, IP address, session cookies.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>To process and ship your orders.</li>
        <li>To authenticate your account and protect it with two-factor auth.</li>
        <li>To send transactional emails (order confirmations, password resets).</li>
        <li>To send marketing emails only if you have opted in.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We share data only with service providers needed to deliver your order
        (couriers, payment processors). We do not sell your personal data.
      </p>

      <h2>4. Cookies</h2>
      <p>
        We use cookies that are strictly necessary for the site to function (such
        as session and CSRF cookies). We do not run third-party advertising
        trackers.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You can request access, correction, or deletion of your personal data by
        contacting us. You can also unsubscribe from marketing emails at any time
        from the link in each email.
      </p>

      <h2>6. Security</h2>
      <p>
        Passwords are hashed, sessions use httpOnly cookies, and admin actions are
        protected by mandatory two-factor authentication.
      </p>

      <h2>7. Contact</h2>
      <p>
        Privacy questions or requests? Contact us at{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </div>
  );
};

export default Privacy;
