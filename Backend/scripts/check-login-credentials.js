const User = require('../models/User');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function checkLoginCredentials() {
  try {
    console.log('🔍 Checking login credentials...');
    
    // Check all users using direct database query
    const usersResult = await pool.query('SELECT id, email, role, is_verified, password FROM users ORDER BY id');
    const users = usersResult.rows;
    console.log(`\n📊 Total users in database: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.is_verified}`);
    });
    
    // Check specific admin user
    console.log('\n🔍 Checking admin user...');
    const admin = await User.findByEmail('ridhampatelcg@gmail.com');
    if (admin) {
      console.log('✅ Admin user found:');
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Verified: ${admin.is_verified}`);
      console.log(`- Password hash: ${admin.password.substring(0, 20)}...`);
      
      // Test password comparison
      console.log('\n🔐 Testing password comparison...');
      const testPassword = 'Admin123';
      const isPasswordValid = await User.comparePassword(testPassword, admin.password);
      console.log(`Password '${testPassword}' is valid: ${isPasswordValid}`);
      
      // Test with different passwords
      const testPasswords = ['admin123', 'Admin123', 'admin', 'password', '123456'];
      for (const pwd of testPasswords) {
        const isValid = await User.comparePassword(pwd, admin.password);
        console.log(`Password '${pwd}' is valid: ${isValid}`);
      }
      
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Check if there are any verified users
    console.log('\n🔍 Checking verified users...');
    const verifiedUsers = users.filter(user => user.is_verified);
    console.log(`Verified users: ${verifiedUsers.length}`);
    verifiedUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLoginCredentials();
