const pool = require('../config/database');

class UserProfile {
  static async create(userId, profileData) {
    const { username, first_name, last_name, bio, avatar_url, website, location, phone, date_of_birth, gender, social_links, preferences } = profileData;
    
    const query = `
      INSERT INTO user_profiles (user_id, username, first_name, last_name, bio, avatar_url, website, location, phone, date_of_birth, gender, social_links, preferences, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `;
    
    const values = [
      userId, username, first_name, last_name, bio, avatar_url, website, 
      location, phone, date_of_birth, gender, 
      social_links ? JSON.stringify(social_links) : null,
      preferences ? JSON.stringify(preferences) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM user_profiles WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async update(userId, profileData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        if (key === 'social_links' || key === 'preferences') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(profileData[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(profileData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE user_profiles 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(userId) {
    const query = 'DELETE FROM user_profiles WHERE user_id = $1';
    await pool.query(query, [userId]);
  }

  static async search(searchTerm, limit = 10, offset = 0) {
    const query = `
      SELECT up.*, u.email, u.is_verified
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE up.username ILIKE $1 OR up.first_name ILIKE $1 OR up.last_name ILIKE $1 OR up.bio ILIKE $1
      ORDER BY up.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`, limit, offset]);
    return result.rows;
  }

  static async getProUsers(limit = 10, offset = 0) {
    const query = `
      SELECT up.*, u.email, u.is_verified
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE up.is_pro = TRUE AND (up.pro_expires_at IS NULL OR up.pro_expires_at > NOW())
      ORDER BY up.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = UserProfile;
