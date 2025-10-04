const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class UserSession {
  static async create(userId, deviceInfo, ipAddress, userAgent, expiresInHours = 24) {
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    
    const query = `
      INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, user_agent, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const values = [
      userId, 
      sessionToken, 
      JSON.stringify(deviceInfo), 
      ipAddress, 
      userAgent, 
      expiresAt
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByToken(sessionToken) {
    const query = `
      SELECT us.*, u.email, u.is_verified
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = $1 AND us.is_active = TRUE AND us.expires_at > NOW()
    `;
    
    const result = await pool.query(query, [sessionToken]);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 10) {
    const query = `
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
      ORDER BY last_accessed_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async updateLastAccessed(sessionToken) {
    const query = `
      UPDATE user_sessions 
      SET last_accessed_at = NOW()
      WHERE session_token = $1 AND is_active = TRUE
    `;
    
    await pool.query(query, [sessionToken]);
  }

  static async deactivate(sessionToken) {
    const query = `
      UPDATE user_sessions 
      SET is_active = FALSE
      WHERE session_token = $1
    `;
    
    await pool.query(query, [sessionToken]);
  }

  static async deactivateAllForUser(userId) {
    const query = `
      UPDATE user_sessions 
      SET is_active = FALSE
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  static async cleanupExpired() {
    const query = `
      UPDATE user_sessions 
      SET is_active = FALSE
      WHERE expires_at < NOW() AND is_active = TRUE
    `;
    
    const result = await pool.query(query);
    return result.rowCount;
  }

  static async getActiveSessionsCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM user_sessions 
      WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = UserSession;
