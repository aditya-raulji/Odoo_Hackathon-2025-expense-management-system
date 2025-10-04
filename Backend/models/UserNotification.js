const pool = require('../config/database');

class UserNotification {
  static async create(userId, title, message, type = 'info', actionUrl = null, metadata = null) {
    const query = `
      INSERT INTO user_notifications (user_id, title, message, type, action_url, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const values = [
      userId,
      title,
      message,
      type,
      actionUrl,
      metadata ? JSON.stringify(metadata) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0, unreadOnly = false) {
    let query = `
      SELECT * FROM user_notifications 
      WHERE user_id = $1
    `;
    
    const values = [userId];
    let paramCount = 1;

    if (unreadOnly) {
      paramCount++;
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE user_notifications 
      SET is_read = TRUE, read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE user_notifications 
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = $1 AND is_read = FALSE
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM user_notifications 
      WHERE user_id = $1 AND is_read = FALSE
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async delete(notificationId, userId) {
    const query = `
      DELETE FROM user_notifications 
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [notificationId, userId]);
    return result.rowCount;
  }

  static async deleteOldNotifications(days = 30) {
    const query = `
      DELETE FROM user_notifications 
      WHERE created_at < NOW() - INTERVAL '${days} days' AND is_read = TRUE
    `;
    
    const result = await pool.query(query);
    return result.rowCount;
  }

  static async createBulk(notifications) {
    if (notifications.length === 0) return [];

    const values = [];
    const placeholders = [];
    let paramCount = 1;

    notifications.forEach(notification => {
      placeholders.push(`($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, NOW())`);
      values.push(
        notification.user_id,
        notification.title,
        notification.message,
        notification.type || 'info',
        notification.action_url || null,
        notification.metadata ? JSON.stringify(notification.metadata) : null
      );
      paramCount += 6;
    });

    const query = `
      INSERT INTO user_notifications (user_id, title, message, type, action_url, metadata, created_at)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = UserNotification;
