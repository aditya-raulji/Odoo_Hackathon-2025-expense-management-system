const pool = require('../config/database');

class UserSubscription {
  static async create(userId, subscriptionData = {}) {
    const { newsletter = false, marketing_emails = false, product_updates = false, security_alerts = true } = subscriptionData;
    
    const query = `
      INSERT INTO user_subscriptions (user_id, newsletter, marketing_emails, product_updates, security_alerts, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const values = [userId, newsletter, marketing_emails, product_updates, security_alerts];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_subscriptions WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async update(userId, subscriptionData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(subscriptionData).forEach(key => {
      if (subscriptionData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(subscriptionData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE user_subscriptions 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getSubscribersByType(type) {
    const query = `
      SELECT us.*, u.email, u.name, up.username
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      LEFT JOIN user_profiles up ON us.user_id = up.user_id
      WHERE us.${type} = TRUE AND u.is_verified = TRUE
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getSubscriptionStats() {
    const query = `
      SELECT 
        COUNT(*) as total_subscribers,
        SUM(CASE WHEN newsletter = TRUE THEN 1 ELSE 0 END) as newsletter_subscribers,
        SUM(CASE WHEN marketing_emails = TRUE THEN 1 ELSE 0 END) as marketing_subscribers,
        SUM(CASE WHEN product_updates = TRUE THEN 1 ELSE 0 END) as product_update_subscribers,
        SUM(CASE WHEN security_alerts = TRUE THEN 1 ELSE 0 END) as security_alert_subscribers
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE u.is_verified = TRUE
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async delete(userId) {
    const query = 'DELETE FROM user_subscriptions WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = UserSubscription;
