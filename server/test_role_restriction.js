// Automated test verifying role permissions:
// 1. Students cannot post jobs (403 Forbidden)
// 2. Employers can post jobs
// 3. Students can view and apply for employer-posted jobs

import http from 'http';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('--- Testing Role Enforcement: Students Cannot Post Jobs ---');

  // 1. Register a student
  const studentEmail = `student_${Date.now()}@college.edu`;
  const stuReg = await request('POST', '/api/auth/register', {
    name: 'Aarav Student',
    email: studentEmail,
    password: 'password123',
    role: 'student',
    collegeOrBusiness: 'RV College of Engineering',
    city: 'Bengaluru',
  });
  console.log('1. Student Registered:', stuReg.status, stuReg.body.user?.name);
  const studentUser = stuReg.body.user;

  // 2. Register an employer
  const empEmail = `owner_${Date.now()}@store.com`;
  const empReg = await request('POST', '/api/auth/register', {
    name: 'Ramesh Store Owner',
    email: empEmail,
    password: 'password123',
    role: 'employer',
    collegeOrBusiness: 'Ramesh Provision & Organics',
    city: 'Bengaluru',
  });
  console.log('2. Employer Registered:', empReg.status, empReg.body.user?.name);
  const employerUser = empReg.body.user;

  // 3. Test: Student attempts to post a job -> MUST FAIL with 403
  const studentPostAttempt = await request('POST', '/api/jobs', {
    employerId: studentUser.id,
    title: 'Illegal Student Posted Job',
    description: 'Students should not be allowed to post jobs',
    category: 'Retail',
    salary: 750,
    salaryType: 'daily',
    address: 'Indiranagar 100ft Road',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.6412,
  });

  console.log('3. Student Post Attempt Status:', studentPostAttempt.status);
  console.log('   Response Error:', studentPostAttempt.body.error);
  if (studentPostAttempt.status === 403) {
    console.log('   >>> SUCCESS: Student was blocked with 403 Forbidden as required!');
  } else {
    console.error('   >>> FAILED: Student was not blocked with 403!');
    process.exit(1);
  }

  // 4. Test: Employer posts a job -> MUST SUCCEED
  const employerPostAttempt = await request('POST', '/api/jobs', {
    employerId: employerUser.profile?.id || employerUser.id,
    title: 'Weekend Cashier & Helper',
    description: 'Assist with evening rush and counter billing.',
    category: 'Retail',
    salary: 700,
    salaryType: 'daily',
    address: 'Indiranagar 12th Main, Bengaluru',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.6412,
  });

  console.log('4. Employer Post Attempt Status:', employerPostAttempt.status);
  if (employerPostAttempt.status === 201) {
    console.log('   >>> SUCCESS: Employer successfully posted job ID:', employerPostAttempt.body.jobId);
  } else {
    console.error('   >>> FAILED: Employer could not post job:', employerPostAttempt.body);
    process.exit(1);
  }

  const createdJobId = employerPostAttempt.body.jobId;

  // 5. Test: Student applies for the job -> MUST SUCCEED
  const studentApplyAttempt = await request('POST', '/api/applications', {
    jobId: createdJobId,
    studentId: studentUser.profile?.id || studentUser.id,
    message: 'Available this weekend for the shift.',
  });

  console.log('5. Student Apply Status:', studentApplyAttempt.status);
  if (studentApplyAttempt.status === 201) {
    console.log('   >>> SUCCESS: Student successfully applied to the employer shift!');
  } else {
    console.error('   >>> FAILED: Student could not apply:', studentApplyAttempt.body);
    process.exit(1);
  }

  console.log('\nAll role restriction tests PASSED successfully!');
}

runTest().catch(console.error);
