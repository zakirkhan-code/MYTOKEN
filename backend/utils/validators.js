// utils/validators.js - Validation Functions

// ============================================
// EMAIL VALIDATION
// ============================================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// ============================================
// PASSWORD VALIDATION
// ============================================

const validatePassword = (password) => {
  // Minimum 8 characters
  if (password.length < 8) return false;
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // At least one number
  if (!/[0-9]/.test(password)) return false;
  
  return true;
};

// ============================================
// WALLET ADDRESS VALIDATION
// ============================================

const validateWalletAddress = (address) => {
  // Ethereum address format: 0x followed by 40 hex characters
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
};

// ============================================
// TOKEN AMOUNT VALIDATION
// ============================================

const validateTokenAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  // Must be a positive number
  if (isNaN(numAmount) || numAmount <= 0) return false;
  
  // Maximum 1 trillion tokens (accounting for decimals)
  if (numAmount > 1000000000000) return false;
  
  return true;
};

// ============================================
// TRANSACTION HASH VALIDATION
// ============================================

const validateTxHash = (txHash) => {
  // Ethereum tx hash: 0x followed by 64 hex characters
  const txRegex = /^0x[a-fA-F0-9]{64}$/;
  return txRegex.test(txHash);
};

// ============================================
// USERNAME VALIDATION
// ============================================

const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// ============================================
// PHONE VALIDATION
// ============================================

const validatePhone = (phone) => {
  // Basic phone validation - 10 to 15 digits
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[-()\s]/g, ''));
};

// ============================================
// 2FA TOKEN VALIDATION
// ============================================

const validate2FAToken = (token) => {
  // 6 digit code
  return /^\d{6}$/.test(token);
};

// ============================================
// BACKUP CODE VALIDATION
// ============================================

const validateBackupCode = (code) => {
  // 8 alphanumeric characters
  return /^[A-Z0-9]{8}$/.test(code);
};

// ============================================
// INPUT SANITIZATION
// ============================================

const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

// ============================================
// RATE LIMIT VALIDATION
// ============================================

const validateRateLimit = (attempts, maxAttempts, timeWindow) => {
  return attempts < maxAttempts;
};

// ============================================
// PAGINATION VALIDATION
// ============================================

const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  // Validate page
  if (pageNum < 1) return { valid: false, error: 'Page must be >= 1' };

  // Validate limit (max 100)
  if (limitNum < 1 || limitNum > 100) {
    return { valid: false, error: 'Limit must be between 1 and 100' };
  }

  return {
    valid: true,
    page: pageNum,
    limit: limitNum
  };
};

// ============================================
// DATE RANGE VALIDATION
// ============================================

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return { valid: false, error: 'Date range cannot exceed 365 days' };
  }

  return { valid: true, start, end };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateWalletAddress,
  validateTokenAmount,
  validateTxHash,
  validateUsername,
  validatePhone,
  validate2FAToken,
  validateBackupCode,
  sanitizeEmail,
  sanitizeString,
  sanitizeObject,
  validateRateLimit,
  validatePagination,
  validateDateRange
};