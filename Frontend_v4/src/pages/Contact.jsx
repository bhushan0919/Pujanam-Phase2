// Frontend/src/pages/Contact.jsx

import React, { useState } from 'react';
import { buildUrl } from '../config';
import { motion } from 'framer-motion';
import '../styles/Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error/success when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Frontend/src/pages/Contact.jsx - Updated handleSubmit

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Basic validation
  if (!formData.name.trim()) {
    setError('Please enter your name');
    return;
  }
  if (!formData.email.trim()) {
    setError('Please enter your email');
    return;
  }
  if (!formData.message.trim()) {
    setError('Please enter your message');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }
  
  setLoading(true);
  setError('');
  setSuccess('');
  
  try {
    const response = await fetch(buildUrl('contact/submit'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Check if response is OK
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Server error: ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
      throw new Error(errorMessage);
    }
    
    // Parse JSON response
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    const data = JSON.parse(text);
    
    if (data.success) {
      setSuccess('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } else {
      setError(data.message || 'Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      setError('⚠️ Too many messages. Please try again later.');
    } else if (error.message.includes('fetch')) {
      setError('Network error. Please check your connection.');
    } else {
      setError(error.message || 'Failed to send message. Please try again.');
    }
  } finally {
    setLoading(false);
  }

  };

  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
          Get in Touch 🙏
        </motion.h1>
        <p>We're here to help you with all your spiritual needs.</p>
      </section>

      {/* MAIN */}
      <section className="contact-container">

        {/* FORM */}
        <motion.div 
          className="contact-form glass" 
          initial={{ opacity: 0, x: -50 }} 
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2>Send a Message</h2>
          
          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div className="form-success">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone (Optional)"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
            
            <textarea
              name="message"
              placeholder="Your Message *"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              required
            ></textarea>

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
          
          <p className="form-note">
            * We typically respond within 24 hours
          </p>
        </motion.div>

        {/* INFO */}
        <motion.div 
          className="contact-info glass" 
          initial={{ opacity: 0, x: 50 }} 
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2>Contact Info</h2>

          <p>📞 +91 9373120370</p>
          <p>📧 gavhaneb02@gmail.com</p>
          <p>📍 Pune, India</p>

          <div className="social-links">
            <a href="#" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://instagram.com/bhushan_0919" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://youtube.com/@pujanamIndia" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
          
          <div className="business-hours">
            <h3>Business Hours</h3>
            <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
            <p>Sunday: 10:00 AM - 6:00 PM</p>
          </div>
        </motion.div>

      </section>

      {/* MAP */}
      <section className="contact-map">
        <iframe
          src="https://maps.google.com/maps?q=pune&t=&z=13&ie=UTF8&iwloc=&output=embed"
          title="Pujanam Location Map"
          aria-label="Google Maps showing Pune location"
        ></iframe>
      </section>

    </div>
  );
};

export default Contact;