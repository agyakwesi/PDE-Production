import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCart from '../utils/useCart';
import { useAuth } from '../context/AuthContext';
import { calculateRetailGHS, calculateLandedUSD, formatGHS, FIXED_RATE } from '../utils/pricingEngine';
import './CartPage.css';

const PAYSTACK_LIMIT_GHS = 30000;

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);

  // ── Pricing calculations ──
  const lineItems = cart.map((item) => {
    const unitPrice = calculateRetailGHS(item.supplierCost);
    return { ...item, unitPrice, lineTotal: unitPrice * item.quantity };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const useMoMo = total >= PAYSTACK_LIMIT_GHS;

  // ... (copyProductLink and getMoqStatus unchanged)

  // ─────────────────────────────────────────────
  //  EMPTY STATE
  // ... (unchanged)

  // ─────────────────────────────────────────────
  //  MAIN CART
  // ... (unchanged)

  // ─────────────────────────────────────────────
  //  SUMMARY SIDEBAR
  // ─────────────────────────────────────────────
  return (
    <div className="cart-page">
      {/* ... (h1 and subtitle unchanged) */}
      
      <div className="cart-layout">
        {/* ... (cart-items list unchanged) */}

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

          {/* Dynamic Checkout Button */}
          <button
            className={`checkout-btn ${useMoMo ? 'checkout-btn--momo' : ''}`}
            onClick={() =>
              alert(
                useMoMo
                  ? 'Redirecting to Direct MoMo reservation...'
                  : 'Redirecting to Paystack checkout...'
              )
            }
          >
            {useMoMo ? 'Reserve via Direct MoMo' : 'Pay with Paystack'}
          </button>

          {/* Trust Signals */}
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

      {/* Toast */}
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
