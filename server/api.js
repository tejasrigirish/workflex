// server/api.js
import { db } from './db.js';
import crypto from 'node:crypto';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protect against overly large payloads
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Secure Cryptographic Hashing (PBKDF2)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  // Backward compatibility with demo plaintext accounts
  if (!stored.includes(':')) {
    return stored === password;
  }
  const [salt, hash] = stored.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

function normalizePhone(str) {
  if (!str) return '';
  const digits = str.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export async function handleApiRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  try {
    // ------------------------------------------------------------------------
    // AUTHENTICATION: REGISTER
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const { email, phone, password, role, name, collegeOrBusiness, city, skills, availability, preferredCategories } = body;

      if (!password || !role || !name) {
        return sendJson(res, 400, { success: false, error: 'Missing required registration fields' });
      }

      // At least one identifier (email or phone) is required
      const cleanEmail = (email || '').toLowerCase().trim();
      const rawPhone = (phone || '').trim();
      const cleanPhone = normalizePhone(rawPhone);

      if (!cleanEmail && !cleanPhone) {
        return sendJson(res, 400, { success: false, error: 'Please provide either an email or a 10-digit phone number' });
      }

      // Validate email format if provided
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return sendJson(res, 400, { success: false, error: 'Please enter a valid email address' });
      }

      // Validate phone number format if provided
      if (rawPhone) {
        if (!/^\d{10}$/.test(rawPhone) && !/^\d{10}$/.test(cleanPhone)) {
          return sendJson(res, 400, { success: false, error: 'Phone number must contain exactly 10 digits.' });
        }
      }

      // Validate password strength: minimum 8 characters, at least 1 letter, at least 1 number
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return sendJson(res, 400, { success: false, error: 'Password must be at least 8 characters and contain both letters and numbers' });
      }

      // Ensure email uniqueness (or assign synthetic email for phone-only signups)
      const finalEmail = cleanEmail || `${cleanPhone}@phone.workflex.in`;

      // Check existing email
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(finalEmail);
      if (existingEmail) {
        return sendJson(res, 409, { success: false, error: 'An account with this email address already exists' });
      }

      // Check existing phone if phone provided
      if (cleanPhone) {
        const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(cleanPhone);
        if (existingPhone) {
          return sendJson(res, 409, { success: false, error: 'An account with this phone number already exists' });
        }
      }

      const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const hashedPassword = hashPassword(password);

      // Insert User
      const insertUserStmt = db.prepare(`
        INSERT INTO users (id, name, email, phone, password, role, profile_info, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertUserStmt.run(
        userId,
        name.trim(),
        finalEmail,
        cleanPhone,
        hashedPassword,
        role === 'employer' ? 'employer' : 'student',
        JSON.stringify({ city: city || 'Bengaluru', preferredCategories: preferredCategories || [] }),
        now
      );

      let profile = null;

      if (role === 'employer') {
        const employerId = `emp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const insertEmployerStmt = db.prepare(`
          INSERT INTO employers (id, user_id, business_name, business_type, description, phone, verification_status, address, latitude, longitude, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertEmployerStmt.run(
          employerId,
          userId,
          collegeOrBusiness || name,
          'Local Business & Services',
          'Verified local employer on WorkFlex',
          cleanPhone || '',
          'verified',
          city || 'Bengaluru',
          12.9716,
          77.5946,
          now
        );
        profile = {
          id: employerId,
          userId,
          businessName: collegeOrBusiness || name,
          businessType: 'Local Business & Services',
          phone: cleanPhone || '',
          city: city || 'Bengaluru',
          verificationStatus: 'verified'
        };
      } else {
        const studentId = `stu_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const insertStudentStmt = db.prepare(`
          INSERT INTO students (id, user_id, college, skills, availability, profile_info, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insertStudentStmt.run(
          studentId,
          userId,
          collegeOrBusiness || 'Job Seeker',
          JSON.stringify(skills || ['Customer Support', 'Communication']),
          availability || 'Flexible Shifts (Evenings & Weekends)',
          JSON.stringify({ city: city || 'Bengaluru', preferredCategories: preferredCategories || [] }),
          now
        );
        profile = {
          id: studentId,
          userId,
          college: collegeOrBusiness || 'Job Seeker',
          skills: skills || ['Customer Support', 'Communication'],
          availability: availability || 'Flexible Shifts (Evenings & Weekends)',
          city: city || 'Bengaluru'
        };
      }

      return sendJson(res, 201, {
        success: true,
        user: {
          id: userId,
          email: finalEmail,
          name: name.trim(),
          phone: cleanPhone,
          role: role === 'employer' ? 'employer' : 'student',
          createdAt: now,
          profile
        }
      });
    }

    // ------------------------------------------------------------------------
    // AUTHENTICATION: LOGIN (SUPPORT EMAIL OR 10-DIGIT PHONE)
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, identifier, phone, password, role } = body;
      const rawIdentifier = (identifier || email || phone || '').trim();

      if (!rawIdentifier || !password) {
        return sendJson(res, 400, { success: false, error: 'Please enter both your email or phone and password' });
      }

      const cleanPhone = normalizePhone(rawIdentifier);
      const isTenDigitPhone = /^\d{10}$/.test(rawIdentifier) || /^\d{10}$/.test(cleanPhone);

      // Find user by email or phone
      const stmt = db.prepare(`
        SELECT * FROM users 
        WHERE LOWER(email) = LOWER(?) 
           OR phone = ? 
           OR phone = ?
      `);
      const user = stmt.get(rawIdentifier, rawIdentifier, cleanPhone);

      if (!user || !verifyPassword(password, user.password)) {
        return sendJson(res, 401, { success: false, error: 'Invalid credentials. Please check your details and try again.' });
      }

      // Check role authorization if requested role provided
      if (role && role !== user.role) {
        const expectedName = role === 'employer' ? 'Employer' : 'Employee / Job Seeker';
        const actualName = user.role === 'employer' ? 'Employer' : 'Employee / Job Seeker';
        return sendJson(res, 403, {
          success: false,
          error: `This account is registered as an ${actualName}. Please select ${actualName} to sign in.`
        });
      }

      let profile = null;
      if (user.role === 'employer') {
        const empStmt = db.prepare('SELECT * FROM employers WHERE user_id = ?');
        profile = empStmt.get(user.id);
      } else {
        const stuStmt = db.prepare('SELECT * FROM students WHERE user_id = ?');
        const stuRow = stuStmt.get(user.id);
        if (stuRow) {
          profile = {
            ...stuRow,
            skills: stuRow.skills ? JSON.parse(stuRow.skills) : []
          };
        }
      }

      return sendJson(res, 200, {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.created_at,
          profile
        }
      });
    }

    // ------------------------------------------------------------------------
    // AUTHENTICATION: FORGOT PASSWORD
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/forgot-password' && method === 'POST') {
      const body = await parseBody(req);
      const { identifier } = body;
      const rawIdentifier = (identifier || '').trim();

      if (!rawIdentifier) {
        return sendJson(res, 400, { success: false, error: 'Enter your Gmail or phone number' });
      }

      const cleanPhone = normalizePhone(rawIdentifier);

      // Find user
      const user = db.prepare(`
        SELECT * FROM users 
        WHERE LOWER(email) = LOWER(?) 
           OR phone = ? 
           OR phone = ?
      `).get(rawIdentifier, rawIdentifier, cleanPhone);

      if (!user) {
        return sendJson(res, 404, { success: false, error: 'Account not found. Please check your input or create a new account.' });
      }

      // Generate 6-digit recovery code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const resetId = `rst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity

      db.prepare(`
        INSERT INTO password_resets (id, user_id, identifier, code, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).run(resetId, user.id, rawIdentifier, code, expiresAt, new Date().toISOString());

      return sendJson(res, 200, {
        success: true,
        message: 'Reset instructions sent. Please enter the verification code to reset your password.',
        resetCode: code // Exposed for seamless verification during development & demonstration
      });
    }

    // ------------------------------------------------------------------------
    // AUTHENTICATION: RESET PASSWORD
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/reset-password' && method === 'POST') {
      const body = await parseBody(req);
      const { identifier, code, newPassword } = body;
      const rawIdentifier = (identifier || '').trim();
      const rawCode = (code || '').trim();

      if (!rawIdentifier || !rawCode || !newPassword) {
        return sendJson(res, 400, { success: false, error: 'Please provide identifier, verification code, and new password.' });
      }

      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return sendJson(res, 400, { success: false, error: 'New password must be at least 8 characters and contain both letters and numbers' });
      }

      const cleanPhone = normalizePhone(rawIdentifier);

      const resetRecord = db.prepare(`
        SELECT r.*, u.id as user_id 
        FROM password_resets r
        JOIN users u ON r.user_id = u.id
        WHERE r.code = ? 
          AND (LOWER(u.email) = LOWER(?) OR u.phone = ? OR r.identifier = ?)
          AND r.used = 0
        ORDER BY r.created_at DESC LIMIT 1
      `).get(rawCode, rawIdentifier, cleanPhone, rawIdentifier);

      if (!resetRecord) {
        return sendJson(res, 400, { success: false, error: 'Invalid verification code or identifier.' });
      }

      if (new Date(resetRecord.expires_at) < new Date()) {
        return sendJson(res, 400, { success: false, error: 'Verification code has expired. Please request a new one.' });
      }

      // Update password with secure PBKDF2 hash
      const newHash = hashPassword(newPassword);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, resetRecord.user_id);
      db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);

      return sendJson(res, 200, {
        success: true,
        message: 'Password updated successfully. You can now sign in with your new password.'
      });
    }

    // ------------------------------------------------------------------------
    // JOBS: GET ALL REAL JOBS (ONLY THOSE POSTED BY EMPLOYERS)
    // ------------------------------------------------------------------------
    if (pathname === '/api/jobs' && method === 'GET') {
      const employerIdParam = parsedUrl.searchParams.get('employerId');
      const statusParam = parsedUrl.searchParams.get('status');

      let query = `
        SELECT 
          j.*,
          e.business_name,
          e.business_type,
          e.verification_status,
          e.phone AS employer_phone,
          u.name AS employer_name
        FROM jobs j
        JOIN employers e ON j.employer_id = e.id
        JOIN users u ON e.user_id = u.id
      `;
      const conditions = [];
      const params = [];

      if (employerIdParam) {
        conditions.push('(j.employer_id = ? OR e.user_id = ?)');
        params.push(employerIdParam, employerIdParam);
      } else {
        // Only show open jobs on discovery - filled and completed jobs are hidden from anyone else
        conditions.push("j.status = 'open'");
      }

      if (statusParam) {
        conditions.push('j.status = ?');
        params.push(statusParam);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY j.created_at DESC';

      const stmt = db.prepare(query);
      const rows = stmt.all(...params);

      const formatted = rows.map(r => ({
        id: r.id,
        employerId: r.employer_id,
        title: r.title,
        description: r.description,
        fullDescription: r.description,
        shortDescription: r.description.length > 130 ? r.description.slice(0, 130) + '...' : r.description,
        category: r.category,
        salary: r.salary,
        salaryType: r.salary_type,
        date: r.date || 'Flexible',
        startTime: r.start_time || '05:00 PM',
        endTime: r.end_time || '09:00 PM',
        shiftTiming: 'evening',
        durationText: `${r.start_time || '5:00 PM'} - ${r.end_time || '9:00 PM'}`,
        workingHoursText: '4 Hours/Shift',
        address: r.address,
        locality: r.locality || r.address,
        city: r.city || (r.address.includes('Mysuru') ? 'Mysuru' : r.address.includes('Mumbai') ? 'Mumbai' : r.address.includes('Delhi') ? 'Delhi' : r.address.includes('Pune') ? 'Pune' : r.address.includes('Hyderabad') ? 'Hyderabad' : 'Bengaluru'),
        latitude: r.latitude,
        longitude: r.longitude,
        numberOfWorkers: r.number_of_workers,
        status: r.status,
        photoUrl: r.photo_url || '',
        workplacePhotos: r.photo_url ? [r.photo_url] : [],
        responsibilities: r.responsibilities ? JSON.parse(r.responsibilities) : [],
        requiredSkills: r.required_skills ? JSON.parse(r.required_skills) : [],
        postedDate: new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        businessName: r.business_name,
        businessType: r.business_type,
        isVerifiedBusiness: r.verification_status === 'verified',
        isEmergencyPosting: false,
        workType: 'part_time',
        payment: {
          amount: r.salary,
          frequency: r.salary_type === 'hourly' ? 'hourly' : 'daily',
          currency: '₹',
          isNegotiable: false
        },
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return sendJson(res, 200, { success: true, jobs: formatted });
    }

    // ------------------------------------------------------------------------
    // JOBS: CREATE REAL JOB (ASSOCIATED WITH AUTHENTICATED EMPLOYER)
    // ------------------------------------------------------------------------
    if (pathname === '/api/jobs' && method === 'POST') {
      const body = await parseBody(req);
      const {
        employerId,
        title,
        description,
        category,
        salary,
        salaryType,
        date,
        startTime,
        endTime,
        address,
        locality,
        city,
        latitude,
        longitude,
        numberOfWorkers,
        photoUrl,
        responsibilities,
        requiredSkills
      } = body;

      if (!employerId || !title || !description || !salary || !address || latitude == null || longitude == null) {
        return sendJson(res, 400, { success: false, error: 'Missing required job parameters' });
      }

      // Verify employer exists and role is employer
      const empStmt = db.prepare('SELECT id, user_id FROM employers WHERE id = ? OR user_id = ?');
      const emp = empStmt.get(employerId, employerId);
      if (!emp) {
        // Check if the id belongs to a registered student
        const userCheck = db.prepare('SELECT role FROM users WHERE id = ?').get(employerId);
        if (userCheck && userCheck.role === 'student') {
          return sendJson(res, 403, {
            success: false,
            error: 'Access denied: Students cannot post jobs. Only verified employers can post shifts.'
          });
        }
        return sendJson(res, 403, {
          success: false,
          error: 'Access denied: Employer account not found. Only employers can post shifts.'
        });
      }

      // Double-check the user role in the users table
      const userRoleCheck = db.prepare('SELECT role FROM users WHERE id = ?').get(emp.user_id);
      if (userRoleCheck && userRoleCheck.role !== 'employer') {
        return sendJson(res, 403, {
          success: false,
          error: 'Access denied: Students cannot post jobs. Only verified employers can post shifts.'
        });
      }

      const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const jobCity = city || locality || (address.includes('Mysuru') ? 'Mysuru' : address.includes('Mumbai') ? 'Mumbai' : address.includes('Delhi') ? 'Delhi' : address.includes('Pune') ? 'Pune' : address.includes('Hyderabad') ? 'Hyderabad' : 'Bengaluru');

      const insertJobStmt = db.prepare(`
        INSERT INTO jobs (
          id, employer_id, title, description, category, salary, salary_type,
          date, start_time, end_time, address, locality, city, latitude, longitude,
          number_of_workers, status, photo_url, responsibilities, required_skills,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?)
      `);

      insertJobStmt.run(
        jobId,
        emp.id,
        title.trim(),
        description.trim(),
        category || 'retail',
        parseFloat(salary),
        salaryType || 'daily',
        date || '',
        startTime || '',
        endTime || '',
        address.trim(),
        locality ? locality.trim() : address.trim(),
        jobCity.trim(),
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(numberOfWorkers || '1', 10),
        photoUrl || '',
        JSON.stringify(responsibilities || []),
        JSON.stringify(requiredSkills || []),
        now,
        now
      );

      return sendJson(res, 201, {
        success: true,
        jobId,
        message: 'Job successfully published to live platform'
      });
    }

    // ------------------------------------------------------------------------
    // JOBS: DELETE / CLEAR JOB LISTING
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/jobs/') && method === 'DELETE') {
      const parts = pathname.split('/');
      const jobId = parts[3];

      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
      if (!job) {
        return sendJson(res, 404, { success: false, error: 'Job not found' });
      }

      // Check if there are completed shifts associated with this job
      const shiftsCount = db.prepare('SELECT COUNT(*) as count FROM work_shifts WHERE job_id = ?').get(jobId).count;
      const now = new Date().toISOString();

      if (shiftsCount > 0) {
        // Protect historical shift records by archiving / marking cancelled
        db.prepare("UPDATE jobs SET status = 'cancelled', updated_at = ? WHERE id = ?").run(now, jobId);
        db.prepare("UPDATE applications SET status = 'withdrawn', updated_at = ? WHERE job_id = ? AND status NOT IN ('completed')").run(now, jobId);
        return sendJson(res, 200, { success: true, message: 'Job listing cleared and archived' });
      } else {
        // Safe to remove the job record completely
        db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);
        return sendJson(res, 200, { success: true, message: 'Job listing successfully removed' });
      }
    }

    // ------------------------------------------------------------------------
    // JOBS: UPDATE STATUS (CLEAR, CLOSE, OR REOPEN)
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/jobs/') && pathname.endsWith('/status') && method === 'PATCH') {
      const parts = pathname.split('/');
      const jobId = parts[3];
      const body = await parseBody(req);
      const { status } = body;

      if (!['open', 'paused', 'filled', 'completed', 'cancelled'].includes(status)) {
        return sendJson(res, 400, { success: false, error: 'Invalid job status' });
      }

      const now = new Date().toISOString();
      const updateResult = db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run(status, now, jobId);

      if (updateResult.changes === 0) {
        return sendJson(res, 404, { success: false, error: 'Job not found' });
      }

      return sendJson(res, 200, { success: true, message: `Job status updated to ${status}` });
    }

    // ------------------------------------------------------------------------
    // APPLICATIONS: GET APPLICATIONS
    // ------------------------------------------------------------------------
    if (pathname === '/api/applications' && method === 'GET') {
      const studentId = parsedUrl.searchParams.get('studentId');
      const employerId = parsedUrl.searchParams.get('employerId');
      const jobId = parsedUrl.searchParams.get('jobId');

      let query = `
        SELECT 
          a.*,
          j.title AS job_title,
          j.salary AS job_salary,
          j.salary_type AS job_salary_type,
          j.address AS job_address,
          j.category AS job_category,
          e.business_name,
          e.phone AS employer_phone,
          s.college AS student_college,
          s.skills AS student_skills,
          s.availability AS student_availability,
          u.name AS student_name,
          u.email AS student_email,
          u.phone AS student_phone
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN employers e ON a.employer_id = e.id
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
      `;
      const conditions = [];
      const params = [];

      if (studentId) {
        conditions.push('(a.student_id = ? OR s.user_id = ?)');
        params.push(studentId, studentId);
      }
      if (employerId) {
        conditions.push('(a.employer_id = ? OR e.user_id = ?)');
        params.push(employerId, employerId);
      }
      if (jobId) {
        conditions.push('a.job_id = ?');
        params.push(jobId);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY a.created_at DESC';

      const stmt = db.prepare(query);
      const rows = stmt.all(...params);

      const formatted = rows.map(r => ({
        id: r.id,
        jobId: r.job_id,
        studentId: r.student_id,
        employerId: r.employer_id,
        message: r.message,
        status: r.status,
        jobTitle: r.job_title,
        jobSalary: r.job_salary,
        businessName: r.business_name,
        applicantName: r.student_name,
        applicantEmail: r.student_email,
        applicantPhone: r.student_phone,
        applicantCollege: r.student_college,
        applicantSkills: r.student_skills ? JSON.parse(r.student_skills) : [],
        appliedAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return sendJson(res, 200, { success: true, applications: formatted });
    }

    // ------------------------------------------------------------------------
    // APPLICATIONS: SUBMIT NEW APPLICATION
    // ------------------------------------------------------------------------
    if (pathname === '/api/applications' && method === 'POST') {
      const body = await parseBody(req);
      const { jobId, studentId, message } = body;

      if (!jobId || !studentId) {
        return sendJson(res, 400, { success: false, error: 'Job ID and Student ID are required' });
      }

      // Check job
      const jobStmt = db.prepare('SELECT id, employer_id FROM jobs WHERE id = ?');
      const job = jobStmt.get(jobId);
      if (!job) {
        return sendJson(res, 404, { success: false, error: 'Job not found' });
      }

      // Check student
      const stuStmt = db.prepare('SELECT id FROM students WHERE id = ? OR user_id = ?');
      const student = stuStmt.get(studentId, studentId);
      if (!student) {
        return sendJson(res, 404, { success: false, error: 'Student profile not found' });
      }

      // Check existing application
      const checkAppStmt = db.prepare('SELECT id FROM applications WHERE job_id = ? AND student_id = ?');
      const existing = checkAppStmt.get(jobId, student.id);
      if (existing) {
        return sendJson(res, 409, { success: false, error: 'You have already applied for this job' });
      }

      const appId = `app_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO applications (id, job_id, student_id, employer_id, message, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `);
      insertStmt.run(appId, jobId, student.id, job.employer_id, message || '', now, now);

      return sendJson(res, 201, { success: true, applicationId: appId, message: 'Application submitted successfully' });
    }

    // ------------------------------------------------------------------------
    // APPLICATIONS: UPDATE STATUS (ACCEPT / REJECT)
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/applications/') && pathname.endsWith('/status') && method === 'PATCH') {
      const parts = pathname.split('/');
      const appId = parts[3];
      const body = await parseBody(req);
      const { status } = body;

      if (!['pending', 'accepted', 'rejected', 'withdrawn', 'completed'].includes(status)) {
        return sendJson(res, 400, { success: false, error: 'Invalid application status' });
      }

      const now = new Date().toISOString();

      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId);
      if (!app) {
        return sendJson(res, 404, { success: false, error: 'Application not found' });
      }

      // Update application status
      const updateStmt = db.prepare(`
        UPDATE applications
        SET status = ?, updated_at = ?
        WHERE id = ?
      `);
      updateStmt.run(status, now, appId);

      // Lifecycle update on jobs table:
      // "if someone accepts that work , i want that not to appear to anyone else"
      if (status === 'accepted') {
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(app.job_id);
        if (job) {
          const workersNeeded = job.number_of_workers || 1;
          const acceptedRow = db.prepare(
            "SELECT COUNT(*) as count FROM applications WHERE job_id = ? AND status IN ('accepted', 'completed')"
          ).get(app.job_id);
          const acceptedCount = acceptedRow ? acceptedRow.count : 0;

          if (acceptedCount >= workersNeeded) {
            // Mark job as filled so it immediately stops appearing to anyone else
            db.prepare("UPDATE jobs SET status = 'filled', updated_at = ? WHERE id = ?").run(now, app.job_id);

            // Automatically reject remaining pending applications with note
            db.prepare(
              "UPDATE applications SET status = 'rejected', message = 'Position filled by another applicant', updated_at = ? WHERE job_id = ? AND id != ? AND status = 'pending'"
            ).run(now, app.job_id, appId);
          }
        }
      } else if (status === 'rejected' || status === 'withdrawn') {
        // If an accepted application was cancelled/rejected, reopen job if slots became available
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(app.job_id);
        if (job && job.status === 'filled') {
          const acceptedRow = db.prepare(
            "SELECT COUNT(*) as count FROM applications WHERE job_id = ? AND status IN ('accepted', 'completed')"
          ).get(app.job_id);
          const acceptedCount = acceptedRow ? acceptedRow.count : 0;
          if (acceptedCount < (job.number_of_workers || 1)) {
            db.prepare("UPDATE jobs SET status = 'open', updated_at = ? WHERE id = ?").run(now, app.job_id);
          }
        }
      } else if (status === 'completed') {
        // "if the job is completed , clear that"
        db.prepare("UPDATE jobs SET status = 'completed', updated_at = ? WHERE id = ?").run(now, app.job_id);
      }

      return sendJson(res, 200, { success: true, message: `Application status updated to ${status}` });
    }

    // ------------------------------------------------------------------------
    // WORK SHIFTS: COMPLETE SHIFT & PAY
    // ------------------------------------------------------------------------
    if (pathname === '/api/shifts/complete' && method === 'POST') {
      const body = await parseBody(req);
      const { applicationId } = body;

      if (!applicationId) {
        return sendJson(res, 400, { success: false, error: 'Application ID is required' });
      }

      const appStmt = db.prepare(`
        SELECT a.*, j.salary, j.start_time, j.end_time
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
      `);
      const app = appStmt.get(applicationId);
      if (!app) {
        return sendJson(res, 404, { success: false, error: 'Application not found' });
      }

      const shiftId = `shift_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();

      // Insert work shift
      const insertShiftStmt = db.prepare(`
        INSERT INTO work_shifts (id, job_id, student_id, employer_id, start_time, end_time, amount, status, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)
      `);
      insertShiftStmt.run(
        shiftId,
        app.job_id,
        app.student_id,
        app.employer_id,
        app.start_time || '05:00 PM',
        app.end_time || '09:00 PM',
        app.salary,
        now
      );

      // Update application
      const updateAppStmt = db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?');
      updateAppStmt.run('completed', now, applicationId);

      // "if the job is completed , clear that"
      // Update job status to completed so it is cleared from active listings
      db.prepare("UPDATE jobs SET status = 'completed', updated_at = ? WHERE id = ?").run(now, app.job_id);

      return sendJson(res, 201, {
        success: true,
        shiftId,
        amount: app.salary,
        payoutAmount: app.salary,
        message: 'Shift successfully marked as completed and paid'
      });
    }

    // ------------------------------------------------------------------------
    // WORK SHIFTS: GET SHIFTS
    // ------------------------------------------------------------------------
    if (pathname === '/api/shifts' && method === 'GET') {
      const studentId = parsedUrl.searchParams.get('studentId');
      const employerId = parsedUrl.searchParams.get('employerId');

      let query = `
        SELECT 
          ws.*,
          j.title AS job_title,
          e.business_name,
          u.name AS student_name
        FROM work_shifts ws
        JOIN jobs j ON ws.job_id = j.id
        JOIN employers e ON ws.employer_id = e.id
        JOIN students s ON ws.student_id = s.id
        JOIN users u ON s.user_id = u.id
      `;
      const conditions = [];
      const params = [];

      if (studentId) {
        conditions.push('(ws.student_id = ? OR s.user_id = ?)');
        params.push(studentId, studentId);
      }
      if (employerId) {
        conditions.push('(ws.employer_id = ? OR e.user_id = ?)');
        params.push(employerId, employerId);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY ws.completed_at DESC';

      const stmt = db.prepare(query);
      const rows = stmt.all(...params);

      return sendJson(res, 200, { success: true, shifts: rows });
    }

    // ------------------------------------------------------------------------
    // DASHBOARD: EMPLOYER REAL METRICS (STRICT ZERO DEFAULTS)
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/dashboard/employer/') && method === 'GET') {
      const identifier = pathname.split('/')[4];

      // Resolve employer id
      const empStmt = db.prepare('SELECT id, business_name FROM employers WHERE id = ? OR user_id = ?');
      const employer = empStmt.get(identifier, identifier);

      if (!employer) {
        return sendJson(res, 200, {
          success: true,
          metrics: {
            activePostings: 0,
            pendingApplications: 0,
            acceptedWorkers: 0,
            completedGigs: 0
          },
          jobs: [],
          applications: [],
          shifts: []
        });
      }

      // Real active postings count
      const activePostingsStmt = db.prepare("SELECT COUNT(*) AS count FROM jobs WHERE employer_id = ? AND status = 'open'");
      const activePostings = activePostingsStmt.get(employer.id).count;

      // Real pending applications count
      const pendingAppsStmt = db.prepare("SELECT COUNT(*) AS count FROM applications WHERE employer_id = ? AND status = 'pending'");
      const pendingApplications = pendingAppsStmt.get(employer.id).count;

      // Real accepted workers count
      const acceptedWorkersStmt = db.prepare("SELECT COUNT(*) AS count FROM applications WHERE employer_id = ? AND status = 'accepted'");
      const acceptedWorkers = acceptedWorkersStmt.get(employer.id).count;

      // Real completed gigs count
      const completedGigsStmt = db.prepare("SELECT COUNT(*) AS count FROM work_shifts WHERE employer_id = ?");
      const completedGigs = completedGigsStmt.get(employer.id).count;

      return sendJson(res, 200, {
        success: true,
        metrics: {
          activePostings,
          pendingApplications,
          acceptedWorkers,
          completedGigs
        }
      });
    }

    // ------------------------------------------------------------------------
    // DASHBOARD: STUDENT REAL METRICS (STRICT ZERO DEFAULTS)
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/dashboard/student/') && method === 'GET') {
      const identifier = pathname.split('/')[4];

      const stuStmt = db.prepare('SELECT id FROM students WHERE id = ? OR user_id = ?');
      const student = stuStmt.get(identifier, identifier);

      if (!student) {
        return sendJson(res, 200, {
          success: true,
          metrics: {
            totalEarnings: 0,
            completedShifts: 0,
            activeApplications: 0
          }
        });
      }

      const earningsStmt = db.prepare('SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM work_shifts WHERE student_id = ?');
      const earningsRow = earningsStmt.get(student.id);

      const activeAppsStmt = db.prepare("SELECT COUNT(*) AS count FROM applications WHERE student_id = ? AND status IN ('pending', 'accepted')");
      const activeAppsRow = activeAppsStmt.get(student.id);

      return sendJson(res, 200, {
        success: true,
        metrics: {
          totalEarnings: earningsRow.total,
          completedShifts: earningsRow.count,
          activeApplications: activeAppsRow.count
        }
      });
    }

    // Route not matched
    return sendJson(res, 404, { success: false, error: `Endpoint not found: ${method} ${pathname}` });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
  }
}
