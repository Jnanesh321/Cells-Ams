# VCET Academic Monitoring System - Multi-Role Implementation

## Overview

A complete multi-role academic monitoring system built with React Native Expo, featuring 5 distinct user roles with tailored dashboards and functionality.

## System Architecture

```
App.tsx (NavigationContainer)
  └── AppNavigator (Stack Navigator)
      ├── LoginScreen (Role-aware authentication)
      └── Role-based Navigators
          ├── StudentNavigator (Bottom Tabs)
          ├── FacultyNavigator (Bottom Tabs)
          ├── HodNavigator (Bottom Tabs)
          ├── PrincipalNavigator (Bottom Tabs)
          └── AdminNavigator (Bottom Tabs)
```

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v5+ (Stack + Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Language**: TypeScript
- **Data**: Mock data (local storage ready)
- **UI Components**: Custom reusable components

## Implemented Roles

### 1. **STUDENT**
- **ID Format**: VTU USN (e.g., `4VP21CS001`)
- **Password**: `vcet@123`
- **Access**: Dashboard, Attendance, Marks, Notices, Profile
- **Features**:
  - View attendance percentage by subject
  - Check IA marks
  - View academic status
  - Access notices
  - Low attendance warnings

### 2. **FACULTY**
- **ID Format**: `FAC_[DEPT]##` (e.g., `FAC_CSE01`, `FAC_ECE01`)
- **Password**: `faculty@123`
- **Access**: Dashboard, Subjects, Attendance, Marks, Profile
- **Features**:
  - View assigned students and sections
  - Track student attendance
  - Edit IA marks
  - Mark attendance
  - Generate reports
  - Low attendance alerts for assigned students

### 3. **HOD** (Head of Department)
- **ID**: `HOD_CSE`
- **Password**: `hod@123`
- **Access**: Dashboard, Analytics, Faculty, Reports, Profile
- **Features**:
  - Department-wide analytics
  - Faculty management overview
  - Section performance tracking
  - Low attendance monitoring
  - IA marks distribution analysis
  - Department statistics

### 4. **PRINCIPAL**
- **ID**: `PRINCIPAL`
- **Password**: `principal@123`
- **Access**: Dashboard, Analytics, Notices, Profile
- **Features**:
  - Overall college metrics
  - Department comparison
  - Faculty and student count
  - Academic health assessment
  - Top/low performing departments
  - Active sessions monitoring
  - Latest notices

### 5. **ADMIN**
- **ID**: `ADMIN`
- **Password**: `admin@123`
- **Access**: Dashboard, Users, Settings, Profile
- **Features**:
  - User statistics
  - System health monitoring
  - Active sessions tracking
  - API health status
  - Backup status
  - Audit logs
  - Quick system actions

## Directory Structure

```
VCET-AMS-Mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── FacultyDashboardScreen.tsx
│   │   ├── HodDashboardScreen.tsx
│   │   ├── PrincipalDashboardScreen.tsx
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── student/
│   │   │   └── StudentDashboardScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── StudentNavigator.tsx
│   │   ├── FacultyNavigator.tsx
│   │   ├── HodNavigator.tsx
│   │   ├── PrincipalNavigator.tsx
│   │   └── AdminNavigator.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Loader.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   └── auth.ts
│   ├── types/
│   │   └── index.ts
│   └── mock/
│       ├── index.ts
│       ├── users.ts
│       ├── students.ts
│       ├── attendance.ts
│       ├── marks.ts
│       └── faculty.ts
├── App.tsx
├── tsconfig.json
├── package.json
└── global.css
```

## Mock Data Structure

### `src/mock/users.ts`
Contains all staff user credentials:
- Admin, Principal, HOD_CSE, FAC_CSE01, FAC_CSE02, FAC_ECE01

### `src/mock/students.ts`
15 realistic Karnataka student names with:
- VTU USN format
- Department and section assignments
- GPA and academic status
- Contact information

### `src/mock/attendance.ts`
Mock attendance records with:
- Subject-wise attendance percentage
- Present vs total classes
- Low attendance alerts

### `src/mock/marks.ts`
IA marks data with:
- CIE marks (3 continuous internal evaluations)
- Average calculations
- Editable marks for faculty

### `src/mock/faculty.ts`
Faculty assignments with:
- Assigned subjects and credits
- Assigned sections
- Student list mapping
- Faculty updates

## Login System

The login system auto-detects user role based on ID format:

1. **Student Detection**: Validates VTU USN pattern (`\d{1}[A-Z]{2}\d{2}[A-Z]{2}\d{3}`)
2. **Staff Detection**: Looks up ID in staff user database
3. **Error Handling**: Clear error messages for invalid credentials
4. **Local Validation**: No backend calls (mock authentication)

### Login Flow

```
User enters ID + Password
    ↓
Check if Student USN format
    ├─ YES → Validate student credentials
    ├─ NO → Check staff database
    │       ├─ Found → Validate password
    │       └─ Not Found → Error
    ↓
Create mock token + Set user in auth store
    ↓
Navigate to role-specific navigator
    ↓
App ready
```

## UI/UX Design

### Color Scheme
- **Primary Background**: `slate-900` (Dark)
- **Secondary Background**: `slate-800` (Cards)
- **Accent Color by Role**:
  - Student: Blue (`#3b82f6`)
  - Faculty: Blue (`#3b82f6`)
  - HOD: Purple (`#a855f7`)
  - Principal: Amber (`#f59e0b`)
  - Admin: Red (`#ef4444`)
- **Text**: White for headings, `slate-300` for body
- **Borders**: `slate-700` for card borders

### Component Styling
All components use **NativeWind** only (no external UI libraries):
- **Button**: Blue background with active state
- **Input**: Dark background with placeholder text
- **Card**: Rounded corners with border
- **Layout**: Flexbox with responsive spacing

## Authentication & State Management

### Zustand Auth Store
```typescript
useAuthStore: {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setToken(token)
  setUser(user)
  logout()
}
```

### TypeScript User Type
```typescript
interface User {
  id?: string
  usn?: string
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'ADMIN'
  name: string
  email?: string
  phone?: string
  department?: string
  designation?: string
  year?: number
  semester?: number
  section?: string
  gpa?: number
  academicStatus?: string
}
```

## Key Features

### ✅ Implemented
- [x] 5 distinct role-based dashboards
- [x] Role-aware login with auto-detection
- [x] Mock data for 15+ students
- [x] Faculty assignment system
- [x] Attendance tracking
- [x] IA marks management
- [x] Low attendance alerts
- [x] Department analytics
- [x] System health monitoring
- [x] Dark theme UI with NativeWind
- [x] Reusable card-based components
- [x] Logout functionality

### 🚀 Ready for Backend Integration
- [ ] API endpoints for login
- [ ] Real database for students/faculty
- [ ] Live attendance data
- [ ] Real-time marks updates
- [ ] Audit logs
- [ ] Analytics processing

## Running the App

```bash
# Navigate to app directory
cd VCET-AMS-Mobile

# Start Expo
npm start

# On iOS/Android emulator, press:
# 'i' for iOS
# 'a' for Android
# 'w' for web preview
```

## Demo Credentials

| Role | ID | Password |
|------|----|----|
| Student | 4VP21CS001 | vcet@123 |
| Faculty | FAC_CSE01 | faculty@123 |
| HOD | HOD_CSE | hod@123 |
| Principal | PRINCIPAL | principal@123 |
| Admin | ADMIN | admin@123 |

## Testing Scenarios

### Test 1: Student Login
1. Enter `4VP21CS001`
2. Enter `vcet@123`
3. Should see StudentNavigator with tabs: Dashboard, Attendance, Marks, Notices, Profile

### Test 2: Faculty Login
1. Enter `FAC_CSE01`
2. Enter `faculty@123`
3. Should see FacultyNavigator with assigned students and attendance UI

### Test 3: Role-Based Dashboard Styles
- Faculty: Blue accent on tab bar
- HOD: Purple accent
- Principal: Amber accent
- Admin: Red accent

### Test 4: Logout
1. Navigate to Profile tab in any role
2. Click Logout button
3. Should return to LoginScreen

## Troubleshooting

### Metro Bundler Errors
If you see bundling errors:
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Import Path Issues
All screens are in `src/screens/` (not nested in role folders)
```
✅ import Screen from '../screens/FacultyDashboardScreen'
❌ import Screen from '../screens/faculty/FacultyDashboardScreen'
```

### Navigation Type Safety
Make sure `AppNavigator` routes match role values (uppercase):
```
✅ user?.role === 'STUDENT'
❌ user?.role === 'student'
```

## Future Enhancements

1. **Backend Integration**
   - Connect to REST API
   - Replace mock data with real database

2. **Additional Features**
   - Assignment submission system
   - Notification system
   - File upload for documents
   - Chat/messaging system

3. **Performance**
   - Implement pagination
   - Add data caching
   - Optimize image loading

4. **Security**
   - JWT token management
   - Biometric authentication
   - SSL certificate pinning

## Notes

- **No expo-router**: Uses React Navigation instead for better control
- **No /app directory**: Sticks to traditional src/ structure
- **NativeWind only**: No Material-UI or other UI libraries
- **Mock data only**: Ready for backend integration
- **TypeScript throughout**: Full type safety
- **Dark theme**: Consistent across all screens

## Support

For issues or questions:
1. Check `src/mock/` for data structure
2. Review `src/types/index.ts` for type definitions
3. Check navigation in `src/navigation/AppNavigator.tsx`
4. Verify credentials in `src/mock/users.ts`
