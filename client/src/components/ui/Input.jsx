import React, { useState } from 'react';
import './ui.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, style, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-wrapper ${className || ''}`} style={style}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`custom-input ${isFocused ? 'focused' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </div>
  );
};

export default Input;
