const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE,
  amount REAL,
  email TEXT,
  status TEXT,
  raw_response TEXT,
  verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT,
  email TEXT,
  state TEXT,
  country TEXT,
  paystack_ref TEXT,
  amount REAL,
  payment_status TEXT,
  application_status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
