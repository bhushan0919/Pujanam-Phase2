import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ icon = '🚀', title, description, serviceName }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e2 50%, #fff0d6 100%)',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '28px',
        boxShadow: '0 20px 60px rgba(214,120,30,0.12)',
        border: '1px solid #f5dfc0',
        padding: '56px 40px',
      }}>
        {/* Icon */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f9d18b, #e08a1e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: '40px',
          boxShadow: '0 12px 28px rgba(224,138,30,0.28)',
        }}>
          {icon}
        </div>

        {/* Badge */}
        <span style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #fff5e6, #fff0d6)',
          border: '1px solid #f0c882',
          color: '#b86314',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '5px 16px',
          borderRadius: '20px',
          marginBottom: '20px',
        }}>
          Coming Soon
        </span>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#5c2c18',
          marginBottom: '16px',
          lineHeight: 1.2,
        }}>
          {serviceName || title}
        </h1>

        {/* Description */}
        <p style={{
          color: '#8a6a52',
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: '36px',
        }}>
          {description || `We are working hard to bring you ${title}. Stay tuned for updates!`}
        </p>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #e8c898, transparent)',
          margin: '0 0 32px',
        }} />

        {/* Notify button (non-functional placeholder) */}
        <button
          style={{
            display: 'block',
            width: '100%',
            padding: '13px',
            background: 'linear-gradient(135deg, #e8a528, #d47c18)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'default',
            marginBottom: '12px',
            boxShadow: '0 6px 18px rgba(212,124,24,0.28)',
          }}
          onClick={() => alert('Notification feature coming soon!')}
        >
          🔔 Notify Me When Available
        </button>

        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            width: '100%',
            padding: '13px',
            background: 'transparent',
            color: '#8a6a52',
            border: '1px solid #e8c898',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = '#fff8f0'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          ← Return to Home
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
