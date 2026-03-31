import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <div className="dark-section">
      <footer className="footer">
        {/* Top Section - Newsletter */}
        <div className="footer-top">
          <h2>Join the Inner Circle</h2>
          <p>Subscribe to be notified of new reference drops and exclusive pre-order allocations.</p>
          <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Unlock</button>
          </form>
        </div>

        {/* Middle Section - Navigation */}
        <div className="footer-middle">
          <div className="footer-brand">
            <h3>Parfum d'Élite</h3>
            <p>The curated pre-order experience for rare niche fragrances. Discover masterpieces from the world's most coveted ateliers.</p>
          </div>
          
          <div className="footer-nav-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/catalog">Live Catalog</Link></li>
              <li><Link to="/vault">The Vault</Link></li>
              <li><Link to="/auth">Client Portal</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping Protocol</a></li>
              <li><a href="#">Authenticity Guarantee</a></li>
              <li><a href="#">Contact Concierge</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">X / Twitter</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Legal */}
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} PARFUM D'ÉLITE. ALL RIGHTS RESERVED.</div>
          <div style={{ color: 'var(--color-primary-container)' }}>DELIVERED TO GHANA FROM AUTHENTIC SOURCES</div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
