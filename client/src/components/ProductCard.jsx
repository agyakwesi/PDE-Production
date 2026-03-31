import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateRetailGHS, formatGHS } from '../utils/pricingEngine';
import './ProductCard.css';

const ProductCard = ({ product, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const retailPrice = calculateRetailGHS(product.supplierCost || product.officialMSRP);
  
  const initialImageSrc = product.image || product.images?.[0] || '/images/bottle_1.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: "easeOut" }}
      className="minimal-product-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Bottle Container */}
      <div className="minimal-bottle-container">
        <motion.img
          src={initialImageSrc}
          alt={product.name}
          initial={{ opacity: 1, scale: 1, y: 0 }}
          animate={{
            opacity: 1,
            y: isHovered ? -10 : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="minimal-bottle"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = '/images/bottle_1.png';
          }}
        />
      </div>

      {/* Status Badge */}
      <div className="minimal-badge-container">
        <div className="minimal-badge">
          {product.stockQuantity > 0 ? 'Batch Open' : 'Waiting List'}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="minimal-card-content">
        <p className="minimal-brand">{product.brand}</p>
        <h3 className="minimal-name">{product.name}</h3>
        
        <div className="minimal-pricing">
          <span className="minimal-price-value">{formatGHS(retailPrice)}</span>
          <span className="minimal-price-label">Excl.</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
