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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          // Set default variant if available
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
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

  const currentSupplierCost = selectedVariant ? selectedVariant.supplierCost : product.supplierCost;
  const retailGHS = calculateRetailGHS(currentSupplierCost);

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

          <div className="product-urgency-container">
             <span className="product-urgency-text">Only 3 bottles remaining</span>
          </div>

          {/* Size Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="product-variants-section">
              <span className="product-variants-label">Available Sizes</span>
              <div className="product-variants-grid">
                {product.variants.map((v, i) => (
                  <button 
                    key={i}
                    className={`product-variant-btn ${selectedVariant?.size === v.size ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  productId: product.id || product._id,
                  name: product.name,
                  brand: product.brand,
                  image: product.image,
                  supplierCost: currentSupplierCost,
                  size: selectedVariant ? selectedVariant.size : 'Standard',
                });
                navigate('/cart');
              }}
            >
              Pre order
            </Button>
          </div>

        </div>
      </section>

      <ScentNotesReveal notes={product.notes} />

    </div>
  );
};

export default ProductDetailsPage;
