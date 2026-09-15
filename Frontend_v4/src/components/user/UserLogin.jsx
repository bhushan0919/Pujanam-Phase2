import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCircleCheck,
  faCircleXmark,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHouse,
  faLock,
  faPhone,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/UserAuth.css';

const UserLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAcceptPolicies, setLoginAcceptPolicies] = useState(false);
  const [registerAcceptPolicies, setRegisterAcceptPolicies] = useState(false);
  const [registerSubmitAttempted, setRegisterSubmitAttempted] = useState(false);

  // Login State
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    otp: '',
    phone: '',
    password: '',
    confirmPassword: '',

  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpVerifyStatus, setOtpVerifyStatus] = useState('idle');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const locationMessage = location.state?.message || '';

  useEffect(() => {
    setIsActive(false);
    setOtpSent(false);
    setResendCountdown(0);
  }, []);

  // Login Handlers
  const handleLoginChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await userApi.login(loginCredentials);

      if (result.success && result.token) {
        authStorage.saveAuth('user', result.token, result.customer);
        login(result.token, result.customer);

        // ✅ Check for pending booking
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          // User will be redirected to booking page where form will restore data
          const bookingData = JSON.parse(pendingBooking);
          if (bookingData.service) {
            navigate('/services');
          } else if (bookingData.pandit) {
            navigate('/find-pandit');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          const previousPage = localStorage.getItem('previousPage') || '/';
          localStorage.removeItem('previousPage');
          navigate(previousPage);
        }
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };
  // Register Handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'otp' ? value.replace(/\D/g, '').slice(0, 6)
      : name === 'phone' ? value.replace(/\D/g, '').slice(0, 10)
      : value;

    setRegisterData({
      ...registerData,
      [name]: nextValue
    });
  };

  useEffect(() => {
    if (!resendCountdown) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (!otpSent) {
      setOtpVerifyStatus('idle');
      return undefined;
    }

    const otpValue = String(registerData.otp || '').trim();

    if (otpValue.length !== 6) {
      setOtpVerifyStatus('idle');
      return undefined;
    }

    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.phone.trim()) {
      setOtpVerifyStatus('idle');
      return undefined;
    }

    let active = true;
    setOtpVerifyStatus('checking');

    const timer = setTimeout(async () => {
      try {
        const result = await userApi.verifyOtp({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          otp: otpValue
        });

        if (active) {
          setOtpVerifyStatus(result.success ? 'valid' : 'invalid');
        }
      } catch (error) {
        if (active) {
          setOtpVerifyStatus('invalid');
        }
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [otpSent, registerData.name, registerData.email, registerData.phone, registerData.otp]);

  const validateRegisterForm = (formData = registerData, requireOtp = false, otpOnly = false) => {
    if (!formData.name.trim()) {
      setRegisterError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setRegisterError('Email is required');
      return false;
    }
    if (!otpOnly) {
      if (!/^\d{10}$/.test(formData.phone)) {
        setRegisterError('Valid 10-digit phone number is required');
        return false;
      }
      if (formData.password.length < 6) {
        setRegisterError('Password must be at least 6 characters');
        return false;
      }
      if (requireOtp && formData.password !== formData.confirmPassword) {
        setRegisterError('Passwords do not match');
        return false;
      }
      if (requireOtp && !/^\d{6}$/.test(formData.otp)) {
        setRegisterError('Enter the 6-digit OTP sent to your email');
        return false;
      }
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const otpPayload = { ...registerData };

    if (!validateRegisterForm(otpPayload, false, true)) {
      return;
    }

    setOtpLoading(true);
    setRegisterError('');

    try {
      const { confirmPassword, otp, ...userData } = otpPayload;
      const result = await userApi.sendOtp(userData);

      if (result.success) {
        setOtpSent(true);
        setResendCountdown(result.resendAfterSeconds || 30);
        setOtpVerifyStatus('idle');
        setRegisterData((prev) => ({ ...prev, otp: '' }));
        toast.success(result.message || 'OTP sent successfully');
      } else {
        setRegisterError(result.message || 'Failed to send OTP');
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setRegisterError(message);
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    setRegisterSubmitAttempted(true);

    if (!registerAcceptPolicies) {
      setRegisterError('Please accept the Terms and Conditions and Privacy Statement');
      toast.error('Please accept the Terms and Conditions and Privacy Statement');
      return;
    }

    if (otpSent && otpVerifyStatus === 'invalid') {
      setRegisterError('Please enter the correct OTP before signing up');
      return;
    }

    const registrationPayload = { ...registerData };

    if (!validateRegisterForm(registrationPayload, true)) {
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const { confirmPassword, ...userData } = registrationPayload;
      userData.acceptPolicies = true;

      const result = await userApi.register(userData);

      if (result.success) {
        toast.success('Registration successful! Please log in to continue.');
        setRegisterData({ name: '', email: '', otp: '', phone: '', password: '', confirmPassword: '' });
        setRegisterAcceptPolicies(false);
        setRegisterSubmitAttempted(false);
        setOtpSent(false);
        setOtpVerifyStatus('idle');
        switchToLogin();

      } else {
        setRegisterError(result.message || 'Registration failed');
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setRegisterError(message);
      toast.error(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  
  let otpButtonLabel = 'VERIFY OTP';
  if (otpLoading) {
    otpButtonLabel = 'Sending OTP...';
  } else if (otpSent) {
    otpButtonLabel = 'RESEND OTP';
  }

  const switchToRegister = () => {
    setIsActive(true);
    setLoginError('');
    setRegisterError('');
    setRegisterSubmitAttempted(false);
  };

  const switchToLogin = () => {
    setIsActive(false);
    setLoginError('');
    setRegisterError('');
    setRegisterSubmitAttempted(false);
  };

  return (
    <div className="auth-page">
      <div className={`auth-shell ${isActive ? 'is-register' : 'is-login'}`}>
        <aside className="auth-hero" aria-hidden="true">
          <div className="auth-hero-glow auth-hero-glow-one" />
          <div className="auth-hero-glow auth-hero-glow-two" />
          <div className="auth-hero-corner auth-hero-corner-top" />
          <div className="auth-hero-corner auth-hero-corner-bottom" />

          <div className="auth-hero-content">
            <p className="auth-hero-kicker">Welcome to</p>
            <h1 className="auth-hero-title">Pujanam</h1>
            <div className="auth-hero-divider">
              <span />
              <span className="auth-hero-star">✻</span>
              <span />
            </div>
            <p className="auth-hero-subtitle">Comprehensive Portal for Pandit Booking, Puja Services & Samagri Management</p>

            <div className="auth-hero-emblem-wrap">
              <img src="/icon.png" alt="Pujanam emblem" className="auth-hero-emblem" />
            </div>

            <div className="auth-hero-prayer">
              <span>धर्मो रक्षति रक्षितः</span>
              <small>हमारा उद्देश्य है आपको सही पंडित से जोड़ना</small>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-card">
            {!isActive ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-login-top-actions">
                  <Link to="/" className="auth-home-button">
                    <FontAwesomeIcon icon={faHouse} />
                    Back to Home
                  </Link>
                </div>

                <div className="auth-card-header">
                  <span className="auth-card-rule" />
                  <h2>Login</h2>
                  <span className="auth-card-rule" />
                </div>

                <p className="auth-card-subtitle">Sign in to manage your bookings</p>

                {locationMessage && <div className="auth-error-message" style={{background:'#fff8e6',borderColor:'#f0c05a',color:'#7a4a00'}}>ℹ️ {locationMessage}</div>}
                {loginError && <div className="auth-error-message">⚠️ {loginError}</div>}

                <div className="auth-field">
                  <label htmlFor="login-email">Email</label>
                  <div className="auth-input-shell">
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      value={loginCredentials.email}
                      onChange={handleLoginChange}
                      required
                      disabled={loginLoading}
                    />
                    <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="auth-input-shell">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter Your Password"
                      value={loginCredentials.password}
                      onChange={handleLoginChange}
                      required
                      disabled={loginLoading}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowLoginPassword((value) => !value)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showLoginPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="auth-checkline auth-checkline-single">
                  <Link to="/user/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                </div>

                <label className="auth-policy">
                  <input
                    type="checkbox"
                    checked={loginAcceptPolicies}
                    onChange={(e) => setLoginAcceptPolicies(e.target.checked)}
                  />
                  <span>
                    You agree to accept the <Link to="/terms-conditions">Terms and Conditions</Link> &{' '}
                    <Link to="/privacy-policy">Privacy Policy</Link> set by the Pujanam
                  </span>
                </label>

                {!loginAcceptPolicies && (
                  <p className="auth-error-message" style={{fontSize:'13px',marginBottom:'8px'}}>⚠️ You must accept the Privacy Policy and Terms &amp; Conditions to continue.</p>
                )}
                <button type="submit" className="auth-submit" disabled={loginLoading || !loginAcceptPolicies}>
                  {loginLoading ? <LoadingSpinner size="small" inline /> : <><FontAwesomeIcon icon={faLock} /> Sign In</>}
                </button>

                <button
                  type="button"
                  className="auth-pandit-link-button"
                  onClick={() => navigate('/pandit-login')}
                >
                  Login as Pandit
                </button>

                <div className="auth-divider">
                  <span />
                  <span>or</span>
                  <span />
                </div>

                <p className="auth-switch-copy">
                  Don&apos;t have an account?{' '}
                  <button type="button" className="auth-switch-link" onClick={switchToRegister}>
                    Sign Up Here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="auth-card-header">
                  <span className="auth-card-rule" />
                  <h2>Sign Up</h2>
                  <span className="auth-card-rule" />
                </div>

                <p className="auth-card-subtitle">Create your Pujanam account</p>

                {registerError && <div className="auth-error-message">⚠️ {registerError}</div>}

                <div className="auth-field">
                  <label htmlFor="register-name">Full Name <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      placeholder="Enter Your Name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading}
                    />
                    <FontAwesomeIcon icon={faUser} className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-email">Email Address <span className="auth-required">*</span></label>
                  <div className="auth-inline-field">
                    <div className="auth-input-shell auth-input-shell-inline">
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        disabled={registerLoading}
                      />
                      <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                    </div>
                   
                  </div>
                </div>

                

                <div className="auth-field">
                  <label htmlFor="register-phone">Mobile Number <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit mobile number"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      maxLength="10"
                      inputMode="numeric"
                      required
                      disabled={registerLoading}
                    />
                    <FontAwesomeIcon icon={faPhone} className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-password">Password <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowRegisterPassword((value) => !value)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showRegisterPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-confirm-password">Confirm Password <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading || otpLoading}
                    />

                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

<div className="auth-field">
                 <button
                      type="button"
                      className="auth-inline-cta"
                      onClick={handleSendOtp}
                      disabled={otpLoading || registerLoading || resendCountdown > 0}
                    >
                      {otpButtonLabel}
                    </button>
                    </div>

                    {otpSent && (
                  <div className="auth-field">
                    <label htmlFor="register-otp">OTP <span className="auth-required">*</span></label>
                    <div className="auth-input-shell auth-input-shell-status">
                      <input
                        id="register-otp"
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={registerData.otp}
                        onChange={handleRegisterChange}
                        maxLength="6"
                        inputMode="numeric"
                        required
                        disabled={registerLoading}
                      />
                      {otpVerifyStatus === 'checking' && (
                        <FontAwesomeIcon icon={faSpinner} spin className="auth-input-status-icon auth-input-status-checking" />
                      )}
                      {otpVerifyStatus === 'valid' && (
                        <FontAwesomeIcon icon={faCircleCheck} className="auth-input-status-icon auth-input-status-valid" />
                      )}
                      {otpVerifyStatus === 'invalid' && (
                        <FontAwesomeIcon icon={faCircleXmark} className="auth-input-status-icon auth-input-status-invalid" />
                      )}
                    </div>
                  </div>
                )}

                <label className="auth-policy">
                  <input
                    type="checkbox"
                    checked={registerAcceptPolicies}
                    onChange={(e) => setRegisterAcceptPolicies(e.target.checked)}
                  />
                  <span>
                    I agree to the <Link to="/terms-conditions">Terms and Conditions</Link> and{' '}
                    <Link to="/privacy-policy">Privacy Statement</Link>
                  </span>
                </label>

                {registerSubmitAttempted && !registerAcceptPolicies && (
                  <p className="auth-error-message" style={{fontSize:'13px',marginBottom:'8px'}}>⚠️ You must accept the Privacy Policy and Terms &amp; Conditions to continue.</p>
                )}
                <button type="submit" className="auth-submit" disabled={registerLoading}>
                  {registerLoading ? 'Creating Account...' : 'SIGN UP'}
                </button>

                <p className="auth-switch-copy">
                  Already have an account?{' '}
                  <button type="button" className="auth-switch-link" onClick={switchToLogin}>
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserLogin;