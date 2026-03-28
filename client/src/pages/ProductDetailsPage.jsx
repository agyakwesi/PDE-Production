import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import ScentNotesReveal from '../components/ScentNotesReveal';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateRetailGHS, formatGHS, calculateBatchProgress } from '../utils/pricingEngine';
import useCart from '../utils/useCart';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(res.ok ? data : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--color-primary)' }}>Accessing Archives...</div>;
  if (!product) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Reference not found in vault.</div>;

  const retailGHS = calculateRetailGHS(product.supplierCost);
  const progress = calculateBatchProgress(product.batchTotal, 3000);

  return (
    <div style={{ paddingBottom: '6rem' }}>
      
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        minHeight: '80vh' 
      }}>
        
        <div style={{ 
          background: 'var(--color-surface-container-lowest)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          padding: '6rem 4rem',
          borderRight: '1px solid var(--color-outline-variant)'
        }}>
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            src={product.image || `/images/bottle_1.png`} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              maxWidth: '450px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0px 50px 70px rgba(0,0,0,0.5))',
              marginBottom: '4rem'
            }} 
            onError={(e) => { e.target.src = '/images/bottle_1.png' }}
          />
        </div>

        <div style={{ padding: '6rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>
            <span>{product.brand}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '2rem' }}>
            {product.name}
          </h1>

          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px', marginBottom: '4rem' }}>
            {product.description}
          </p>

          <div style={{ 
            border: '1px solid var(--color-outline-variant)', 
            padding: '2rem', 
            marginBottom: '2rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Batch Status</span>
              <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'var(--color-surface-container-highest)', marginBottom: '1.5rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', lineHeight: 0.9 }}>
                {formatGHS(retailGHS)}
              </div>
            </div>

            <Button 
              style={{ padding: '1.75rem 3rem', fontSize: '0.85rem', letterSpacing: '0.2em' }} 
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  brand: product.brand,
                  image: product.image,
                  supplierCost: product.supplierCost,
                });
                navigate('/cart');
              }}
            >
              Secure Allocation
            </Button>
          </div>

        </div>
      </section>

      <ScentNotesReveal notes={product.notes} />

    </div>
  );
};

export default ProductDetailsPage;
