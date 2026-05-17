# Testing & Verification Guide

## ✅ Pre-Launch Verification

### 1. File Structure Verification
```
src/
├── screens/
│   ├── LoginScreen.tsx ✅
│   ├── FacultyDashboardScreen.tsx ✅
│   ├── HodDashboardScreen.tsx ✅
│   ├── PrincipalDashboardScreen.tsx ✅
│   ├── AdminDashboardScreen.tsx ✅
│   └── student/StudentDashboardScreen.tsx ✅
├── navigation/
│   ├── AppNavigator.tsx ✅
│   ├── StudentNavigator.tsx ✅
│   ├── FacultyNavigator.tsx ✅
│   ├── HodNavigator.tsx ✅
│   ├── PrincipalNavigator.tsx ✅
│   └── AdminNavigator.tsx ✅
├── components/
│   ├── Button.tsx ✅
│   ├── Card.tsx ✅
│   ├── Input.tsx ✅
│   └── Loader.tsx ✅
├── store/auth.ts ✅
├── types/index.ts ✅
└── mock/
    ├── index.ts ✅
    ├── users.ts ✅
    ├── students.ts ✅
    ├── attendance.ts ✅
    ├── marks.ts ✅
    └── faculty.ts ✅
```

### 2. Import Path Verification
All screens use correct import paths:
```
✅ import { useAuthStore } from '../store/auth'
✅ import { mock* } from '../mock'
✅ import Card from '../components/Card'
✅ import Button from '../components/Button'
```

### 3. Navigation Routing Verification
AppNavigator correctly routes based on role:
```
user?.role === 'STUDENT'    → StudentNavigator ✅
user?.role === 'FACULTY'    → FacultyNavigator ✅
user?.role === 'HOD'        → HodNavigator ✅
user?.role === 'PRINCIPAL'  → PrincipalNavigator ✅
user?.role === 'ADMIN'      → AdminNavigator ✅
```

### 4. Type Safety Verification
All TypeScript types defined:
```typescript
type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'ADMIN' ✅
interface User { ... } ✅
interface AuthState { ... } ✅
interface Student { ... } ✅
interface Subject { ... } ✅
interface StudentAttendance { ... } ✅
```

## 🧪 Manual Testing Guide

### Test Suite 1: Authentication

#### Test 1.1: Student Login - Valid
```
STEP 1: Launch app
STEP 2: Enter ID: 4VP21CS001
STEP 3: Enter Password: vcet@123
STEP 4: Click Login

EXPECTED:
✅ No errors in console
✅ Navigates to StudentNavigator
✅ Bottom tab bar shows: Dashboard, Attendance, Marks, Notices, Profile
✅ Dashboard displays student data
✅ Welcome card shows student name
```

#### Test 1.2: Student Login - Invalid Password
```
STEP 1: Enter ID: 4VP21CS001
STEP 2: Enter Password: wrongpassword
STEP 3: Click Login

EXPECTED:
✅ Alert appears: "Login Failed - Invalid credentials"
✅ Stays on LoginScreen
✅ Can retry login
```

#### Test 1.3: Faculty Login
```
STEP 1: Enter ID: FAC_CSE01
STEP 2: Enter Password: faculty@123
STEP 3: Click Login

EXPECTED:
✅ Navigates to FacultyNavigator
✅ Shows faculty dashboard with:
   - Welcome card (Dr. Rajeev Sharma)
   - Assigned subjects (CS501, CS504)
   - Assigned sections (A, B)
   - Student list (6 students)
✅ Tab bar accent is blue (#3b82f6)
```

#### Test 1.4: HOD Login
```
STEP 1: Enter ID: HOD_CSE
STEP 2: Enter Password: hod@123
STEP 3: Click Login

EXPECTED:
✅ Navigates to HodNavigator
✅ Shows HOD dashboard with:
   - Department statistics
   - Low attendance alerts
   - Faculty overview
✅ Tab bar accent is purple (#a855f7)
```

#### Test 1.5: Principal Login
```
STEP 1: Enter ID: PRINCIPAL
STEP 2: Enter Password: principal@123
STEP 3: Click Login

EXPECTED:
✅ Navigates to PrincipalNavigator
✅ Shows principal dashboard with:
   - Welcome card (Dr. Mahesh Prasanna K)
   - College metrics
   - Department comparison
✅ Tab bar accent is amber (#f59e0b)
```

#### Test 1.6: Admin Login
```
STEP 1: Enter ID: ADMIN
STEP 2: Enter Password: admin@123
STEP 3: Click Login

EXPECTED:
✅ Navigates to AdminNavigator
✅ Shows admin dashboard with:
   - System health (98%)
   - User statistics
   - API health
✅ Tab bar accent is red (#ef4444)
```

### Test Suite 2: Navigation & UI

#### Test 2.1: Tab Navigation (Student)
```
STEP 1: Login as student (4VP21CS001)
STEP 2: Tap each tab: Dashboard, Attendance, Marks, Notices, Profile
STEP 3: Verify smooth transitions

EXPECTED:
✅ All tabs are clickable
✅ Content switches smoothly
✅ Dark background (slate-900) on all screens
✅ No console errors
```

#### Test 2.2: Card-Based Layout
```
STEP 1: Login as any role
STEP 2: Scroll through dashboard

EXPECTED:
✅ All content in card containers
✅ Cards have dark background (slate-800)
✅ Cards have visible border (slate-700)
✅ Rounded corners on all cards
✅ Proper spacing between cards
```

#### Test 2.3: Responsive Layout
```
STEP 1: Login as faculty (FAC_CSE01)
STEP 2: Rotate device / Change orientation
STEP 3: Verify layout adjusts

EXPECTED:
✅ Layout responds to rotation
✅ Text remains readable
✅ Cards adjust width appropriately
✅ No overlapping elements
```

### Test Suite 3: Data Display

#### Test 3.1: Faculty Dashboard Data
```
STEP 1: Login as FAC_CSE01

EXPECTED DATA:
✅ Faculty Name: Dr. Rajeev Sharma
✅ Department: CSE
✅ Assigned Subjects: CS501, CS504
✅ Assigned Sections: A, B
✅ Student Count: 6
✅ Low Attendance Alerts: Shows alert for Vikram Singh (60.5%)
```

#### Test 3.2: HOD Dashboard Data
```
STEP 1: Login as HOD_CSE

EXPECTED DATA:
✅ Department: CSE
✅ Total Students: 10
✅ Avg Attendance: 84%
✅ Avg GPA: 7.8
✅ Low Attendance Count: 2
```

#### Test 3.3: Principal Dashboard Data
```
STEP 1: Login as PRINCIPAL

EXPECTED DATA:
✅ Principal Name: Dr. Mahesh Prasanna K
✅ Total Students: 15
✅ Faculty Count: 3
✅ Overall Attendance: 82%
✅ Active Sessions: 15
✅ Department Stats: CSE (10 students), ECE (5 students)
```

#### Test 3.4: Admin Dashboard Data
```
STEP 1: Login as ADMIN

EXPECTED DATA:
✅ System Health: 98%
✅ Active Sessions: 12
✅ Total Users: 50
✅ API Response Time: 125ms
✅ Backup Status: Success
```

### Test Suite 4: User Actions

#### Test 4.1: Faculty Edit Marks
```
STEP 1: Login as FAC_CSE01
STEP 2: On dashboard, click "Edit" button in IA Marks Editor
STEP 3: Click "Save" button

EXPECTED:
✅ Edit button toggles to Save
✅ Alert shows: "Marks updated successfully"
✅ Edit mode UI appears/disappears
```

#### Test 4.2: Faculty Mark Attendance
```
STEP 1: Login as FAC_CSE01
STEP 2: Click "Mark Attendance" button in Quick Actions
STEP 3: Observe response

EXPECTED:
✅ Alert shows: "Attendance updated"
✅ No console errors
```

#### Test 4.3: Profile Tab Logout
```
STEP 1: Login as any role
STEP 2: Click Profile tab
STEP 3: Click Logout button

EXPECTED:
✅ Returns to LoginScreen
✅ Auth store is cleared
✅ Can login again immediately
✅ No data persists
```

### Test Suite 5: Styling & Theme

#### Test 5.1: Dark Theme Consistency
```
STEP 1: Login and navigate through all dashboards

EXPECTED COLORS:
✅ Background: slate-900 (#0f172a)
✅ Cards: slate-800 (#1e293b)
✅ Borders: slate-700 (#334155)
✅ Text: white (#ffffff)
✅ Secondary Text: slate-300 (#cbd5e1)
✅ Tab Bar: slate-900 with role-based accent
```

#### Test 5.2: Role-Based Accent Colors
```
STEP 1: Login as each role and check tab bar

EXPECTED:
✅ Student: Blue (#3b82f6)
✅ Faculty: Blue (#3b82f6)
✅ HOD: Purple (#a855f7)
✅ Principal: Amber (#f59e0b)
✅ Admin: Red (#ef4444)
```

#### Test 5.3: Button Styling
```
STEP 1: Observe all buttons throughout app

EXPECTED:
✅ Primary buttons: Blue background
✅ Danger buttons: Red background
✅ Text: White
✅ Rounded corners
✅ Hover/active state works
✅ Disabled state shows reduced opacity
```

#### Test 5.4: Input Field Styling
```
STEP 1: On LoginScreen, focus input fields

EXPECTED:
✅ Input background: dark (slate-700)
✅ Input border: slate-600
✅ Text color: white
✅ Placeholder: visible (slate-400)
✅ Cursor visible on focus
```

### Test Suite 6: Error Handling

#### Test 6.1: Invalid USN Format
```
STEP 1: Enter ID: INVALID123
STEP 2: Enter any password
STEP 3: Click Login

EXPECTED:
✅ Alert: "Login Failed - Invalid credentials"
✅ Stays on LoginScreen
```

#### Test 6.2: Empty Fields
```
STEP 1: Leave ID and/or Password empty
STEP 2: Click Login

EXPECTED:
✅ Alert: "Please enter both ID and password"
✅ Stays on LoginScreen
```

#### Test 6.3: Invalid Staff ID
```
STEP 1: Enter ID: INVALID_STAFF
STEP 2: Enter Password: faculty@123
STEP 3: Click Login

EXPECTED:
✅ Alert: "Login Failed - Invalid credentials"
✅ Stays on LoginScreen
```

#### Test 6.4: Case Sensitivity
```
STEP 1: Enter ID: fac_cse01 (lowercase)
STEP 2: Enter password: faculty@123
STEP 3: Click Login

EXPECTED:
✅ Auto-converts to uppercase (FAC_CSE01)
✅ Login succeeds
```

### Test Suite 7: Data Filtering

#### Test 7.1: Faculty Student Filtering
```
STEP 1: Login as FAC_CSE01
STEP 2: Check assigned students on dashboard

EXPECTED:
✅ Shows exactly 6 students (from mock data)
✅ All students in faculty's student list
✅ Display limited to scrollable area
```

#### Test 7.2: HOD Department Filtering
```
STEP 1: Login as HOD_CSE
STEP 2: Check low attendance alerts

EXPECTED:
✅ Shows only CSE department students
✅ Shows students below 75% attendance
✅ Displays name and percentage
```

#### Test 7.3: Principal College-Wide View
```
STEP 1: Login as PRINCIPAL
STEP 2: Check department comparison

EXPECTED:
✅ Shows all departments
✅ CSE and ECE stats separate
✅ Comparison visible
```

## 🚨 Troubleshooting During Testing

### Issue: "Cannot find module" error
```
SOLUTION:
1. Check import paths match file structure
2. Verify filename spelling (case-sensitive)
3. Clear Metro cache: npm start -- --reset-cache
```

### Issue: White/blank screen
```
SOLUTION:
1. Check console for errors
2. Verify navigation routing
3. Check if LoginScreen loads
4. Try hard refresh in emulator
```

### Issue: Tab bar not showing
```
SOLUTION:
1. Verify navigator has screenOptions
2. Check Tab.Screen components are present
3. Verify header is hidden if needed
```

### Issue: Buttons not clickable
```
SOLUTION:
1. Check onPress handler exists
2. Verify TouchableOpacity not nested
3. Check className not overriding pointer events
```

### Issue: Dark theme not applied
```
SOLUTION:
1. Verify NativeWind is configured
2. Check className syntax is correct
3. Rebuild with npm start -- --reset-cache
```

## 📊 Test Results Template

```
Date: ___________
Tester: _________
Environment: iOS / Android / Web

Test Suite 1: Authentication
├─ Test 1.1: Student Login ✓ / ✗
├─ Test 1.2: Invalid Password ✓ / ✗
├─ Test 1.3: Faculty Login ✓ / ✗
├─ Test 1.4: HOD Login ✓ / ✗
├─ Test 1.5: Principal Login ✓ / ✗
└─ Test 1.6: Admin Login ✓ / ✗

Test Suite 2: Navigation & UI
├─ Test 2.1: Tab Navigation ✓ / ✗
├─ Test 2.2: Card-Based Layout ✓ / ✗
└─ Test 2.3: Responsive Layout ✓ / ✗

Test Suite 3: Data Display
├─ Test 3.1: Faculty Dashboard ✓ / ✗
├─ Test 3.2: HOD Dashboard ✓ / ✗
├─ Test 3.3: Principal Dashboard ✓ / ✗
└─ Test 3.4: Admin Dashboard ✓ / ✗

Test Suite 4: User Actions
├─ Test 4.1: Faculty Edit Marks ✓ / ✗
├─ Test 4.2: Faculty Mark Attendance ✓ / ✗
└─ Test 4.3: Profile Tab Logout ✓ / ✗

Test Suite 5: Styling & Theme
├─ Test 5.1: Dark Theme ✓ / ✗
├─ Test 5.2: Role Accents ✓ / ✗
├─ Test 5.3: Button Styling ✓ / ✗
└─ Test 5.4: Input Styling ✓ / ✗

Test Suite 6: Error Handling
├─ Test 6.1: Invalid USN ✓ / ✗
├─ Test 6.2: Empty Fields ✓ / ✗
├─ Test 6.3: Invalid Staff ID ✓ / ✗
└─ Test 6.4: Case Sensitivity ✓ / ✗

Test Suite 7: Data Filtering
├─ Test 7.1: Faculty Filtering ✓ / ✗
├─ Test 7.2: HOD Filtering ✓ / ✗
└─ Test 7.3: Principal View ✓ / ✗

Overall Status: PASS / FAIL
Notes: ______________________
```

## ✅ Final Verification Checklist

Before considering implementation complete:

- [ ] npm start runs without errors
- [ ] Metro Bundler shows "Waiting for connection"
- [ ] All 5 roles login successfully
- [ ] All dashboards display correctly
- [ ] All tabs navigate smoothly
- [ ] Dark theme applies consistently
- [ ] All buttons are functional
- [ ] Logout returns to LoginScreen
- [ ] No console errors during testing
- [ ] Data displays correctly for each role
- [ ] Mock data loads without API calls
- [ ] TypeScript shows no errors
- [ ] All imports resolve correctly
- [ ] Navigation routing is correct
- [ ] UI is responsive and polished
