const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireVerified, isAdmin } = require('../middleware/auth');
const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);
router.use(isAdmin); // Only admins can manage rules

// Validation rules
const ruleValidation = [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('threshold').optional().isInt({ min: 0, max: 100 }).withMessage('Threshold must be between 0 and 100'),
  body('requiredApprovers').optional().isArray().withMessage('Required approvers must be an array'),
  body('isSequential').optional().isBoolean().withMessage('Is sequential must be a boolean'),
  body('minAmount').optional().isNumeric().withMessage('Min amount must be a number'),
  body('maxAmount').optional().isNumeric().withMessage('Max amount must be a number'),
  body('categoryFilters').optional().isArray().withMessage('Category filters must be an array')
];

// POST /api/rules - Create new approval rule
router.post('/', ruleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      threshold,
      requiredApprovers,
      isSequential = true,
      minAmount,
      maxAmount,
      categoryFilters
    } = req.body;

    const companyId = req.user.company_id;
    const createdBy = req.user.id;

    // Validate required approvers if provided
    if (requiredApprovers && requiredApprovers.length > 0) {
      const validation = await ApprovalRule.validateApprovers(companyId, requiredApprovers);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid approvers: ${validation.missingIds.join(', ')}`
        });
      }
    }

    // Validate amount range
    if (minAmount && maxAmount && minAmount >= maxAmount) {
      return res.status(400).json({
        success: false,
        message: 'Min amount must be less than max amount'
      });
    }

    // Create rule
    const ruleData = {
      companyId,
      name,
      threshold,
      requiredApprovers,
      isSequential,
      minAmount,
      maxAmount,
      categoryFilters,
      createdBy
    };

    const rule = await ApprovalRule.create(ruleData);

    res.status(201).json({
      success: true,
      data: {
        rule: {
          id: rule.id,
          name: rule.name,
          threshold: rule.threshold,
          requiredApprovers: rule.required_approvers,
          isSequential: rule.is_sequential,
          minAmount: rule.min_amount,
          maxAmount: rule.max_amount,
          categoryFilters: rule.category_filters,
          isActive: rule.is_active,
          createdAt: rule.created_at
        }
      },
      message: 'Approval rule created successfully'
    });

  } catch (error) {
    console.error('Error creating approval rule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/rules - Get all approval rules for company
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const companyId = req.user.company_id;
    const activeOnly = active === 'true';

    const rules = await ApprovalRule.findByCompany(companyId, activeOnly);

    res.json({
      success: true,
      data: {
        rules: rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          threshold: rule.threshold,
          requiredApprovers: rule.required_approvers,
          approverDetails: rule.approver_details || [],
          isSequential: rule.is_sequential,
          minAmount: rule.min_amount,
          maxAmount: rule.max_amount,
          categoryFilters: rule.category_filters,
          isActive: rule.is_active,
          createdBy: rule.created_by_name,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching approval rules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/rules/:id - Get specific approval rule
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await ApprovalRule.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Approval rule not found'
      });
    }

    // Check if rule belongs to user's company
    if (rule.company_id !== req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this rule'
      });
    }

    res.json({
      success: true,
      data: {
        rule: {
          id: rule.id,
          name: rule.name,
          threshold: rule.threshold,
          requiredApprovers: rule.required_approvers,
          isSequential: rule.is_sequential,
          minAmount: rule.min_amount,
          maxAmount: rule.max_amount,
          categoryFilters: rule.category_filters,
          isActive: rule.is_active,
          createdBy: rule.created_by_name,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error fetching approval rule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/rules/:id - Update approval rule
router.put('/:id', ruleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      name,
      threshold,
      requiredApprovers,
      isSequential,
      minAmount,
      maxAmount,
      categoryFilters,
      isActive
    } = req.body;

    // Check if rule exists and belongs to user's company
    const existingRule = await ApprovalRule.findById(id);
    if (!existingRule) {
      return res.status(404).json({
        success: false,
        message: 'Approval rule not found'
      });
    }

    if (existingRule.company_id !== req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this rule'
      });
    }

    // Validate required approvers if provided
    if (requiredApprovers && requiredApprovers.length > 0) {
      const validation = await ApprovalRule.validateApprovers(req.user.company_id, requiredApprovers);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid approvers: ${validation.missingIds.join(', ')}`
        });
      }
    }

    // Validate amount range
    if (minAmount && maxAmount && minAmount >= maxAmount) {
      return res.status(400).json({
        success: false,
        message: 'Min amount must be less than max amount'
      });
    }

    // Update rule
    const updateData = {
      name,
      threshold,
      requiredApprovers,
      isSequential,
      minAmount,
      maxAmount,
      categoryFilters,
      isActive
    };

    const updatedRule = await ApprovalRule.update(id, updateData);

    res.json({
      success: true,
      data: {
        rule: {
          id: updatedRule.id,
          name: updatedRule.name,
          threshold: updatedRule.threshold,
          requiredApprovers: updatedRule.required_approvers,
          isSequential: updatedRule.is_sequential,
          minAmount: updatedRule.min_amount,
          maxAmount: updatedRule.max_amount,
          categoryFilters: updatedRule.category_filters,
          isActive: updatedRule.is_active,
          createdAt: updatedRule.created_at,
          updatedAt: updatedRule.updated_at
        }
      },
      message: 'Approval rule updated successfully'
    });

  } catch (error) {
    console.error('Error updating approval rule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/rules/:id - Delete approval rule (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rule exists and belongs to user's company
    const existingRule = await ApprovalRule.findById(id);
    if (!existingRule) {
      return res.status(404).json({
        success: false,
        message: 'Approval rule not found'
      });
    }

    if (existingRule.company_id !== req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this rule'
      });
    }

    // Soft delete rule
    const deletedRule = await ApprovalRule.delete(id);

    res.json({
      success: true,
      data: {
        rule: {
          id: deletedRule.id,
          name: deletedRule.name
        }
      },
      message: 'Approval rule deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting approval rule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/rules/stats - Get approval rules statistics
router.get('/stats', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const stats = await ApprovalRule.getRuleStats(companyId);

    res.json({
      success: true,
      data: {
        stats: {
          totalRules: parseInt(stats.total_rules),
          activeRules: parseInt(stats.active_rules),
          inactiveRules: parseInt(stats.inactive_rules),
          thresholdRules: parseInt(stats.threshold_rules),
          specificApproverRules: parseInt(stats.specific_approver_rules)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching approval rules stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/rules/approvers - Get available approvers for company
router.get('/approvers', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    // Get all users who can be approvers (managers and admins)
    const approvers = await User.getUsersByCompany(companyId);
    const availableApprovers = approvers.filter(user => 
      user.role === 'manager' || user.role === 'admin'
    );

    res.json({
      success: true,
      data: {
        approvers: availableApprovers.map(approver => ({
          id: approver.id,
          name: approver.name,
          email: approver.email,
          role: approver.role,
          isManagerApprover: approver.is_manager_approver
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching available approvers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/rules/categories - Get available expense categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Travel',
      'Meals',
      'Transportation',
      'Accommodation',
      'Office Supplies',
      'Software',
      'Training',
      'Marketing',
      'Entertainment',
      'Other'
    ];

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
