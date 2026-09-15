// Frontend/src/components/support/LiveChart.jsx
import React, { useState, useEffect, useRef } from 'react';

const LiveChart = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'support',
      text: '🙏 Namaste! Welcome to Pujanam Support. How can we help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const AUTO_REPLIES = {
    booking: 'For booking issues, please visit your dashboard or call us at +91 9373120370.',
    payment: 'For payment queries, please share your booking ID and we will assist you shortly.',
    pandit: 'We will assign a qualified pandit for your puja. Please complete your booking first.',
    cancel: 'To cancel a booking, go to My Bookings in your dashboard and click "Cancel Booking".',
    refund: 'Refunds are processed within 5–7 business days to your original payment method.',
    default: 'Thank you for reaching out! Our support team will get back to you within 24 hours. You can also call us at +91 9373120370.'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAutoReply = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('book')) return AUTO_REPLIES.booking;
    if (lower.includes('pay') || lower.includes('payment')) return AUTO_REPLIES.payment;
    if (lower.includes('pandit')) return AUTO_REPLIES.pandit;
    if (lower.includes('cancel')) return AUTO_REPLIES.cancel;
    if (lower.includes('refund')) return AUTO_REPLIES.refund;
    return AUTO_REPLIES.default;
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        id: Date.now() + 1,
        from: 'support',
        text: getAutoReply(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: '80px', right: '20px',
      width: '320px', height: '420px',
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column',
      zIndex: 9999, fontFamily: 'inherit'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e67e22, #c0392b)',
        borderRadius: '12px 12px 0 0', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>🙏 Pujanam Support</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Typically replies in minutes</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fff',
            fontSize: '18px', cursor: 'pointer', lineHeight: 1
          }}>✕</button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '78%', padding: '8px 12px', borderRadius: '10px',
              background: msg.from === 'user' ? '#e67e22' : '#f1f1f1',
              color: msg.from === 'user' ? '#fff' : '#333',
              fontSize: '13px', lineHeight: '1.4'
            }}>
              <div>{msg.text}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '3px', textAlign: 'right' }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: '#f1f1f1', borderRadius: '10px', padding: '8px 14px',
              fontSize: '20px', letterSpacing: '2px', color: '#888'
            }}>•••</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid #eee', padding: '10px',
        display: 'flex', gap: '8px', alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: '20px',
            border: '1px solid #ddd', fontSize: '13px', outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            background: inputText.trim() ? '#e67e22' : '#ccc',
            border: 'none', borderRadius: '50%', width: '34px', height: '34px',
            color: '#fff', cursor: inputText.trim() ? 'pointer' : 'default',
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >➤</button>
      </div>
    </div>
  );
};

export default LiveChart;
