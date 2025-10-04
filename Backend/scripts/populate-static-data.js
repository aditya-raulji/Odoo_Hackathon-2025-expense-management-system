const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function populateStaticData() {
  try {
    console.log('🚀 Starting to populate static data...');

    // Create a test company
    const companyQuery = `
      INSERT INTO companies (name, currency, country, admin_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    
    // First create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminQuery = `
      INSERT INTO users (name, email, password, role, is_verified, verification_code, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    
    const adminResult = await pool.query(adminQuery, [
      'Admin User',
      'admin@company.com',
      adminPassword,
      'admin',
      true,
      '123456'
    ]);

    let adminId = adminResult.rows[0]?.id;
    
    if (!adminId) {
      // Get existing admin
      const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@company.com']);
      adminId = existingAdmin.rows[0].id;
    }

    // Create company
    const companyResult = await pool.query(companyQuery, [
      'TechCorp Solutions',
      'INR',
      'India',
      adminId
    ]);

    let companyId = companyResult.rows[0]?.id;
    
    if (!companyId) {
      // Get existing company
      const existingCompany = await pool.query('SELECT id FROM companies WHERE name = $1', ['TechCorp Solutions']);
      companyId = existingCompany.rows[0].id;
    }

    // Update admin with company_id
    await pool.query('UPDATE users SET company_id = $1 WHERE id = $2', [companyId, adminId]);

    console.log(`✅ Company created/found with ID: ${companyId}`);

    // Create managers
    const managers = [
      {
        name: 'John Manager',
        email: 'john.manager@company.com',
        password: 'manager123',
        role: 'manager',
        isManagerApprover: true
      },
      {
        name: 'Sarah Finance',
        email: 'sarah.finance@company.com',
        password: 'manager123',
        role: 'manager',
        isManagerApprover: true
      },
      {
        name: 'Mike Director',
        email: 'mike.director@company.com',
        password: 'manager123',
        role: 'manager',
        isManagerApprover: true
      }
    ];

    const managerIds = [];
    for (const manager of managers) {
      const hashedPassword = await bcrypt.hash(manager.password, 12);
      const managerQuery = `
        INSERT INTO users (name, email, password, role, company_id, is_verified, verification_code, is_manager_approver, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      
      const result = await pool.query(managerQuery, [
        manager.name,
        manager.email,
        hashedPassword,
        manager.role,
        companyId,
        true,
        '123456',
        manager.isManagerApprover
      ]);

      if (result.rows[0]) {
        managerIds.push(result.rows[0].id);
        console.log(`✅ Manager created: ${manager.name} (ID: ${result.rows[0].id})`);
      } else {
        // Get existing manager
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [manager.email]);
        managerIds.push(existing.rows[0].id);
        console.log(`✅ Manager found: ${manager.name} (ID: ${existing.rows[0].id})`);
      }
    }

    // Create employees
    const employees = [
      {
        name: 'Alice Employee',
        email: 'alice.employee@company.com',
        password: 'employee123',
        role: 'employee',
        managerId: managerIds[0] // John Manager
      },
      {
        name: 'Bob Developer',
        email: 'bob.developer@company.com',
        password: 'employee123',
        role: 'employee',
        managerId: managerIds[0] // John Manager
      },
      {
        name: 'Carol Designer',
        email: 'carol.designer@company.com',
        password: 'employee123',
        role: 'employee',
        managerId: managerIds[1] // Sarah Finance
      },
      {
        name: 'David Tester',
        email: 'david.tester@company.com',
        password: 'employee123',
        role: 'employee',
        managerId: managerIds[2] // Mike Director
      }
    ];

    for (const employee of employees) {
      const hashedPassword = await bcrypt.hash(employee.password, 12);
      const employeeQuery = `
        INSERT INTO users (name, email, password, role, company_id, manager_id, is_verified, verification_code, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      
      const result = await pool.query(employeeQuery, [
        employee.name,
        employee.email,
        hashedPassword,
        employee.role,
        companyId,
        employee.managerId,
        true,
        '123456'
      ]);

      if (result.rows[0]) {
        console.log(`✅ Employee created: ${employee.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`✅ Employee found: ${employee.name}`);
      }
    }

    // Create approval rules
    const rules = [
      {
        name: 'Sequential Approval Rule',
        companyId: companyId,
        requiredApprovers: managerIds, // [John, Sarah, Mike]
        isSequential: true,
        minAmount: 0,
        maxAmount: 10000,
        categoryFilters: ['travel', 'meals', 'office'],
        createdBy: adminId
      },
      {
        name: 'Percentage Approval Rule',
        companyId: companyId,
        threshold: 60, // 60% approval required
        requiredApprovers: managerIds,
        isSequential: false,
        minAmount: 10000,
        maxAmount: 50000,
        categoryFilters: ['travel', 'meals', 'office'],
        createdBy: adminId
      },
      {
        name: 'Specific Approver Rule',
        companyId: companyId,
        requiredApprovers: [managerIds[2]], // Only Mike Director
        isSequential: false,
        minAmount: 50000,
        maxAmount: null,
        categoryFilters: ['travel', 'meals', 'office'],
        createdBy: adminId
      }
    ];

    for (const rule of rules) {
      const ruleQuery = `
        INSERT INTO approval_rules (
          company_id, name, threshold, required_approvers, is_sequential,
          min_amount, max_amount, category_filters, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      
      const result = await pool.query(ruleQuery, [
        rule.companyId,
        rule.name,
        rule.threshold,
        rule.requiredApprovers,
        rule.isSequential,
        rule.minAmount,
        rule.maxAmount,
        rule.categoryFilters,
        rule.createdBy
      ]);

      if (result.rows[0]) {
        console.log(`✅ Approval rule created: ${rule.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`✅ Approval rule found: ${rule.name}`);
      }
    }

    console.log('\n🎉 Static data population completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Managers:');
    console.log('  - john.manager@company.com / manager123');
    console.log('  - sarah.finance@company.com / manager123');
    console.log('  - mike.director@company.com / manager123');
    console.log('Employees:');
    console.log('  - alice.employee@company.com / employee123');
    console.log('  - bob.developer@company.com / employee123');
    console.log('  - carol.designer@company.com / employee123');
    console.log('  - david.tester@company.com / employee123');

  } catch (error) {
    console.error('❌ Error populating static data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  populateStaticData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = populateStaticData;
