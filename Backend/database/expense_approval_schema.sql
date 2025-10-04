-- Enhanced schema for proper expense approval workflow
-- This will be applied on top of existing schema

-- Create expense_approvals table for proper approval tracking
CREATE TABLE IF NOT EXISTS expense_approvals (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    approver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expense_id, approver_id)
);

-- Update expenses table to remove approvers JSONB and add proper status
ALTER TABLE expenses 
DROP COLUMN IF EXISTS approvers,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS current_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Update approval_rules table for better rule management
ALTER TABLE approval_rules 
ADD COLUMN IF NOT EXISTS rule_type VARCHAR(20) DEFAULT 'sequential' CHECK (rule_type IN ('sequential', 'percentage', 'specific', 'hybrid')),
ADD COLUMN IF NOT EXISTS percentage_required INTEGER DEFAULT NULL CHECK (percentage_required >= 0 AND percentage_required <= 100),
ADD COLUMN IF NOT EXISTS specific_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create approvers table for rule-specific approvers
CREATE TABLE IF NOT EXISTS rule_approvers (
    id SERIAL PRIMARY KEY,
    approval_rule_id INTEGER REFERENCES approval_rules(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(approval_rule_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_id ON expense_approvals(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_status ON expense_approvals(status);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_sequence ON expense_approvals(expense_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_rule_approvers_rule_id ON rule_approvers(approval_rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_approvers_user_id ON rule_approvers(user_id);
CREATE INDEX IF NOT EXISTS idx_rule_approvers_sequence ON rule_approvers(approval_rule_id, sequence_order);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_expense_approvals_updated_at 
    BEFORE UPDATE ON expense_approvals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get next approver in sequence
CREATE OR REPLACE FUNCTION get_next_approver(expense_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    next_approver_id INTEGER;
BEGIN
    SELECT ea.approver_id INTO next_approver_id
    FROM expense_approvals ea
    WHERE ea.expense_id = expense_id_param 
      AND ea.status = 'waiting'
    ORDER BY ea.sequence_order ASC
    LIMIT 1;
    
    RETURN next_approver_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if expense is fully approved
CREATE OR REPLACE FUNCTION is_expense_fully_approved(expense_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    total_approvers INTEGER;
    approved_count INTEGER;
    percentage_required INTEGER;
    rule_type VARCHAR(20);
BEGIN
    -- Get total approvers and approved count
    SELECT COUNT(*), 
           COUNT(CASE WHEN status = 'approved' THEN 1 END)
    INTO total_approvers, approved_count
    FROM expense_approvals 
    WHERE expense_id = expense_id_param;
    
    -- Get rule type and percentage from the expense's company
    SELECT ar.rule_type, ar.percentage_required
    INTO rule_type, percentage_required
    FROM expenses e
    JOIN approval_rules ar ON e.company_id = ar.company_id
    WHERE e.id = expense_id_param
    ORDER BY ar.created_at DESC
    LIMIT 1;
    
    -- Check based on rule type
    IF rule_type = 'sequential' THEN
        RETURN approved_count = total_approvers;
    ELSIF rule_type = 'percentage' THEN
        RETURN (approved_count::FLOAT / total_approvers::FLOAT * 100) >= COALESCE(percentage_required, 100);
    ELSIF rule_type = 'specific' THEN
        -- Check if specific approver has approved
        SELECT COUNT(*) INTO approved_count
        FROM expense_approvals ea
        JOIN approval_rules ar ON ea.expense_id = expense_id_param
        WHERE ea.approver_id = ar.specific_approver_id 
          AND ea.status = 'approved';
        RETURN approved_count > 0;
    ELSIF rule_type = 'hybrid' THEN
        -- Check if either sequential is complete OR percentage is met OR specific approver approved
        RETURN (approved_count = total_approvers) OR 
               ((approved_count::FLOAT / total_approvers::FLOAT * 100) >= COALESCE(percentage_required, 100)) OR
               (EXISTS (SELECT 1 FROM expense_approvals ea 
                       JOIN approval_rules ar ON ea.expense_id = expense_id_param
                       WHERE ea.approver_id = ar.specific_approver_id AND ea.status = 'approved'));
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
