import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingScreen from '../components/LoadingScreen';
import './CatalogPage.css';

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
    <div className="catalog-page">
      
      {/* Centered Header Section */}
      <div className="catalog-header">
        <h1 className="catalog-title">
          THE CURATED INVENTORY
        </h1>
        <p className="catalog-subtitle">
          Access rare extracts and signature scents sourced directly from verified ateliers.<br/>
          Each reference is subject to architectural validation and rarity checks.
        </p>

        {/* Pill Toggle Switch */}
        <div className="catalog-toggle-container">
          <div className="catalog-toggle">
            <button className="catalog-toggle-btn active">Full Bottles</button>
            <button className="catalog-toggle-btn inactive">Original Vials</button>
          </div>
        </div>

        <p className="catalog-reference-count">
          SHOWING {products.length} REFERENCES
        </p>
      </div>

      {loading ? (
        <LoadingScreen message="Accessing Vault..." />
      ) : products.length === 0 ? (
        <div className="catalog-empty-state">
          The vault is currently empty. Waiting for administrative curation.
        </div>
      ) : (
      <div className="catalog-grid">
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
      <div className="catalog-footer-action">
        <button className="catalog-expand-btn">
          EXPAND ARCHIVES
        </button>
      </div>

    </div>
  );
};

export default CatalogPage;
