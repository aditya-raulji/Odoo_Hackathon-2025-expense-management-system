const pool = require('../config/database');

class Company {
  static async create(companyData) {
    const { name, currency, country, adminId } = companyData;
    
    const query = `
      INSERT INTO companies (name, currency, country, admin_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, currency, country, admin_id, created_at
    `;
    
    const values = [name, currency, country, adminId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByAdminId(adminId) {
    const query = 'SELECT * FROM companies WHERE admin_id = $1';
    const result = await pool.query(query, [adminId]);
    return result.rows[0];
  }

  static async countCompanies() {
    const query = 'SELECT COUNT(*) as count FROM companies';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async updateAdminId(companyId, adminId) {
    const query = `
      UPDATE companies 
      SET admin_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, currency, country, admin_id
    `;
    const result = await pool.query(query, [adminId, companyId]);
    return result.rows[0];
  }

  static async getCompanyWithUsers(companyId) {
    const query = `
      SELECT 
        c.id, c.name, c.currency, c.country, c.created_at,
        u.id as user_id, u.name as user_name, u.email, u.role, u.created_at as user_created_at,
        m.name as manager_name
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE c.id = $1
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }
}

module.exports = Company;
