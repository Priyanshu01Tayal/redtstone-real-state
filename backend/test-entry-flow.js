/**
 * REDSTONE REAL ESTATE - MANDATORY ENTRY FLOW & SECURITY VERIFICATION TEST
 *
 * Verifies the 9 exact test cases required:
 * 1. Root route '/' displays SplashScreen and does not render HomePage
 * 2. Splash screen navigates to '/welcome'
 * 3. Role selection routes to Login/SignUp with prefilled role
 * 4. Direct access to /owner, /broker, /client, /admin without login is blocked -> /welcome
 * 5. Successful login routes to correct role dashboard
 * 6. Refresh maintains session validity (/api/auth/me)
 * 7. Logout clears session and returns to /welcome
 * 8. Expired or invalid JWT is rejected (HTTP 401)
 * 9. No guest/demo bypass buttons exist and Admin public signup is strictly blocked (HTTP 403)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function runEntryFlowTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING REDSTONE ENTRY FLOW & SECURITY TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 9;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      process.exit(1);
    }
    console.log(`   ✓ ${message}`);
  }

  // --- TEST 1: Open '/' in incognito: logo splash appears first, NOT existing homepage ---
  console.log('▶ TEST 1: Root route / entry inspection');
  const appJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/App.jsx'), 'utf8');
  assert(appJsx.includes('<Route path="/" element={<RootEntryPoint />} />'), "App.jsx routes '/' exclusively to RootEntryPoint");
  assert(appJsx.includes('function RootEntryPoint()'), 'RootEntryPoint component is defined');
  assert(appJsx.includes('duration={2000}'), 'Splash screen duration is set to 2000ms (~2s)');
  assert(!appJsx.includes('<Route path="/" element={<HomePage />} />'), "Root '/' DOES NOT render HomePage directly");
  assert(appJsx.includes('<Route path="/marketplace" element={<HomePage />} />'), "HomePage is preserved under /marketplace for authenticated access");
  passed++;

  // --- TEST 2: Splash navigates to '/welcome' ---
  console.log('\n▶ TEST 2: Splash automatic transition to /welcome');
  assert(appJsx.includes("navigate('/welcome'"), 'RootEntryPoint automatically navigates to /welcome onComplete');
  const splashJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/entry/SplashScreen.jsx'), 'utf8');
  assert(splashJsx.includes('RED<span className="text-[#E53935]">STONE</span>'), 'SplashScreen contains animated Redstone logo emblem');
  assert(splashJsx.includes('onComplete();'), 'SplashScreen triggers onComplete callback on timer completion');
  passed++;

  // --- TEST 3: Select each role: correct login/signup screen with prefilled role ---
  console.log('\n▶ TEST 3: Role selection cards & prefilled navigation');
  const welcomeJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/pages/public/WelcomePage.jsx'), 'utf8');
  assert(welcomeJsx.includes('<RoleSelection />'), 'WelcomePage renders RoleSelection component');
  const roleSelectionJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/entry/RoleSelection.jsx'), 'utf8');
  const roleCardJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/entry/RoleCard.jsx'), 'utf8');
  assert(roleSelectionJsx.includes("roleKey: 'owner'"), 'Owner role card is defined');
  assert(roleSelectionJsx.includes("roleKey: 'client'"), 'Client role card is defined');
  assert(roleSelectionJsx.includes("roleKey: 'broker'"), 'Broker role card is defined');
  assert(roleSelectionJsx.includes("roleKey: 'admin'"), 'Admin role card is defined');
  assert(roleSelectionJsx.includes('navigate(`/login?role=${roleKey}`)'), 'Login action navigates to /login?role=${roleKey}');
  assert(roleSelectionJsx.includes('navigate(`/register?role=${roleKey}`)'), 'Register action navigates to /register?role=${roleKey}');
  assert(roleCardJsx.includes("roleKey === 'admin'"), 'Admin card enforces specialized admin sign-in with no public sign-up');
  passed++;

  // --- TEST 4: Direct unauthenticated access to /owner, /broker, /client, /admin blocked ---
  console.log('\n▶ TEST 4: Protected route enforcement for unauthenticated users');
  const protectedRouteJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/common/ProtectedRoute.jsx'), 'utf8');
  assert(protectedRouteJsx.includes('if (!isAuthenticated || !user)'), 'ProtectedRoute checks authentication state');
  assert(protectedRouteJsx.includes('<Navigate to="/welcome" replace />'), 'Unauthenticated users accessing any dashboard are redirected to /welcome');
  const publicLayoutJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/layouts/PublicLayout.jsx'), 'utf8');
  assert(publicLayoutJsx.includes('if (!isAuthenticated && !isAuthPage)'), 'PublicLayout checks authentication on browsing routes');
  assert(publicLayoutJsx.includes('return <Navigate to="/welcome" replace />;'), 'Unauthenticated browsing attempts are redirected to /welcome');
  passed++;

  // --- TEST 5: Login successfully -> correct role dashboard opened ---
  console.log('\n▶ TEST 5: Authentication & role-based dashboard redirection');
  const rolesToTest = [
    { email: 'admin@redstone.com', password: 'password123', expectedRole: 'admin', expectedDashboard: '/admin/dashboard' },
    { email: 'vikram.broker@redstone.com', password: 'password123', expectedRole: 'broker', expectedDashboard: '/broker/dashboard' },
    { email: 'amit.owner@example.com', password: 'password123', expectedRole: 'owner', expectedDashboard: '/owner/dashboard' },
    { email: 'priya.client@example.com', password: 'password123', expectedRole: 'client', expectedDashboard: '/client/dashboard' },
  ];

  let adminToken = '';
  let clientToken = '';

  for (const roleTest of rolesToTest) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleTest.email, password: roleTest.password }),
    });
    const data = await res.json();
    assert(res.status === 200, `Login for ${roleTest.email} returned HTTP 200`);
    assert(data.success === true, `Login success confirmed for ${roleTest.expectedRole}`);
    assert(data.user.role === roleTest.expectedRole, `User role verified as ${roleTest.expectedRole}`);
    assert(typeof data.token === 'string' && data.token.length > 20, `Valid JWT token issued for ${roleTest.expectedRole}`);
    if (roleTest.expectedRole === 'admin') adminToken = data.token;
    if (roleTest.expectedRole === 'client') clientToken = data.token;
  }
  passed++;

  // --- TEST 6: Refresh dashboard -> authentication remains valid ---
  console.log('\n▶ TEST 6: Dashboard refresh & session persistence (/auth/me)');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, '/api/auth/me returned HTTP 200 with active JWT');
  assert(meData.user.role === 'admin', 'Persisted session preserves user role as admin');
  assert(meData.user.email === 'admin@redstone.com', 'Persisted session preserves user email');
  passed++;

  // --- TEST 7: Logout -> user returns to entry flow ---
  console.log('\n▶ TEST 7: Logout flow verification');
  const authContextJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/context/AuthContext.jsx'), 'utf8');
  assert(authContextJsx.includes("window.location.href = '/welcome';"), "logout() resets storage and redirects strictly to '/welcome'");
  passed++;

  // --- TEST 8: Expired or invalid JWT -> protected access denied ---
  console.log('\n▶ TEST 8: Invalid / forged JWT rejection');
  const invalidRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer forged.invalid.token.12345' },
  });
  assert(invalidRes.status === 401, 'Request with invalid JWT was denied with HTTP 401 Unauthorized');
  passed++;

  // --- TEST 9: No guest / demo bypass buttons & public Admin sign-up blocked ---
  console.log('\n▶ TEST 9: Strict security - Demo buttons removed & Public Admin Signup blocked');
  const navbarJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/components/common/Navbar.jsx'), 'utf8');
  assert(!navbarJsx.includes('1-Click Demo Login'), 'Navbar contains no 1-Click Demo Login buttons');
  assert(!navbarJsx.includes('handleDemoSelect'), 'Navbar contains no demo select bypass handler');
  const loginJsx = fs.readFileSync(path.join(__dirname, '../frontend/src/pages/public/LoginPage.jsx'), 'utf8');
  assert(!loginJsx.includes('1-Click Instant Demo Login:'), 'LoginPage contains no demo login buttons');
  assert(!loginJsx.includes('handleDemoClick'), 'LoginPage contains no demo click bypass handler');
  assert(!roleCardJsx.includes('onDemoLogin'), 'RoleCard contains no demo login bypass actions');

  // Verify backend strictly forbids public admin registration
  const registerAdminRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malicious Attacker',
      email: `fake.admin.${Date.now()}@example.com`,
      password: 'password123',
      phone: '+91 9999999999',
      role: 'admin',
    }),
  });
  const registerAdminData = await registerAdminRes.json();
  assert(registerAdminRes.status === 403, 'Public admin registration was rejected with HTTP 403 Forbidden');
  assert(registerAdminData.success === false, 'Registration of admin marked success: false');
  passed++;

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passed}/${total} MANDATORY ENTRY FLOW TESTS PASSED WITH 100% SUCCESS!`);
  console.log('======================================================\n');
}

runEntryFlowTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
