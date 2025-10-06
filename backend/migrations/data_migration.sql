-- Data Migration Script
-- This script handles data migration from old schema to new schema

USE loan_app_db;

-- Create backup tables before migration
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS loans_backup AS SELECT * FROM loans;
CREATE TABLE IF NOT EXISTS payments_backup AS SELECT * FROM payments;
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;
CREATE TABLE IF NOT EXISTS admin_logs_backup AS SELECT * FROM admin_logs;

-- Data migration procedures
DELIMITER $$

-- Procedure to migrate user data with validation
CREATE PROCEDURE IF NOT EXISTS MigrateUserData()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update users with default values for new columns
    UPDATE users 
    SET 
        employment_status = CASE 
            WHEN status = 'active' THEN 'active'
            WHEN status = 'suspended' THEN 'inactive'
            WHEN status = 'inactive' THEN 'inactive'
            ELSE 'active'
        END
    WHERE employment_status IS NULL;
    
    -- Set hire_date for existing users (use created_at as approximation)
    UPDATE users 
    SET hire_date = DATE(created_at)
    WHERE hire_date IS NULL;
    
    COMMIT;
END$$

-- Procedure to migrate loan data with calculations
CREATE PROCEDURE IF NOT EXISTS MigrateLoanData()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Recalculate outstanding balance for all loans
    UPDATE loans l
    SET outstanding_balance = (
        SELECT l.total_amount - COALESCE(SUM(p.payment_amount), 0)
        FROM payments p 
        WHERE p.loan_id = l.id AND p.status = 'completed'
    )
    WHERE l.status IN ('active', 'completed');
    
    -- Update loan status based on outstanding balance
    UPDATE loans 
    SET status = CASE 
        WHEN outstanding_balance <= 0 THEN 'completed'
        WHEN outstanding_balance > 0 AND status = 'active' THEN 'active'
        ELSE status
    END;
    
    COMMIT;
END$$

-- Procedure to clean up orphaned records
CREATE PROCEDURE IF NOT EXISTS CleanupOrphanedRecords()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Remove orphaned payments
    DELETE p FROM payments p
    LEFT JOIN loans l ON p.loan_id = l.id
    WHERE l.id IS NULL;
    
    -- Remove orphaned notifications
    DELETE n FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    WHERE u.id IS NULL;
    
    -- Remove orphaned admin logs
    DELETE al FROM admin_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE u.id IS NULL;
    
    COMMIT;
END$$

DELIMITER ;

-- Execute data migration procedures
CALL MigrateUserData();
CALL MigrateLoanData();
CALL CleanupOrphanedRecords();

-- Drop the procedures after execution
DROP PROCEDURE IF EXISTS MigrateUserData;
DROP PROCEDURE IF EXISTS MigrateLoanData;
DROP PROCEDURE IF EXISTS CleanupOrphanedRecords;
