import React from 'react';
import { motion } from 'framer-motion';
import { calculateRetailGHS, formatGHS, formatUSD, FIXED_RATE } from '../utils/pricingEngine';
import './TransparencyWidget.css';

const TransparencyWidget = ({ officialMSRP, localRetailGHS }) => {
  const ourPrice = calculateRetailGHS(officialMSRP);
  const msrpInGHS = officialMSRP * FIXED_RATE;
  const savings = localRetailGHS ? localRetailGHS - ourPrice : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="transparency-widget"
    >
      <div className="widget-header">
        <div className="dot" />
        <span>Price Transparency Protocol</span>
      </div>

      <div className="price-comparison-grid">
        {/* Official MSRP */}
        <div className="price-row">
          <div className="label">Official MSRP (USD)</div>
          <div className="value">{formatUSD(officialMSRP)}</div>
          <div className="meta">Global Retail Standard</div>
        </div>

        {/* Cedi Conversion */}
        <div className="price-row">
          <div className="label">Exchange Rate</div>
          <div className="value">10.90</div>
          <div className="meta">Locked GHS/USD Rate</div>
        </div>

        <div className="divider" />

        {/* Our Price */}
        <div className="price-row highlight">
          <div className="label">Our Transparent Price</div>
          <div className="value">{formatGHS(ourPrice)}</div>
          <div className="meta">Direct-to-Curator Pricing</div>
        </div>

        {/* Local Retail Comparison */}
        {localRetailGHS && (
          <div className="price-row local-market">
            <div className="label">Local Market Retail</div>
            <div className="value strike">{formatGHS(localRetailGHS)}</div>
            <div className="meta danger">Local Markup Applied</div>
          </div>
        )}
      </div>

      {savings > 0 && (
        <div className="savings-footer">
          <span className="gold-text">Savings: {formatGHS(savings)}</span>
          <span className="meta">Unlocking Value for the "Founder 50"</span>
        </div>
      )}
    </motion.div>
  );
};

export default TransparencyWidget;
