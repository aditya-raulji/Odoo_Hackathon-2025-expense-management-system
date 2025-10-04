const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Read and execute the init.sql file
    const initSqlPath = path.join(__dirname, '../database/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    console.log('📋 Creating users table...');
    await pool.query(initSql);

    // Read and execute the schema.sql file
    const schemaSqlPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    
    console.log('📋 Creating application tables...');
    await pool.query(schemaSql);

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - user_profiles');
    console.log('   - user_sessions');
    console.log('   - user_activities');
    console.log('   - user_notifications');
    console.log('   - user_subscriptions');

    // Test the connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('🕐 Database connection test successful:', result.rows[0].current_time);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
