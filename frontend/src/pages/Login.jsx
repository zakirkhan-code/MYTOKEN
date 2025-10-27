import React, { useState } from 'react';
import axios from 'axios';
import '../pages/AuthPages.css'; // Optional styling

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    walletAddress: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Connect Metamask Wallet
  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setErrors({ wallet: 'MetaMask not installed. Please install MetaMask!' });
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts[0]) {
        const walletAddress = accounts[0];
        setFormData(prev => ({
          ...prev,
          walletAddress: walletAddress
        }));
        setWalletConnected(true);
        setMessage('✅ Wallet connected successfully!');
        setErrors({});
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setErrors({ wallet: 'Failed to connect wallet. Please try again.' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Wallet address validation
    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Wallet address is required. Please connect your wallet!';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Invalid wallet address format';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: formData.email,
          password: formData.password,
          walletAddress: formData.walletAddress
        }
      );

      if (response.data.success) {
        // Check if 2FA is required
        if (response.data.requires2FA) {
          setMessage('⚠️ 2FA verification required');
          // Store temp token for 2FA page
          localStorage.setItem('tempToken', response.data.tempToken);
          setTimeout(() => {
            window.location.href = '/verify-2fa';
          }, 1500);
        }
        // Check if email verification is required
        else if (response.data.requiresEmailVerification) {
          setMessage('❌ Please verify your email first');
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 1500);
        }
        // Check if wallet connection required
        else if (response.data.requiresWallet) {
          setMessage('❌ Please connect your wallet to continue');
        }
        // Successful login
        else {
          // Store JWT token
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          setMessage('✅ Login successful! Redirecting...');
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      } else {
        setMessage('❌ Login failed. Please try again.');
      }

      // Handle specific error cases
      if (error.response?.status === 403) {
        if (error.response?.data?.requiresEmailVerification) {
          setMessage('❌ Please verify your email first');
        } else if (error.response?.data?.requiresWallet) {
          setMessage('❌ Please connect your wallet');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 Login</h1>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Wallet Address Field */}
          <div className="form-group">
            <label htmlFor="walletAddress">
              🔗 Wallet Address:
              {walletConnected && <span className="connected-badge">✅ Connected</span>}
            </label>
            <div className="wallet-input-group">
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                placeholder="0x... (Click Connect Wallet)"
                readOnly
                className={`wallet-input ${errors.walletAddress ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={connectWallet}
                className={`connect-wallet-btn ${walletConnected ? 'connected' : ''}`}
              >
                {walletConnected ? '✅ Connected' : '🦊 Connect Wallet'}
              </button>
            </div>
            {errors.walletAddress && (
              <span className="error-message">{errors.walletAddress}</span>
            )}
            <small className="hint">
              Click "Connect Wallet" to connect your MetaMask wallet
            </small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '✅ Login'}
          </button>
        </form>

        {/* Links */}
        <div className="footer-links">
          <div>
            <a href="/forgot-password">🔄 Forgot Password?</a>
          </div>
          <div>
            Don't have an account? <a href="/register">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;