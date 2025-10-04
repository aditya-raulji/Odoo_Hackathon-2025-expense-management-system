const pool = require('../config/database');
const jwt = require('jsonwebtoken');

async function debugUsersEndpoint() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Debugging /api/users endpoint...');
    
    // 1. Check if admin user exists
    console.log('1. Checking admin user...');
    const adminResult = await client.query(`
      SELECT id, name, email, role, company_id, is_manager_approver 
      FROM users 
      WHERE role = 'admin' 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('❌ No admin user found');
      return;
    }
    
    const admin = adminResult.rows[0];
    console.log('✅ Admin found:', admin);
    
    // 2. Generate JWT token for admin
    console.log('2. Generating JWT token...');
    const token = jwt.sign(
      { 
        userId: admin.id, 
        role: admin.role, 
        companyId: admin.company_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    console.log('✅ Token generated:', token.substring(0, 50) + '...');
    
    // 3. Test the users query that the endpoint uses
    console.log('3. Testing users query...');
    try {
      const usersResult = await client.query(`
        SELECT u.id, u.name, u.email, u.role, u.is_manager_approver, u.created_at,
               m.name as manager_name
        FROM users u
        LEFT JOIN users m ON u.manager_id = m.id
        WHERE u.company_id = $1
        ORDER BY u.created_at DESC
      `, [admin.company_id]);
      
      console.log('✅ Users query successful, found:', usersResult.rows.length, 'users');
      usersResult.rows.forEach(user => {
        console.log(`   - ID: ${user.id}, Name: ${user.name}, Role: ${user.role}, Manager: ${user.manager_name || 'None'}`);
      });
    } catch (error) {
      console.log('❌ Users query failed:', error.message);
    }
    
    // 4. Check if company exists
    console.log('4. Checking company...');
    const companyResult = await client.query(`
      SELECT id, name, currency, country 
      FROM companies 
      WHERE id = $1
    `, [admin.company_id]);
    
    if (companyResult.rows.length === 0) {
      console.log('❌ Company not found for admin');
    } else {
      console.log('✅ Company found:', companyResult.rows[0]);
    }
    
    // 5. Check database schema
    console.log('5. Checking database schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    schemaCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 6. Test specific error scenarios
    console.log('6. Testing error scenarios...');
    
    // Test with invalid company_id
    try {
      await client.query(`
        SELECT u.id, u.name, u.email, u.role, u.is_manager_approver, u.created_at,
               m.name as manager_name
        FROM users u
        LEFT JOIN users m ON u.manager_id = m.id
        WHERE u.company_id = $1
        ORDER BY u.created_at DESC
      `, [999999]);
      console.log('✅ Query with invalid company_id worked (unexpected)');
    } catch (error) {
      console.log('❌ Query with invalid company_id failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    client.release();
  }
}

// Run debug if called directly
if (require.main === module) {
  debugUsersEndpoint()
    .then(() => {
      console.log('Debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

module.exports = debugUsersEndpoint;
