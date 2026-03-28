import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        
        setSuccess(data.message);
        if (data.previewUrl) {
           console.log("TEST EMAIL PREVIEW:", data.previewUrl);
        }
      } else {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        
        login(data.user, data.token);
        navigate('/vault');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2.5rem', 
          color: 'var(--color-on-surface)',
          marginBottom: '0.5rem'
        }}>
          Parfum d'Élite
        </p>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          The Private Collection Atelier
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface)',
          padding: '3rem',
          border: '1px solid var(--color-surface-container-highest)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
          <button 
            onClick={() => setActiveTab('signup')}
            style={{ 
              background: 'none', border: 'none', 
              color: activeTab === 'signup' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              paddingBottom: '1rem',
              borderBottom: activeTab === 'signup' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s'
            }}
          >
            Sign Up
          </button>
          <button 
            onClick={() => setActiveTab('login')}
            style={{ 
              background: 'none', border: 'none', 
              color: activeTab === 'login' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              paddingBottom: '1rem',
              borderBottom: activeTab === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s'
            }}
          >
            Login
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          {error && <div style={{ color: 'var(--color-error)', fontSize: '0.875rem', background: 'rgba(255, 0, 0, 0.1)', padding: '1rem', border: '1px solid var(--color-error)' }}>{error}</div>}
          {success && <div style={{ color: 'var(--color-primary)', fontSize: '0.875rem', background: 'rgba(0, 255, 0, 0.1)', padding: '1rem', border: '1px solid var(--color-primary)' }}>{success}</div>}
          {activeTab === 'signup' && (
            <Input 
              label="Full Name" 
              placeholder="Alexandre De Bourbon"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <Input 
            label="Email Address" 
            placeholder="curator@parfumdelite.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          {activeTab === 'signup' && (
            <Input 
              label="Phone Number" 
              placeholder="+1 234 567 8900"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          )}
          <Input 
            label="Security Phrase" 
            placeholder="••••••••••••"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <Button 
          style={{ width: '100%', marginBottom: '1.5rem', opacity: loading ? 0.7 : 1 }} 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : (activeTab === 'signup' ? 'Request Access' : 'Enter the Vault')}
        </Button>

        <div style={{ 
          background: 'var(--color-surface-container-low)', 
          padding: '1rem', 
          border: '1px solid var(--color-outline-variant)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ color: 'var(--color-primary)' }}>★</div>
          <div>
            <div style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>Founder Status</div>
            <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limited Allocation Remaining</div>
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: 'var(--color-on-surface-variant)', 
          fontSize: '0.65rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          lineHeight: '1.6'
        }}>
          By entering, you agree to our <span style={{ color: 'var(--color-on-surface)', cursor: 'pointer', borderBottom: '1px solid var(--color-outline-variant)' }}>Terms of Provenance</span> and <span style={{ color: 'var(--color-on-surface)', cursor: 'pointer', borderBottom: '1px solid var(--color-outline-variant)' }}>Privacy Protocol</span>
        </p>

      </motion.div>

    </div>
  );
};

export default AuthPage;
