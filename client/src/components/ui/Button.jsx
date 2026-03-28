import React from 'react';
import './ui.css';

const Button = ({ variant = 'primary', children, onClick, style, className, ...props }) => {
  const baseStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '1rem 2rem',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0px',
  };

  let variantStyle = {};

  if (variant === 'primary') {
    variantStyle = {
      background: 'linear-gradient(to bottom, var(--color-primary), var(--color-primary-container))',
      color: 'var(--color-surface-container-lowest)',
      fontWeight: '600',
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      background: 'transparent',
      border: '1px solid rgba(242, 202, 80, 0.4)',
      color: 'var(--color-primary)',
    };
  } else if (variant === 'tertiary') {
    variantStyle = {
      background: 'transparent',
      color: 'var(--color-primary)',
      padding: '0.5rem 0',
      position: 'relative',
      overflow: 'hidden',
    };
  }

  return (
    <button 
      className={`btn-${variant} ${className || ''}`} 
      style={{ ...baseStyle, ...variantStyle, ...style }} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
