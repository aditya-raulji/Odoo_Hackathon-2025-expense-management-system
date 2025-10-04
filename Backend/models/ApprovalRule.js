const pool = require('../config/database');

class ApprovalRule {
  static async create(ruleData) {
    const {
      companyId,
      name,
      threshold = null,
      requiredApprovers = null,
      isSequential = true,
      minAmount = null,
      maxAmount = null,
      categoryFilters = null,
      createdBy
    } = ruleData;

    const query = `
      INSERT INTO approval_rules (
        company_id, name, threshold, required_approvers, is_sequential,
        min_amount, max_amount, category_filters, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company_id, name, threshold, required_approvers, 
                is_sequential, min_amount, max_amount, category_filters, 
                is_active, created_by, created_at
    `;

    const values = [
      companyId, name, threshold, requiredApprovers, isSequential,
      minAmount, maxAmount, categoryFilters, createdBy
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT ar.*, u.name as created_by_name,
             c.name as company_name
      FROM approval_rules ar
      LEFT JOIN users u ON ar.created_by = u.id
      LEFT JOIN companies c ON ar.company_id = c.id
      WHERE ar.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByCompany(companyId, activeOnly = false) {
    let query = `
      SELECT ar.*, u.name as created_by_name,
             array_agg(
               CASE 
                 WHEN ar.required_approvers IS NOT NULL 
                 THEN jsonb_build_object('id', approver.id, 'name', approver.name, 'email', approver.email)
                 ELSE NULL 
               END
             ) FILTER (WHERE ar.required_approvers IS NOT NULL) as approver_details
      FROM approval_rules ar
      LEFT JOIN users u ON ar.created_by = u.id
      LEFT JOIN unnest(ar.required_approvers) AS approver_id ON true
      LEFT JOIN users approver ON approver.id = approver_id
      WHERE ar.company_id = $1
    `;
    const values = [companyId];

    if (activeOnly) {
      query += ` AND ar.is_active = true`;
    }

    query += ` GROUP BY ar.id, u.name ORDER BY ar.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findApplicableRules(companyId, expenseData) {
    const { amount, category } = expenseData;
    
    const query = `
      SELECT ar.*, u.name as created_by_name
      FROM approval_rules ar
      LEFT JOIN users u ON ar.created_by = u.id
      WHERE ar.company_id = $1 
        AND ar.is_active = true
        AND (
          ar.min_amount IS NULL OR ar.min_amount <= $2
        )
        AND (
          ar.max_amount IS NULL OR ar.max_amount >= $2
        )
        AND (
          ar.category_filters IS NULL OR $3 = ANY(ar.category_filters)
        )
      ORDER BY ar.min_amount DESC NULLS LAST
    `;

    const result = await pool.query(query, [companyId, amount, category]);
    return result.rows;
  }

  static async update(id, updateData) {
    const {
      name,
      threshold,
      requiredApprovers,
      isSequential,
      minAmount,
      maxAmount,
      categoryFilters,
      isActive
    } = updateData;

    const query = `
      UPDATE approval_rules 
      SET name = COALESCE($2, name),
          threshold = COALESCE($3, threshold),
          required_approvers = COALESCE($4, required_approvers),
          is_sequential = COALESCE($5, is_sequential),
          min_amount = COALESCE($6, min_amount),
          max_amount = COALESCE($7, max_amount),
          category_filters = COALESCE($8, category_filters),
          is_active = COALESCE($9, is_active),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, company_id, name, threshold, required_approvers, 
                is_sequential, min_amount, max_amount, category_filters, 
                is_active, created_by, created_at, updated_at
    `;

    const values = [
      id, name, threshold, requiredApprovers, isSequential,
      minAmount, maxAmount, categoryFilters, isActive
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      UPDATE approval_rules 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async hardDelete(id) {
    const query = 'DELETE FROM approval_rules WHERE id = $1 RETURNING id, name';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getRuleStats(companyId) {
    const query = `
      SELECT 
        COUNT(*) as total_rules,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_rules,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_rules,
        COUNT(CASE WHEN threshold IS NOT NULL THEN 1 END) as threshold_rules,
        COUNT(CASE WHEN required_approvers IS NOT NULL THEN 1 END) as specific_approver_rules
      FROM approval_rules 
      WHERE company_id = $1
    `;

    const result = await pool.query(query, [companyId]);
    return result.rows[0];
  }

  static async validateApprovers(companyId, approverIds) {
    if (!approverIds || approverIds.length === 0) {
      return { valid: true, approvers: [] };
    }

    const query = `
      SELECT id, name, email, role
      FROM users 
      WHERE id = ANY($1) AND company_id = $2
    `;

    const result = await pool.query(query, [approverIds, companyId]);
    
    const foundIds = result.rows.map(row => row.id);
    const missingIds = approverIds.filter(id => !foundIds.includes(id));

    return {
      valid: missingIds.length === 0,
      approvers: result.rows,
      missingIds
    };
  }
}

module.exports = ApprovalRule;
