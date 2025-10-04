# Complete Expense Management Flow

## Overview
Yeh complete expense management system hai jo dynamic database ke saath work karta hai. Static data nahi, sab kuch database me store hota hai.

## Database Schema
- `expenses` - Main expense records
- `expense_approvals` - Individual approval tracking
- `approval_rules` - Configurable approval workflows
- `rule_approvers` - Rule-specific approvers
- `companies` - Multi-tenant support
- `users` - Employees, managers, admins

## Complete Flow

### 1. Employee Expense Submit
```
POST /api/expenses
```
- Form data: amount, category, description, date, receipt
- OCR se auto-fill (optional)
- Currency conversion (USD → INR)
- Database me save with status 'pending'
- Approval rules apply hote hain
- First approver ko notification

### 2. Manager Dashboard
```
GET /api/expenses/pending
```
- Manager login karta hai
- Pending approvals list milti hai
- Approve/Reject buttons

### 3. Manager Approval
```
PUT /api/expenses/:id/approve
```
- Manager approve/reject karta hai
- Comments add kar sakta hai
- Next approver activate hota hai (sequential)
- Or final approval (percentage/specific)

### 4. Employee Status Check
```
GET /api/expenses/my
```
- Employee apne expenses dekh sakta hai
- Approval timeline dikhta hai
- Status: pending, in_progress, approved, rejected

## Approval Rules Types

### 1. Sequential (Default)
- Manager → Finance → Director
- Ek ke baad dusra

### 2. Percentage
- 60% approvers approve kare
- Parallel approval

### 3. Specific
- CFO approve kare to auto-approved

### 4. Hybrid
- Sequential OR Percentage OR Specific

## Database Setup

### 1. Run Migration
```bash
cd Backend
npm run migrate-expense
```

### 2. Test Complete Flow
```bash
npm run test-expense
```

## API Endpoints

### Employee APIs
- `POST /api/expenses` - Submit expense
- `GET /api/expenses/my` - My expenses with timeline
- `GET /api/expenses/:id` - Expense details

### Manager APIs
- `GET /api/expenses/pending` - Pending approvals
- `PUT /api/expenses/:id/approve` - Approve/reject

### Admin APIs
- `GET /api/rules` - Approval rules
- `POST /api/rules` - Create rule
- `PUT /api/rules/:id` - Update rule

## Frontend Integration

### Employee Dashboard
```javascript
// Submit expense
const response = await fetch('/api/expenses', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// Get my expenses
const expenses = await fetch('/api/expenses/my', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Manager Dashboard
```javascript
// Get pending approvals
const pending = await fetch('/api/expenses/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Approve expense
const result = await fetch(`/api/expenses/${expenseId}/approve`, {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ approved: true, comments: 'OK' })
});
```

## Database Queries

### Check Pending Approvals
```sql
SELECT e.*, u.name as submitted_by_name
FROM expenses e
JOIN expense_approvals ea ON e.id = ea.expense_id
LEFT JOIN users u ON e.submitted_by = u.id
WHERE ea.approver_id = $1 AND ea.status = 'pending'
```

### Get Approval Timeline
```sql
SELECT e.*, json_agg(
  json_build_object(
    'approver_name', approver.name,
    'status', ea.status,
    'comments', ea.comments,
    'approved_at', ea.approved_at
  ) ORDER BY ea.sequence_order
) as approval_timeline
FROM expenses e
LEFT JOIN expense_approvals ea ON e.id = ea.expense_id
LEFT JOIN users approver ON ea.approver_id = approver.id
WHERE e.submitted_by = $1
GROUP BY e.id
```

## Testing

### Manual Testing
1. Employee login → Submit expense
2. Manager login → Approve expense
3. Employee login → Check status

### Automated Testing
```bash
npm run test-expense
```

## Features

✅ Dynamic database storage
✅ Multi-tenant support
✅ Currency conversion
✅ OCR integration
✅ Email notifications
✅ In-app notifications
✅ Approval workflows
✅ Real-time status updates
✅ Approval timeline tracking
✅ Configurable rules

## Next Steps

1. Run migration: `npm run migrate-expense`
2. Test flow: `npm run test-expense`
3. Start server: `npm run dev`
4. Test with frontend
