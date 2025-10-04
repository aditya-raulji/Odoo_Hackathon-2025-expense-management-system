const pool = require('../config/database');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Drop existing users table if it exists
    console.log('🗑️ Dropping existing users table...');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Create new users table with correct schema
    console.log('📋 Creating new users table...');
    await pool.query(`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          is_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          verified_at TIMESTAMP,
          password_reset_token VARCHAR(255),
          password_reset_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await pool.query('CREATE INDEX idx_users_email ON users(email);');
    await pool.query('CREATE INDEX idx_users_verification_token ON users(verification_token);');
    await pool.query('CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);');
    
    // Create function for updated_at trigger
    console.log('⚙️ Creating trigger function...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create trigger
    console.log('🔗 Creating trigger...');
    await pool.query(`
      CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✅ Database schema fixed successfully!');
    
    // Verify the table
    const result = await pool.query('SELECT * FROM users LIMIT 1;');
    console.log('📋 Users table is ready with correct schema');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();
