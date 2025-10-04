const pool = require('../config/database');

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing database schema...');
    
    await client.query('BEGIN');
    
    // 1. Check if is_manager_approver column exists
    console.log('1. Checking is_manager_approver column...');
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_manager_approver'
      ) as column_exists
    `);
    
    if (!columnCheck.rows[0].column_exists) {
      console.log('❌ is_manager_approver column missing. Adding...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN is_manager_approver BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ is_manager_approver column added');
    } else {
      console.log('✅ is_manager_approver column exists');
    }
    
    // 2. Check if verification_code column exists
    console.log('2. Checking verification_code column...');
    const verificationCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verification_code'
      ) as column_exists
    `);
    
    if (!verificationCheck.rows[0].column_exists) {
      console.log('❌ verification_code column missing. Adding...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN verification_code VARCHAR(6)
      `);
      console.log('✅ verification_code column added');
    } else {
      console.log('✅ verification_code column exists');
    }
    
    // 3. Check if verified_at column exists
    console.log('3. Checking verified_at column...');
    const verifiedAtCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verified_at'
      ) as column_exists
    `);
    
    if (!verifiedAtCheck.rows[0].column_exists) {
      console.log('❌ verified_at column missing. Adding...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN verified_at TIMESTAMP
      `);
      console.log('✅ verified_at column added');
    } else {
      console.log('✅ verified_at column exists');
    }
    
    // 4. Update existing managers to have is_manager_approver = true
    console.log('4. Updating existing managers...');
    const updateResult = await client.query(`
      UPDATE users 
      SET is_manager_approver = true 
      WHERE role = 'manager' AND is_manager_approver = false
    `);
    console.log(`✅ Updated ${updateResult.rowCount} managers to be manager approvers`);
    
    // 5. Check final schema
    console.log('5. Final schema check...');
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    finalCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    await client.query('COMMIT');
    console.log('🎉 Database schema fixed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Schema fix failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixDatabaseSchema()
    .then(() => {
      console.log('Schema fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixDatabaseSchema;
