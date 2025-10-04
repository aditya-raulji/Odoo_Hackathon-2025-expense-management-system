const pool = require('../config/database');
const User = require('../models/User');

async function debugManagerCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Debugging manager creation...');
    
    // 1. Check if companies table exists and has data
    console.log('1. Checking companies table...');
    const companiesResult = await client.query('SELECT * FROM companies ORDER BY id DESC LIMIT 5');
    console.log('Companies found:', companiesResult.rows.length);
    companiesResult.rows.forEach(company => {
      console.log(`   - ID: ${company.id}, Name: ${company.name}, Currency: ${company.currency}`);
    });
    
    // 2. Check if users table structure
    console.log('2. Checking users table structure...');
    const usersStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    usersStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Check existing users
    console.log('3. Checking existing users...');
    const usersResult = await client.query('SELECT id, name, email, role, company_id, is_manager_approver FROM users ORDER BY id DESC LIMIT 10');
    console.log('Users found:', usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Name: ${user.name}, Role: ${user.role}, Company: ${user.company_id}, Manager Approver: ${user.is_manager_approver}`);
    });
    
    // 4. Test manager creation with sample data
    console.log('4. Testing manager creation...');
    
    // Get first company ID
    const firstCompany = companiesResult.rows[0];
    if (!firstCompany) {
      console.log('❌ No companies found. Creating test company...');
      const newCompany = await client.query(`
        INSERT INTO companies (name, currency, country, created_at)
        VALUES ('Debug Company', 'INR', 'India', NOW())
        RETURNING id
      `);
      firstCompany = newCompany.rows[0];
    }
    
    console.log('Using company ID:', firstCompany.id);
    
    // Test manager creation
    const managerData = {
      name: 'Debug Manager',
      email: 'debugmanager@test.com',
      password: 'Manager123',
      role: 'manager',
      companyId: firstCompany.id,
      isVerified: true,
      isManagerApprover: true
    };
    
    console.log('Manager data:', managerData);
    
    try {
      const manager = await User.create(managerData);
      console.log('✅ Manager created successfully:', manager);
    } catch (error) {
      console.log('❌ Manager creation failed:', error.message);
      console.log('Error details:', error);
    }
    
    // 5. Check if is_manager_approver column exists
    console.log('5. Checking is_manager_approver column...');
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_manager_approver'
      ) as column_exists
    `);
    console.log('is_manager_approver column exists:', columnCheck.rows[0].column_exists);
    
    // 6. Test direct SQL insertion
    console.log('6. Testing direct SQL insertion...');
    try {
      const directInsert = await client.query(`
        INSERT INTO users (name, email, password, role, company_id, is_verified, is_manager_approver, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, name, email, role, is_manager_approver
      `, [
        'Direct Manager',
        'direct@test.com',
        'hashedpassword',
        'manager',
        firstCompany.id,
        true,
        true
      ]);
      console.log('✅ Direct SQL insertion successful:', directInsert.rows[0]);
    } catch (error) {
      console.log('❌ Direct SQL insertion failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    client.release();
  }
}

// Run debug if called directly
if (require.main === module) {
  debugManagerCreation()
    .then(() => {
      console.log('Debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

module.exports = debugManagerCreation;
