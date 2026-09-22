const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = path.join(__dirname, '../megas_dashboard.db');
let db;

function initializeDatabase() {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
}

async function query(sql, params = []) {
  if (!db) {
    initializeDatabase();
  }

  try {
    // Convert MySQL syntax to SQLite where needed
    let sqliteSql = sql;
    
    // Replace MySQL backticks with double quotes for SQLite
    sqliteSql = sqliteSql.replace(/`/g, '"');
    
    // Replace AUTO_INCREMENT with AUTOINCREMENT and adjust syntax
    sqliteSql = sqliteSql.replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    sqliteSql = sqliteSql.replace(/TINYINT\(1\)/g, 'INTEGER');
    sqliteSql = sqliteSql.replace(/VARCHAR\([0-9]+\)/g, 'TEXT');
    sqliteSql = sqliteSql.replace(/DECIMAL\([0-9,]+\)/g, 'REAL');
    sqliteSql = sqliteSql.replace(/TEXT NOT NULL/g, 'TEXT');
    sqliteSql = sqliteSql.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, "DATETIME DEFAULT CURRENT_TIMESTAMP");
    sqliteSql = sqliteSql.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, "DATETIME DEFAULT CURRENT_TIMESTAMP");
    sqliteSql = sqliteSql.replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;?/g, ';');
    sqliteSql = sqliteSql.replace(/ENUM\([^)]+\)/g, 'TEXT');
    sqliteSql = sqliteSql.replace(/ON DELETE CASCADE/g, 'ON DELETE CASCADE');
    sqliteSql = sqliteSql.replace(/ON DELETE SET NULL/g, 'ON DELETE SET NULL');

    if (sqliteSql.trim().toUpperCase().startsWith('INSERT') || 
        sqliteSql.trim().toUpperCase().startsWith('UPDATE') || 
        sqliteSql.trim().toUpperCase().startsWith('DELETE')) {
      const stmt = db.prepare(sqliteSql);
      const result = stmt.run(...params);
      return result;
    } else if (
      sqliteSql.trim().toUpperCase().startsWith('CREATE') ||
      sqliteSql.trim().toUpperCase().startsWith('ALTER')
    ) {
      db.exec(sqliteSql);
      return [];
    } else {
      const stmt = db.prepare(sqliteSql);
      const rows = stmt.all(...params);
      return rows;
    }
  } catch (error) {
    console.error('Database query error:', error.message, '\nSQL:', sql);
    throw error;
  }
}

async function initDB() {
  if (!db) {
    initializeDatabase();
  }

  if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
  }

  try {
    // Create tables with SQLite-compatible syntax
    await query(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      approved INTEGER NOT NULL DEFAULT 0,
      chief_application INTEGER DEFAULT 0,
      chief_position TEXT DEFAULT NULL,
      password_reset_token TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`)

    await query(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    await query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      project_type TEXT NOT NULL,
      budget REAL NOT NULL,
      description TEXT,
      deadline DATE DEFAULT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cv_file TEXT,
      job_title TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_one INTEGER NOT NULL,
      participant_two INTEGER NOT NULL,
      last_message TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participant_one) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_two) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER DEFAULT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER DEFAULT NULL,
      message TEXT NOT NULL,
      chat_type TEXT DEFAULT 'direct',
      read_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // Migrate old messages table schema if receiver_id was incorrectly defined as NOT NULL
    const tableInfo = db.prepare('PRAGMA table_info(messages)').all();
    const receiverColumn = tableInfo.find((col) => col.name === 'receiver_id');
    const chatTypeColumn = tableInfo.find((col) => col.name === 'chat_type');
    const readAtColumn = tableInfo.find((col) => col.name === 'read_at');

    if (!readAtColumn) {
      await query('ALTER TABLE messages ADD COLUMN read_at DATETIME DEFAULT NULL');
    }

    if (receiverColumn && receiverColumn.notnull === 1) {
      console.log('Migrating messages table to allow NULL receiver_id for chef group chat...');
      db.exec('PRAGMA foreign_keys = OFF;');
      db.exec('BEGIN TRANSACTION;');
      db.exec(`CREATE TABLE IF NOT EXISTS messages_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER DEFAULT NULL,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER DEFAULT NULL,
        message TEXT NOT NULL,
        chat_type TEXT DEFAULT 'direct',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );`);
      db.exec(`INSERT INTO messages_new (id, conversation_id, sender_id, receiver_id, message, chat_type, created_at)
        SELECT id, conversation_id, sender_id, receiver_id, message, COALESCE(chat_type, 'direct'), created_at FROM messages;`);
      db.exec('DROP TABLE messages;');
      db.exec('ALTER TABLE messages_new RENAME TO messages;');
      db.exec('COMMIT;');
      db.exec('PRAGMA foreign_keys = ON;');
    }

    if (!chatTypeColumn) {
      await query('ALTER TABLE messages ADD COLUMN chat_type TEXT DEFAULT \'direct\'');
    }

    await query(`CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    await query(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      status TEXT DEFAULT 'todo',
      due_date DATE DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await query(`CREATE TABLE IF NOT EXISTS chef_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      experience TEXT NOT NULL,
      qualifications TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );`);

    const existingAdmin = await query('SELECT id FROM users WHERE email = ?', ['admin@megas.com']);
    if (existingAdmin.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin#123', 10);
      await query(
        'INSERT INTO users (username, email, password, role, approved, chief_position) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@megas.com', hashedPassword, 'admin', 1, 'Head Administrator']
      );
      console.log('Created default admin account: admin@megas.com / Admin#123');
    }

    const existingRoles = await query('SELECT COUNT(*) AS total FROM roles');
    if (existingRoles.length === 0 || existingRoles[0]?.total === 0) {
      const roleData = [
        ['Chief of Security', 'Protect admin dashboards and manage secure access.'],
        ['Chief Developer', 'Oversee engineering teams and software initiatives.'],
        ['Chief Marketing Officer', 'Lead marketing strategy and growth campaigns.'],
        ['HR Manager', 'Manage staff operations and team recruitment.'],
        ['Team Supervisor', 'Coordinate project execution and pre admin work.'],
      ];
      
      for (const [name, description] of roleData) {
        await query('INSERT INTO roles (name, description) VALUES (?, ?)', [name, description]);
      }
    }

    // Add missing columns if they don't exist
    try {
      db.exec(`ALTER TABLE users ADD COLUMN chief_application INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist, ignore error
    }

    try {
      db.exec(`ALTER TABLE messages ADD COLUMN chat_type TEXT DEFAULT 'direct'`);
    } catch (error) {
      // Column might already exist, ignore error
    }

    console.log('SQLite database initialized successfully at:', dbPath);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = {
  query,
  initDB,
};
