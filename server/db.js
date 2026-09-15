// server/db.js
// Persistent SQLite Database using Node v24 built-in `node:sqlite`
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../database.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable Foreign Keys & WAL mode for performance and integrity
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables as specified in requirements
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'employer')),
      profile_info TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      business_type TEXT,
      description TEXT,
      phone TEXT,
      verification_status TEXT NOT NULL DEFAULT 'verified',
      address TEXT,
      latitude REAL,
      longitude REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      college TEXT,
      skills TEXT,
      availability TEXT,
      profile_info TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      salary REAL NOT NULL,
      salary_type TEXT NOT NULL DEFAULT 'per_shift',
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      address TEXT NOT NULL,
      locality TEXT,
      city TEXT DEFAULT 'Bengaluru',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      number_of_workers INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'paused', 'filled', 'completed', 'cancelled')),
      photo_url TEXT,
      responsibilities TEXT,
      required_skills TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      employer_id TEXT NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'completed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS work_shifts (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      employer_id TEXT NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      start_time TEXT,
      end_time TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      identifier TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Ensure city column exists in existing databases
  try {
    db.exec(`ALTER TABLE jobs ADD COLUMN city TEXT DEFAULT 'Bengaluru'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Ensure password_resets table exists if database was already created
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        identifier TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);
  } catch (e) {
    // ignore
  }

  // Seed default demo student and employer if missing, and normalize phones
  try {
    const checkUser = db.prepare('SELECT id FROM users WHERE email = ?');
    const now = new Date().toISOString();

    if (!checkUser.get('student@workflex.in')) {
      db.prepare(`
        INSERT INTO users (id, name, email, phone, password, role, profile_info, created_at)
        VALUES ('user_demo_student', 'Rahul Sharma', 'student@workflex.in', '9876543210', 'demo123', 'student', '{"city":"Bengaluru"}', ?)
      `).run(now);
      db.prepare(`
        INSERT INTO students (id, user_id, college, skills, availability, profile_info, created_at)
        VALUES ('student_demo_1', 'user_demo_student', 'Christ University Bengaluru', '["Customer Service", "Billing"]', 'Evening Shifts', '{}', ?)
      `).run(now);
    } else {
      // Normalize existing demo phone to 10-digit
      db.prepare("UPDATE users SET phone = '9876543210' WHERE email = 'student@workflex.in' AND (phone LIKE '%98765%' OR phone = '')").run();
    }

    if (!checkUser.get('employer@workflex.in')) {
      db.prepare(`
        INSERT INTO users (id, name, email, phone, password, role, profile_info, created_at)
        VALUES ('user_demo_employer', 'Venkatesh Stores', 'employer@workflex.in', '9845012389', 'demo123', 'employer', '{"city":"Bengaluru"}', ?)
      `).run(now);
      db.prepare(`
        INSERT INTO employers (id, user_id, business_name, business_type, description, phone, verification_status, address, latitude, longitude, created_at)
        VALUES ('emp_demo_1', 'user_demo_employer', 'Venkatesh Stores & Provisions', 'Retail & Grocery', 'Trusted neighborhood supermarket in Koramangala', '9845012389', 'verified', '104, 5th Cross, Koramangala, Bengaluru', 12.9352, 77.6245, ?)
      `).run(now);
    } else {
      // Normalize existing demo phone to 10-digit
      db.prepare("UPDATE users SET phone = '9845012389' WHERE email = 'employer@workflex.in' AND (phone LIKE '%98450%' OR phone = '')").run();
    }
  } catch (err) {
    console.error('Error seeding demo accounts:', err);
  }
}

// Call immediately on load
initDatabase();

