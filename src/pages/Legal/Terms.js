import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import './Legal.css';

const Terms = () => {
  const { settings } = useSettings();
  const storeName = settings?.storeName || 'Our store';
  const contactEmail = settings?.storeEmail || 'support@example.com';

  return (
    <div className="legal-page">
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last updated: January 2026</p>

      <p>
        These Terms of Service govern your use of {storeName} and any purchase made
        through this site. By creating an account or placing an order, you agree to
        these terms.
      </p>

      <h2>1. Orders and payment</h2>
      <p>
        Prices are listed in Tunisian Dinar (TND) and may change without notice. An
        order is only confirmed once payment has been authorised and you receive an
        order confirmation. We reserve the right to refuse or cancel any order at
        our discretion (for example, in the case of suspected fraud or pricing
        errors).
      </p>

      <h2>2. Shipping and delivery</h2>
      <p>
        Estimated delivery times are provided in good faith but are not guaranteed.
        Risk of loss passes to you once the package is handed to the courier.
      </p>

      <h2>3. Returns and refunds</h2>
      <p>
        Eligible items may be returned within 30 days of delivery, unworn and in
        their original packaging. Refunds are issued to the original payment method
        once the returned item is inspected.
      </p>

      <h2>4. Account responsibilities</h2>
      <p>
        You are responsible for keeping your account credentials confidential and
        for all activity that occurs under your account. Notify us immediately if
        you suspect unauthorised access.
      </p>

      <h2>5. Acceptable use</h2>
      <p>
        You agree not to use the site to engage in fraudulent activity, scrape
        content at scale, or attempt to disrupt the service.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {storeName} is not liable for
        indirect or consequential damages arising from your use of the site.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these terms? Contact us at{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </div>
  );
};

export default Terms;
