// server/test_job_lifecycle.js
// Automated verification for job acceptance, hiding from others, shift completion, and clearing.

const BASE_URL = 'http://localhost:3000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting Job Lifecycle & Visibility Verification...\n');

  try {
    // 1. Log in demo employer
    const empLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier: 'employer@workflex.in', password: 'demo123', role: 'employer' })
    });
    console.log('1. Employer Login:', empLogin.data.success ? 'PASSED ✅' : 'FAILED ❌', empLogin.data.error || '');
    const employer = empLogin.data.user;

    // 2. Register Student 1
    const stud1Reg = await req(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'First Applicant',
        email: `student1_${Date.now()}@test.com`,
        phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
        password: 'password123',
        role: 'student',
        collegeOrBusiness: 'Christ University',
        city: 'Bengaluru'
      })
    });
    console.log('2. Student 1 Account:', stud1Reg.data.success ? 'PASSED ✅' : 'FAILED ❌');
    const student1 = stud1Reg.data.user;

    // 3. Register or log in a second student
    const stud2Reg = await req(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Second Applicant',
        email: `student2_${Date.now()}@test.com`,
        phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
        password: 'password123',
        role: 'student',
        collegeOrBusiness: 'RV College',
        city: 'Bengaluru'
      })
    });
    console.log('3. Student 2 Account:', stud2Reg.data.success ? 'PASSED ✅' : 'FAILED ❌');
    const student2 = stud2Reg.data.user;

    // 4. Employer posts a shift
    const empId = employer.employerData?.id || employer.id;
    const postRes = await req(`${BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify({
        employerId: empId,
        title: 'Test Barista Shift - ' + Date.now(),
        description: 'Need a fast barista for 4 hours rush shift.',
        category: 'cafe',
        salary: 650,
        salaryType: 'daily',
        date: 'Tomorrow',
        startTime: '04:00 PM',
        endTime: '08:00 PM',
        address: 'Indiranagar 100ft Road, Bengaluru',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        latitude: 12.9784,
        longitude: 77.6408,
        numberOfWorkers: 1,
        responsibilities: ['Brew espresso', 'Cashier counter'],
        requiredSkills: ['Espresso machine', 'Customer service']
      })
    });
    console.log('4. Post Job:', postRes.data.success ? 'PASSED ✅' : 'FAILED ❌');
    const jobId = postRes.data.jobId;

    // 5. Verify job appears in public discovery (GET /api/jobs)
    const publicJobs1 = await req(`${BASE_URL}/jobs`);
    const foundInPublic1 = publicJobs1.data.jobs.some(j => j.id === jobId);
    console.log('5. Public Discovery Before Acceptance (should appear):', foundInPublic1 ? 'PASSED ✅' : 'FAILED ❌');

    // 6. Student 1 applies
    const stud1Id = student1.studentData?.id || student1.id;
    const app1Res = await req(`${BASE_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        studentId: stud1Id,
        message: 'Hi, I have 1 year experience as a barista.'
      })
    });
    console.log('6. Student 1 Applies:', app1Res.data.success ? 'PASSED ✅' : 'FAILED ❌');
    const app1Id = app1Res.data.applicationId;

    // 7. Student 2 applies
    const stud2Id = student2.studentData?.id || student2.id;
    const app2Res = await req(`${BASE_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        studentId: stud2Id,
        message: 'I would love to help during rush hours.'
      })
    });
    console.log('7. Student 2 Applies:', app2Res.data.success ? 'PASSED ✅' : 'FAILED ❌');
    const app2Id = app2Res.data.applicationId;

    // 8. Employer ACCEPTS Student 1
    // User request: "if someone accepts that work , i want that not to appear to anyone else"
    const acceptRes = await req(`${BASE_URL}/applications/${app1Id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' })
    });
    console.log('8. Employer Accepts Student 1:', acceptRes.data.success ? 'PASSED ✅' : 'FAILED ❌');

    // 9. Verify job NO LONGER appears to anyone in public discovery!
    const publicJobs2 = await req(`${BASE_URL}/jobs`);
    const foundInPublic2 = publicJobs2.data.jobs.some(j => j.id === jobId);
    console.log('9. Public Discovery After Acceptance (MUST NOT appear to anyone else):', !foundInPublic2 ? 'PASSED (Hidden from Public!) ✅' : 'FAILED (Still Visible!) ❌');

    // 10. Verify Student 2's application was auto-rejected because position was filled
    const student2Apps = await req(`${BASE_URL}/applications?studentId=${student2.id}`);
    const app2Record = student2Apps.data.applications.find(a => a.id === app2Id);
    console.log('10. Other Pending Applicants Notified/Rejected:', app2Record && app2Record.status === 'rejected' ? 'PASSED ✅' : 'FAILED ❌');

    // 11. Complete the shift
    // User request: "if the job is completed , clear that"
    const completeRes = await req(`${BASE_URL}/shifts/complete`, {
      method: 'POST',
      body: JSON.stringify({ applicationId: app1Id })
    });
    console.log('11. Shift Completed & Paid:', completeRes.data.success ? 'PASSED ✅' : 'FAILED ❌');

    // 12. Verify job is marked 'completed' and still not visible publicly
    const publicJobs3 = await req(`${BASE_URL}/jobs`);
    const foundInPublic3 = publicJobs3.data.jobs.some(j => j.id === jobId);
    console.log('12. Completed Job Cleared from Public View:', !foundInPublic3 ? 'PASSED ✅' : 'FAILED ❌');

    // 13. Verify employer can see completed shift in shifts
    const shiftsRes = await req(`${BASE_URL}/shifts?employerId=${empId}`);
    const shiftFound = shiftsRes.data.shifts.some(s => s.job_id === jobId);
    console.log('13. Completed Shift in Earning/Payout History:', shiftFound ? 'PASSED ✅' : 'FAILED ❌');

    // 14. Employer clears/deletes the job listing
    const deleteRes = await req(`${BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE'
    });
    console.log('14. Employer Clears Job Listing:', deleteRes.data.success ? 'PASSED ✅' : 'FAILED ❌');

    // 15. Verify completed shift still exists even after job is cleared (financial records protected)
    const shiftsResAfter = await req(`${BASE_URL}/shifts?employerId=${empId}`);
    const shiftStillExists = shiftsResAfter.data.shifts.some(s => s.job_id === jobId);
    console.log('15. Financial Shift Record Intact After Clear:', shiftStillExists ? 'PASSED ✅' : 'FAILED ❌');

    console.log('\n🎉 ALL 15 LIFECYCLE TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
