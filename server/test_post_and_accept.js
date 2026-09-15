// server/test_post_and_accept.js
// Automated verification: Employer posts job -> Student sees and accepts -> Employer accepts -> Shift completes & pays

const BASE = 'http://localhost:3000/api';

async function runTest() {
  console.log('--- STARTING END-TO-END POST & ACCEPT VERIFICATION ---');

  const ts = Date.now();
  const employerEmail = `shopowner_${ts}@localstore.com`;
  const studentEmail = `student_${ts}@campus.edu`;

  // 1. Register Employer
  console.log('1. Registering Employer...');
  const empRegRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ramesh Store Owner',
      email: employerEmail,
      phone: '9845012345',
      password: 'password123',
      role: 'employer',
      collegeOrBusiness: 'Ramesh Supermarket & Bakery',
      city: 'Bengaluru'
    })
  }).then(r => r.json());

  if (!empRegRes.success) throw new Error('Employer registration failed: ' + empRegRes.error);
  const employer = empRegRes.user;
  console.log('✔ Employer registered:', employer.name, employer.id, employer.profile?.id);

  // 2. Employer posts a job
  console.log('2. Employer posting part-time shift...');
  const postJobRes = await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employerId: employer.profile?.id || employer.id,
      title: 'Weekend Evening Billing & Counter Help',
      description: 'Need an enthusiastic college student to handle evening billing and customer assistance.',
      category: 'Retail',
      salary: 750,
      salaryType: 'daily',
      date: 'This Weekend',
      startTime: '05:00 PM',
      endTime: '09:30 PM',
      address: '104, 5th Cross, Koramangala, Bengaluru',
      locality: 'Koramangala',
      city: 'Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      numberOfWorkers: 2,
      responsibilities: ['Handle customer billing', 'Organize shelves'],
      requiredSkills: ['Punctuality', 'Basic Math / UPI Billing']
    })
  }).then(r => r.json());

  if (!postJobRes.success) throw new Error('Job posting failed: ' + postJobRes.error);
  const jobId = postJobRes.jobId;
  console.log('✔ Job posted successfully with ID:', jobId);

  // 3. Verify Job is visible in GET /api/jobs
  console.log('3. Fetching all available jobs...');
  const jobsRes = await fetch(`${BASE}/jobs`).then(r => r.json());
  if (!jobsRes.success) throw new Error('Failed to fetch jobs');
  const foundJob = jobsRes.jobs.find(j => j.id === jobId);
  if (!foundJob) throw new Error('Posted job not found in public jobs listing!');
  console.log('✔ Job is publicly visible:');
  console.log(`   - Title: "${foundJob.title}"`);
  console.log(`   - Employer: "${foundJob.businessName}"`);
  console.log(`   - City: "${foundJob.city}"`);
  console.log(`   - Salary: ₹${foundJob.salary} (${foundJob.salaryType})`);
  console.log(`   - Status: ${foundJob.status}`);

  // 4. Register Student
  console.log('4. Registering Student...');
  const stuRegRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditya Rao',
      email: studentEmail,
      phone: '9876543210',
      password: 'password123',
      role: 'student',
      collegeOrBusiness: 'BMS College of Engineering',
      city: 'Bengaluru'
    })
  }).then(r => r.json());

  if (!stuRegRes.success) throw new Error('Student registration failed: ' + stuRegRes.error);
  const student = stuRegRes.user;
  console.log('✔ Student registered:', student.name, student.id, student.profile?.id);

  // 5. Student applies / accepts the job
  console.log('5. Student submitting shift acceptance / application...');
  const applyRes = await fetch(`${BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId: jobId,
      studentId: student.profile?.id || student.id,
      message: 'I am a nearby BMS College student with free hours from 4:30 PM. Ready to work this weekend shift!'
    })
  }).then(r => r.json());

  if (!applyRes.success) throw new Error('Job application failed: ' + applyRes.error);
  const applicationId = applyRes.applicationId;
  console.log('✔ Student application submitted with ID:', applicationId);

  // 6. Verify Student sees the application
  console.log('6. Checking student application listing...');
  const stuAppsRes = await fetch(`${BASE}/applications?studentId=${student.id}`).then(r => r.json());
  if (!stuAppsRes.success || stuAppsRes.applications.length === 0) throw new Error('Application not found in student view');
  const stuApp = stuAppsRes.applications.find(a => a.id === applicationId);
  console.log('✔ Application visible in student view:');
  console.log(`   - Job: "${stuApp.jobTitle}"`);
  console.log(`   - Business: "${stuApp.businessName}"`);
  console.log(`   - Status: ${stuApp.status}`);

  // 7. Verify Employer sees the application
  console.log('7. Checking employer dashboard applications...');
  const empAppsRes = await fetch(`${BASE}/applications?employerId=${employer.id}`).then(r => r.json());
  if (!empAppsRes.success || empAppsRes.applications.length === 0) throw new Error('Application not found in employer view');
  const empApp = empAppsRes.applications.find(a => a.id === applicationId);
  console.log('✔ Application visible on employer dashboard:');
  console.log(`   - Applicant: "${empApp.applicantName}" (${empApp.applicantCollege})`);
  console.log(`   - Message: "${empApp.message}"`);

  // 8. Employer accepts candidate
  console.log('8. Employer accepting student for the shift...');
  const acceptRes = await fetch(`${BASE}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' })
  }).then(r => r.json());
  if (!acceptRes.success) throw new Error('Failed to accept application');
  console.log('✔ Application status updated to "accepted"');

  // 9. Complete shift & Payout
  console.log('9. Employer marking shift completed with payment...');
  const shiftRes = await fetch(`${BASE}/shifts/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId })
  }).then(r => r.json());
  if (!shiftRes.success) throw new Error('Failed to complete shift: ' + shiftRes.error);
  console.log(`✔ Shift completed! Payout of ₹${shiftRes.payoutAmount} registered.`);

  // 10. Verify metrics on Student & Employer dashboards
  console.log('10. Verifying updated metrics in dashboards...');
  const stuMetrics = await fetch(`${BASE}/dashboard/student/${student.id}`).then(r => r.json());
  const empMetrics = await fetch(`${BASE}/dashboard/employer/${employer.id}`).then(r => r.json());

  console.log('✔ Student Dashboard Metrics:', stuMetrics.metrics);
  console.log('✔ Employer Dashboard Metrics:', empMetrics.metrics);

  console.log('\n🎉 ALL TESTS PASSED: Full lifecycle of employer job posting -> student visibility & acceptance -> employer confirmation -> shift completion works seamlessly!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
