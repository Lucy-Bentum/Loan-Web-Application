-- Migration 002: Add Employee Deductions Table
-- This script adds the employee deductions functionality

USE loan_app_db;

-- Employee Deductions Table
CREATE TABLE IF NOT EXISTS employee_deductions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deduction_type ENUM('salary_advance', 'loan_payment', 'insurance', 'other') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  deduction_percentage DECIMAL(5, 2) DEFAULT NULL COMMENT 'Percentage of salary if applicable',
  description TEXT,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_amount DECIMAL(10, 2) DEFAULT NULL,
  total_deducted DECIMAL(10, 2) DEFAULT 0.00,
  remaining_amount DECIMAL(10, 2),
  created_by INT NOT NULL COMMENT 'Admin who created this deduction',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_deduction_type (deduction_type),
  INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Update users table to add employment information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS employment_status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD INDEX IF NOT EXISTS idx_employee_id (employee_id),
ADD INDEX IF NOT EXISTS idx_employment_status (employment_status);

-- Insert migration record
INSERT INTO migrations (migration_name) VALUES ('002_add_employee_deductions') 
ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP;
