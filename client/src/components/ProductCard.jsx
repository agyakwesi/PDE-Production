import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateRetailGHS, formatGHS } from '../utils/pricingEngine';
import './ProductCard.css';

const ProductCard = ({ product, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const retailPrice = calculateRetailGHS(product.officialMSRP);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="editorial-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Background Typography */}
      <div className="card-bg-brand">
        {product.brand || product.house}
      </div>

      {/* Floating Bottle Container */}
      <div className="bottle-container">
        <motion.img
          src={product.image || product.images?.[0] || `/images/bottle_1.png`}
          alt={product.name}
          animate={{ 
            y: isHovered ? -15 : 0,
            scale: isHovered ? 1.05 : 1,
            rotateZ: isHovered ? 2 : 0
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="floating-bottle"
          onError={(e) => { e.target.src = '/images/bottle_1.png' }}
        />
      </div>

      {/* Card Info Overlay */}
      <div className="card-info">
        <div className="card-header">
          <motion.h3 
            animate={{ x: isHovered ? 5 : 0 }}
            className="product-name"
          >
            {product.name}
          </motion.h3>
          <p className="brand-label">{product.brand || product.house}</p>
        </div>

        <div className="card-pricing">
          <div className="pricing-meta">
            Founder's Exclusive Price
          </div>
          <div className="price-value">
            {formatGHS(retailPrice)}
          </div>
          <div className="transparency-tag">
            Official MSRP-Anchored
          </div>
        </div>

        {/* Stock/Status Indicator */}
        <div className="card-status">
          <div className={`status-dot ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`} />
          <span>{product.stockQuantity > 0 ? 'Batch Open' : 'Filling Soon'}</span>
        </div>
      </div>

      {/* Hover Detail Overlay (Optional/Minimal) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-hover-accent"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;
