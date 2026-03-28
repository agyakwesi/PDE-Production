import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useCart from '../utils/useCart';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Parfum d'Élite
        </Link>
      </div>
      
      <button 
        className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/vault" className={`nav-link ${location.pathname.startsWith('/vault') ? 'active' : ''}`} onClick={closeMenu}>
          The Vault
        </Link>
        <Link to="/catalog" className={`nav-link ${location.pathname.startsWith('/catalog') ? 'active' : ''}`} onClick={closeMenu}>
          Catalog
        </Link>
        <Link to="/cart" className={`nav-link cart-link ${location.pathname.startsWith('/cart') ? 'active' : ''}`} onClick={closeMenu}>
          Cart
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>
        
        {user ? (
          <Link to="/" className="nav-link" onClick={() => { logout(); closeMenu(); }}>
            Logout
          </Link>
        ) : (
          <Link to="/auth" className={`nav-link ${location.pathname.startsWith('/auth') ? 'active' : ''}`} onClick={closeMenu}>
            Login
          </Link>
        )}

        {user && user.role === 'admin' && (
          <Link to="/admin" className={`nav-link admin-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`} onClick={closeMenu}>
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
