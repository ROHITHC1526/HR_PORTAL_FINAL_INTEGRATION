-- PostgreSQL Schema Initialization for Brightcone Recruitment & HR Portal

-- 1. Manpower Requirements
CREATE TABLE IF NOT EXISTS manpower_requirements (
    id VARCHAR(50) PRIMARY KEY,
    designation VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    positions INT NOT NULL DEFAULT 1,
    employment_type VARCHAR(100) DEFAULT 'Full-time',
    location VARCHAR(255) DEFAULT 'Hyderabad',
    experience VARCHAR(100) DEFAULT '2-5',
    budget_ctc VARCHAR(100) DEFAULT '120000',
    reason VARCHAR(255) DEFAULT 'New position',
    replacing VARCHAR(255) DEFAULT '—',
    hiring_manager VARCHAR(255) DEFAULT '—',
    required_by VARCHAR(100) DEFAULT 'Feb 20, 2020',
    status VARCHAR(50) DEFAULT 'Approved',
    job_description TEXT DEFAULT '',
    created_at VARCHAR(100),
    updated_at VARCHAR(100),
    archived BOOLEAN DEFAULT FALSE
);

-- 2. Candidate Trackers
CREATE TABLE IF NOT EXISTS candidate_trackers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    applied_for VARCHAR(255) NOT NULL,
    source VARCHAR(100) DEFAULT 'Careers Page',
    total_experience INT DEFAULT 3,
    expected_ctc BIGINT DEFAULT 1500000,
    stage VARCHAR(50) DEFAULT 'Applied',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Offer Letters
CREATE TABLE IF NOT EXISTS offer_letters (
    id VARCHAR(50) PRIMARY KEY,
    candidate_id VARCHAR(50),
    candidate_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    annual_ctc VARCHAR(100) NOT NULL,
    joining_date VARCHAR(100) NOT NULL,
    valid_till VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending approval',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employees
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    grade VARCHAR(50) DEFAULT 'L3',
    location VARCHAR(255) DEFAULT 'Hyderabad',
    manager VARCHAR(255) DEFAULT 'Ananya Rao',
    status VARCHAR(50) DEFAULT 'Active',
    email VARCHAR(255) NOT NULL,
    joined_date VARCHAR(100) DEFAULT 'Oct 01, 2026'
);

-- 5. Employee Profiles
CREATE TABLE IF NOT EXISTS employee_profiles (
    employee_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    phone VARCHAR(50) DEFAULT '',
    dob VARCHAR(50) DEFAULT '',
    blood_group VARCHAR(20) DEFAULT '',
    address TEXT DEFAULT '',
    emergency_contact VARCHAR(100) DEFAULT '',
    manager VARCHAR(255) DEFAULT '',
    grade VARCHAR(50) DEFAULT '',
    location VARCHAR(255) DEFAULT '',
    doj VARCHAR(50) DEFAULT '',
    bank_name VARCHAR(100) DEFAULT '',
    bank_account VARCHAR(100) DEFAULT '',
    ifsc VARCHAR(50) DEFAULT '',
    pan VARCHAR(50) DEFAULT '',
    uan VARCHAR(50) DEFAULT '',
    nominee_name VARCHAR(100) DEFAULT '',
    nominee_relation VARCHAR(50) DEFAULT ''
);

-- 6. Employee Leaves
CREATE TABLE IF NOT EXISTS employee_leaves (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    from_date VARCHAR(50) NOT NULL,
    to_date VARCHAR(50) NOT NULL,
    days INT NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- 7. Employee Attendance
CREATE TABLE IF NOT EXISTS employee_attendance (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    punch_in VARCHAR(50) NOT NULL,
    punch_out VARCHAR(50),
    work_hours VARCHAR(50) DEFAULT '8h 00m',
    status VARCHAR(50) DEFAULT 'Present'
);

-- 8. Employee Referrals
CREATE TABLE IF NOT EXISTS employee_referrals (
    id VARCHAR(50) PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    referred_by VARCHAR(255) NOT NULL,
    bonus INT DEFAULT 30000,
    status VARCHAR(50) DEFAULT 'Applied',
    date VARCHAR(50) DEFAULT 'Today'
);

-- 9. Goals
CREATE TABLE IF NOT EXISTS goals (
    id INT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_date VARCHAR(50) NOT NULL,
    progress INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In Progress'
);

-- 10. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    cycle VARCHAR(50) NOT NULL,
    rating INT DEFAULT 4,
    feedback TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    updated_at VARCHAR(50) DEFAULT 'Today'
);

-- Extend Interviews table for Screenshots 1-4 fields
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round VARCHAR(100);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS mode VARCHAR(50);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS time VARCHAR(50);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS venue_link VARCHAR(255);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS rating INT DEFAULT 0;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS result VARCHAR(50) DEFAULT 'Pending';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Initial seed data for Manpower Requirements matching Screenshot 4
INSERT INTO manpower_requirements (
    id, designation, department, positions, employment_type, location, experience, budget_ctc, reason, replacing, hiring_manager, required_by, status, job_description, created_at, updated_at, archived
) VALUES (
    'MR-0001', 'asa', 'ss', 2, 'Full-time', 'sed', '2', '120000', 'New position', '—', '—', 'Feb 20, 2020', 'Overdue', 'sswefg', '15 Oct 2026, 4:17 pm', '19 Oct 2026, 12:21 pm', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO manpower_requirements (
    id, designation, department, positions, employment_type, location, experience, budget_ctc, reason, replacing, hiring_manager, required_by, status, job_description, created_at, updated_at, archived
) VALUES (
    'MR-0002', 'Senior ML Engineer', 'AI Research', 3, 'Full-time', 'Hyderabad', '3-5', '3500000', 'Expansion', '—', 'Karthik Reddy', 'Nov 30, 2026', 'Approved', 'Core ML platform development in Rust & Python', '16 Oct 2026, 10:00 am', '19 Oct 2026, 11:30 am', FALSE
) ON CONFLICT (id) DO NOTHING;

-- Initial seed data for Candidate Trackers
INSERT INTO candidate_trackers (id, full_name, applied_for, source, total_experience, expected_ctc, stage, email, phone, status, archived)
VALUES 
    ('CAN-001', 'Rahul Varma', 'Senior ML Engineer', 'LinkedIn', 4, 2800000, 'Interview', 'rahul.varma@brightcone.ai', '+91 98765 43210', 'Active', FALSE),
    ('CAN-002', 'Siddharth Rao', 'Full-Stack Developer', 'Careers Page', 3, 2200000, 'Screening', 'siddharth.rao@example.com', '+91 98450 12345', 'Active', FALSE),
    ('CAN-003', 'Neha Bansal', 'QA Automation Lead', 'Referral', 5, 2500000, 'Interview', 'neha.bansal@example.com', '+91 91234 56789', 'Active', FALSE),
    ('CAN-004', 'Aarav Sharma', 'AI Systems Architect', 'Direct', 7, 4500000, 'Applied', 'aarav.sharma@example.com', '+91 99887 76655', 'Active', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Initial seed data for Offer Letters (1 archived matching Screenshot 5)
INSERT INTO offer_letters (id, candidate_id, candidate_name, designation, annual_ctc, joining_date, valid_till, status, archived)
VALUES 
    ('OFF-001', 'CAN-002', 'Siddharth Rao', 'Full-Stack Developer', '₹22,00,000', 'Nov 15, 2026', 'Oct 25, 2026', 'Draft', TRUE)
ON CONFLICT (id) DO NOTHING;
