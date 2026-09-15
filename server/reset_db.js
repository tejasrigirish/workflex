// server/reset_db.js
import { db } from './db.js';

console.log('Resetting database tables to clean zero-data state...');
db.exec(`
  DELETE FROM work_shifts;
  DELETE FROM applications;
  DELETE FROM jobs;
  DELETE FROM students;
  DELETE FROM employers;
  DELETE FROM users;
`);
console.log('Database reset complete: 0 users, 0 jobs, 0 applications.');
