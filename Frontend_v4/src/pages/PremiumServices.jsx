import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumServices = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '85vh',
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1155 40%, #4a1a6b 70%, #6b2980 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(180,100,255,0.12)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,180,50,0.10)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: '30%', left: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(120,60,200,0.15)', filter: 'blur(40px)' }} />

      <div style={{
        maxWidth: '620px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Crown icon */}
        <div style={{
          width: '108px',
          height: '108px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f9d18b 0%, #d4a017 50%, #a37412 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '48px',
          boxShadow: '0 0 0 12px rgba(212,160,23,0.15), 0 20px 48px rgba(212,160,23,0.35)',
        }}>
          👑
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(212,160,23,0.35)',
          borderRadius: '30px',
          padding: '6px 20px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{ color: '#f9d18b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>✦ Premium Services</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '8px',
          lineHeight: 1.15,
        }}>
          Something Extraordinary
        </h1>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 600,
          background: 'linear-gradient(90deg, #f9d18b, #e0a028)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px',
        }}>
          is Coming Soon
        </h2>

        {/* Description */}
        <p style={{
          color: 'rgba(255,255,255,0.68)',
          fontSize: '1.05rem',
          lineHeight: 1.8,
          maxWidth: '480px',
          margin: '0 auto 40px',
        }}>
          We are crafting exclusive premium astrology and puja services designed to provide you with the deepest spiritual guidance, one-on-one consultations, and sacred Vedic experiences.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '40px' }}>
          {['🔮 Personal Consultations', '📿 Vedic Remedies', '🪔 Exclusive Pujas', '⭐ Expert Pandits'].map((f, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.80)',
              borderRadius: '20px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
            }}>{f}</span>
          ))}
        </div>

        {/* Notify button */}
        <button
          onClick={() => alert('Notification feature coming soon!')}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto 14px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f9d18b 0%, #d4a017 100%)',
            color: '#3a1a00',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212,160,23,0.35)',
            letterSpacing: '0.02em',
          }}
        >
          🔔 Notify Me at Launch
        </button>

        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto',
            padding: '13px',
            background: 'rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.70)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← Return to Home
        </button>
      </div>
    </div>
  );
};

export default PremiumServices;
