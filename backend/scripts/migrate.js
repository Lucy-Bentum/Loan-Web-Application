const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

class DatabaseMigrator {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'loan_app_db',
      port: process.env.DB_PORT || 3306
    };
    
    this.migrationsDir = path.join(__dirname, '../migrations');
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connected to MySQL database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async getExecutedMigrations() {
    try {
      const [rows] = await this.connection.execute(
        'SELECT migration_name FROM migrations ORDER BY executed_at'
      );
      return rows.map(row => row.migration_name);
    } catch (error) {
      // If migrations table doesn't exist, return empty array
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return [];
      }
      throw error;
    }
  }

  async getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
      .sort();
    
    return files;
  }

  async executeMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsDir, migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`🔄 Executing migration: ${migrationFile}`);
    
    try {
      // Split SQL by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection.execute(statement);
        }
      }
      
      console.log(`✅ Migration completed: ${migrationFile}`);
      return true;
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`, error.message);
      throw error;
    }
  }

  async runMigrations() {
    try {
      await this.connect();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      console.log(`📋 Found ${migrationFiles.length} migration files`);
      console.log(`📋 Already executed: ${executedMigrations.length} migrations`);
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.some(executed => 
          executed === file.replace('.sql', '')
        )
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }
      
      console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);
      
      for (const migrationFile of pendingMigrations) {
        await this.executeMigration(migrationFile);
      }
      
      console.log('✅ All migrations completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration process failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async rollbackMigration(migrationName) {
    try {
      await this.connect();
      
      // This is a simplified rollback - in production you'd want more sophisticated rollback logic
      console.log(`🔄 Rolling back migration: ${migrationName}`);
      
      // Remove from migrations table
      await this.connection.execute(
        'DELETE FROM migrations WHERE migration_name = ?',
        [migrationName]
      );
      
      console.log(`✅ Rollback completed: ${migrationName}`);
      console.log('⚠️  Note: You may need to manually revert schema changes');
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async showStatus() {
    try {
      await this.connect();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      console.log('\n📊 Migration Status:');
      console.log('===================');
      
      for (const file of migrationFiles) {
        const migrationName = file.replace('.sql', '');
        const isExecuted = executedMigrations.includes(migrationName);
        const status = isExecuted ? '✅ EXECUTED' : '⏳ PENDING';
        console.log(`${status} ${migrationName}`);
      }
      
      console.log(`\nTotal: ${migrationFiles.length} migrations`);
      console.log(`Executed: ${executedMigrations.length}`);
      console.log(`Pending: ${migrationFiles.length - executedMigrations.length}`);
      
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI usage
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
    case 'up':
      migrator.runMigrations()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Migration failed:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      migrator.showStatus()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Status check failed:', error);
          process.exit(1);
        });
      break;
      
    case 'rollback':
      const migrationName = process.argv[3];
      if (!migrationName) {
        console.error('Please provide migration name to rollback');
        process.exit(1);
      }
      migrator.rollbackMigration(migrationName)
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Rollback failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Database Migration Tool');
      console.log('======================');
      console.log('Usage: node migrate.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  migrate, up    - Run all pending migrations');
      console.log('  status         - Show migration status');
      console.log('  rollback       - Rollback a specific migration (requires migration name)');
      console.log('');
      console.log('Examples:');
      console.log('  node migrate.js migrate');
      console.log('  node migrate.js status');
      console.log('  node migrate.js rollback 001_initial_schema');
      break;
  }
}

module.exports = DatabaseMigrator;
