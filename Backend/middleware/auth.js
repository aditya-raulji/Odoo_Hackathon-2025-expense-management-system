const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth middleware - Headers:', {
    authorization: authHeader ? 'Present' : 'Missing',
    token: token ? token.substring(0, 20) + '...' : 'None'
  });

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    console.log('Auth middleware - Verifying token...');
    console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded:', { userId: decoded.userId, role: decoded.role, companyId: decoded.companyId });
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('Auth middleware - User found:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      companyId: user.company_id,
      isVerified: user.is_verified 
    });
    
    // Map snake_case to camelCase for consistency
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      companyId: user.company_id,
      manager_id: user.manager_id,
      managerId: user.manager_id,
      is_verified: user.is_verified,
      isVerified: user.is_verified,
      is_manager_approver: user.is_manager_approver,
      isManagerApprover: user.is_manager_approver,
      created_at: user.created_at,
      createdAt: user.created_at,
      manager_name: user.manager_name,
      managerName: user.manager_name
    };
    
    console.log('Auth middleware - User authenticated successfully');
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification failed:', error.message);
    console.error('Auth middleware - Error stack:', error.stack);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token: ' + error.message 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required' 
    });
  }
  next();
};

// Generate JWT token with role and company information
const generateToken = (userId, role, companyId) => {
  return jwt.sign(
    { userId, role, companyId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // 1 hour session
  );
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is manager or admin
const isManagerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ 
      success: false, 
      message: 'Manager or Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is employee or admin
const isEmployeeOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') {
    return res.status(403).json({ 
      success: false, 
      message: 'Employee or Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is manager
const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ 
      success: false, 
      message: 'Manager access required' 
    });
  }
  next();
};

// Middleware to check if user is employee
const isEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ 
      success: false, 
      message: 'Employee access required' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireVerified,
  generateToken,
  isAdmin,
  isManagerOrAdmin,
  isEmployeeOrAdmin,
  isManager,
  isEmployee
};
