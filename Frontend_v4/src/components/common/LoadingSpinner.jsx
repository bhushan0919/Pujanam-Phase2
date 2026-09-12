// Frontend/src/components/common/LoadingSpinner.jsx

import React from 'react';
import '../../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading...',
  overlay = false,
  inline = false   // NEW: use inside buttons / compact spaces
}) => {
  // Inline mode: render a bare spinner with no container padding,
  // no block-level text, so the button does not grow at all.
  if (inline) {
    return (
      <span className={`spinner spinner-inline ${size} ${color}`}>
        <span className="spinner-circle"></span>
      </span>
    );
  }

  return (
    <div className={`loading-spinner-container ${overlay ? 'overlay' : ''}`}>
      <div className={`spinner ${size} ${color}`}>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// InlineSpinner: uses <span> tags so it is valid and truly inline inside <button>
export const InlineSpinner = ({ size = 'small' }) => (
  <span className={`inline-spinner ${size}`} style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
    <span className="spinner-dot"></span>
    <span className="spinner-dot"></span>
    <span className="spinner-dot"></span>
  </span>
);
export default LoadingSpinner;