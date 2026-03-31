import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ExternalScentModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', brand: '', category: 'Day' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand) return alert('Name and Brand required.');

    setIsLoading(true);
    try {
      const res = await fetch('/api/users/external', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to add scent.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)',
          padding: '2.5rem', width: '100%', maxWidth: '400px', position: 'relative'
        }}
      >
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', 
          color: 'var(--color-on-surface)', cursor: 'pointer', fontSize: '1.25rem' 
        }}>×</button>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '2rem' }}>
          External <span style={{ color: 'var(--color-primary)' }}>Acquisition</span>
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input 
            label="Scent Name" 
            placeholder="e.g. Aventus, Baccarat Rouge" 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
          />
          <Input 
            label="Atelier / Brand" 
            placeholder="e.g. Creed, Francis Kurkdjian" 
            value={form.brand} 
            onChange={(e) => setForm({...form, brand: e.target.value})} 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Wardrobe Segment</label>
            <select 
              value={form.category} 
              onChange={(e) => setForm({...form, category: e.target.value})}
              style={{ padding: '0.75rem', background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
            >
              <option value="Day">Day (Fresh, Citrus, Clean)</option>
              <option value="Night">Night (Deep, Sexy, Oriental)</option>
              <option value="Office">Office (Professional, Subtle, Crisp)</option>
              <option value="Rainy Day">Rainy Day (Warm, Spicy, Cozy)</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Add to Collection'}</Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ExternalScentModal;
