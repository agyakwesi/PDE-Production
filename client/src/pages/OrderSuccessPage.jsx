import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useCart from '../utils/useCart';
import './OrderSuccessPage.css';
import LoadingScreen from '../components/LoadingScreen';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('success');
        clearCart();
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/receipt/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (status === 'verifying') {
    return <LoadingScreen message="Securing your allocation..." />;
  }

  if (status === 'error') {
    return (
      <div className="success-page success-page--error">
        <h1>Verification Failed</h1>
        <p>We couldn't verify your payment. If you were charged, please contact concierge@pde.com</p>
        <button onClick={() => navigate('/vault')}>Go to Vault</button>
      </div>
    );
  }

  return (
    <div className="success-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="success-card"
      >
        <div className="success-icon">✓</div>
        <h1 className="success-title">Allocation Secured</h1>
        <p className="success-subtitle">
          Welcome to the Elite, {user?.name || 'Client'}. Your fragrance selection has been officially registered in the upcoming batch.
        </p>

        <div className="receipt-actions">
          <button 
            className="action-btn action-btn--download" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? 'Generating...' : 'Download Branded Receipt (PDF)'}
          </button>
          
          <p className="email-note">
            A copy has also been sent to <strong>{user?.email}</strong>.
          </p>
        </div>

        <button className="vault-link" onClick={() => navigate('/vault')}>
          Enter the Vault
        </button>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
