# VCET AMS Mobile

Academic Monitoring System for Vivekananda College of Engineering & Technology (VCET), Puttur.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo SDK | 54 |
| UI | React Native | 0.81.5 |
| Styling | NativeWind v4 | 4.1.23 |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) | Stack v7.3.0, Tabs v7.15.13 |
| State | Zustand | 5.x |
| HTTP | Axios | 1.16.0 |
| Auth | JWT (access + refresh tokens) | — |
| Storage | expo-secure-store + AsyncStorage fallback | — |

---

## Project Structure

```
VCET-AMS-Mobile/
├── App.tsx                          # Root: NavigationContainer + NavErrorBoundary
├── global.css                       # NativeWind global styles
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Root Stack Navigator (Login + 7 role screens)
│   │   ├── navigationRef.ts         # Navigation ref for imperative navigation
│   │   ├── StudentNavigator.tsx     # Bottom tabs: Dashboard, Attendance, Marks, Notices, Profile
│   │   ├── FacultyNavigator.tsx     # Bottom tabs: Dashboard (stack), Subjects, Marks (stack), Profile
│   │   ├── HodNavigator.tsx        # Bottom tabs: Dashboard, Analytics, Faculty, Reports, Profile
│   │   ├── PrincipalNavigator.tsx   # Bottom tabs: Dashboard, Analytics, Notices, Profile + DeptDetail stack
│   │   ├── AdminNavigator.tsx       # Bottom tabs: Dashboard, Users, Settings, Profile
│   │   ├── ParentNavigator.tsx      # Bottom tabs: Dashboard, Attendance, Marks, Profile
│   │   └── AdmissionNavigator.tsx   # Bottom tabs: Dashboard, Batches, Students, Mappings, Profile
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Login with backend + mock fallback
│   │   ├── DemoCredentialsScreen.tsx # Demo credentials reference
│   │   ├── AdminDashboardScreen.tsx  # Admin: system health, user stats, quick actions
│   │   ├── FacultyDashboardScreen.tsx
│   │   ├── SubjectPickerScreen.tsx
│   │   ├── AttendanceSessionScreen.tsx
│   │   ├── EditAttendanceScreen.tsx
│   │   ├── ReviewSubmitScreen.tsx
│   │   ├── SuccessConfirmationScreen.tsx
│   │   ├── HodDashboardScreen.tsx
│   │   ├── PrincipalDashboardScreen.tsx  # Re-exports principal/DashboardScreen
│   │   ├── StudentDashboardScreen.tsx     # Re-exports student/DashboardScreen
│   │   ├── student/
│   │   │   ├── DashboardScreen.tsx   # Fetches attendance, marks, notices, calendar
│   │   │   ├── AttendanceScreen.tsx   # GET /attendance/student/:usn/summary + mock fallback
│   │   │   ├── MarksScreen.tsx        # GET /marks/student/:usn + mock fallback
│   │   │   └── NoticesScreen.tsx      # GET /notices + mock fallback
│   │   ├── faculty/
│   │   │   ├── MarksSubjectPickerScreen.tsx
│   │   │   └── IAMarksEntryScreen.tsx
│   │   ├── hod/
│   │   │   ├── AnalyticsScreen.tsx
│   │   │   ├── FacultyScreen.tsx
│   │   │   └── ReportsScreen.tsx
│   │   ├── principal/
│   │   │   ├── DashboardScreen.tsx   # GET /analytics/college + mock fallback
│   │   │   ├── DeptDetailScreen.tsx
│   │   │   ├── NoticesScreen.tsx
│   │   │   └── AnalyticsScreen.tsx
│   │   ├── admin/
│   │   │   ├── UsersScreen.tsx       # User list + add/edit/delete modal
│   │   │   └── SettingsScreen.tsx    # Editable settings with inline modal
│   │   ├── parent/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── AttendanceScreen.tsx
│   │   │   └── MarksScreen.tsx
│   │   └── admission/
│   │       ├── DashboardScreen.tsx
│   │       ├── BatchCreateScreen.tsx
│   │       ├── BulkStudentEntryScreen.tsx
│   │       └── USNMappingScreen.tsx
│   ├── store/
│   │   ├── authStore.ts              # Auth state, login/logout, persist
│   │   ├── auth.ts                   # Barrel export
│   │   ├── attendance.ts             # Attendance session state + API
│   │   └── admissionStore.ts         # Admission cell mock state
│   ├── services/
│   │   ├── api.ts                    # Axios instance, interceptors, caching
│   │   └── queryClient.ts            # React Query client setup
│   ├── mock/                         # Mock data files for all roles
│   │   ├── users.ts                  # Staff mock users + getMockUser()
│   │   ├── students.ts              # Student mock data
│   │   ├── attendance.ts            # Mock attendance
│   │   ├── marks.ts                 # Mock marks
│   │   ├── faculty.ts               # Mock faculty subjects
│   │   ├── facultyData.ts           # Faculty list
│   │   ├── facultySubjects.ts       # Subject assignments
│   │   ├── backend.ts               # Mock backend functions
│   │   ├── birthdays.ts             # Birthday data
│   │   ├── studentAttendance.ts     # Student attendance records
│   │   └── admission.ts             # Admission workflow mock
│   └── components/                   # Shared UI components
└── docs/
    └── README.md                     # This file
```

---

## The 7 Roles & Credentials

| Role | USN/ID | Password | Notes |
|------|--------|----------|-------|
| **STUDENT** | `4VP21CS001` | `vcet@123` | VTU USN format |
| **FACULTY** | `FAC_CSE_001` | `faculty@123` | Also: FAC_CSE_002, FAC_ECE_001 |
| **HOD** | `HOD_CSE` | `hod@123` | — |
| **PRINCIPAL** | `PRINCIPAL` | `principal@123` | — |
| **ADMIN** | `ADMIN` | `admin@123` | Local bypass, never hits backend |
| **PARENT** | `PARENT01` | `parent@123` | Ward: 4VP21CS001 |
| **ADMISSION_CELL** | `ADMISSION` | `admission@123` | — |

**Login logic (LoginScreen.tsx):**
- `ADMIN` → local mock only (no backend call)
- All others → try `POST /auth/login` on backend → catch → fallback to `getMockUser()`
- Mock credentials match `mock/users.ts` and `mock/students.ts`

---

## API Integration Status

### Wired to Backend (try API first, fall back to mock)

| Screen | Endpoint | Status |
|--------|----------|--------|
| LoginScreen | `POST /auth/login` | ✅ Working with fallback |
| Student Dashboard | `GET /attendance/student/:usn/summary`, `GET /marks/student/:usn`, `GET /notices`, `GET /calendar` | ✅ Promise.allSettled, sets empty on failure |
| Student Attendance | `GET /attendance/student/:usn/summary` | ✅ With mock fallback |
| Student Marks | `GET /marks/student/:usn` | ✅ With mock fallback |
| Student Notices | `GET /notices` | ✅ With mock fallback |
| Principal Dashboard | `GET /analytics/college` | ✅ With mock fallback |
| Faculty Attendance | `POST /attendance/mark` (via store) | ✅ With mock fallback |

### Mock Only (no API calls)

| Screen | Notes |
|--------|-------|
| Faculty Dashboard | Mock subjects + attendance |
| Faculty SubjectPicker | Mock faculty subjects |
| Faculty MarksSubjectPicker | Mock |
| Faculty IAMarksEntry | Mock |
| HOD Dashboard | Mock |
| HOD Analytics | Mock |
| HOD FacultyScreen | Mock faculty data |
| HOD Reports | Placeholder UI |
| Principal Analytics | Mock |
| Principal Notices | Mock |
| Parent Dashboard | Mock |
| Parent Attendance | Mock |
| Parent Marks | Mock |
| Admin UsersScreen | Add/edit/delete in local state |
| Admin SettingsScreen | Editable via modal |
| All Admission screens | Full mock workflow |

### Phase 2 (Not Yet Wired)
- HOD screens → API endpoints exist but not connected
- Faculty screens → API endpoints exist but not connected
- Parent screens → API endpoints exist but not connected
- Admission screens → Backend endpoints not built
- Reports/PDF download → Endpoints exist
- Timetable → Endpoints exist

---

## Navigation Flow

### AppNavigator (Root Stack)
```
Login ──► DemoCredentials
     │
     ├──► StudentNavigator (tabs)
     ├──► FacultyNavigator (tabs + stacks)
     ├──► HOD Navigator (tabs)
     ├──► PrincipalNavigator (tabs + stack)
     ├──► AdminNavigator (tabs)
     ├──► ParentNavigator (tabs)
     └──► AdmissionNavigator (tabs)
```

### Auth-Based Navigation
- LoginScreen calls `setAuth()` → Zustand store updates `isAuthenticated` + `user.role`
- `AppNavigator` `useEffect` detects auth change → retries `navigationRef.reset()` up to 30×100ms
- Logout: `clearAuth()` → `useEffect` detects `isAuthenticated: false` → retries reset to Login
- Both login and logout navigation use retry pattern with `setTimeout(tryReset, 50)` initial delay

---

## Changes Made

### Round 1 — Login Fix (May 17)
| File | Change |
|------|--------|
| `src/store/authStore.ts` | Made `setAuth` synchronous `set()` + fire-and-forget `persistAuthSnapshot` |
| `src/navigation/AppNavigator.tsx` | Added retry pattern (30×100ms) for both login and logout navigation |
| `App.tsx` | Verified `NavErrorBoundary` already wrapping `NavigationContainer` |

### Round 2 — Admin Features (May 17)
| File | Change |
|------|--------|
| `src/screens/AdminDashboardScreen.tsx` | Added `useNavigation`; wired quick-action buttons to 'Settings', 'Users', 'Dashboard' tabs |
| `src/screens/admin/UsersScreen.tsx` | Added "+ Add" button; add/edit/delete modal with form (name, id, role, dept, email, password, designation); role selector chips; local state management |
| `src/screens/admin/SettingsScreen.tsx` | Made all setting values editable via tap → modal with TextInput |

### Round 3 — Navigation Fixes (May 17)
| File | Change |
|------|--------|
| `src/navigation/AppNavigator.tsx` | Added retry pattern for logout (previously single-shot `if(isReady)`) |
| `src/screens/principal/DashboardScreen.tsx` | Added try/catch + mock fallback (previously no error handling) |

---

## Testing Instructions

### Prerequisites
1. Android emulator running (Pixel_9 AVD)
2. Expo Go app installed on emulator

### Steps
```bash
cd VCET-AMS-Mobile
npx expo start --clear
# Press 'a' for Android, or scan QR with Expo Go
```

### Expected Log Output (Metro Console)

**Login (e.g., ADMIN admin@123):**
```
[STORE] setAuth called, role: ADMIN
[STORE] zustand set() done
[NAV] RENDER isAuthenticated: true | role: ADMIN
[NAV] useEffect fired, isAuthenticated: true role: ADMIN
[NAV] isReady attempt 1: true
[NAV] *** reset fired to: Admin
```

**Logout:**
```
[NAV] useEffect fired, isAuthenticated: false role: ADMIN
[NAV] logout isReady attempt 1: true
[NAV] *** logged out — reset to Login
```

### Test All 7 Roles
1. Login with each credential from the table above
2. Verify landing on correct home screen (no crash)
3. Verify tab navigation works
4. Verify Logout button returns to Login screen
5. Verify Admin: Users tab shows users, add/edit/delete works
6. Verify Admin: Settings tab items are editable
7. Verify Admin: Dashboard quick actions navigate to Users/Settings

---

## Backend API Reference

Backend runs at `http://10.0.2.2:3000` (Express + Prisma + PostgreSQL)

### Auth
- `POST /auth/login` — Login with usn + password → returns accessToken + refreshToken + user
- `POST /auth/refresh` — Refresh token
- `GET /auth/me` — Get current user

### Student
- `GET /attendance/student/:usn/summary` — Attendance summary by subject
- `GET /marks/student/:usn` — IA marks for all subjects

### Faculty
- `POST /attendance/mark` — Mark attendance session
- `PUT /attendance/record` — Edit attendance record
- `GET /attendance/session` — Get session data
- `POST /marks/ia` — Save IA marks

### Analytics
- `GET /analytics/college` — College-wide analytics (principal)

### Admin
- `GET/POST/DELETE /admin/assign-class*` — Class assignment management

### General
- `GET /notices` — Get notices
- `POST /notices` — Create notice
- `GET /calendar` — Calendar events
- `GET /report/student/:usn/pdf` — Student report PDF

---

## Key Architecture Decisions

1. **ADMIN login is fully local** — never contacts backend; uses mock data only
2. **All API calls have mock fallback** — screens never crash from network errors
3. **Auth navigation uses polling** — `navigationRef.isReady()` is polled up to 30 times (3s) because the ref may not be ready immediately during re-render
4. **Zustand over Context** — simpler API, less boilerplate, built-in selectors
5. **`@react-navigation/stack` over native-stack** — consistent behavior across platforms
6. **expo-secure-store with AsyncStorage fallback** — handles devices without SecureStore
