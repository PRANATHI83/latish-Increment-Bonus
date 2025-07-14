-- init.sql

-- This script will be executed when the PostgreSQL container is first initialized
-- (e.g., via Docker's /docker-entrypoint-initdb.d/ mechanism).

-- Important: If you are using this in a production environment or an existing database,
-- consider using proper database migration tools (like Flyway, Liquibase, or custom
-- Node.js migration scripts) instead of DROP TABLE, to avoid data loss.
-- For development/testing, DROP TABLE provides a clean slate.

-- Optional: Drop the table if it already exists to ensure a clean slate for
-- repeatable deployments in development or testing environments.
DROP TABLE IF EXISTS employee_records CASCADE; -- CASCADE will drop dependent objects like indexes

-- Create the employee_records table
CREATE TABLE employee_records (
    id SERIAL PRIMARY KEY, -- Unique identifier for each record, automatically incrementing
    employee_id VARCHAR(255) NOT NULL, -- Employee's unique ID (e.g., ATS0123)
    employee_name VARCHAR(255) NOT NULL, -- Employee's full name
    department VARCHAR(255), -- Department (optional, can be NULL)
    position VARCHAR(255), -- Job position (optional, can be NULL)
    month VARCHAR(20) NOT NULL, -- Month of the record (e.g., 'January')
    year INT NOT NULL, -- Year of the record (e.g., 2025)

    -- NUMERIC(precision, scale) is best for monetary values to prevent floating-point inaccuracies.
    -- 15 total digits, 2 after decimal (e.g., up to 999,999,999,999.99)
    current_salary NUMERIC(15, 2) NOT NULL,
    increment_percentage NUMERIC(5, 2) NOT NULL, -- e.g., 5.00 for 5%
    bonus_amount NUMERIC(15, 2) NOT NULL,
    new_salary NUMERIC(15, 2) NOT NULL, -- Calculated new salary

    comments TEXT, -- Any additional comments, allows for longer text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Automatically records creation timestamp

    -- Add a composite unique constraint to ensure that for a given employee_id,
    -- there can only be one record for a specific month and year combination.
    UNIQUE (employee_id, month, year)
);

-- Optional: Create indexes for columns frequently used in WHERE clauses to improve query performance.
-- This is especially beneficial for large tables.
CREATE INDEX idx_employee_id ON employee_records (employee_id);
CREATE INDEX idx_month_year ON employee_records (month, year);

-- Optional: Insert some sample data for initial testing and demonstration.
-- This data will be present upon the first successful initialization of the database.
INSERT INTO employee_records (
    employee_id, employee_name, department, position, month, year,
    current_salary, increment_percentage, bonus_amount, new_salary, comments
) VALUES
('ATS001', 'Alice Smith', 'Engineering', 'Software Engineer', 'January', 2024, 60000.00, 5.00, 500.00, 63500.00, 'Excellent performance and project leadership.'),
('ATS002', 'Bob Johnson', 'HR', 'HR Manager', 'January', 2024, 75000.00, 3.00, 0.00, 77250.00, 'Standard annual increment.'),
('ATS003', 'Charlie Brown', 'Marketing', 'Marketing Specialist', 'February', 2024, 55000.00, 4.00, 200.00, 57400.00, 'Strong social media campaign results.'),
('ATS001', 'Alice Smith', 'Engineering', 'Software Engineer', 'February', 2024, 63500.00, 0.00, 0.00, 63500.00, 'No salary changes this month.'),
('ATS004', 'Diana Miller', 'Sales', 'Sales Representative', 'March', 2024, 62000.00, 6.00, 1500.00, 67220.00, 'Exceeded quarterly sales targets by 20%.');