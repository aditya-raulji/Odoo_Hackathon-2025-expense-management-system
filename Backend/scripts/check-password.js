const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function checkPassword() {
  try {
    const result = await pool.query('SELECT email, password FROM users WHERE email = $1', ['ridhampatelcg@gmail.com']);
    const user = result.rows[0];
    
    if (user) {
      console.log('User found:', user.email);
      console.log('Password hash:', user.password);
      
      // Test different passwords
      const passwords = ['Admin123', 'admin123', 'password', '123456', 'admin', 'ridham', 'Ridham123'];
      
      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        console.log(`Password '${pwd}' is valid: ${isValid}`);
      }
      
      // Check if password was hashed with different rounds
      console.log('\nHash info:');
      console.log('Starts with $2a$:', user.password.startsWith('$2a$'));
      console.log('Starts with $2b$:', user.password.startsWith('$2b$'));
      console.log('Starts with $2y$:', user.password.startsWith('$2y$'));
      
    } else {
      console.log('User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPassword();
