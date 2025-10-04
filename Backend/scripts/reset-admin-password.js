const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    const newPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('New password:', newPassword);
    console.log('Hashed password:', hashedPassword);
    
    // Update password in database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, 'ridhampatelcg@gmail.com']
    );
    
    console.log('Password updated for user:', result.rowCount);
    
    // Verify the update
    const userResult = await pool.query('SELECT email, password FROM users WHERE email = $1', ['ridhampatelcg@gmail.com']);
    const user = userResult.rows[0];
    
    if (user) {
      console.log('Verification - User found:', user.email);
      console.log('Verification - New password hash:', user.password);
      
      // Test the new password
      const isValid = await bcrypt.compare(newPassword, user.password);
      console.log('Verification - Password test result:', isValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
