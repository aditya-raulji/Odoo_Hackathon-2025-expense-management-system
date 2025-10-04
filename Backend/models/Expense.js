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
        category, description, expense_date, receipt_url, status, approvers
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', '[]'::jsonb)
      RETURNING id, submitted_by, company_id, amount, converted_amount, 
                currency, category, description, expense_date, receipt_url, 
                status, approvers, created_at
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
    const query = `
      UPDATE expenses 
      SET approvers = (
        SELECT jsonb_agg(
          CASE 
            WHEN approver->>'userId' = $2::text THEN 
              approver || jsonb_build_object(
                'approved', $3,
                'comments', $4,
                'approvedAt', NOW()::text
              )
            ELSE approver
          END
        )
        FROM jsonb_array_elements(approvers) AS approver
      ),
      status = CASE 
        WHEN $3 = true THEN 
          CASE 
            WHEN (SELECT COUNT(*) FROM jsonb_array_elements(approvers) WHERE (value->>'approved')::boolean = true) 
                 >= (SELECT COUNT(*) FROM jsonb_array_elements(approvers)) THEN 'approved'
            ELSE 'pending'
          END
        ELSE 'rejected'
      END,
      updated_at = NOW()
      WHERE id = $1
      RETURNING id, status, approvers
    `;

    const result = await pool.query(query, [expenseId, approverId, approved, comments]);
    return result.rows[0];
  }

  static async addApprover(expenseId, approverData) {
    const { userId, order, approved = false, comments = null } = approverData;
    
    const query = `
      UPDATE expenses 
      SET approvers = approvers || jsonb_build_array(
        jsonb_build_object(
          'userId', $2,
          'order', $3,
          'approved', $4,
          'comments', $5,
          'addedAt', NOW()::text
        )
      ),
      updated_at = NOW()
      WHERE id = $1
      RETURNING id, approvers
    `;

    const result = await pool.query(query, [expenseId, userId, order, approved, comments]);
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
}

module.exports = Expense;
