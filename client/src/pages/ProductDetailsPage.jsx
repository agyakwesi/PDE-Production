import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import ScentNotesReveal from '../components/ScentNotesReveal';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateRetailGHS, formatGHS, calculateBatchProgress } from '../utils/pricingEngine';
import useCart from '../utils/useCart';
import './ProductDetailsPage.css';

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

  if (loading) return <div className="product-loading">Accessing Archives...</div>;
  if (!product) return <div className="product-not-found">Reference not found in vault.</div>;

  const retailGHS = calculateRetailGHS(product.supplierCost);
  const progress = calculateBatchProgress(product.batchTotal, 3000);

  return (
    <div className="product-details-page">
      
      <section className="product-details-layout">
        
        <div className="product-image-section">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            src={product.image || `/images/bottle_1.png`} 
            alt={product.name} 
            className="product-main-image"
            onError={(e) => { e.target.src = '/images/bottle_1.png' }}
          />
        </div>

        <div className="product-info-section">
          
          <div className="product-brand-tags">
            <span>{product.brand}</span>
          </div>

          <h1 className="product-title">
            {product.name}
          </h1>

          <p className="product-description">
            {product.description}
          </p>

          <div className="product-batch-card">
            <div className="product-batch-header">
              <span className="product-batch-label">Batch Status</span>
              <span className="product-batch-value">{Math.round(progress)}%</span>
            </div>
            <div className="product-batch-bar-bg">
              <div className="product-batch-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="product-action-container">
            <div style={{ flex: 1 }}>
              <div className="product-price">
                {formatGHS(retailGHS)}
              </div>
            </div>

            <Button 
              className="product-action-btn"
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
