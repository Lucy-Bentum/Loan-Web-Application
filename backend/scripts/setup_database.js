const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

class DatabaseSetup {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    };
    
    this.databaseName = process.env.DB_NAME || 'loan_app_db';
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connected to MySQL server');
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async createDatabase() {
    try {
      console.log(`🔄 Creating database: ${this.databaseName}`);
      
      await this.connection.execute(
        `CREATE DATABASE IF NOT EXISTS ${this.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      
      await this.connection.execute(`USE ${this.databaseName}`);
      
      console.log(`✅ Database '${this.databaseName}' created successfully`);
      return true;
    } catch (error) {
      console.error('❌ Database creation failed:', error.message);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      console.log(`🔄 Dropping database: ${this.databaseName}`);
      
      await this.connection.execute(`DROP DATABASE IF EXISTS ${this.databaseName}`);
      
      console.log(`✅ Database '${this.databaseName}' dropped successfully`);
      return true;
    } catch (error) {
      console.error('❌ Database drop failed:', error.message);
      throw error;
    }
  }

  async createUser() {
    try {
      const dbUser = process.env.DB_USER || 'loanapp_user';
      const dbPassword = process.env.DB_PASSWORD || 'loanapp_password';
      
      console.log(`🔄 Creating database user: ${dbUser}`);
      
      // Create user if it doesn't exist
      await this.connection.execute(
        `CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}'`
      );
      
      // Grant privileges
      await this.connection.execute(
        `GRANT ALL PRIVILEGES ON ${this.databaseName}.* TO '${dbUser}'@'localhost'`
      );
      
      await this.connection.execute('FLUSH PRIVILEGES');
      
      console.log(`✅ Database user '${dbUser}' created successfully`);
      return true;
    } catch (error) {
      console.error('❌ User creation failed:', error.message);
      throw error;
    }
  }

  async checkConnection() {
    try {
      await this.connect();
      
      const [rows] = await this.connection.execute('SELECT VERSION() as version');
      console.log(`✅ MySQL Version: ${rows[0].version}`);
      
      // Check if database exists
      const [dbs] = await this.connection.execute('SHOW DATABASES');
      const dbExists = dbs.some(db => db.Database === this.databaseName);
      
      if (dbExists) {
        console.log(`✅ Database '${this.databaseName}' exists`);
        
        // Check tables
        await this.connection.execute(`USE ${this.databaseName}`);
        const [tables] = await this.connection.execute('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables in database`);
        
        if (tables.length > 0) {
          console.log('Tables:');
          tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
          });
        }
      } else {
        console.log(`⚠️  Database '${this.databaseName}' does not exist`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Connection check failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async runInitialSetup() {
    try {
      console.log('🚀 Starting database setup...');
      
      await this.connect();
      await this.createDatabase();
      
      // Run initial schema migration
      const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
      if (fs.existsSync(migrationPath)) {
        console.log('🔄 Running initial schema migration...');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement.trim()) {
            await this.connection.execute(statement);
          }
        }
        
        console.log('✅ Initial schema migration completed');
      }
      
      console.log('✅ Database setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Copy .env.example to .env and update with your settings');
      console.log('2. Run: npm run migrate to apply additional migrations');
      console.log('3. Run: npm start to start the application');
      
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI usage
if (require.main === module) {
  const setup = new DatabaseSetup();
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
    case 'init':
      setup.runInitialSetup()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Setup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'check':
      setup.checkConnection()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Check failed:', error);
          process.exit(1);
        });
      break;
      
    case 'create':
      setup.connect()
        .then(() => setup.createDatabase())
        .then(() => setup.disconnect())
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Create failed:', error);
          process.exit(1);
        });
      break;
      
    case 'drop':
      setup.connect()
        .then(() => setup.dropDatabase())
        .then(() => setup.disconnect())
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Drop failed:', error);
          process.exit(1);
        });
      break;
      
    case 'user':
      setup.connect()
        .then(() => setup.createUser())
        .then(() => setup.disconnect())
        .then(() => process.exit(0))
        .catch(error => {
          console.error('User creation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Database Setup Tool');
      console.log('==================');
      console.log('Usage: node setup_database.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  setup, init - Complete database setup (create DB + initial schema)');
      console.log('  check       - Check database connection and status');
      console.log('  create      - Create database only');
      console.log('  drop        - Drop database (WARNING: This will delete all data!)');
      console.log('  user        - Create database user');
      console.log('');
      console.log('Examples:');
      console.log('  node setup_database.js setup');
      console.log('  node setup_database.js check');
      break;
  }
}

module.exports = DatabaseSetup;
