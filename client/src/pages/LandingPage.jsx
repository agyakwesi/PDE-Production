import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProducts: 0, totalSlots: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const totalSlots = data.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
        setStats({ totalProducts: data.length, totalSlots });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-page" style={{ paddingBottom: '6rem' }}>
      {/* Hero Section */}
      <div className="dark-section">
        <section style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6rem 4rem',
          minHeight: '80vh'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ maxWidth: '600px' }}
          >
            <p style={{ color: 'var(--color-primary)', letterSpacing: '0.2em', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
              The Collective Sourcing Experience
            </p>
            <h1 style={{
              fontSize: '5rem',
              lineHeight: 1,
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Pre-Order<br/><span style={{ color: 'var(--color-primary-container)', fontStyle: 'italic' }}>Luxury</span> Scents.
            </h1>
            <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '3rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
              Join the elite circle of curators. We pool pre-orders to unlock wholesale access to the world's rarest niche extraits de parfum. Once the batch fills, the cargo ships directly to Ghana.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Button onClick={() => navigate('/auth')}>Secure Your Bottle</Button>
              <Button variant="secondary" onClick={() => navigate('/catalog')}>View Live Catalog</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Ambient glow behind logo */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0
              }}
            />
            <svg 
              viewBox="0 0 1000 1000" 
              style={{ width: '450px', height: '450px', position: 'relative', zIndex: 1 }}
            >
              {/* Outer gold circle - draws on */}
              <motion.circle
                cx="500" cy="499.65" r="202.25"
                fill="none" stroke="#D4AF46" strokeWidth="6" strokeMiterlimit="10"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
              />
              {/* Inner gold circle - draws on with slight delay */}
              <motion.ellipse
                transform="matrix(0.7071 -0.7071 0.7071 0.7071 -206.8605 499.898)"
                cx="500" cy="499.65" rx="193.25" ry="193.25"
                fill="none" stroke="#D4AF37" strokeWidth="5" strokeMiterlimit="10"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 0.8 }}
              />
              {/* The É letterform - fades in */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.8 }}
              >
                <path fill="var(--color-on-surface)" d="M486.28,486.56l-54.05,80.09c13.81-9.65,26.87-14.48,39.18-14.48c11.16,0,26.21,3.9,45.16,11.69l25.23,10.49c7.35,3.01,12.35,4.52,15.01,4.52c4.87,0,10.67-4.91,17.4-14.74l4.12,2.52c-0.8,1.24-1.28,1.99-1.46,2.26l-8.77,12.48l-8.5,13.28c-0.18,0.35-0.8,1.24-1.86,2.66c-8.32-2.04-18.77-5.93-31.34-11.69c-17.44-7.88-30.99-13.28-40.64-16.2s-18.95-4.38-27.89-4.38c-9.47,0-17.53,2.12-24.17,6.38s-13.28,11.55-19.92,21.91l-3.98-2.79l27.36-41.3c-10.89-13.63-16.34-28.91-16.34-45.82c0-14.25,4.43-26.7,13.28-37.32c8.85-10.62,19.21-15.94,31.08-15.94c10.09,0,19.3,5,27.62,15.01l0.8-1.33l3.98-6.91c3.28-5.49,4.91-10.05,4.91-13.68c0-1.59-0.58-3.19-1.73-4.78c1.68-0.09,2.57-0.13,2.66-0.13l7.17-0.27c1.15,0,3.76-0.27,7.84-0.8l1.86-0.27c-2.04,2.66-5.89,8.37-11.55,17.13c-2.74,4.25-5.84,8.81-9.3,13.68l-2.12,3.05c0.8,1.06,1.24,1.68,1.33,1.86l7.7,10.76c12.93,17.8,27.71,26.7,44.36,26.7c10.45,0,19.86-5.18,28.22-15.54c8.37-10.36,12.55-22.05,12.55-35.06c0-20.63-14.56-30.95-43.7-30.95c-12.66,0-36.04,1.33-70.12,3.98l-38.52,3.05c-8.59,0.71-17.53,1.06-26.83,1.06c-16.82,0-28.29-2.08-34.4-6.24l10.23-37.32l4.65,1.2l-0.4,2.26c-1.15,5.14-1.73,8.9-1.73,11.29c0,4.34,1.9,7.37,5.71,9.1c3.81,1.73,10.49,2.59,20.05,2.59c14.61,0,36.12-1.15,64.55-3.45c32.05-2.57,54.45-3.85,67.2-3.85c37.54,0,56.31,12.8,56.31,38.38c0,15.32-5.53,29.84-16.6,43.56c-13.1,16.2-29.62,24.31-49.54,24.31c-10.01,0-18.64-2.12-25.9-6.38s-15.27-11.86-24.04-22.84L486.28,486.56z M482.16,481.25c-4.87-6.73-9.34-11.55-13.41-14.48s-8.37-4.38-12.88-4.38c-7.7,0-14.1,2.94-19.19,8.83c-5.09,5.89-7.64,13.35-7.64,22.38c0,12.4,6.06,25.81,18.19,40.24L482.16,481.25z"/>
                {/* Accent mark */}
                <path fill="var(--color-on-surface)" d="M507.94,401.65l15.87-22c3.09-4.28,5.58-7.2,7.47-8.76c1.89-1.56,4.03-2.34,6.44-2.34c4.4,0,6.59,2.14,6.59,6.42c0,3.46-3.37,7.71-10.1,12.73l-24.31,18.34c-1.65,1.22-2.78,1.83-3.4,1.83c-0.96,0-1.44-0.44-1.44-1.32C505.05,405.93,506.01,404.3,507.94,401.65z"/>
              </motion.g>
            </svg>
          </motion.div>
        </section>
      </div>

      {/* Protocol Section */}
      <section style={{ padding: '6rem 4rem' }}>
        <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '1rem', width: '30%', marginBottom: '4rem' }}>
          <p style={{ color: 'var(--color-primary)', letterSpacing: '0.2em', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            The Protocol
          </p>
          <h2 style={{ fontSize: '2.5rem' }}>How It Works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'var(--color-surface)', border: '1px solid var(--color-surface-container-highest)' }}>
          {[
            { step: '01', title: 'Browse & Select', desc: 'Explore our curated catalog of rare niche perfumes. Each reference is sourced directly from verified ateliers.' },
            { step: '02', title: 'Pre-Order', desc: 'Place your pre-order and pay a deposit to secure your slot in the current batch.' },
            { step: '03', title: 'Batch Ships', desc: 'Once enough pre-orders fill the batch, we place the wholesale order and ship directly to Ghana.' },
            { step: '04', title: 'Collect', desc: 'Your authenticated bottle is ready for personal collection at our designated pickup point.' }
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              key={item.step}
              style={{
                background: 'var(--color-surface-container-low)',
                padding: '3rem 2rem',
                minHeight: '350px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                width: 'fit-content',
                marginBottom: '1rem',
              }}>{item.step}</div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '1.25rem', marginBottom: '1rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Promo Section */}
      <section style={{ padding: '0 4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          background: 'var(--color-surface-container-lowest)',
          borderTop: '2px solid var(--color-surface-container-highest)'
        }}>
          <div style={{ padding: '6rem 4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>The Curated Vault</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.125rem', maxWidth: '500px', marginBottom: '3rem' }}>
              {stats.totalProducts > 0
                ? `Currently featuring ${stats.totalProducts} exclusive reference${stats.totalProducts > 1 ? 's' : ''} sourced from the world's most coveted niche houses.`
                : 'Our curators are currently sourcing the next wave of exclusive references. Check back soon.'
              }
            </p>
            <Button variant="tertiary" onClick={() => navigate('/catalog')}>Explore the Vault →</Button>
          </div>
          <div style={{ background: 'var(--color-primary-container)', padding: '6rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--color-background)', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
              {stats.totalSlots > 0
                ? `${stats.totalSlots} Slots Available.`
                : 'New Batch Opening Soon.'
              }
            </h3>
            <p style={{ color: 'var(--color-background)', opacity: 0.8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {stats.totalSlots > 0
                ? 'Secure your allocation before the batch closes.'
                : 'Register now to be first in line when the next batch opens.'
              }
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
