import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCart from '../utils/useCart';
import { calculateRetailGHS, formatGHS } from '../utils/pricingEngine';
import API_BASE_URL from '../config';
import './CheckoutPage.css';

const PRIORITY_SHIPPING = 50;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  // ── Step ──────────────────────────────────────────────────────
  const [step, setStep] = useState('information'); // information | shipping | payment

  // ── Step 1: Information ───────────────────────────────────────
  const [info, setInfo] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    street: '',
    apt: '',
    city: '',
    postcode: '',
    country: 'Ghana',
  });

  // ── Step 2: Shipping ──────────────────────────────────────────
  const [shippingMethod, setShippingMethod] = useState('Ground');

  // ── Step 3: Payment ───────────────────────────────────────────
  const [paymentTab, setPaymentTab] = useState('card');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [momoData, setMomoData] = useState({ phone: '', provider: 'mtn' });
  const [otpNeeded, setOtpNeeded] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [pendingReference, setPendingReference] = useState('');
  const [momoSent, setMomoSent] = useState(false);

  // ── Shared ────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const streetRef = useRef(null);

  // ── Guards ────────────────────────────────────────────────────
  useEffect(() => { if (!user) navigate('/auth'); }, [user]);
  useEffect(() => { if (cart.length === 0) navigate('/cart'); }, [cart]);
  useEffect(() => {
    if (user?.email && !info.email) setInfo(prev => ({ ...prev, email: user.email }));
  }, [user]);

  // ── Google Places Autocomplete ────────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !streetRef.current) return;
    const initPlaces = () => {
      if (!window.google) return;
      const ac = new window.google.maps.places.Autocomplete(streetRef.current, { types: ['address'] });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const comps = place.address_components || [];
        const get = type => comps.find(c => c.types.includes(type))?.long_name || '';
        setInfo(prev => ({
          ...prev,
          street: [get('street_number'), get('route')].filter(Boolean).join(' ') || prev.street,
          city: get('locality') || get('administrative_area_level_2'),
          postcode: get('postal_code'),
          country: get('country') || 'Ghana',
        }));
      });
    };
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      s.async = true;
      s.onload = initPlaces;
      document.head.appendChild(s);
    } else {
      initPlaces();
    }
  }, [step]);

  // ── Calculations ──────────────────────────────────────────────
  const subtotal = cart.reduce((acc, item) =>
    acc + (calculateRetailGHS(item.supplierCost) * item.quantity), 0);
  const shippingCost = shippingMethod === 'Priority' ? PRIORITY_SHIPPING : 0;
  const total = subtotal + shippingCost;
  const lineItems = cart.map(item => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: calculateRetailGHS(item.supplierCost),
    lineTotal: calculateRetailGHS(item.supplierCost) * item.quantity,
  }));

  // ── Helpers ───────────────────────────────────────────────────
  const getToken = () => (localStorage.getItem('token') || '').replace(/["\r\n\t]/g, '').trim();
  const formatCardNumber = val => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = val => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── Step navigation ───────────────────────────────────────────
  const handleInfoSubmit = () => {
    if (!info.email || !info.firstName || !info.street || !info.city) {
      setError('Please fill in all required fields before continuing.');
      return;
    }
    setError('');
    setStep('shipping');
    scrollTop();
  };

  const handleShippingSubmit = () => {
    setStep('payment');
    scrollTop();
  };

  // ── Card Payment ──────────────────────────────────────────────
  const handleCardPayment = async () => {
    const [expiryMonth, expiryYear] = (cardData.expiry || '').split('/');
    if (!cardData.number.replace(/\s/g, '') || !cardData.cvv || !expiryMonth || !expiryYear) {
      setError('Please complete all card details.');
      return;
    }
    setIsProcessing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/charge/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          cardNumber: cardData.number.replace(/\s/g, ''),
          cvv: cardData.cvv,
          expiryMonth: expiryMonth.trim(),
          expiryYear: expiryYear.trim(),
          items: lineItems,
          totalAmount: total,
          shippingAddress: info,
          shippingMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');
      if (data.status === 'success') {
        clearCart();
        navigate(`/order-success?reference=${data.reference}`);
      } else if (data.status === 'send_otp') {
        setPendingReference(data.reference);
        setOtpNeeded(true);
      } else if (data.status === 'open_url' && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.display_text || 'Payment could not be completed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── OTP Submit ────────────────────────────────────────────────
  const handleOtpSubmit = async () => {
    if (!otpValue) return;
    setIsProcessing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/charge/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ otp: otpValue, reference: pendingReference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      if (data.status === 'success') {
        clearCart();
        navigate(`/order-success?reference=${data.reference}`);
      } else if (data.status === 'open_url' && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.display_text || 'OTP verification failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── MoMo Payment ──────────────────────────────────────────────
  const handleMoMoPayment = async () => {
    if (!momoData.phone) {
      setError('Please enter your mobile money phone number.');
      return;
    }
    setIsProcessing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/charge/momo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          phone: momoData.phone.replace(/\s/g, ''),
          provider: momoData.provider,
          items: lineItems,
          totalAmount: total,
          shippingAddress: info,
          shippingMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'MoMo charge failed. Please check your number and try again.');
      setPendingReference(data.reference);
      setMomoSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // SIDEBAR JSX (variable, not a nested component — avoids key warnings)
  // ══════════════════════════════════════════════════════════════
  const stepOrder = ['information', 'shipping', 'payment'];
  const currentIdx = stepOrder.indexOf(step);

  const sidebarJSX = (
    <aside className="checkout-sidebar">
      {/* Checkout Progress — visible on steps 2 & 3 */}
      {step !== 'information' && (
        <div className="co-sidebar-progress">
          <p className="co-sidebar-progress__title">Checkout Progress</p>
          {stepOrder.map((s, idx) => {
            const isDone = idx < currentIdx;
            const isActive = s === step;
            return (
              <div
                key={s}
                className={`co-progress-item${isActive ? ' co-progress-item--active' : ''}${isDone ? ' co-progress-item--done' : ''}`}
              >
                <span className="co-progress-item__icon">{isDone ? '✓' : isActive ? '›' : '○'}</span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            );
          })}
        </div>
      )}

      {/* Order Summary */}
      <div className="co-sidebar-summary__header">
        <span className="co-sidebar-summary__title">
          {step === 'information' ? 'Order Summary' : 'Your Selection'}
        </span>
        <span className="co-sidebar-summary__count">
          {cart.length} ITEM{cart.length !== 1 ? 'S' : ''}
        </span>
      </div>

      {cart.map(item => (
        <div key={item.productId} className="co-sidebar-item">
          <div className="co-sidebar-item__img-wrap">
            <img
              src={item.image || item.images?.[0] || '/images/bottle_1.png'}
              alt={item.name}
              className="co-sidebar-item__img"
              referrerPolicy="no-referrer"
              onError={e => { e.currentTarget.src = '/images/bottle_1.png'; }}
            />
            <span className="co-sidebar-item__qty">{item.quantity}</span>
          </div>
          <div className="co-sidebar-item__info">
            <span className="co-sidebar-item__brand">{item.brand}</span>
            <span className="co-sidebar-item__name">{item.name}</span>
          </div>
          <span className="co-sidebar-item__price">
            {formatGHS(calculateRetailGHS(item.supplierCost) * item.quantity)}
          </span>
        </div>
      ))}

      {/* Gift code — information step only */}
      {step === 'information' && (
        <div className="co-gift-code">
          <input className="co-input co-input--gift" placeholder="Gift card or discount code" />
          <button className="co-gift-apply">APPLY</button>
        </div>
      )}

      {/* Totals */}
      <div className="co-sidebar-totals">
        <div className="co-sidebar-total-row">
          <span>Subtotal</span>
          <span>{formatGHS(subtotal)}</span>
        </div>
        <div className="co-sidebar-total-row">
          <span>Shipping</span>
          <span>
            {step === 'information'
              ? 'Calculated at next step'
              : shippingMethod === 'Priority'
              ? formatGHS(PRIORITY_SHIPPING)
              : 'Complimentary'}
          </span>
        </div>
        {step === 'payment' && (
          <div className="co-sidebar-total-row">
            <span>Heritage Tax</span>
            <span>Inc.</span>
          </div>
        )}
        <div className="co-sidebar-total-row co-sidebar-total-row--total">
          <span>Total</span>
          <span>{formatGHS(total)}</span>
        </div>
      </div>

      {step === 'information' && (
        <div className="co-trust-badges">
          <span>🔒 Secure</span>
          <span>✓ Verified</span>
          <span>↗ Authentic</span>
        </div>
      )}
    </aside>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="checkout-page">

      {/* Progress Bar */}
      <div className="co-progress">
        {[
          { key: 'information', label: 'Information', num: '01' },
          { key: 'shipping', label: 'Shipping', num: '02' },
          { key: 'payment', label: 'Payment', num: '03' },
        ].map((s, i, arr) => {
          const itemIdx = stepOrder.indexOf(s.key);
          const isDone = itemIdx < currentIdx;
          const isActive = s.key === step;
          return (
            <React.Fragment key={s.key}>
              <div className={`co-progress__step${isActive ? ' co-progress__step--active' : ''}${isDone ? ' co-progress__step--done' : ''}`}>
                <span className="co-progress__step-num">Step {s.num}</span>
                <span className="co-progress__step-name">{s.label}</span>
              </div>
              {i < arr.length - 1 && <span className="co-progress__sep">›</span>}
            </React.Fragment>
          );
        })}
      </div>

      <div className="checkout-layout">
        {/* ── MAIN FORM ── */}
        <main className="checkout-main">

          {/* ════ STEP 1: INFORMATION ════ */}
          {step === 'information' && (
            <div>
              <span className="co-step-label">Step 01</span>
              <h2 className="co-section__title">Information</h2>

              <div className="co-form-group">
                <label className="co-label">Email</label>
                <input
                  id="checkout-email"
                  className="co-input"
                  type="email"
                  value={info.email}
                  onChange={e => setInfo({ ...info, email: e.target.value })}
                  placeholder="Email Address"
                  autoComplete="email"
                />
              </div>

              <span className="co-subsection-label">Shipping Address</span>

              <div className="co-row">
                <div className="co-form-group">
                  <label className="co-label">First Name</label>
                  <input
                    id="checkout-first-name"
                    className="co-input"
                    value={info.firstName}
                    onChange={e => setInfo({ ...info, firstName: e.target.value })}
                    placeholder="First Name"
                    autoComplete="given-name"
                  />
                </div>
                <div className="co-form-group">
                  <label className="co-label">Last Name</label>
                  <input
                    id="checkout-last-name"
                    className="co-input"
                    value={info.lastName}
                    onChange={e => setInfo({ ...info, lastName: e.target.value })}
                    placeholder="Last Name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="co-form-group">
                <label className="co-label">Street Address (Auto-Complete Enabled)</label>
                <input
                  id="checkout-street"
                  ref={streetRef}
                  className="co-input"
                  value={info.street}
                  onChange={e => setInfo({ ...info, street: e.target.value })}
                  placeholder="Start typing address..."
                  autoComplete="street-address"
                />
              </div>

              <div className="co-row co-row--3">
                <div className="co-form-group">
                  <label className="co-label">Apartment, Suite, etc.</label>
                  <input
                    id="checkout-apt"
                    className="co-input"
                    value={info.apt}
                    onChange={e => setInfo({ ...info, apt: e.target.value })}
                    placeholder="Apt, Ste"
                  />
                </div>
                <div className="co-form-group">
                  <label className="co-label">City</label>
                  <input
                    id="checkout-city"
                    className="co-input"
                    value={info.city}
                    onChange={e => setInfo({ ...info, city: e.target.value })}
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                </div>
                <div className="co-form-group">
                  <label className="co-label">Postcode</label>
                  <input
                    id="checkout-postcode"
                    className="co-input"
                    value={info.postcode}
                    onChange={e => setInfo({ ...info, postcode: e.target.value })}
                    placeholder="Postcode"
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              {error && <p className="co-error">{error}</p>}

              <div className="co-form-actions">
                <button className="co-link-btn" onClick={() => navigate('/cart')}>← Return to Cart</button>
                <button id="btn-continue-shipping" className="co-cta-btn" onClick={handleInfoSubmit}>
                  Continue to Shipping
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 2: SHIPPING ════ */}
          {step === 'shipping' && (
            <div>
              <span className="co-step-label">Step 02</span>
              <h2 className="co-section__title">Shipping</h2>

              <span className="co-subsection-label">Review Delivery Address</span>
              <div className="co-address-card">
                <div className="co-address-card__content">
                  <strong>{info.firstName} {info.lastName}</strong>
                  <span>{info.street}{info.apt ? ', ' + info.apt : ''}</span>
                  <span>{info.city}{info.postcode ? ', ' + info.postcode : ''}</span>
                  <span>{info.country}</span>
                </div>
                <button className="co-edit-btn" onClick={() => setStep('information')}>Edit</button>
              </div>

              <span className="co-subsection-label">Select Shipping Method</span>
              <div className="co-shipping-options">
                {[
                  { value: 'Ground', label: 'Elite Ground Shipping (3–5 days)', desc: 'Standard atelier handling with tracked surface transit.', price: 'Free' },
                  { value: 'Priority', label: 'Priority Courier (1–2 days)', desc: 'Express air-locked dispatch for urgent requirements.', price: 'GHC 50.00' },
                ].map(opt => (
                  <label key={opt.value} className={`co-shipping-card${shippingMethod === opt.value ? ' co-shipping-card--active' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shippingMethod === opt.value}
                      onChange={() => setShippingMethod(opt.value)}
                    />
                    <div className="co-shipping-card__content">
                      <div>
                        <span className="co-shipping-card__name">{opt.label}</span>
                        <span className="co-shipping-card__desc">{opt.desc}</span>
                      </div>
                      <span className="co-shipping-card__price">{opt.price}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="co-alcohol-notice">
                <span className="co-alcohol-notice__icon">ℹ</span>
                <p>
                  Due to the high alcohol concentration of our artisanal extraits, international shipping is
                  restricted to specialized ground logistics. Priority air shipping is available for select regions only.
                </p>
              </div>

              <div className="co-form-actions">
                <button className="co-link-btn" onClick={() => setStep('information')}>← Return to Information</button>
                <button id="btn-continue-payment" className="co-cta-btn" onClick={handleShippingSubmit}>
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 3: PAYMENT ════ */}
          {step === 'payment' && (
            <div>
              <span className="co-step-label">Step 03</span>
              <h1 className="co-payment-title">Finalize Your Acquisition</h1>
              <p className="co-payment-subtitle">Secure Payment Terminal</p>

              {!otpNeeded && !momoSent && (
                <>
                  <div className="co-tab-bar">
                    <button
                      id="tab-card"
                      className={`co-tab${paymentTab === 'card' ? ' co-tab--active' : ''}`}
                      onClick={() => { setPaymentTab('card'); setError(''); }}
                    >
                      Pay with Card
                    </button>
                    <button
                      id="tab-momo"
                      className={`co-tab${paymentTab === 'momo' ? ' co-tab--active' : ''}`}
                      onClick={() => { setPaymentTab('momo'); setError(''); }}
                    >
                      Mobile Money (MoMo)
                    </button>
                  </div>

                  {paymentTab === 'card' && (
                    <div className="co-card-form">
                      <div className="co-form-group">
                        <label className="co-label">Card Number</label>
                        <div className="co-card-input-wrap">
                          <input
                            id="card-number"
                            className="co-input"
                            value={cardData.number}
                            onChange={e => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            inputMode="numeric"
                            autoComplete="cc-number"
                          />
                          <span className="co-card-icon">💳</span>
                        </div>
                      </div>
                      <div className="co-row">
                        <div className="co-form-group">
                          <label className="co-label">Expiry Date</label>
                          <input
                            id="card-expiry"
                            className="co-input"
                            value={cardData.expiry}
                            onChange={e => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                            placeholder="MM / YY"
                            maxLength={5}
                            inputMode="numeric"
                            autoComplete="cc-exp"
                          />
                        </div>
                        <div className="co-form-group">
                          <label className="co-label">CVV</label>
                          <div className="co-card-input-wrap">
                            <input
                              id="card-cvv"
                              className="co-input"
                              value={cardData.cvv}
                              onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              placeholder="* * *"
                              maxLength={4}
                              type="password"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                            />
                            <span className="co-cvv-help" title="3 or 4-digit number on the back of your card">?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentTab === 'momo' && (
                    <div className="co-momo-form">
                      <div className="co-form-group">
                        <label className="co-label">Network Provider</label>
                        <div className="co-provider-grid">
                          {[
                            { value: 'mtn', label: 'MTN MoMo' },
                            { value: 'vod', label: 'Telecel' },
                            { value: 'tgo', label: 'AirtelTigo' },
                          ].map(p => (
                            <button
                              key={p.value}
                              id={`provider-${p.value}`}
                              className={`co-provider-btn${momoData.provider === p.value ? ' co-provider-btn--active' : ''}`}
                              onClick={() => setMomoData({ ...momoData, provider: p.value })}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="co-form-group">
                        <label className="co-label">Mobile Money Number</label>
                        <input
                          id="momo-phone"
                          className="co-input"
                          value={momoData.phone}
                          onChange={e => setMomoData({ ...momoData, phone: e.target.value })}
                          placeholder="024 000 0000"
                          inputMode="tel"
                          autoComplete="tel"
                        />
                      </div>
                      <p className="co-momo-instruction">
                        After tapping "Complete Transaction", approve the prompt on your phone to complete your acquisition.
                      </p>
                    </div>
                  )}

                  {error && <p className="co-error">{error}</p>}

                  <button
                    id="btn-complete-transaction"
                    className="co-cta-btn co-cta-btn--full"
                    disabled={isProcessing}
                    onClick={paymentTab === 'card' ? handleCardPayment : handleMoMoPayment}
                  >
                    {isProcessing ? 'Processing...' : `Complete Transaction — ${formatGHS(total)}`}
                  </button>

                  <div className="co-trust-row">
                    <span className="co-trust-badge">🔒 Secured by Paystack</span>
                  </div>
                  <p className="co-secure-note">
                    Your payment is protected by 3D Secure 2.0. A verification OTP may be required by your issuing bank.
                  </p>
                </>
              )}

              {/* OTP state */}
              {otpNeeded && (
                <div className="co-otp-section">
                  <h3 className="co-otp-title">OTP Verification Required</h3>
                  <p className="co-otp-desc">
                    Your bank has sent a one-time password to your registered number. Enter it below to complete your allocation.
                  </p>
                  <div className="co-form-group">
                    <label className="co-label">One-Time Password</label>
                    <input
                      id="otp-input"
                      className="co-input co-input--otp"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="— — — — — —"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>
                  {error && <p className="co-error">{error}</p>}
                  <button
                    id="btn-verify-otp"
                    className="co-cta-btn co-cta-btn--full"
                    disabled={isProcessing || otpValue.length < 4}
                    onClick={handleOtpSubmit}
                    style={{ marginTop: '1.5rem' }}
                  >
                    {isProcessing ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                </div>
              )}

              {/* MoMo pending state */}
              {momoSent && (
                <div className="co-momo-pending">
                  <div className="co-momo-pending__icon">📱</div>
                  <h3 className="co-momo-pending__title">Check Your Phone</h3>
                  <p className="co-momo-pending__desc">
                    A payment prompt has been sent to your mobile money number. Approve the payment on your phone to complete your acquisition.
                  </p>
                  {pendingReference && (
                    <p className="co-momo-pending__ref">Reference: <strong>{pendingReference}</strong></p>
                  )}
                  <button
                    id="btn-momo-approved"
                    className="co-cta-btn co-cta-btn--full"
                    onClick={() => navigate(`/order-success?reference=${pendingReference}`)}
                  >
                    I've Approved the Payment →
                  </button>
                </div>
              )}

              <div className="co-form-actions co-form-actions--payment-back">
                <button
                  className="co-link-btn"
                  onClick={() => { setStep('shipping'); setOtpNeeded(false); setMomoSent(false); setError(''); }}
                >
                  ← Return to Shipping
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR (JSX variable — not a nested component) ── */}
        {sidebarJSX}
      </div>

      {/* Footer */}
      <footer className="checkout-footer">
        <span className="checkout-footer__copy">© 2024 Parfum d'Élite Atelier</span>
        <div className="checkout-footer__links">
          <Link to="/">Home</Link>
          <Link to="/catalog">Catalog</Link>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
