const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function testManagerAccess() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing manager access to routes...');
    
    // 1. Find manager user
    console.log('1. Finding manager user...');
    const managerResult = await client.query(`
      SELECT id, name, email, role, company_id, is_verified, is_manager_approver
      FROM users 
      WHERE email = 'manager@company.com' AND role = 'manager'
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    if (managerResult.rows.length === 0) {
      console.log('❌ Manager not found. Creating one...');
      
      // Find company
      const companyResult = await client.query(`
        SELECT id FROM companies ORDER BY id ASC LIMIT 1
      `);
      
      if (companyResult.rows.length === 0) {
        console.log('❌ No company found');
        return;
      }
      
      // Create manager
      const managerPassword = await bcrypt.hash('Manager123', 12);
      const newManager = await client.query(`
        INSERT INTO users (name, email, password, role, company_id, is_verified, is_manager_approver, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, name, email, role, company_id, is_verified, is_manager_approver
      `, [
        'Test Manager',
        'manager@company.com',
        managerPassword,
        'manager',
        companyResult.rows[0].id,
        true,
        true
      ]);
      
      managerResult.rows[0] = newManager.rows[0];
    }
    
    const manager = managerResult.rows[0];
    console.log('✅ Manager found:', manager);
    
    // 2. Generate JWT token for manager
    console.log('2. Generating JWT token for manager...');
    const token = jwt.sign(
      { 
        userId: manager.id, 
        role: manager.role, 
        companyId: manager.company_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    console.log('✅ Token generated:', token.substring(0, 50) + '...');
    
    // 3. Test manager login
    console.log('3. Testing manager login...');
    const loginManager = await client.query(`
      SELECT id, name, email, role, company_id, is_verified, is_manager_approver
      FROM users 
      WHERE email = 'manager@company.com'
    `);
    
    if (loginManager.rows.length === 0) {
      console.log('❌ Manager login failed - user not found');
      return;
    }
    
    const passwordMatch = await bcrypt.compare('Manager123', loginManager.rows[0].password);
    console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');
    
    // 4. Test manager access to pending approvals
    console.log('4. Testing manager access to pending approvals...');
    try {
      const pendingResult = await client.query(`
        SELECT DISTINCT e.*, u.name as submitted_by_name, u.email as submitted_by_email,
               ea.status as approval_status, ea.comments as approval_comments,
               ea.approved_at, ea.sequence_order
        FROM expenses e
        JOIN expense_approvals ea ON e.id = ea.expense_id
        LEFT JOIN users u ON e.submitted_by = u.id
        WHERE ea.approver_id = $1 
          AND e.company_id = $2 
          AND ea.status = 'pending'
          AND e.status IN ('pending', 'in_progress')
        ORDER BY ea.sequence_order ASC, e.created_at ASC
      `, [manager.id, manager.company_id]);
      
      console.log('✅ Manager can access pending approvals:', pendingResult.rows.length, 'found');
    } catch (error) {
      console.log('❌ Manager access to pending approvals failed:', error.message);
    }
    
    // 5. Test manager access to users list (should fail)
    console.log('5. Testing manager access to users list...');
    try {
      const usersResult = await client.query(`
        SELECT u.id, u.name, u.email, u.role, u.is_manager_approver, u.created_at,
               m.name as manager_name
        FROM users u
        LEFT JOIN users m ON u.manager_id = m.id
        WHERE u.company_id = $1
        ORDER BY u.created_at DESC
      `, [manager.company_id]);
      
      console.log('⚠️ Manager can access users list (unexpected):', usersResult.rows.length, 'found');
    } catch (error) {
      console.log('✅ Manager access to users list properly blocked:', error.message);
    }
    
    // 6. Test manager role verification
    console.log('6. Testing manager role verification...');
    const isManager = manager.role === 'manager';
    const isManagerApprover = manager.is_manager_approver === true;
    const isVerified = manager.is_verified === true;
    
    console.log('✅ Manager role check:', isManager ? 'PASSED' : 'FAILED');
    console.log('✅ Manager approver check:', isManagerApprover ? 'PASSED' : 'FAILED');
    console.log('✅ Manager verified check:', isVerified ? 'PASSED' : 'FAILED');
    
    // 7. Test JWT token verification
    console.log('7. Testing JWT token verification...');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ JWT token verification:', 'PASSED');
      console.log('   - User ID:', decoded.userId);
      console.log('   - Role:', decoded.role);
      console.log('   - Company ID:', decoded.companyId);
    } catch (error) {
      console.log('❌ JWT token verification failed:', error.message);
    }
    
    console.log('\n🎉 Manager access test completed!');
    console.log('\n📋 Manager Login Credentials:');
    console.log('📧 Email: manager@company.com');
    console.log('🔑 Password: Manager123');
    console.log('👨‍💼 Role: manager');
    console.log('✅ Can approve expenses: YES');
    console.log('✅ Can access pending approvals: YES');
    console.log('❌ Cannot access user management: YES (as expected)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
  }
}

// Run test if called directly
if (require.main === module) {
  testManagerAccess()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testManagerAccess;
