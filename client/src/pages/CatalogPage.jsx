import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateRetailGHS, formatGHS } from '../utils/pricingEngine';

// High-demand luxury brands that get the prestige badge
const LUXURY_HOUSES = [
  'creed', 'maison francis kurkdjian', 'mfk', 'baccarat', 'tom ford',
  'xerjoff', 'amouage', 'parfums de marly', 'pdm', 'roja', 'clive christian',
  'initio', 'nishane', 'byredo', 'le labo', 'kilian', 'memo'
];

const isLuxuryBrand = (brand) => {
  if (!brand) return false;
  const lower = brand.toLowerCase();
  return LUXURY_HOUSES.some(h => lower.includes(h));
};

// Split notes into a scent pyramid (Top → Heart → Base)
const buildPyramid = (notesStr) => {
  if (!notesStr) return null;
  const all = notesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
  if (all.length === 0) return null;
  
  const third = Math.max(1, Math.ceil(all.length / 3));
  return {
    top: all.slice(0, third),
    heart: all.slice(third, third * 2),
    base: all.slice(third * 2)
  };
};


const CatalogPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '6rem 4rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            The Curated<br/>
            <span style={{ color: 'var(--color-primary)' }}>Inventory</span>
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', lineHeight: 1.6 }}>
            Access rare extraits and signature scents sourced directly from verified ateliers. Each reference is subject to architectural validation and rarity checks.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ display: 'flex', border: '1px solid var(--color-outline-variant)' }}>
            <button style={{ 
              background: 'var(--color-primary)', color: 'var(--color-background)', 
              padding: '0.75rem 1.5rem', border: 'none', 
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', textTransform: 'uppercase', 
              fontWeight: 600, letterSpacing: '0.05em'
            }}>Full Bottles</button>
            <button style={{ 
              background: 'transparent', color: 'var(--color-on-surface-variant)', 
              padding: '0.75rem 1.5rem', border: 'none', 
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', textTransform: 'uppercase', 
              fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer'
            }}>Original Vials</button>
          </div>
          <p style={{ color: 'var(--color-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Showing {products.length} References
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Accessing Vault...
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          The vault is currently empty. Waiting for administrative curation.
        </div>
      ) : (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2.75rem'
      }}>
        {products.map((product, i) => {
          const retailGHS = calculateRetailGHS(product.supplierCost);
          return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/catalog/${product._id}`)}
              style={{
                background: 'var(--color-surface-container-low)',
                padding: '2rem',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'border-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', background: 'var(--color-surface-container-lowest)' }}>
                <img 
                  src={product.image || `/images/bottle_1.png`} 
                  alt={product.name} 
                  style={{ width: '70%', height: '70%', objectFit: 'contain' }} 
                  onError={(e) => { e.target.src = '/images/bottle_1.png' }}
                />
              </div>
              <p style={{ color: 'var(--color-primary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{product.brand}</p>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>{product.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatGHS(retailGHS)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>{product.stockQuantity > 0 ? 'Batch Open' : 'Filling Soon'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <button style={{
          background: 'transparent',
          border: '1px solid var(--color-outline-variant)',
          color: 'var(--color-on-surface)',
          padding: '1rem 3rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer'
        }}>
          Expand Archives
        </button>
      </div>

    </div>
  );
};

export default CatalogPage;
