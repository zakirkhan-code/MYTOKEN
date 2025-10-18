// utils/email.js - Email Utilities
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ============================================
// SEND VERIFICATION EMAIL
// ============================================

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mytoken.com',
      to: email,
      subject: 'Verify Your Email - MyToken',
      html: `
        <h2>Welcome to MyToken!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Send verification email error:', error);
    throw error;
  }
};

// ============================================
// SEND RESET PASSWORD EMAIL
// ============================================

const sendResetEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mytoken.com',
      to: email,
      subject: 'Reset Your Password - MyToken',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link expires in 30 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}`);
  } catch (error) {
    console.error('Send reset email error:', error);
    throw error;
  }
};

// ============================================
// SEND STAKING NOTIFICATION
// ============================================

const sendStakingNotification = async (email, type, data) => {
  try {
    let subject, htmlContent;

    switch (type) {
      case 'stake':
        subject = `Your Staking Confirmed - ${data.amount} MTK`;
        htmlContent = `
          <h2>Staking Confirmed!</h2>
          <p>You have successfully staked ${data.amount} MTK tokens.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Amount: ${data.amount} MTK</li>
            <li>APY: 10%</li>
            <li>Lock Period: 30 days</li>
            <li>Transaction Hash: ${data.txHash}</li>
          </ul>
          <p>Track your staking rewards in your dashboard.</p>
        `;
        break;

      case 'unstake':
        subject = `Your Unstaking Completed - ${data.returnAmount} MTK`;
        htmlContent = `
          <h2>Unstaking Completed!</h2>
          <p>You have successfully unstaked your tokens.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Staked Amount: ${data.stakedAmount} MTK</li>
            <li>Return Amount: ${data.returnAmount} MTK</li>
            <li>Rewards Earned: ${data.rewards} MTK</li>
            ${data.penalty ? `<li>Early Unstake Penalty: ${data.penalty} MTK</li>` : ''}
            <li>Transaction Hash: ${data.txHash}</li>
          </ul>
        `;
        break;

      case 'claim':
        subject = `Rewards Claimed - ${data.amount} MTK`;
        htmlContent = `
          <h2>Rewards Claimed!</h2>
          <p>You have successfully claimed your staking rewards.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Rewards Amount: ${data.amount} MTK</li>
            <li>Transaction Hash: ${data.txHash}</li>
          </ul>
          <p>Keep staking to earn more rewards!</p>
        `;
        break;

      default:
        return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mytoken.com',
      to: email,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Staking notification (${type}) sent to ${email}`);
  } catch (error) {
    console.error('Send staking notification error:', error);
    throw error;
  }
};

// ============================================
// SEND 2FA NOTIFICATION
// ============================================

const send2FANotification = async (email, action) => {
  try {
    let subject, htmlContent;

    if (action === 'enabled') {
      subject = '2FA Enabled - Your Account is More Secure';
      htmlContent = `
        <h2>Two-Factor Authentication Enabled</h2>
        <p>Your account is now protected with 2FA.</p>
        <p>Make sure to save your backup codes in a safe place.</p>
        <p>If you didn't enable 2FA, please contact us immediately.</p>
      `;
    } else if (action === 'disabled') {
      subject = '2FA Disabled - Your Account Security Changed';
      htmlContent = `
        <h2>Two-Factor Authentication Disabled</h2>
        <p>2FA has been disabled on your account.</p>
        <p>We recommend keeping 2FA enabled for better security.</p>
        <p>If you didn't make this change, please reset your password immediately.</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mytoken.com',
      to: email,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 2FA notification sent to ${email}`);
  } catch (error) {
    console.error('Send 2FA notification error:', error);
    throw error;
  }
};

// ============================================
// SEND LOGIN ALERT
// ============================================

const sendLoginAlert = async (email, ipAddress, userAgent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mytoken.com',
      to: email,
      subject: 'New Login to Your MyToken Account',
      html: `
        <h2>New Login Alert</h2>
        <p>Your account was accessed from a new location.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>IP Address: ${ipAddress}</li>
          <li>Device: ${userAgent}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>If this wasn't you, please secure your account immediately.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Login alert sent to ${email}`);
  } catch (error) {
    console.error('Send login alert error:', error);
    // Don't throw - this is optional
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  sendStakingNotification,
  send2FANotification,
  sendLoginAlert
};