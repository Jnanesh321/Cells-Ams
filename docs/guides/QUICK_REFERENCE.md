# Quick Reference Guide

## 🔐 Demo Login Credentials

```
┌─────────┬─────────────────┬──────────────┐
│ Role    │ ID              │ Password     │
├─────────┼─────────────────┼──────────────┤
│ Student │ 4VP21CS001      │ vcet@123     │
│ Faculty │ FAC_CSE01       │ faculty@123  │
│ HOD     │ HOD_CSE         │ hod@123      │
│ Princi. │ PRINCIPAL       │ principal@23 │
│ Admin   │ ADMIN           │ admin@123    │
└─────────┴─────────────────┴──────────────┘
```

## 📊 Dashboard Features by Role

### 👨‍🎓 STUDENT Dashboard
- **Tabs**: Dashboard | Attendance | Marks | Notices | Profile
- **Shows**:
  - ✅ Overall attendance percentage
  - ✅ Subject-wise attendance
  - ✅ IA marks for all subjects
  - ✅ Academic status
  - ✅ Notices from faculty

### 👨‍🏫 FACULTY Dashboard
- **Tabs**: Dashboard | Subjects | Attendance | Marks | Profile
- **Shows**:
  - ✅ Assigned subjects (CSE501, CS502, CS503, CS504)
  - ✅ Assigned sections (A, B, C)
  - ✅ Student list (6 students)
  - ✅ Attendance overview
  - ✅ Low attendance alerts (students below 75%)
  - ✅ IA marks editor
  - ✅ Quick action buttons

### 👔 HOD Dashboard
- **Tabs**: Dashboard | Analytics | Faculty | Reports | Profile
- **Shows**:
  - ✅ Department statistics (10 students, 84% attendance, 7.8 GPA)
  - ✅ Low attendance alerts
  - ✅ Section performance breakdown
  - ✅ Faculty member overview
  - ✅ IA marks distribution

### 🎓 PRINCIPAL Dashboard
- **Tabs**: Dashboard | Analytics | Notices | Profile
- **Premium Features**:
  - ✅ College-wide metrics (15 students, 3 faculty)
  - ✅ Department comparison cards
  - ✅ Academic health status
  - ✅ Critical alerts system
  - ✅ Latest notices
  - ✅ Amber-themed UI

### ⚙️ ADMIN Dashboard
- **Tabs**: Dashboard | Users | Settings | Profile
- **Shows**:
  - ✅ System health (98%)
  - ✅ Active sessions (12)
  - ✅ User breakdown
  - ✅ API response time
  - ✅ Backup status
  - ✅ Audit logs
  - ✅ Red-themed UI

## 🎨 UI Color Scheme by Role

| Role | Primary | Accent | Text |
|------|---------|--------|------|
| Student | slate-900 | Blue | white |
| Faculty | slate-900 | Blue | white |
| HOD | slate-900 | Purple | white |
| Principal | slate-900 | Amber | white |
| Admin | slate-900 | Red | white |

## 📁 File Locations

### Screens
- `src/screens/LoginScreen.tsx` - Universal login
- `src/screens/FacultyDashboardScreen.tsx` - Faculty
- `src/screens/HodDashboardScreen.tsx` - HOD
- `src/screens/PrincipalDashboardScreen.tsx` - Principal
- `src/screens/AdminDashboardScreen.tsx` - Admin
- `src/screens/student/StudentDashboardScreen.tsx` - Student

### Navigation
- `src/navigation/AppNavigator.tsx` - Main router
- `src/navigation/StudentNavigator.tsx` - Student tabs
- `src/navigation/FacultyNavigator.tsx` - Faculty tabs
- `src/navigation/HodNavigator.tsx` - HOD tabs
- `src/navigation/PrincipalNavigator.tsx` - Principal tabs
- `src/navigation/AdminNavigator.tsx` - Admin tabs

### Mock Data
- `src/mock/users.ts` - Staff credentials
- `src/mock/students.ts` - Student database (15 students)
- `src/mock/attendance.ts` - Attendance records
- `src/mock/marks.ts` - IA marks
- `src/mock/faculty.ts` - Faculty assignments

### Components
- `src/components/Button.tsx` - Reusable button
- `src/components/Card.tsx` - Dark card layout
- `src/components/Input.tsx` - Text input
- `src/components/Loader.tsx` - Loading spinner

## 🔄 User Flow

```
1. App Launches
   └─ App.tsx → NavigationContainer → AppNavigator

2. AppNavigator Checks Auth
   ├─ Not authenticated → LoginScreen
   └─ Authenticated → Role-based Navigator

3. Login Screen
   ├─ User enters ID + Password
   ├─ System detects role
   ├─ Validates credentials
   └─ Routes to role navigator

4. Role Navigator (Bottom Tabs)
   ├─ Dashboard (main content)
   ├─ Support tabs
   ├─ Reports/Analytics tabs
   └─ Profile tab (with logout)

5. Logout
   └─ Clear auth store → LoginScreen
```

## 🧪 Test Cases

### Test: Login Success (Student)
```
ID: 4VP21CS001
PW: vcet@123
Expected: StudentNavigator with 5 tabs
```

### Test: Login Success (Faculty)
```
ID: FAC_CSE01
PW: faculty@123
Expected: FacultyNavigator with 5 tabs
Expected: Shows 6 assigned students
```

### Test: Invalid Credentials
```
ID: 4VP21CS001
PW: wrongpassword
Expected: Alert "Invalid credentials"
```

### Test: Invalid USN Format
```
ID: INVALID
PW: vcet@123
Expected: Alert "Invalid credentials"
```

### Test: Tab Navigation
```
Expected: Smooth tab switching
Expected: Dark background (slate-900)
Expected: Accent color matches role
```

### Test: Logout
```
Action: Click logout in Profile tab
Expected: Return to LoginScreen
Expected: Auth store cleared
```

## 📱 Development Commands

```bash
# Start Expo
npm start

# Clear cache and rebuild
npm start -- --reset-cache

# View on iOS simulator
npm start → i

# View on Android emulator
npm start → a

# View on web
npm start → w

# Stop Expo
Ctrl+C
```

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module"
**Fix**: Check import paths - should be `../screens/` not `../../screens/`

### Issue: "Network request failed"
**Fix**: App uses mock data, no backend needed yet

### Issue: Buttons not responding
**Fix**: Ensure TouchableOpacity isn't nested in another TouchableOpacity

### Issue: Dark theme not applied
**Fix**: Verify NativeWind is processing className attributes

### Issue: Navigation not working
**Fix**: Check AppNavigator role comparison - must use UPPERCASE (STUDENT, not student)

## 📊 Mock Data Statistics

### Students
- Total: 15 realistic Karnataka names
- Departments: CSE (10), ECE (5)
- Sections: A, B, C
- Year: 3rd semester (5th semester)
- GPA Range: 6.7 - 8.7
- Status: Excellent, Good, At Risk

### Faculty
- Total: 3 faculty members
- CSE: 2 (Dr. Rajeev Sharma, Prof. Deepa Shenoy)
- ECE: 1 (Dr. Niranjan Das)
- Subjects each: 2
- Students assigned: 5-6 per faculty

### Attendance
- Range: 55% - 100%
- Alert threshold: 75%
- At risk students: 3

### Marks
- Scale: 0-20 (CIA marks)
- Average: 13-19.67
- Highest: 20/20
- Lowest: 7/20

## 🎯 Next Steps for Backend

1. Replace `src/mock/` with API calls
2. Update `useAuthStore` to use JWT tokens
3. Implement real database queries
4. Add real-time attendance marking
5. Connect IA marks to backend
6. Implement notification system

## ✅ Implementation Checklist

- [x] 5 user roles with dashboards
- [x] Role-based login system
- [x] 15+ student mock data
- [x] Faculty assignment system
- [x] Attendance tracking
- [x] IA marks management
- [x] Dark theme throughout
- [x] NativeWind styling only
- [x] TypeScript type safety
- [x] React Navigation structure
- [x] Reusable components
- [x] Mock data structure ready
- [x] No errors on npm start
