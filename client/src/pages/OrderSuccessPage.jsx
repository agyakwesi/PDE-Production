import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useCart from '../utils/useCart';
import API_BASE_URL from '../config';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState('verifying');
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (reference) verifyPayment();
  }, [reference]);

  const getToken = () => (localStorage.getItem('token') || '').replace(/["\r\n\t]/g, '').trim();

  const verifyPayment = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/verify/${reference}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('success');
        clearCart();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/receipt/${reference}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDE_Receipt_${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading
  if (status === 'verifying') {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '2px solid #E8E4DC', borderTop: '2px solid #C8A96E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B9892' }}>Verifying your allocation...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div style={{ background: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1C1C1A', marginBottom: '0.75rem' }}>Verification Pending</h1>
          <p style={{ fontSize: '0.875rem', color: '#6B6860', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            We couldn't auto-verify your payment yet. If you were charged, your order is still registered.
            Please contact <strong>concierge@parfumdelite.tech</strong> with your reference number.
          </p>
          {reference && (
            <p style={{ fontSize: '0.75rem', color: '#9B9892', marginBottom: '1.5rem' }}>
              Reference: <strong>{reference}</strong>
            </p>
          )}
          <button
            onClick={() => navigate('/vault')}
            style={{ background: '#C8A96E', color: '#fff', border: 'none', padding: '0.9rem 2rem', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Go to My Vault
          </button>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '5rem 2rem 3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 20 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#F0EBE0',
              border: '2px solid #C8A96E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '1.75rem',
              color: '#C8A96E',
            }}
          >
            ✓
          </motion.div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.25rem', fontWeight: 400, color: '#1C1C1A', marginBottom: '0.5rem' }}>
            Allocation Secured
          </h1>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1.5rem' }}>
            Welcome to the Elite
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6B6860', lineHeight: 1.75, maxWidth: 420, margin: '0 auto 2.5rem' }}>
            {user?.name ? `${user.name.split(' ')[0]}, your` : 'Your'} fragrance selection has been officially registered.
            Our concierge will dispatch a tracking link via email within 24 hours.
          </p>

          {reference && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', padding: '1rem 1.5rem', marginBottom: '2.5rem', display: 'inline-block' }}>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9B9892', marginBottom: '0.35rem' }}>Order Reference</p>
              <p style={{ fontSize: '0.95rem', fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1C1C1A', margin: 0 }}>{reference}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              style={{ background: '#C8A96E', color: '#fff', border: 'none', padding: '0.9rem 2.5rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: isDownloading ? 'not-allowed' : 'pointer', opacity: isDownloading ? 0.7 : 1, fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: 360 }}
            >
              {isDownloading ? 'Generating Receipt...' : 'Download Branded Receipt (PDF)'}
            </button>

            {user?.email && (
              <p style={{ fontSize: '0.75rem', color: '#9B9892' }}>
                A copy has been sent to <strong>{user.email}</strong>
              </p>
            )}

            <button
              onClick={() => navigate('/catalog')}
              style={{ background: 'transparent', color: '#1C1C1A', border: '1px solid #E8E4DC', padding: '0.9rem 2.5rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: 360 }}
            >
              Continue Browsing
            </button>

            <button
              onClick={() => navigate('/vault')}
              style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#9B9892', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              View My Vault →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E8E4DC', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', maxWidth: 620, margin: '3rem auto 0', fontFamily: 'Inter, sans-serif' }}>
        <span style={{ fontSize: '0.62rem', color: '#9B9892', letterSpacing: '0.05em', textTransform: 'uppercase' }}>© 2024 Parfum d'Élite Atelier</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.62rem', color: '#9B9892', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Home</Link>
          <Link to="/catalog" style={{ fontSize: '0.62rem', color: '#9B9892', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Catalog</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;


