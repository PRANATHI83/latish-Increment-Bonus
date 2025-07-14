
CREATE DATABASE employee_portal;


\c employee_portal


CREATE TABLE employee_records (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(7) NOT NULL CHECK (employee_id ~ '^ATS0(?!000)\d{3}$'),
    employee_name VARCHAR(30) NOT NULL CHECK (employee_name ~ '^[a-zA-Z\s]{5,30}$'),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(30) NOT NULL CHECK (position ~ '^[a-zA-Z\s]{5,30}$'),
    month VARCHAR(10) NOT NULL CHECK (month IN (
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    )),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
    current_salary DECIMAL(10,2) NOT NULL CHECK (current_salary >= 0 AND current_salary <= 1000000),
    increment_percentage DECIMAL(5,2) NOT NULL CHECK (increment_percentage >= 0 AND increment_percentage <= 100),
    bonus_amount DECIMAL(10,2) NOT NULL CHECK (bonus_amount >= 0 AND bonus_amount <= 1000000),
    new_salary DECIMAL(10,2) NOT NULL CHECK (new_salary >= 0 AND new_salary <= 1000000),
    comments VARCHAR(30) CHECK (comments ~ '^[a-zA-Z\s]{5,30}$'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, month, year)
);


CREATE INDEX idx_employee_id ON employee_records(employee_id);
CREATE INDEX idx_month_year ON employee_records(month, year);
