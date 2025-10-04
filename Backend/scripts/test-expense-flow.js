const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function testExpenseFlow() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing complete expense flow...');
    
    // 1. Create test company
    console.log('1. Creating test company...');
    const companyResult = await client.query(`
      INSERT INTO companies (name, currency, country, created_at)
      VALUES ('Test Company', 'INR', 'India', NOW())
      RETURNING id
    `);
    const companyId = companyResult.rows[0].id;
    console.log('✅ Company created with ID:', companyId);
    
    // 2. Create test users
    console.log('2. Creating test users...');
    
    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, is_verified, created_at)
      VALUES ('Admin User', 'admin@test.com', $1, 'admin', $2, true, NOW())
      RETURNING id
    `, [adminPassword, companyId]);
    const adminId = adminResult.rows[0].id;
    
    // Create manager
    const managerPassword = await bcrypt.hash('manager123', 12);
    const managerResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, is_manager_approver, is_verified, created_at)
      VALUES ('Manager User', 'manager@test.com', $1, 'manager', $2, true, true, NOW())
      RETURNING id
    `, [managerPassword, companyId]);
    const managerId = managerResult.rows[0].id;
    
    // Create employee
    const employeePassword = await bcrypt.hash('employee123', 12);
    const employeeResult = await client.query(`
      INSERT INTO users (name, email, password, role, company_id, manager_id, is_verified, created_at)
      VALUES ('Employee User', 'employee@test.com', $1, 'employee', $2, $3, true, NOW())
      RETURNING id
    `, [employeePassword, companyId, managerId]);
    const employeeId = employeeResult.rows[0].id;
    
    console.log('✅ Users created - Admin:', adminId, 'Manager:', managerId, 'Employee:', employeeId);
    
    // 3. Create approval rule
    console.log('3. Creating approval rule...');
    const ruleResult = await client.query(`
      INSERT INTO approval_rules (company_id, name, rule_type, is_sequential, min_amount, max_amount, created_by, created_at)
      VALUES ($1, 'Default Sequential Rule', 'sequential', true, 0, 100000, $2, NOW())
      RETURNING id
    `, [companyId, adminId]);
    const ruleId = ruleResult.rows[0].id;
    
    // Add approvers to rule
    await client.query(`
      INSERT INTO rule_approvers (approval_rule_id, user_id, sequence_order, is_required)
      VALUES ($1, $2, 1, true), ($1, $3, 2, true)
    `, [ruleId, managerId, adminId]);
    
    console.log('✅ Approval rule created with ID:', ruleId);
    
    // 4. Test expense submission
    console.log('4. Testing expense submission...');
    const expenseResult = await client.query(`
      INSERT INTO expenses (submitted_by, company_id, amount, converted_amount, currency, category, description, expense_date, status, created_at)
      VALUES ($1, $2, 5000, 5000, 'INR', 'Travel', 'Test expense submission', CURRENT_DATE, 'pending', NOW())
      RETURNING id
    `, [employeeId, companyId]);
    const expenseId = expenseResult.rows[0].id;
    console.log('✅ Expense created with ID:', expenseId);
    
    // 5. Apply approval rules
    console.log('5. Applying approval rules...');
    const Expense = require('../models/Expense');
    await Expense.applyApprovalRules(expenseId, companyId, {
      amount: 5000,
      category: 'Travel'
    });
    console.log('✅ Approval rules applied');
    
    // 6. Check approval status
    console.log('6. Checking approval status...');
    const approvalResult = await client.query(`
      SELECT ea.*, u.name as approver_name
      FROM expense_approvals ea
      JOIN users u ON ea.approver_id = u.id
      WHERE ea.expense_id = $1
      ORDER BY ea.sequence_order
    `, [expenseId]);
    
    console.log('📋 Approval chain:');
    approvalResult.rows.forEach((approval, index) => {
      console.log(`   ${index + 1}. ${approval.approver_name} (${approval.status})`);
    });
    
    // 7. Test manager approval
    console.log('7. Testing manager approval...');
    const updateResult = await Expense.updateApproverStatus(expenseId, managerId, true, 'Approved by manager');
    console.log('✅ Manager approval result:', updateResult);
    
    // 8. Check final status
    console.log('8. Checking final expense status...');
    const finalExpense = await Expense.getExpenseWithApprovals(expenseId);
    console.log('📊 Final expense status:', finalExpense.status);
    console.log('📊 Approvals:', finalExpense.approvals);
    
    console.log('🎉 Complete expense flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run test if called directly
if (require.main === module) {
  testExpenseFlow()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testExpenseFlow;
