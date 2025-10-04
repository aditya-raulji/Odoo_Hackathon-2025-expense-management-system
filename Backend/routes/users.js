const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateUserCreation } = require('../middleware/validation');

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/', authenticateToken, isAdmin, validateUserCreation, async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // Check if user already exists in the company
    const existingUser = await User.findByEmailAndCompany(email, req.user.company_id);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists in your company'
      });
    }

    // Validate manager ID if provided
    if (managerId && role === 'employee') {
      const manager = await User.findById(managerId);
      if (!manager || manager.company_id !== req.user.company_id || manager.role !== 'manager') {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager ID'
        });
      }
    }

    // Create new user (admin-created users are automatically verified)
    const user = await User.create({
      name,
      email,
      password,
      role,
      companyId: req.user.company_id,
      managerId: role === 'employee' ? managerId : null,
      isVerified: true, // Admin-created users are automatically verified
      isManagerApprover: role === 'manager' // Auto-set manager approver for managers
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully. They can login immediately with the provided credentials.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          managerId: user.manager_id,
          isVerified: user.is_verified,
          isManagerApprover: user.is_manager_approver,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        message: 'Invalid company or manager reference'
      });
    }
    
    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users
// @desc    Get all users in company (Admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('🔍 Getting users for company:', req.user.company_id);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 Query params:', req.query);
    
    const { role } = req.query;
    
    // Validate company_id exists
    if (!req.user.company_id) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any company'
      });
    }
    
    const users = await User.getUsersByCompany(req.user.company_id, role);
    
    console.log('✅ Found users:', users.length);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          managerName: user.manager_name,
          isManagerApprover: user.is_manager_approver,
          createdAt: user.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/managers
// @desc    Get all managers in company (Admin only)
// @access  Private (Admin)
router.get('/managers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const managers = await User.getManagersByCompany(req.user.company_id);

    res.json({
      success: true,
      data: {
        managers: managers.map(manager => ({
          id: manager.id,
          name: manager.name,
          email: manager.email
        }))
      }
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user || user.company_id !== req.user.company_id) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, managerId } = req.body;

    // Check if user exists and belongs to company
    const existingUser = await User.findById(id);
    if (!existingUser || existingUser.company_id !== req.user.company_id) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user in the company
    if (email && email !== existingUser.email) {
      const emailUser = await User.findByEmailAndCompany(email, req.user.company_id);
      if (emailUser && emailUser.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists in your company'
        });
      }
    }

    // Validate manager ID if provided
    if (managerId && role === 'employee') {
      const manager = await User.findById(managerId);
      if (!manager || manager.company_id !== req.user.company_id || manager.role !== 'manager') {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager ID'
        });
      }
    }

    // Update user
    const pool = require('../config/database');
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          manager_id = CASE WHEN $3 = 'employee' THEN $4 ELSE NULL END,
          updated_at = NOW()
      WHERE id = $5 AND company_id = $6
      RETURNING id, name, email, role, manager_id, updated_at
    `;
    
    const values = [name, email, role, managerId, id, req.user.company_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and belongs to company
    const user = await User.findById(id);
    if (!user || user.company_id !== req.user.company_id) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user
    const pool = require('../config/database');
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
