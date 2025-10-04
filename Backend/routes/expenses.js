const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireVerified, isManagerOrAdmin } = require('../middleware/auth');
const { uploadSingle, generateFileUrl } = require('../middleware/upload');
const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');
const currencyConverter = require('../utils/currencyConverter');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// Validation rules
const expenseValidation = [
  body('amount').isNumeric().withMessage('Amount must be a valid number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('expenseDate').isISO8601().withMessage('Expense date must be a valid date')
];

// POST /api/expenses - Submit new expense
router.post('/', uploadSingle('receipt'), expenseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, currency, category, description, expenseDate } = req.body;
    const submittedBy = req.user.id;
    const companyId = req.user.company_id;

    // Check if user is employee or admin
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employees and admins can submit expenses'
      });
    }

    // Validate currency
    if (!currencyConverter.isValidCurrency(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency code'
      });
    }

    // Convert currency to company currency
    const companyCurrency = req.user.company_currency || 'USD';
    const conversion = await currencyConverter.convertAmount(
      parseFloat(amount),
      currency.toUpperCase(),
      companyCurrency
    );

    // Handle file upload
    let receiptUrl = null;
    if (req.file) {
      receiptUrl = generateFileUrl(req, req.file.filename);
    }

    // Create expense
    const expenseData = {
      submittedBy,
      companyId,
      amount: parseFloat(amount),
      convertedAmount: conversion.convertedAmount,
      currency: currency.toUpperCase(),
      category,
      description,
      expenseDate,
      receiptUrl
    };

    const expense = await Expense.create(expenseData);

    // Apply approval rules
    await Expense.applyApprovalRules(expense.id, companyId, {
      amount: expense.converted_amount,
      category: expense.category
    });

    // Get updated expense with approvals
    const updatedExpense = await Expense.getExpenseWithApprovals(expense.id);

    // Notify first approver if exists
    if (updatedExpense.approvals && updatedExpense.approvals.length > 0) {
      const firstApprover = updatedExpense.approvals.find(a => a.status === 'pending');
      if (firstApprover) {
        const approver = await User.findById(firstApprover.approver_id);
        if (approver) {
          await notificationService.notifyExpenseSubmitted(updatedExpense, approver);
          await notificationService.createInAppNotification(
            approver.id,
            'New Expense for Approval',
            `New expense submitted by ${req.user.name} requires your approval`,
            'info',
            `/dashboard/approvals`
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        expense: {
          id: expense.id,
          amount: expense.amount,
          convertedAmount: expense.convertedAmount,
          currency: expense.currency,
          category: expense.category,
          description: expense.description,
          expenseDate: expense.expense_date,
          receiptUrl: expense.receipt_url,
          status: expense.status,
          approvals: updatedExpense.approvals || []
        }
      },
      message: 'Expense submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/expenses/my - Get user's expenses
router.get('/my', async (req, res) => {
  try {
    const { status, category, dateFrom, dateTo } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const expenses = await Expense.getUserExpensesWithTimeline(req.user.id, filters);

    res.json({
      success: true,
      data: {
        expenses: expenses.map(expense => ({
          id: expense.id,
          category: expense.category,
          description: expense.description,
          amount: expense.converted_amount,
          currency: expense.currency,
          status: expense.status,
          expenseDate: expense.expense_date,
          receiptUrl: expense.receipt_url,
          createdAt: expense.created_at,
          approvalTimeline: expense.approval_timeline || []
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching user expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/expenses/pending - Get pending expenses for approval
router.get('/pending', isManagerOrAdmin, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const approverId = req.user.id;

    const expenses = await Expense.getPendingApprovals(approverId, companyId);

    res.json({
      success: true,
      data: {
        expenses: expenses.map(expense => ({
          id: expense.id,
          submittedBy: {
            name: expense.submitted_by_name,
            email: expense.submitted_by_email
          },
          category: expense.category,
          description: expense.description,
          amount: expense.converted_amount,
          currency: expense.currency,
          expenseDate: expense.expense_date,
          receiptUrl: expense.receipt_url,
          createdAt: expense.created_at,
          approvalStatus: expense.approval_status,
          approvalComments: expense.approval_comments,
          approvedAt: expense.approved_at,
          sequenceOrder: expense.sequence_order
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching pending expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/expenses/:id/approve - Approve/reject expense
router.put('/:id/approve', [
  body('approved').isBoolean().withMessage('Approved must be a boolean'),
  body('comments').optional().isString().withMessage('Comments must be a string')
], async (req, res) => {
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
    const { approved, comments } = req.body;
    const approverId = req.user.id;

    // Check if user is manager or admin
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can approve expenses'
      });
    }

    // Get expense
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is authorized to approve this expense
    const isAuthorized = await checkApprovalAuthorization(expense, approverId, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this expense'
      });
    }

    // Update approver status
    const updatedExpense = await Expense.updateApproverStatus(id, approverId, approved, comments);

    // Get submitter info for notifications
    const submitter = await User.findById(expense.submitted_by);

    if (approved) {
      if (updatedExpense.status === 'approved') {
        // Fully approved
        await notificationService.notifyExpenseApproved(expense, submitter);
        await notificationService.createInAppNotification(
          submitter.id,
          'Expense Approved',
          `Your expense for ${expense.category} has been approved`,
          'success',
          `/dashboard/expenses`
        );
      } else if (updatedExpense.status === 'in_progress') {
        // Forwarded to next approver
        const nextApprover = await User.findById(updatedExpense.currentApproverId);
        if (nextApprover) {
          await notificationService.notifyNextApprover(expense, nextApprover);
          await notificationService.createInAppNotification(
            nextApprover.id,
            'Expense Forwarded',
            `Expense from ${submitter.name} has been forwarded to you`,
            'info',
            `/dashboard/approvals`
          );
        }
        
        // Notify submitter about progress
        await notificationService.createInAppNotification(
          submitter.id,
          'Expense Progress',
          `Your expense for ${expense.category} has been approved and forwarded`,
          'info',
          `/dashboard/expenses`
        );
      }
    } else {
      // Expense rejected
      await notificationService.notifyExpenseRejected(expense, submitter, comments);
      await notificationService.createInAppNotification(
        submitter.id,
        'Expense Rejected',
        `Your expense for ${expense.category} has been rejected`,
        'error',
        `/dashboard/expenses`
      );
    }

    res.json({
      success: true,
      data: {
        expense: {
          id: updatedExpense.id,
          status: updatedExpense.status,
          currentApproverId: updatedExpense.currentApproverId
        }
      },
      message: approved ? 'Expense approved and routed' : 'Expense rejected'
    });

  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/expenses/:id - Get expense details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.getExpenseWithApprovals(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user can view this expense
    if (expense.submitted_by !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this expense'
      });
    }

    res.json({
      success: true,
      data: {
        expense: {
          id: expense.id,
          submittedBy: {
            name: expense.submitted_by_name,
            email: expense.submitted_by_email
          },
          amount: expense.amount,
          convertedAmount: expense.converted_amount,
          currency: expense.currency,
          category: expense.category,
          description: expense.description,
          expenseDate: expense.expense_date,
          receiptUrl: expense.receipt_url,
          status: expense.status,
          approvals: expense.approvals || [],
          createdAt: expense.created_at,
          updatedAt: expense.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error fetching expense details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to check approval authorization
async function checkApprovalAuthorization(expense, approverId, userRole) {
  if (userRole === 'admin') {
    return true; // Admins can approve any expense
  }

  // Check if user is in the approvers list
  if (expense.approvals && expense.approvals.length > 0) {
    return expense.approvals.some(approver => 
      approver.approver_id === approverId && approver.status === 'pending'
    );
  }

  return false;
}

module.exports = router;
