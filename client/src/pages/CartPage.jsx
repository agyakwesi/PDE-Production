import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import useCart from '../utils/useCart';
import { useAuth } from '../context/AuthContext';
import { calculateRetailGHS, formatGHS } from '../utils/pricingEngine';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);

  // Constants
  const shipping = 0; // Shipping is inclusive in the retail price as per pricingEngine

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const price = calculateRetailGHS(item.supplierCost);
    return acc + (price * item.quantity);
  }, 0);

  const total = subtotal + shipping;

  const lineItems = cart.map(item => {
    const unitPrice = calculateRetailGHS(item.supplierCost);
    return {
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: unitPrice,
      lineTotal: unitPrice * item.quantity
    };
  });

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  const copyProductLink = (id) => {
    const url = `${window.location.origin}/catalog/${id}`;
    navigator.clipboard.writeText(url);
    setToast('Link copied to clipboard');
    setTimeout(() => setToast(null), 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty__icon">∅</div>
          <h1 className="cart-empty__title">Your Vault is Empty</h1>
          <p className="cart-empty__text">
            No allocations currently reserved. Explore the catalog to secure your seasonal staples.
          </p>
          <Link to="/catalog" className="vault-link" style={{ textDecoration: 'none', border: '1px solid #C5A059', padding: '1rem 2rem' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Your Selection</h1>
      <p className="cart-page__subtitle">Review your curated inventory for the upcoming batch.</p>
      
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item__image-wrap">
                <img 
                  src={item.image || item.images?.[0] || '/images/bottle_1.png'} 
                  alt={item.name} 
                  className="cart-item__image" 
                  referrerPolicy="no-referrer"
                  onError={(e) => { 
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/bottle_1.png';
                  }}
                />
              </div>
              <div className="cart-item__details">
                <div>
                  <span className="cart-item__brand">{item.brand}</span>
                  <h3 className="cart-item__name">{item.name}</h3>
                  <span className="cart-item__price">
                    {formatGHS(calculateRetailGHS(item.supplierCost))}
                  </span>
                </div>
                
                <div className="cart-item__actions">
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>Remove</button>
                  <button className="share-btn" onClick={() => copyProductLink(item.productId)}>Share Link</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 className="cart-summary__heading">Order Summary</h3>

          <div className="summary-row">
            <span className="summary-row__label">Subtotal</span>
            <span className="summary-row__value">{formatGHS(subtotal)}</span>
          </div>

          <div className="summary-row summary-row--shipping">
            <span className="summary-row__label">
              Shipping — Turkey to Ghana (Inc.)
            </span>
            <span className="summary-row__value">{formatGHS(shipping)}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span className="summary-total__label">Total</span>
            <span className="summary-total__value">{formatGHS(total)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
          >
            Continue to Checkout →
          </button>

          <div className="trust-signals">
            <div className="trust-item">
              <span className="trust-item__icon" />
              <span>
                Authenticity Guarantee — Every bottle is sourced directly from
                authorised Turkey retailers and verified upon arrival.
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="cart-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
