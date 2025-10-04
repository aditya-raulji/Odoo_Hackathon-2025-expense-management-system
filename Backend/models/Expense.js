const pool = require('../config/database');

class Expense {
  static async create(expenseData) {
    const {
      submittedBy,
      companyId,
      amount,
      convertedAmount,
      currency,
      category,
      description,
      expenseDate,
      receiptUrl = null
    } = expenseData;

    const query = `
      INSERT INTO expenses (
        submitted_by, company_id, amount, converted_amount, currency, 
        category, description, expense_date, receipt_url, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING id, submitted_by, company_id, amount, converted_amount, 
                currency, category, description, expense_date, receipt_url, 
                status, created_at
    `;

    const values = [
      submittedBy, companyId, amount, convertedAmount, currency,
      category, description, expenseDate, receiptUrl
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT e.*, u.name as submitted_by_name, u.email as submitted_by_email,
             c.name as company_name, c.currency as company_currency
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUser(userId, filters = {}) {
    let query = `
      SELECT e.*, u.name as submitted_by_name, u.email as submitted_by_email
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      WHERE e.submitted_by = $1
    `;
    const values = [userId];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.dateFrom) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      values.push(filters.dateTo);
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findPendingForApproval(approverId, companyId, teamOnly = false) {
    let query = `
      SELECT e.*, u.name as submitted_by_name, u.email as submitted_by_email,
             u.manager_id as submitted_by_manager_id
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      WHERE e.company_id = $1 AND e.status = 'pending'
    `;
    const values = [companyId];

    if (teamOnly) {
      // For managers, show only expenses from their direct reports
      query += ` AND u.manager_id = $2`;
      values.push(approverId);
    }

    query += ` ORDER BY e.created_at ASC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateApproverStatus(expenseId, approverId, approved, comments = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update the specific approver's status
      const updateApproverQuery = `
        UPDATE expense_approvals 
        SET status = $3, 
            comments = $4, 
            approved_at = CASE WHEN $3 = 'approved' THEN NOW() ELSE NULL END,
            updated_at = NOW()
        WHERE expense_id = $1 AND approver_id = $2
        RETURNING id, status, comments, approved_at
      `;
      
      const approverResult = await client.query(updateApproverQuery, [expenseId, approverId, approved ? 'approved' : 'rejected', comments]);
      
      if (approverResult.rows.length === 0) {
        throw new Error('Approver not found for this expense');
      }
      
      let newStatus = 'in_progress';
      
      if (!approved) {
        // If rejected, set expense status to rejected
        newStatus = 'rejected';
      } else {
        // Check if expense is fully approved
        const isFullyApproved = await client.query('SELECT is_expense_fully_approved($1) as is_approved', [expenseId]);
        
        if (isFullyApproved.rows[0].is_approved) {
          newStatus = 'approved';
        } else {
          // Activate next approver
          const nextApproverId = await client.query('SELECT get_next_approver($1) as next_approver_id', [expenseId]);
          
          if (nextApproverId.rows[0].next_approver_id) {
            // Update next approver to pending
            await client.query(`
              UPDATE expense_approvals 
              SET status = 'pending', updated_at = NOW()
              WHERE expense_id = $1 AND approver_id = $2
            `, [expenseId, nextApproverId.rows[0].next_approver_id]);
            
            // Update expense current_approver_id
            await client.query(`
              UPDATE expenses 
              SET current_approver_id = $2, updated_at = NOW()
              WHERE id = $1
            `, [expenseId, nextApproverId.rows[0].next_approver_id]);
          }
        }
      }
      
      // Update expense status
      const updateExpenseQuery = `
        UPDATE expenses 
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, status, current_approver_id
      `;
      
      const expenseResult = await client.query(updateExpenseQuery, [expenseId, newStatus]);
      
      await client.query('COMMIT');
      
      return {
        id: expenseResult.rows[0].id,
        status: expenseResult.rows[0].status,
        currentApproverId: expenseResult.rows[0].current_approver_id,
        approverStatus: approverResult.rows[0]
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async addApprover(expenseId, approverData) {
    const { userId, order, isRequired = true } = approverData;
    
    const query = `
      INSERT INTO expense_approvals (expense_id, approver_id, sequence_order, status, is_required)
      VALUES ($1, $2, $3, 'waiting', $4)
      ON CONFLICT (expense_id, approver_id) 
      DO UPDATE SET sequence_order = $3, is_required = $4, updated_at = NOW()
      RETURNING id, expense_id, approver_id, sequence_order, status
    `;

    const result = await pool.query(query, [expenseId, userId, order, isRequired]);
    return result.rows[0];
  }

  static async updateStatus(expenseId, status) {
    const query = `
      UPDATE expenses 
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `;

    const result = await pool.query(query, [expenseId, status]);
    return result.rows[0];
  }

  static async getExpenseStats(companyId, userId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_expenses,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_expenses,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_expenses,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_expenses,
        SUM(CASE WHEN status = 'approved' THEN converted_amount ELSE 0 END) as total_approved_amount
      FROM expenses 
      WHERE company_id = $1
    `;
    const values = [companyId];

    if (userId) {
      query += ` AND submitted_by = $2`;
      values.push(userId);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByCompany(companyId, filters = {}) {
    let query = `
      SELECT e.*, u.name as submitted_by_name, u.email as submitted_by_email
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      WHERE e.company_id = $1
    `;
    const values = [companyId];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.dateFrom) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      values.push(filters.dateTo);
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get pending approvals for a specific approver
  static async getPendingApprovals(approverId, companyId) {
    const query = `
      SELECT DISTINCT e.*, u.name as submitted_by_name, u.email as submitted_by_email,
             ea.status as approval_status, ea.comments as approval_comments,
             ea.approved_at, ea.sequence_order
      FROM expenses e
      JOIN expense_approvals ea ON e.id = ea.expense_id
      LEFT JOIN users u ON e.submitted_by = u.id
      WHERE ea.approver_id = $1 
        AND e.company_id = $2 
        AND ea.status = 'pending'
        AND e.status IN ('pending', 'in_progress')
      ORDER BY ea.sequence_order ASC, e.created_at ASC
    `;
    
    const result = await pool.query(query, [approverId, companyId]);
    return result.rows;
  }

  // Get expense with full approval timeline
  static async getExpenseWithApprovals(expenseId) {
    const query = `
      SELECT e.*, u.name as submitted_by_name, u.email as submitted_by_email,
             c.name as company_name, c.currency as company_currency,
             json_agg(
               json_build_object(
                 'id', ea.id,
                 'approver_id', ea.approver_id,
                 'approver_name', approver.name,
                 'approver_email', approver.email,
                 'sequence_order', ea.sequence_order,
                 'status', ea.status,
                 'comments', ea.comments,
                 'approved_at', ea.approved_at,
                 'created_at', ea.created_at
               ) ORDER BY ea.sequence_order
             ) as approvals
      FROM expenses e
      LEFT JOIN users u ON e.submitted_by = u.id
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN expense_approvals ea ON e.id = ea.expense_id
      LEFT JOIN users approver ON ea.approver_id = approver.id
      WHERE e.id = $1
      GROUP BY e.id, u.name, u.email, c.name, c.currency
    `;
    
    const result = await pool.query(query, [expenseId]);
    return result.rows[0];
  }

  // Apply approval rules to an expense
  static async applyApprovalRules(expenseId, companyId, expenseData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get applicable rules
      const rulesQuery = `
        SELECT ar.*, ra.user_id, ra.sequence_order, ra.is_required
        FROM approval_rules ar
        LEFT JOIN rule_approvers ra ON ar.id = ra.approval_rule_id
        WHERE ar.company_id = $1 
          AND ar.is_active = true
          AND (ar.min_amount IS NULL OR ar.min_amount <= $2)
          AND (ar.max_amount IS NULL OR ar.max_amount >= $2)
          AND (ar.category_filters IS NULL OR $3 = ANY(ar.category_filters))
        ORDER BY ar.min_amount DESC NULLS LAST, ra.sequence_order ASC
      `;
      
      const rulesResult = await client.query(rulesQuery, [companyId, expenseData.amount, expenseData.category]);
      
      if (rulesResult.rows.length === 0) {
        // No rules found, use default manager approval
        const managerQuery = `
          SELECT id FROM users 
          WHERE company_id = $1 AND is_manager_approver = true
          ORDER BY created_at ASC
          LIMIT 1
        `;
        const managerResult = await client.query(managerQuery, [companyId]);
        
        if (managerResult.rows.length > 0) {
          await client.query(`
            INSERT INTO expense_approvals (expense_id, approver_id, sequence_order, status)
            VALUES ($1, $2, 1, 'pending')
          `, [expenseId, managerResult.rows[0].id]);
          
          // Set current approver
          await client.query(`
            UPDATE expenses SET current_approver_id = $2 WHERE id = $1
          `, [expenseId, managerResult.rows[0].id]);
        }
      } else {
        // Apply the first rule (most specific)
        const rule = rulesResult.rows[0];
        const approvers = rulesResult.rows.filter(row => row.user_id);
        
        if (approvers.length > 0) {
          for (const approver of approvers) {
            await client.query(`
              INSERT INTO expense_approvals (expense_id, approver_id, sequence_order, status)
              VALUES ($1, $2, $3, $4)
            `, [expenseId, approver.user_id, approver.sequence_order, 
                approver.sequence_order === 1 ? 'pending' : 'waiting']);
          }
          
          // Set first approver as current
          await client.query(`
            UPDATE expenses SET current_approver_id = $2 WHERE id = $1
          `, [expenseId, approvers[0].user_id]);
        }
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get expenses by user with approval timeline
  static async getUserExpensesWithTimeline(userId, filters = {}) {
    let query = `
      SELECT e.*, 
             json_agg(
               json_build_object(
                 'approver_name', approver.name,
                 'approver_email', approver.email,
                 'status', ea.status,
                 'comments', ea.comments,
                 'approved_at', ea.approved_at,
                 'sequence_order', ea.sequence_order
               ) ORDER BY ea.sequence_order
             ) as approval_timeline
      FROM expenses e
      LEFT JOIN expense_approvals ea ON e.id = ea.expense_id
      LEFT JOIN users approver ON ea.approver_id = approver.id
      WHERE e.submitted_by = $1
    `;
    
    const values = [userId];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.dateFrom) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      values.push(filters.dateTo);
    }

    query += ` GROUP BY e.id ORDER BY e.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Expense;
