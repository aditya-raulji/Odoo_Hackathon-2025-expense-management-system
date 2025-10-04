const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { name, email, password, role = 'employee', companyId, managerId, verificationCode, isVerified = false, isManagerApprover = false } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Auto-set isManagerApprover for managers
    const shouldBeManagerApprover = role === 'manager' || isManagerApprover;
    
    const query = `
      INSERT INTO users (name, email, password, role, company_id, manager_id, verification_code, is_verified, is_manager_approver, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, name, email, role, company_id, manager_id, is_verified, is_manager_approver, created_at
    `;
    
    const values = [name, email, hashedPassword, role, companyId, managerId, verificationCode, isVerified, shouldBeManagerApprover];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.company_id, u.manager_id, u.is_verified, 
             u.is_manager_approver, u.created_at,
             c.name as company_name, c.currency, c.country,
             m.name as manager_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByVerificationToken(token) {
    const query = 'SELECT * FROM users WHERE verification_token = $1';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async findByEmailAndVerificationCode(email, code) {
    const query = 'SELECT * FROM users WHERE email = $1 AND verification_code = $2';
    const result = await pool.query(query, [email, code]);
    return result.rows[0];
  }

  static async verifyEmail(userId) {
    const query = `
      UPDATE users 
      SET is_verified = true, verification_token = NULL, verification_code = NULL, verified_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, is_verified
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async createPasswordResetToken(email) {
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    const query = `
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2
      WHERE email = $3
      RETURNING id, name, email
    `;
    
    const result = await pool.query(query, [resetToken, expiresAt, email]);
    return { user: result.rows[0], resetToken };
  }

  static async findByPasswordResetToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE password_reset_token = $1 AND password_reset_expires > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async clearPasswordResetToken(userId) {
    const query = `
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }

  static async findByEmailAndCompany(email, companyId) {
    const query = 'SELECT * FROM users WHERE email = $1 AND company_id = $2';
    const result = await pool.query(query, [email, companyId]);
    return result.rows[0];
  }

  static async getUsersByCompany(companyId, role = null) {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.is_manager_approver, u.created_at,
             m.name as manager_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.company_id = $1
    `;
    const values = [companyId];
    
    if (role) {
      query += ' AND u.role = $2';
      values.push(role);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getManagersByCompany(companyId) {
    const query = `
      SELECT id, name, email
      FROM users
      WHERE company_id = $1 AND role = 'manager'
      ORDER BY name
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async getManagerApproversByCompany(companyId) {
    const query = `
      SELECT id, name, email, role
      FROM users
      WHERE company_id = $1 AND is_manager_approver = true
      ORDER BY name
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async verifyEmail(userId) {
    const query = `
      UPDATE users 
      SET is_verified = TRUE, verification_code = NULL, verified_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, role, company_id, is_verified
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = User;
