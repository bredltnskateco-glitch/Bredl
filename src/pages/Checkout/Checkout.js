import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiArrowLeft, FiTag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { promosApi } from '../../api';
import './Checkout.css';

// Online gateways are not integrated yet — every method currently records the
// order and is settled manually by the team. Keep the chosen label on the order
// so finance knows which gateway to invoice through.
const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on delivery', description: 'Pay in cash when your order arrives.' },
  { id: 'flouci', label: 'Flouci (manual)', description: 'We will contact you to share Flouci payment details after the order is placed.' },
  { id: 'bank', label: 'Bank transfer', description: 'We will email transfer details after the order is placed.' },
];

const PAYMENT_FOLLOWUP_NOTES = {
  cod: 'You will pay in cash when the courier delivers your order.',
  flouci: 'Our team will contact you with Flouci payment details shortly.',
  bank: 'Bank transfer details will arrive in your email shortly.',
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2).replace('.', ',')} TND`;

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems, getCartTotal, checkout } = useCart();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cod',
    notes: '',
  });

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName || '',
      lastName: prev.lastName || user.lastName || '',
      phone: prev.phone || user.phone || '',
      street: prev.street || user.address?.street || '',
      city: prev.city || user.address?.city || '',
      postalCode: prev.postalCode || user.address?.postalCode || '',
      country: prev.country || user.address?.country || '',
    }));
  }, [user]);

  const subtotal = useMemo(() => getCartTotal(), [getCartTotal, cartItems]);
  const discount = appliedPromo ? Math.min(appliedPromo.discount || 0, subtotal) : 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discount + shipping);

  // If the cart subtotal changes after a promo was applied, drop the promo so
  // the server doesn't reject it (user can re-apply to revalidate).
  useEffect(() => {
    setAppliedPromo(null);
  }, [subtotal]);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError('Enter a promo code.');
      return;
    }
    setPromoLoading(true);
    try {
      const res = await promosApi.validate(promoInput.trim(), subtotal);
      setAppliedPromo(res);
      setPromoError('');
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.message || 'That code is not valid.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const validate = () => {
    const required = ['firstName', 'lastName', 'phone', 'street', 'city', 'postalCode', 'country'];
    for (const f of required) {
      if (!String(form[f] || '').trim()) return `Please fill in ${f.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
    }
    if (cartItems.length === 0) return 'Your cart is empty.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitState('processing');
    try {
      const order = await checkout({
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        promoCode: appliedPromo ? appliedPromo.code : '',
      });
      setConfirmation(order);
      setSubmitState('success');
    } catch (e2) {
      setSubmitState('idle');
      setSubmitError(e2.message || 'Checkout failed. Please try again.');
    }
  };

  if (authLoading) {
    return <div className="checkout-page"><p style={{ padding: 40 }}>Loading…</p></div>;
  }

  if (confirmation) {
    return (
      <div className="checkout-page">
        <div className="checkout-container checkout-success">
          <FiCheckCircle size={56} className="success-icon" />
          <h1>Thanks for your order!</h1>
          <p className="success-meta">
            Order <strong>{confirmation.orderNumber}</strong> has been placed.
          </p>
          <p className="success-meta">
            Total charged: <strong>{formatPrice(confirmation.total)}</strong>
          </p>
          {PAYMENT_FOLLOWUP_NOTES[confirmation.paymentMethod] && (
            <p className="success-note">
              {PAYMENT_FOLLOWUP_NOTES[confirmation.paymentMethod]}
            </p>
          )}
          <div className="success-actions">
            <Link to="/" className="btn-secondary">Back to home</Link>
            <Link to="/shop" className="btn-primary">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          <p className="empty-cart">Your cart is empty.</p>
          <Link to="/shop" className="btn-primary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <Link to="/shop" className="back-link"><FiArrowLeft /> Continue shopping</Link>
        <h1>Checkout</h1>

        <form className="checkout-grid" onSubmit={handleSubmit} noValidate>
          <div className="checkout-form">
            <section className="checkout-section">
              <h2>Contact information</h2>
              <div className="form-row">
                <div className="form-field">
                  <label>First name *</label>
                  <input type="text" value={form.firstName} onChange={update('firstName')} required />
                </div>
                <div className="form-field">
                  <label>Last name *</label>
                  <input type="text" value={form.lastName} onChange={update('lastName')} required />
                </div>
              </div>
              <div className="form-field">
                <label>Phone *</label>
                <input type="tel" value={form.phone} onChange={update('phone')} required />
              </div>
            </section>

            <section className="checkout-section">
              <h2>Shipping address</h2>
              <div className="form-field">
                <label>Street address *</label>
                <input type="text" value={form.street} onChange={update('street')} required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>City *</label>
                  <input type="text" value={form.city} onChange={update('city')} required />
                </div>
                <div className="form-field">
                  <label>Postal code *</label>
                  <input type="text" value={form.postalCode} onChange={update('postalCode')} required />
                </div>
              </div>
              <div className="form-field">
                <label>Country *</label>
                <input type="text" value={form.country} onChange={update('country')} required />
              </div>
              <div className="form-field">
                <label>Order notes (optional)</label>
                <textarea rows={3} value={form.notes} onChange={update('notes')} />
              </div>
            </section>

            <section className="checkout-section">
              <h2>Payment method</h2>
              <div className="payment-options" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = form.paymentMethod === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`payment-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={isSelected}
                        onChange={update('paymentMethod')}
                      />
                      <div>
                        <span className="payment-label">{m.label}</span>
                        <span className="payment-description">{m.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>Order summary</h2>

            <ul className="summary-items">
              {cartItems.map((item, idx) => (
                <li key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}>
                  <div className="summary-thumb">
                    <img src={item.image} alt={item.name} />
                    <span className="summary-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-details">
                    <p className="summary-name">{item.name}</p>
                    {(item.selectedSize || item.selectedColor) && (
                      <p className="summary-variant">
                        {[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ')}
                      </p>
                    )}
                  </div>
                  <span className="summary-price">
                    {formatPrice((item.salePrice || item.price || item.regularPrice || 0) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="promo-block">
              {appliedPromo ? (
                <div className="promo-applied">
                  <FiTag />
                  <div>
                    <strong>{appliedPromo.code}</strong>
                    <span> applied — −{formatPrice(discount)}</span>
                  </div>
                  <button type="button" className="link-btn" onClick={handleRemovePromo}>Remove</button>
                </div>
              ) : (
                <div className="promo-form">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                  >
                    {promoLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && <p className="promo-error">{promoError}</p>}
            </div>

            <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {submitError && <p className="checkout-error">{submitError}</p>}

            <button
              type="submit"
              className="place-order-btn"
              disabled={submitState === 'processing'}
            >
              {submitState === 'processing' ? 'Placing order…' : `Place order — ${formatPrice(total)}`}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
