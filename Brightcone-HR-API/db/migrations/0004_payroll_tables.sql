-- ==============================================================================
-- Brightcone HR Portal - Migration 0004: Payroll, Benefits & Expenses
-- ==============================================================================

-- 1. Base Employees Table (if not exists)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Employee',
    department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
    grade VARCHAR(50) DEFAULT 'L4',
    location VARCHAR(100) DEFAULT 'Hyderabad',
    manager VARCHAR(255) DEFAULT 'Naresh Vemparala',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payroll Entries Table
CREATE TABLE IF NOT EXISTS payroll_entries (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_pay NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Benefits Table
CREATE TABLE IF NOT EXISTS benefits (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    benefit_type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Present',
    hours_worked NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
    in_time TIME,
    out_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, date)
);

-- 5. Expense Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Expense Claims Table
CREATE TABLE IF NOT EXISTS expense_claims (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    category_id VARCHAR(50) REFERENCES expense_categories(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    date_submitted DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Expense Approvals Table
CREATE TABLE IF NOT EXISTS expense_approvals (
    id VARCHAR(50) PRIMARY KEY,
    claim_id VARCHAR(50) NOT NULL REFERENCES expense_claims(id) ON DELETE CASCADE,
    approver_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial Expense Categories
INSERT INTO expense_categories (id, name, description)
VALUES 
    ('CAT-TRV', 'Travel', 'Flights, trains, cabs and business transport'),
    ('CAT-MLS', 'Meals', 'Client dining and team meal allowances'),
    ('CAT-NET', 'Internet', 'WFH broadband and mobile connectivity'),
    ('CAT-ENT', 'Client Entertainment', 'Client meetings and relationship building'),
    ('CAT-LRN', 'Learning', 'Certifications, books and training programs'),
    ('CAT-OFC', 'Office Supplies', 'Hardware peripherals and home office supplies')
ON CONFLICT (name) DO NOTHING;

