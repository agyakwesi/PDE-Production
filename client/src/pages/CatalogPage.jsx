import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingScreen from '../components/LoadingScreen';

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
    <div style={{ padding: '6rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Centered Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h1 style={{ 
          fontSize: '4.5rem', 
          fontFamily: 'var(--font-display)', 
          textTransform: 'uppercase', 
          color: 'var(--color-on-background)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          fontWeight: 400
        }}>
          THE CURATED INVENTORY
        </h1>
        <p style={{ 
          color: 'var(--color-on-surface)', 
          fontSize: '1rem', 
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          Access rare extracts and signature scents sourced directly from verified ateliers.<br/>
          Each reference is subject to architectural validation and rarity checks.
        </p>

        {/* Pill Toggle Switch */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            border: '1px solid var(--color-outline)', 
            borderRadius: '100px',
            overflow: 'hidden'
          }}>
            <button style={{ 
              background: 'var(--color-on-background)', 
              color: 'var(--color-background)', 
              padding: '0.6rem 2rem', 
              border: 'none', 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              fontWeight: 600, 
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}>Full Bottles</button>
            <button style={{ 
              background: 'transparent', 
              color: 'var(--color-on-surface-variant)', 
              padding: '0.6rem 2rem', 
              border: 'none', 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              fontWeight: 600, 
              letterSpacing: '0.05em', 
              cursor: 'pointer'
            }}>Original Vials</button>
          </div>
        </div>

        <p style={{ 
          color: 'var(--color-on-surface-variant)', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          fontWeight: 700
        }}>
          SHOWING {products.length} REFERENCES
        </p>
      </div>

      {loading ? (
        <LoadingScreen message="Accessing Vault..." />
      ) : products.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          The vault is currently empty. Waiting for administrative curation.
        </div>
      ) : (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem 4rem',
        justifyItems: 'center'
      }}>
        {products.map((product, i) => (
          <ProductCard 
            key={product._id || product.id}
            product={product}
            index={i}
            onClick={() => navigate(`/catalog/${product._id || product.id}`)}
          />
        ))}
      </div>
      )}

      {/* Footer Wide Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6rem' }}>
        <button style={{
          background: 'transparent',
          border: '1px solid var(--color-on-background)',
          color: 'var(--color-on-background)',
          padding: '1.25rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
          maxWidth: '1200px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-on-background)';
          e.currentTarget.style.color = 'var(--color-background)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--color-on-background)';
        }}>
          EXPAND ARCHIVES
        </button>
      </div>

    </div>
  );
};

export default CatalogPage;
