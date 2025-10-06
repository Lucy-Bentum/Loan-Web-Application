-- Migration 003: Enhanced Audit Trail and Logging
-- This script adds comprehensive audit trail functionality

USE loan_app_db;

-- Enhanced audit trail table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id INT NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_table_name (table_name),
  INDEX idx_record_id (record_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE COMMENT 'Can be accessed by non-admin users',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_setting_key (setting_key),
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('default_interest_rate', '10.00', 'number', 'Default interest rate for loans', TRUE),
('max_loan_amount', '50000.00', 'number', 'Maximum loan amount allowed', TRUE),
('min_loan_amount', '1000.00', 'number', 'Minimum loan amount allowed', TRUE),
('loan_processing_fee', '100.00', 'number', 'Fixed processing fee for loans', TRUE),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', FALSE),
('sms_notifications_enabled', 'true', 'boolean', 'Enable SMS notifications', FALSE)
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Insert migration record
INSERT INTO migrations (migration_name) VALUES ('003_add_audit_trail') 
ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP;
