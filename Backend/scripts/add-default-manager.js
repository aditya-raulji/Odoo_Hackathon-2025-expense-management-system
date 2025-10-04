const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function addDefaultManager() {
  const client = await pool.connect();
  
  try {
    console.log('👤 Adding default manager...');
    
    await client.query('BEGIN');
    
    // 1. Find the first company
    console.log('1. Finding company...');
    const companyResult = await client.query(`
      SELECT id, name FROM companies ORDER BY id ASC LIMIT 1
    `);
    
    if (companyResult.rows.length === 0) {
      console.log('❌ No company found. Creating one...');
      const newCompany = await client.query(`
        INSERT INTO companies (name, currency, country, created_at)
        VALUES ('Default Company', 'INR', 'India', NOW())
        RETURNING id, name
      `);
      companyResult.rows[0] = newCompany.rows[0];
    }
    
    const company = companyResult.rows[0];
    console.log('✅ Using company:', company);
    
    // 2. Check if manager already exists
    console.log('2. Checking if manager already exists...');
    const existingManager = await client.query(`
      SELECT id, name, email FROM users 
      WHERE email = 'manager@company.com' AND company_id = $1
    `, [company.id]);
    
    if (existingManager.rows.length > 0) {
      console.log('✅ Manager already exists:', existingManager.rows[0]);
      await client.query('COMMIT');
      return;
    }
    
    // 3. Create default manager
    console.log('3. Creating default manager...');
    const managerPassword = await bcrypt.hash('Manager123', 12);
    
    const managerResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, is_verified, is_manager_approver, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, email, role, is_verified, is_manager_approver
    `, [
      'Default Manager',
      'manager@company.com',
      managerPassword,
      'manager',
      company.id,
      true,
      true
    ]);
    
    const manager = managerResult.rows[0];
    console.log('✅ Manager created successfully:', manager);
    
    // 4. Create a test employee
    console.log('4. Creating test employee...');
    const employeePassword = await bcrypt.hash('Employee123', 12);
    
    const employeeResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, manager_id, is_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, email, role, manager_id
    `, [
      'Test Employee',
      'employee@company.com',
      employeePassword,
      'employee',
      company.id,
      manager.id,
      true
    ]);
    
    const employee = employeeResult.rows[0];
    console.log('✅ Employee created successfully:', employee);
    
    await client.query('COMMIT');
    
    console.log('🎉 Default users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👨‍💼 Manager:');
    console.log('   Email: manager@company.com');
    console.log('   Password: Manager123');
    console.log('   Role: manager');
    console.log('   Can approve expenses: YES');
    console.log('\n👨‍💻 Employee:');
    console.log('   Email: employee@company.com');
    console.log('   Password: Employee123');
    console.log('   Role: employee');
    console.log('   Manager: Default Manager');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to add default manager:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addDefaultManager()
    .then(() => {
      console.log('Default manager added');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to add default manager:', error);
      process.exit(1);
    });
}

module.exports = addDefaultManager;
