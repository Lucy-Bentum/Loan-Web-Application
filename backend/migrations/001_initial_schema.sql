-- Migration 001: Initial Database Schema
-- This script creates the initial database structure

-- Create Database
CREATE DATABASE IF NOT EXISTS loan_app_db;
USE loan_app_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  phone_verification_token VARCHAR(10),
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
  profile_image VARCHAR(255),
  address TEXT,
  date_of_birth DATE,
  id_number VARCHAR(50),
  occupation VARCHAR(100),
  monthly_salary DECIMAL(10, 2),
  ghana_card_number VARCHAR(20),
  voters_id_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  loan_amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 10.00,
  loan_duration INT NOT NULL COMMENT 'Duration in months',
  loan_purpose VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Principal + Interest',
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  outstanding_balance DECIMAL(10, 2) NOT NULL,
  monthly_payment DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted') DEFAULT 'pending',
  approved_by INT,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  start_date DATE,
  end_date DATE,
  next_payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('mtn_momo', 'vodafone_cash', 'airteltigo_money', 'bank_transfer', 'cash') NOT NULL,
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  transaction_id VARCHAR(100),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_loan_id (loan_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'loan_approval', 'loan_rejection', 'payment_reminder', 'payment_success') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) COMMENT 'user, loan, payment',
  target_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_migration_name (migration_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert migration record
INSERT INTO migrations (migration_name) VALUES ('001_initial_schema') 
ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP;
