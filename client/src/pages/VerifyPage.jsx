import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import API_BASE_URL from '../config';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Verifying your credentials...');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');
        setStatus(data.message);
      } catch (err) {
        setStatus(err.message);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface)',
          padding: '3rem',
          border: '1px solid var(--color-surface-container-highest)',
          textAlign: 'center'
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-on-surface)' }}>Vault Access</p>
        <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem', lineHeight: '1.5' }}>{status}</p>
        <Button onClick={() => navigate('/auth')} style={{ width: '100%' }}>Proceed to Login</Button>
      </motion.div>
    </div>
  );
};

export default VerifyPage;
