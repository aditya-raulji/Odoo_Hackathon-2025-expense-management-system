const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const User = require('../models/User');
const Company = require('../models/Company');
const EmailService = require('../services/emailService');
const { generateToken, authenticateToken } = require('../middleware/auth');
const {
  validateSignup,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateResendVerification
} = require('../middleware/validation');

// @route   POST /api/auth/signup
// @desc    Register first admin user and create company
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { companyName, name, email, password, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Fetch country currency from API
    let currency = 'USD'; // Default fallback
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = await response.json();
      const countryData = countries.find(c => 
        c.name.common.toLowerCase() === country.toLowerCase() ||
        c.name.official.toLowerCase() === country.toLowerCase()
      );
      if (countryData && countryData.currencies) {
        currency = Object.keys(countryData.currencies)[0];
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    }

    // Create company first
    const company = await Company.create({
      name: companyName,
      currency,
      country,
      adminId: null // Will be updated after user creation
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      companyId: company.id,
      verificationCode
    });

    // Update company with admin ID
    await Company.updateAdminId(company.id, user.id);

    // Send verification email with 6-digit code
    try {
      await EmailService.sendVerificationCodeEmail(
        user.email,
        user.name,
        verificationCode
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Admin account created. Please check your email for verification code.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false
        },
        company: {
          id: company.id,
          name: company.name,
          currency: company.currency,
          country: company.country
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Get company information
    const company = await Company.findById(user.company_id);

    // Generate JWT token
    const token = generateToken(user.id, user.role, user.company_id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company_id
        },
        company: {
          id: company.id,
          name: company.name,
          currency: company.currency,
          country: company.country
        }
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token clear)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile with company info
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const company = await Company.findById(user.company_id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company_id,
          managerId: user.manager_id,
          managerName: user.manager_name,
          isVerified: user.is_verified,
          createdAt: user.created_at
        },
        company: {
          id: company.id,
          name: company.name,
          currency: company.currency,
          country: company.country,
          createdAt: company.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/debug
// @desc    Debug endpoint to check authentication status
// @access  Private
router.get('/debug', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: req.user,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/debug-server
// @desc    Debug endpoint to check server configuration
// @access  Public
router.get('/debug-server', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Server debug info',
      data: {
        jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set',
        port: process.env.PORT || 'Not set',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with 6-digit code
// @access  Public
router.post('/verify-email', validateEmailVerification, async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email and verification code
    const user = await User.findByEmailAndVerificationCode(email, code);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code or email'
      });
    }

    // Verify user email
    const verifiedUser = await User.verifyEmail(user.id);

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(verifiedUser.email, verifiedUser.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: verifiedUser
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification code
// @access  Public
router.post('/resend-verification', validateResendVerification, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with new verification code
    const pool = require('../config/database');
    await pool.query(
      'UPDATE users SET verification_code = $1 WHERE id = $2',
      [verificationCode, user.id]
    );

    // Send verification email
    try {
      await EmailService.sendVerificationCodeEmail(
        user.email,
        user.name,
        verificationCode
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Create password reset token
    const { resetToken } = await User.createPasswordResetToken(email);

    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user by reset token
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    await User.updatePassword(user.id, password);

    // Clear reset token
    await User.clearPasswordResetToken(user.id);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token with same user data
    const newToken = generateToken(req.user.id, req.user.role, req.user.company_id);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          companyId: req.user.company_id,
          isVerified: req.user.is_verified
        }
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
