import React, { useState } from 'react';
import axios from 'axios';
import '../pages/AuthPages.css'; // Optional styling

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain number';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        'http://localhost:5000/api/auth/register',
        {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          walletAddress: formData.walletAddress
        }
      );

      if (response.data.success) {
        setMessage('✅ Registration successful! Check your email for verification link.');
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          walletAddress: ''
        });
        setWalletConnected(false);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      } else {
        setMessage('❌ Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>📝 Create Account</h1>

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
              Click "Connect Wallet" to connect your MetaMask wallet (or compatible wallet)
            </small>
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
              placeholder="At least 8 characters (uppercase, lowercase, number)"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            <small className="hint">
              Must contain: uppercase, lowercase, and number
            </small>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Registering...' : '✅ Register'}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Register;