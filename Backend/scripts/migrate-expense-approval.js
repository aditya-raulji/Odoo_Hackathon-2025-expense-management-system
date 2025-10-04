const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function migrateExpenseApproval() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting expense approval migration...');
    
    await client.query('BEGIN');
    
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '../database/expense_approval_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ Expense approval migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateExpenseApproval()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateExpenseApproval;
