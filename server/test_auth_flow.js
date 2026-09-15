// server/test_auth_flow.js
import http from 'node:http';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTHENTICATION VERIFICATION TESTS ---');

  // Test 1: Email Login
  console.log('Test 1: Email login (student@workflex.in)');
  const res1 = await post('/api/auth/login', { identifier: 'student@workflex.in', password: 'demo123Password1' });
  console.log('Result 1:', res1.status, res1.data.success, res1.data.user?.role, res1.data.user?.name);
  if (!res1.data.success) throw new Error('Test 1 failed');

  // Test 2: 10-digit Phone Login
  console.log('Test 2: 10-digit Phone login (9876543210)');
  const res2 = await post('/api/auth/login', { identifier: '9876543210', password: 'demo123Password1' });
  console.log('Result 2:', res2.status, res2.data.success, res2.data.user?.role, res2.data.user?.phone);
  if (!res2.data.success) throw new Error('Test 2 failed');

  // Test 3: Employer 10-digit Phone Login
  console.log('Test 3: Employer phone login (9845012389)');
  const res3 = await post('/api/auth/login', { identifier: '9845012389', password: 'demo123', role: 'employer' });
  console.log('Result 3:', res3.status, res3.data.success, res3.data.user?.role, res3.data.user?.name);
  if (!res3.data.success) throw new Error('Test 3 failed');

  // Test 4: Role Mismatch Prevention
  console.log('Test 4: Role mismatch prevention (student logging in with employer role)');
  const res4 = await post('/api/auth/login', { identifier: 'student@workflex.in', password: 'demo123Password1', role: 'employer' });
  console.log('Result 4 (Expected 403):', res4.status, res4.data.error);
  if (res4.status !== 403) throw new Error('Test 4 failed to reject role mismatch');

  // Test 5: Registration with 10-digit Phone
  const testPhone = '9123456789';
  console.log('Test 5: Registration with 10-digit phone (' + testPhone + ')');
  const res5 = await post('/api/auth/register', {
    name: 'Aarav Patel',
    phone: testPhone,
    password: 'SecurePassword1',
    role: 'student',
    city: 'Bengaluru',
  });
  console.log('Result 5:', res5.status, res5.data.success, res5.data.user?.name, res5.data.user?.phone);
  if (!res5.data.success && !res5.data.error?.includes('already exists')) throw new Error('Test 5 failed');

  // Test 6: Invalid Phone Rejection (9 digits)
  console.log('Test 6: Invalid phone rejection (9 digits: 987654321)');
  const res6 = await post('/api/auth/register', {
    name: 'Invalid Phone User',
    phone: '987654321',
    password: 'SecurePassword1',
    role: 'student',
  });
  console.log('Result 6 (Expected 400):', res6.status, res6.data.error);
  if (res6.status !== 400) throw new Error('Test 6 failed to reject invalid phone');

  // Test 7: Forgot Password Recovery Code Generation
  console.log('Test 7: Forgot password recovery for 9876543210');
  const res7 = await post('/api/auth/forgot-password', { identifier: '9876543210' });
  console.log('Result 7:', res7.status, res7.data.success, 'Reset Code:', res7.data.resetCode);
  if (!res7.data.success || !res7.data.resetCode) throw new Error('Test 7 failed');

  // Test 8: Reset Password with Code
  console.log('Test 8: Reset password with code');
  const res8 = await post('/api/auth/reset-password', {
    identifier: '9876543210',
    code: res7.data.resetCode,
    newPassword: 'NewDemoPassword99',
  });
  console.log('Result 8:', res8.status, res8.data.success, res8.data.message);
  if (!res8.data.success) throw new Error('Test 8 failed');

  // Test 9: Verify Login with New Password
  console.log('Test 9: Verify login with new password');
  const res9 = await post('/api/auth/login', { identifier: '9876543210', password: 'NewDemoPassword99' });
  console.log('Result 9:', res9.status, res9.data.success, res9.data.user?.name);
  if (!res9.data.success) throw new Error('Test 9 failed');

  // Restore demo password
  const resRestore = await post('/api/auth/forgot-password', { identifier: '9876543210' });
  await post('/api/auth/reset-password', {
    identifier: '9876543210',
    code: resRestore.data.resetCode,
    newPassword: 'demo123Password1',
  });
  console.log('--- ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
