import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const ConsultantNote = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/wardrobe/analysis', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setAnalysis(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analysis) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-surface-container-low)',
        border: '1px solid var(--color-outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '4rem',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
              Consultant's Dispatch
            </h4>
          </div>

          <p style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.75rem', 
            lineHeight: 1.4, 
            marginBottom: '2rem',
            color: 'var(--color-on-surface)'
          }}>
            {analysis.pitch}
          </p>

          {analysis.recommendation && (
            <Button onClick={() => navigate(`/catalog/${analysis.recommendation._id}`)}>
              Examine Recommendation
            </Button>
          )}
        </div>

        <div style={{ 
          background: 'var(--color-surface-container-highest)', 
          padding: '3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {analysis.recommendation ? (
            <>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{ 
                  width: '100%', 
                  maxWidth: '180px', 
                  aspectRatio: '4/5', 
                  background: 'var(--color-surface-container-lowest)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  zIndex: 2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              >
                {analysis.recommendation.image ? (
                  <img src={analysis.recommendation.image} alt={analysis.recommendation.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>🧴</span>
                )}
              </motion.div>
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Suggested Filler</p>
                <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{analysis.recommendation.name}</h5>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>Scouting upcoming deliveries...</p>
            </div>
          )}

          {/* Decorative watermarking */}
          <div style={{ 
            position: 'absolute', top: '-10%', right: '-10%', fontSize: '10rem', opacity: 0.03, pointerEvents: 'none', fontFamily: 'serif' 
          }}>
            PDE
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsultantNote;
