import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import ExternalScentModal from './ExternalScentModal';

const WardrobeTracker = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch('/api/wardrobe/analysis', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch analysis');
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) return <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ANALYZING WARDROBE...</div>;

  const categories = ['Day', 'Night', 'Office', 'Rainy Day'];

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Scent <span style={{ color: 'var(--color-primary)' }}>Wardrobe</span></h2>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.7rem' }}>+ Add External Piece</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {categories.map(cat => {
          const data = analysis?.analysis?.find(a => a.category === cat);
          const hasScents = data && data.count > 0;

          return (
            <motion.div 
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: hasScents ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)',
                border: `1px solid ${hasScents ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px',
                position: 'relative'
              }}
            >
              <p style={{ 
                fontSize: '0.6rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em', 
                color: hasScents ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                marginBottom: '1.5rem'
              }}>
                {cat}
              </p>

              {hasScents ? (
                <div style={{ flex: 1 }}>
                  {data.scents.map((s, idx) => (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{s.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>{s.brand}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.5 }}>
                  <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-on-surface-variant)' }}>Gap identified.</p>
                </div>
              )}

              <div style={{ 
                position: 'absolute', bottom: '1rem', right: '1rem', 
                fontSize: '2rem', opacity: 0.05, pointerEvents: 'none' 
              }}>
                {cat === 'Day' && '☀️'}
                {cat === 'Night' && '🌙'}
                {cat === 'Office' && '💼'}
                {cat === 'Rainy Day' && '🌧️'}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ExternalScentModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchAnalysis();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardrobeTracker;
