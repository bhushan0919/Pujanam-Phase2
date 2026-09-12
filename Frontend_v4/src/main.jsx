// frontend/src/main.jsx - UPDATED VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
  const rootElement = document.getElementById('root');
    
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(React.StrictMode, {}, React.createElement(App)));
      } else {
  }
});