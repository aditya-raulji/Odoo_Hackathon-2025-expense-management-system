const pool = require('../config/database');

class UserActivity {
  static async create(userId, activityType, description, metadata, ipAddress, userAgent) {
    const query = `
      INSERT INTO user_activities (user_id, activity_type, description, metadata, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const values = [
      userId,
      activityType,
      description,
      metadata ? JSON.stringify(metadata) : null,
      ipAddress,
      userAgent
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM user_activities 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async findByActivityType(activityType, limit = 100, offset = 0) {
    const query = `
      SELECT ua.*, u.email, up.username
      FROM user_activities ua
      JOIN users u ON ua.user_id = u.id
      LEFT JOIN user_profiles up ON ua.user_id = up.user_id
      WHERE ua.activity_type = $1
      ORDER BY ua.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [activityType, limit, offset]);
    return result.rows;
  }

  static async getRecentActivity(userId, hours = 24) {
    const query = `
      SELECT * FROM user_activities 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getActivityStats(userId, days = 30) {
    const query = `
      SELECT 
        activity_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM user_activities 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY activity_type, DATE(created_at)
      ORDER BY date DESC, count DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getPopularActivities(limit = 10) {
    const query = `
      SELECT 
        activity_type,
        COUNT(*) as count
      FROM user_activities 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY activity_type
      ORDER BY count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async cleanupOldActivities(days = 90) {
    const query = `
      DELETE FROM user_activities 
      WHERE created_at < NOW() - INTERVAL '${days} days'
    `;
    
    const result = await pool.query(query);
    return result.rowCount;
  }
}

module.exports = UserActivity;
