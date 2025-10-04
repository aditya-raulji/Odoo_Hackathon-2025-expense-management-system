const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

async function testManagerCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing manager creation and verification...');
    
    await client.query('BEGIN');
    
    // 1. Create test company
    console.log('1. Creating test company...');
    const companyResult = await client.query(`
      INSERT INTO companies (name, currency, country, created_at)
      VALUES ('Test Company Manager', 'INR', 'India', NOW())
      RETURNING id
    `);
    const companyId = companyResult.rows[0].id;
    console.log('✅ Company created with ID:', companyId);
    
    // 2. Create admin user
    console.log('2. Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, is_verified, is_manager_approver, created_at)
      VALUES ('Admin User', 'admin@testmanager.com', $1, 'admin', $2, true, false, NOW())
      RETURNING id
    `, [adminPassword, companyId]);
    const adminId = adminResult.rows[0].id;
    console.log('✅ Admin created with ID:', adminId);
    
    // 3. Test manager creation using User model
    console.log('3. Creating manager using User model...');
    const managerData = {
      name: 'Test Manager',
      email: 'manager@testmanager.com',
      password: 'manager123',
      role: 'manager',
      companyId: companyId,
      isVerified: true,
      isManagerApprover: true
    };
    
    const manager = await User.create(managerData);
    console.log('✅ Manager created successfully:', {
      id: manager.id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      isVerified: manager.is_verified,
      isManagerApprover: manager.is_manager_approver
    });
    
    // 4. Verify manager can be found
    console.log('4. Verifying manager can be found...');
    const foundManager = await User.findById(manager.id);
    console.log('✅ Manager found:', {
      id: foundManager.id,
      name: foundManager.name,
      email: foundManager.email,
      role: foundManager.role,
      isVerified: foundManager.is_verified,
      isManagerApprover: foundManager.is_manager_approver
    });
    
    // 5. Test manager login (password verification)
    console.log('5. Testing manager login...');
    const loginManager = await User.findByEmail(manager.email);
    const passwordMatch = await User.comparePassword('manager123', loginManager.password);
    console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');
    
    // 6. Test manager approver query
    console.log('6. Testing manager approver query...');
    const managerApprovers = await User.getManagerApproversByCompany(companyId);
    console.log('✅ Manager approvers found:', managerApprovers.length);
    managerApprovers.forEach(m => {
      console.log(`   - ${m.name} (${m.email}) - Manager Approver: ${m.is_manager_approver}`);
    });
    
    // 7. Create employee and assign manager
    console.log('7. Creating employee with manager...');
    const employeeData = {
      name: 'Test Employee',
      email: 'employee@testmanager.com',
      password: 'employee123',
      role: 'employee',
      companyId: companyId,
      managerId: manager.id,
      isVerified: true
    };
    
    const employee = await User.create(employeeData);
    console.log('✅ Employee created with manager:', {
      id: employee.id,
      name: employee.name,
      managerId: employee.manager_id
    });
    
    // 8. Verify employee-manager relationship
    console.log('8. Verifying employee-manager relationship...');
    const employeeWithManager = await User.findById(employee.id);
    console.log('✅ Employee with manager details:', {
      id: employeeWithManager.id,
      name: employeeWithManager.name,
      managerId: employeeWithManager.manager_id,
      managerName: employeeWithManager.manager_name
    });
    
    await client.query('COMMIT');
    console.log('🎉 Manager creation and verification test completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run test if called directly
if (require.main === module) {
  testManagerCreation()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testManagerCreation;
