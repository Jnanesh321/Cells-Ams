# VCET AMS — Project Context Master

> **Handoff document.** Self-contained. Read this to fully understand the project.
> Created: 2026-05-17

---

## SECTION 1 — PROJECT OVERVIEW

**Project:** Cells AMS (Academic Monitoring System)  
**College:** Vivekananda College of Engineering and Technology (VCET), Puttur  
**Purpose:** VTU academic monitoring ERP — mobile app for attendance, IA marks, detention tracking, timetable, notices, analytics  
**Motto:** Prototype > perfection. Stability > feature count.

### Users
| Role | Description |
|------|-------------|
| Student | View attendance, marks, notices, timetable, dashboard |
| Faculty | Mark attendance, enter IA marks, manage subjects |
| HOD | View department analytics, shortage, detained students, faculty workload |
| Principal | College-wide analytics, department comparisons, notices |
| Admin | System settings, user management, class assignments |
| Admission Cell | Batch creation, bulk student entry, USN mapping |
| Parent | Monitor ward's attendance, marks, notices |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo (SDK 54), React Native (0.81.5), TypeScript |
| UI | NativeWind v4 (Tailwind CSS for RN) |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| State | Zustand v5 |
| HTTP | Axios |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Caching | TanStack React Query |
| Auth | JWT (access + refresh tokens) |

### Architecture
- **Monorepo** (single root, two directories)
- Root: `Cells-AMS/` — backend (Express + Prisma)
- Subdir: `Cells-AMS/VCET-AMS-Mobile/` — mobile app (Expo)
- Backend serves REST API on port 3000
- Mobile app uses mock data as fallback when backend unreachable

---

## SECTION 2 — FOLDER STRUCTURE

```
Cells-AMS/
├── src/                          # Backend source
│   ├── server.ts                 # Entry: Express app on port 3000
│   ├── app.ts                    # Express app setup (middleware, routes)
│   ├── config/env.ts             # Zod-validated env vars (PORT, DATABASE_URL, JWT secrets)
│   ├── middleware/               # Auth, role checking, ownership guards
│   │   ├── auth.ts              # JWT verification
│   │   ├── requireRole.ts       # Role-based access: specific roles only
│   │   └── requireOwnStudentData.ts  # Students can only see own data
│   ├── routes/                   # 13 route groups
│   │   ├── auth.routes.ts       # login, refresh, me
│   │   ├── attendance.routes.ts # mark, update, summary, session
│   │   ├── marks.routes.ts      # IA upsert, student view, dept view
│   │   ├── analytics.routes.ts  # college-level analytics
│   │   ├── admin.routes.ts      # class assignments CRUD
│   │   ├── reports.routes.ts    # student/class PDF generation
│   │   ├── notice.routes.ts     # list, create
│   │   ├── calendar.routes.ts   # academic calendar CRUD
│   │   ├── academicDay.routes.ts# day advance, overrides, today schedule
│   │   ├── timetable.routes.ts  # periods, entries CRUD
│   │   ├── birthday.routes.ts   # today, visibility toggle
│   │   ├── student.routes.ts    # profile, assignments
│   │   └── faculty.routes.ts    # profile, subjects
│   ├── controllers/             # Route handler implementations
│   ├── services/                # Business logic (Prisma queries)
│   └── utils/                   # apiResponse, pdf generation
├── prisma/
│   └── schema.prisma            # 18 models: User, StudentProfile, FacultyProfile,
│                                # Attendance, Mark, Subject, Notice, Calendar,
│                                # Timetable, Birthday, Detention, Admission, etc.
├── dist/                        # Compiled backend JS
├── docs/                        # Additional documentation
├── package.json                 # Backend dependencies
├── tsconfig.json
├── .env                         # DATABASE_URL, JWT secrets
│
└── VCET-AMS-Mobile/             # Mobile app (Expo)
    ├── App.tsx                  # Entry: GestureHandler, QueryClient, NavigationContainer
    ├── src/
    │   ├── screens/             # All screen components (organized by role)
    │   │   ├── LoginScreen.tsx           # Auth entry (backend first, mock fallback)
    │   │   ├── DemoCredentialsScreen.tsx # Shows all test accounts
    │   │   ├── student/                  # 5 screens: Dashboard, Attendance, Marks, Notices, Profile
    │   │   ├── faculty/                  # 6 screens: Dashboard, SubjectPicker, AttendanceSession,
    │   │   │                             #   EditAttendance, ReviewSubmit, SuccessConfirmation
    │   │   │   ├── IAMarksEntryScreen.tsx         # IA marks per student
    │   │   │   └── MarksSubjectPickerScreen.tsx    # Subject selection for IA marks
    │   │   ├── hod/                  # 4 screens: Dashboard, Analytics, Faculty, Reports
    │   │   ├── principal/            # 4 screens: Dashboard, Analytics, DeptDetail, Notices
    │   │   ├── admin/               # 3 screens: Dashboard, Users, Settings
    │   │   ├── admission/           # 4 screens: Dashboard, BatchCreate, BulkEntry, USNMapping
    │   │   └── parent/              # 3 screens: Dashboard, Attendance, Marks
    │   ├── navigation/              # Navigators per role + AppNavigator
    │   │   ├── AppNavigator.tsx      # Root stack: all screens registered unconditionally
    │   │   ├── navigationRef.ts      # Shared ref for programmatic navigation
    │   │   ├── StudentNavigator.tsx  # Bottom tabs: Dashboard, Attendance, Marks, Notices, Profile
    │   │   ├── FacultyNavigator.tsx  # Bottom tabs: Dashboard, Subjects(placeholder), Marks, Profile
    │   │   ├── HodNavigator.tsx      # 4 tabs
    │   │   ├── PrincipalNavigator.tsx# 4 tabs
    │   │   ├── AdminNavigator.tsx    # 4 tabs
    │   │   ├── AdmissionNavigator.tsx# 4 tabs
    │   │   └── ParentNavigator.tsx   # 3 tabs (no Notices)
    │   ├── store/                   # Zustand stores
    │   │   ├── authStore.ts         # Auth state, token persistence via SecureStore/AsyncStorage
    │   │   ├── auth.ts             # Barrel re-export of authStore
    │   │   ├── attendance.ts       # Faculty attendance session (mark, edit, submit)
    │   │   └── admissionStore.ts   # Admission batch/student management
    │   ├── services/
    │   │   └── api.ts             # Axios instance with offline cache interceptor
    │   ├── mock/                   # Mock data for all roles
    │   │   ├── users.ts           # Faculty, HOD, Admin, Principal, Parent, Admission users
    │   │   ├── students.ts        # 15 students (10 CSE, 5 ECE)
    │   │   ├── attendance.ts      # Per-student attendance records (CS501-CS504 codes)
    │   │   ├── marks.ts           # Per-student IA marks (cia1/cia2/cia3)
    │   │   ├── facultySubjects.ts # Faculty-subject assignments across departments
    │   │   ├── studentAttendance.ts# Detailed attendance by subject with detention tracking
    │   │   ├── backend.ts         # Mock backend adapter (simulates API calls)
    │   │   └── admission.ts       # Admission batch/student mock data
    │   ├── types/
    │   │   └── index.ts           # TypeScript interfaces for all entities
    │   ├── components/            # Shared UI components (Card, Button, Input, Loader, etc.)
    │   └── utils/
    │       └── vtuRules.ts        # VTU CIE calculation rules
    ├── package.json               # Expo + React Native dependencies
    ├── tsconfig.json
    └── babel.config.js            # expo preset (no nativewind/babel plugin)
```

---

## SECTION 3 — COMPLETED FEATURES

### Authentication — COMPLETE (frontend mock) / COMPLETE (backend)
- **Frontend**: Backend-first login with mock fallback. Local admin bypass (ADMIN/admin@123 never hits backend)
- **Backend**: JWT access + refresh tokens, password hashing, role-based guards
- **Store**: Zustand with SecureStore persistence (with AsyncStorage fallback)

### Role System — COMPLETE (frontend mock) / COMPLETE (backend)
- 7 roles: STUDENT, FACULTY, HOD, PRINCIPAL, ADMIN, PARENT, ADMISSION_CELL
- Backend has `requireRole()` middleware for endpoint protection
- Frontend navigators render role-specific screens based on `user.role`

### Attendance — PARTIAL
- **Faculty marking flow**: UI complete (6 screens, full workflow). **100% mock — no API calls**
- **Student view**: Wired to real API (GET /attendance/student/:usn/summary) with mock fallback
- **Backend**: POST /mark, PUT /record, GET /summary, GET /session — all fully implemented
- **Detention tracking**: Backend model exists (DetentionRecord). No API endpoints for detention CRUD

### IA Marks — PARTIAL
- **Faculty entry**: UI complete (subject picker → student-by-student marks entry with Prev/Next). SubjectId lookup was broken → FIXED (item.code→subjectCode, SUBJ prefix removed)
- **Student view**: Wired to real API (GET /marks/student/:usn) with mock fallback
- **Backend**: POST /marks/ia (upsert), GET /marks/student/:usn, GET /marks/department/:code — all implemented
- **Assignment marks & CIE summary**: Backend models exist (AssignmentMark, CIESummary). NO API endpoints

### Admission Cell — COMPLETE (mock)
- **4 screens**: Dashboard, Batch Create, Bulk Student Entry, USN Mapping
- Full end-to-end workflow with form validation, async store operations
- **Backend**: ZERO admission endpoints. Models exist (AdmissionBatch, StudentDraft, RollNumberSequence) but no routes/controllers

### Parent System — PARTIAL
- **3 screens**: Dashboard, Attendance, Marks — all functional with mock data
- **Wired to API?** NO — 100% mock
- **Missing**: Notices tab (not in navigator)

### Analytics — PARTIAL
- **HOD**: Dashboard has hardcoded shortage data. Analytics screen uses Math.random(). Reports screen all dead
- **Principal**: Dashboard uses real API (GET /analytics/college). Analytics screen uses mock. DeptDetailScreen is dead placeholder

### Academic Day — PLACEHOLDER (frontend) / COMPLETE (backend)
- Backend: GET /current, POST /advance, GET /overrides, POST /overrides, GET /today-schedule — all implemented
- Frontend: No UI consumes these endpoints

### Birthday — PLACEHOLDER (frontend) / COMPLETE (backend)
- Backend: GET /today, GET /visibility/:usn, PUT /visibility — all implemented
- Frontend: BirthdayBanner component exists but **never imported**. Orphaned feature

### Timetable — MISSING (frontend) / COMPLETE (backend)
- Backend: Full CRUD for periods, timetable entries — all implemented
- Frontend: No screen, no nav link, no API call. Complete gap

### Notices — PARTIAL
- Student notices: Wired to real API (GET /notices) with mock fallback
- Principal posting: Post button is `Alert.alert` stub
- Backend: GET /notices (list), POST /notices (create) — both implemented but controller is basics only

### Detention — MISSING (frontend) / PARTIAL (backend)
- Backend model exists (DetentionRecord) with unique constraint on [studentProfileId, academicYear, semester]
- **NO API endpoints** for CRUD operations
- Frontend: HOD shows hardcoded shortage students (fabricated USNs, not matching mock data)

### Reports — PLACEHOLDER
- Backend: GET /reports/student/:usn, GET /reports/class/:code — both implemented (PDF generation)
- Frontend HOD Reports: All 4 buttons are `Alert.alert` stubs. 3 "View" buttons have NO onPress handler

---

## SECTION 4 — ROLE STATUS

### STUDENT — 45/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | COMPLETE | Real API (4 endpoints) | Best student screen. Breaks if backend offline (no mock fallback) |
| Attendance | PARTIAL | Real API + mock fallback | Subject-wise with progress bars, detention warnings |
| Marks | PARTIAL | Real API + mock fallback | IA1/IA2/IA3 color-coded per subject |
| Notices | COMPLETE | Real API + mock fallback | Title, content, target role badge, date |
| Profile | PARTIAL | None | Inline 10-line component: name, email, USN only. No GPA, edit, photo |
| Timetable | MISSING | Backend ready | No screen, no nav tab |
| Birthday Banner | ORPHANED | Backend ready | BirthdayBanner component exists but never imported |

### FACULTY — 40/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | COMPLETE | Mock | Shows subjects, recent activity |
| SubjectPicker | COMPLETE | Mock | Search, select subject + date/time. Detention bug FIXED |
| AttendanceSession | COMPLETE | Mock | Toggle P/A/OD per student, stats bar |
| EditAttendance | COMPLETE | Mock | Change status with reason logging |
| ReviewSubmit | COMPLETE | Mock | Summary review, calls submitSession() |
| SuccessConfirmation | COMPLETE | None | Auto-dismiss after 5s |
| IAMarksEntry | PARTIAL | Mock | SubjectId lookup bug FIXED. Full Prev/Next student flow |
| MarksSubjectPicker | COMPLETE | Mock | Subject list display bug FIXED (code→subjectCode) |
| Subjects Tab | PLACEHOLDER | None | "Coming Soon" text |
| Timetable | MISSING | Backend ready | No screen |
| Audit Trail | MISSING | None | `edits[]` stored in Zustand but never displayed or persisted |

### HOD — 39/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | PARTIAL | Hardcoded + mock | Shortage cards with fabricated USNs. Faculty workload: top 5 only |
| Analytics | PLACEHOLDER | Fake Math.random() | Attendance bars = 75+random. Alerts = 60+random. bySection never populated |
| Faculty Directory | PARTIAL | Mock | Expand/collapse list. No workload details per faculty |
| Reports | PLACEHOLDER | None | All 4 buttons Alert stubs. 3 "View" buttons have NO handler |
| Detained Students | MISSING | None | Backend model exists, NO endpoints, frontend button shows Alert |

### PRINCIPAL — 34/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | COMPLETE | Real API | Best API-integrated screen in the app |
| Analytics | PARTIAL | Mock (inconsistent) | Dashboard uses real API, Analytics uses mock. Same data, different sources |
| DeptDetailScreen | DEAD | None | Navigated to from dashboard cards. Shows generic text only |
| Notices | PARTIAL | Mock | List works. Post button is Alert stub |

### ADMIN — 25/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | PARTIAL | Hardcoded + mock | 3 quick-action buttons all `() => {}` |
| Users | PARTIAL | Mock | Read-only list with tab filter. No add/edit/delete/search |
| Settings | PLACEHOLDER | None | Hardcoded display values. Reset button is fake Alert sequence |
| Class Assignments | MISSING | Backend ready | Backend has POST/GET/DELETE /admin/assign-class. NO frontend UI |
| User/Role Management | MISSING | Backend missing | Backend has NO user CRUD endpoints |

### ADMISSION CELL — 95/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | COMPLETE | Mock | Cards with stats, recent batch |
| Batch Create | COMPLETE | Mock | Form: dept, year, section, intake, roll range |
| Bulk Student Entry | COMPLETE | Mock | CSV-style multiline input, validation, progress |
| USN Mapping | COMPLETE | Mock | Lists unassigned students, mock mapping button |
| **Backend** | **MISSING** | None | ZERO admission API endpoints. Models exist but no routes |

### PARENT — 60/100
| Screen | Status | API | Notes |
|--------|--------|-----|-------|
| Dashboard | COMPLETE | Mock | Attendance %, GPA, subject breakdown. Static mock child data |
| Attendance | COMPLETE | Mock | Subject-wise with progress bars. No child switcher |
| Marks | COMPLETE | Mock | IA1/IA2/IA3 per subject |
| Notices Tab | MISSING | Backend ready | Not in ParentNavigator at all |

---

## SECTION 5 — BACKEND STATUS

### Working Routes (38 endpoints, fully implemented)
| Group | Endpoints | Status |
|-------|-----------|--------|
| Auth | POST /auth/login, POST /auth/refresh, GET /auth/me | COMPLETE |
| Attendance | POST /mark, PUT /record, GET /summary/:usn, GET /student/:usn/summary, GET /session, GET /session/students | COMPLETE |
| Marks | POST /marks/ia, GET /marks/student/:usn, GET /marks/department/:code | COMPLETE |
| Analytics | GET /analytics/college (6 sub-endpoints: overview, dept-wise, trends, etc.) | COMPLETE |
| Admin | POST /admin/assign-class, GET /admin/assign-class, DELETE /admin/assign-class/:id | COMPLETE |
| Reports | GET /reports/student/:usn, GET /reports/class/:code (PDF) | COMPLETE |

### Stub Routes (controllers return placeholder)
| Group | Endpoints | Controller Status |
|-------|-----------|-------------------|
| Notices | GET /notices, POST /notices | STUB — returns hardcoded data |
| Calendar | GET /calendar, POST /calendar, etc. | STUB — basic implementation |
| Academic Day | GET /current, POST /advance, GET /overrides, POST /overrides, GET /today-schedule | STUB — basic implementation |
| Timetable | Full CRUD (periods + entries) | STUB — basic implementation |
| Birthday | GET /today, GET /visibility/:usn, PUT /visibility | STUB — basic implementation |

### Missing Routes (not registered at all)
| Group | Missing Endpoints |
|-------|-------------------|
| Admission | POST /admission/batch, POST /admission/student/bulk, PUT /admission/map-usn, GET /admission/batches, GET /admission/students, POST /admission/generate-roll-numbers |
| User Management | POST /admin/users, PUT /admin/users/:id, DELETE /admin/users/:id, PUT /admin/users/:id/role |
| Detention | POST /detention, GET /detention/student/:usn, PUT /detention/:id, POST /detention/exempt |
| Assignment Marks | POST /marks/assignment, GET /marks/assignment/student/:usn |
| CIE Summary | POST /cie/finalize, GET /cie/student/:usn |
| Parent | GET /parent/children, GET /parent/child/:id/attendance, GET /parent/child/:id/marks |
| Student Profile | PUT /student/profile, PUT /student/change-password |
| Faculty Profile | PUT /faculty/profile, GET /faculty/workload |

---

## SECTION 6 — DATABASE (Prisma Schema)

18 models in `prisma/schema.prisma`. PostgreSQL.

### Core Entities

**User** — Central entity for all roles
- `id` (Int, PK), `usn` (String, unique), `name`, `email`, `passwordHash`, `role` (enum), `isActive`
- Links to: StudentProfile (1:1), FacultyProfile (1:1), ParentStudent (M:N), AttendanceRecord (markedBy), IAMark (enteredBy), Notice (postedBy), ClassAssignment (assignedBy), etc.

**StudentProfile** — 1:1 with User where role=STUDENT
- `userId` (FK→User), `semester`, `section`, `batch`, `dateOfBirth`
- Links to: AttendanceRecord[], IAMark[], AssignmentMark[], CIESummary[], DetentionRecord[]

**FacultyProfile** — 1:1 with User where role=FACULTY/HOD
- `userId` (FK→User), `designation`, `dateOfBirth`
- Links to: SubjectMapping[], ClassAssignment[]

### Academic Entities

**Subject** — Courses offered
- `code` (unique, e.g. "21CS53"), `name`, `semester`, `credits`, `departmentId`
- Links to: SubjectMapping, AttendanceRecord, IAMark, ClassAssignment, TimetableEntry, etc.

**SubjectMapping** — Faculty-subject assignment
- Unique: `[subjectId, section, academicYear]`

**ClassAssignment** — Faculty-class assignments (active flag)
- Unique: `[subjectId, section, academicYear]`

**AttendanceRecord** — Per-student, per-subject, per-date
- Unique: `[studentProfileId, subjectId, date]`
- Status: PRESENT | ABSENT | OD

**IAMark** — Internal Assessment marks
- Unique: `[studentProfileId, subjectId, iaNumber]`
- `marksObtained` (Float), `maxMarks` (default 30)

### Support Entities

**Notice** — Role/department-targeted announcements
- `targetRole` (nullable enum), `departmentId` (nullable), `isActive`

**AcademicCalendar** — College events
- `type`: exam, holiday, event, etc.

**ParentStudent** — M:N parent-child relationship
- Unique: `[parentId, studentId]`

**DetentionRecord** — Per-semester detention status
- Unique: `[studentProfileId, academicYear, semester]`
- Fields: `isDetained`, `detentionReasons` (String[]), `attendancePercent`, `cieTotal`, `exempted`

**AssignmentMark** — Per-assignment marks
- Unique: `[studentProfileId, subjectId, assignmentNumber]`

**CIESummary** — Finalized CIE scores
- Unique: `[studentProfileId, subjectId]`
- Fields: `iaBestTwo`, `cieFromIA`, `assignmentTotal`, `cieTotal`, `isEligible`, `finalized`

### Administrative Entities

**RollNumberSequence** — Auto-increment roll numbers per dept/year
- Unique: `[department, year]`

**StudentDraft** — Pre-registration student records (Admission Cell)
- `rollNo` (unique), `name`, `gender`, `phone`, `parentPhone`, `admissionType`, `department`, `section`, `mappedUSN`, `batchId`

**AdmissionBatch** — Batch definitions for admission
- `id` (String, PK), `department`, `year`, `section`, `intakeSize`, `startRollNo`, `endRollNo`

### Scheduling Entities

**AcademicDayState** — Current academic day counter
- `currentDay` (Int), `academicYear`, `isActive`

**DayOverride** — Holiday/exam/event overrides
- Unique: `[date]`, optional `departmentId`

**Period** — Time slots (e.g. Period 1: 09:00-09:50)
- `name`, `startTime`, `endTime`, `type`, `order`

**TimetableEntry** — Class schedule
- Unique: `[dayNumber, periodId, section, academicYear]`

### Misc

**BirthdayVisibility** — Per-user birthday display opt-in
- Unique: `[userId]`

**RefreshToken** — JWT refresh token storage
- `token` (unique), `userId`, `expiresAt`

---

## SECTION 7 — CRITICAL FIX HISTORY

### F1: NativeWind/Babel plugin removed (2026-05-17)
- **Problem**: `babel.config.js` had `nativewind/babel` plugin. NativeWind v4 removed this plugin — caused bundler crash.
- **Fix**: Removed `nativewind/babel` from plugins. NativeWind v4 uses `babel-preset-expo` only.
- **File**: `babel.config.js`

### F2: Git submodule → tracked directory (2026-05-17)
- **Problem**: `VCET-AMS-Mobile` was registered as a git submodule pointing to a separate repo. Changes weren't committed to root.
- **Fix**: Removed submodule reference from `.gitmodules`, converted to regular directory, cleaned `.git/index`.
- **File**: `.gitmodules` (deleted), `.git/config`, `.git/index`

### F3: Faculty credential ID mismatch (2026-05-17)
- **Problem**: LoginScreen hint text showed `FAC_CSE01` but mock data uses `FAC_CSE_001` with underscores. DemoCredentialsScreen also showed wrong IDs.
- **Fix**: LoginScreen hint → `FAC_CSE_001`. DemoCredentialsScreen NOT updated (still shows `FAC_CSE01`, `FAC_CSE02`, `FAC_ECE01`).
- **Impact**: DemoCredentialsScreen shows WRONG faculty IDs. Users who try `FAC_CSE01` from the demo screen will fail login.
- **File**: `LoginScreen.tsx` (hint text only)

### F4: SecureStore hang (2026-05-17)
- **Problem**: `setAuth()` called `SecureStore.setItemAsync()` synchronously, blocking the login flow. On Android emulators without SecureStore support, this hangs indefinitely.
- **Fix**: Separated Zustand `set()` from persistence. `set()` runs first (synchronous), then `persistAuthSnapshot()` is fire-and-forget (`.catch()`). Added AsyncStorage fallback for all SecureStore operations.
- **File**: `src/store/authStore.ts`

### F5: API base URL wrong (2026-05-17)
- **Problem**: `api.ts` had `baseURL: 'http://10.164.180.116:5000'` — wrong port (5000 vs 3000), wrong IP (not emulator-compatible).
- **Fix**: Changed to `http://10.0.2.2:3000` (Android emulator host loopback + correct backend port).
- **File**: `src/services/api.ts`

### F6: Login navigation broken (2026-05-17)
- **Problem**: `LoginScreen` called `navigation.reset()` synchronously after `setAuth()` — target route (e.g. 'Admin') wasn't registered yet because the re-render hadn't happened.
- **Fix**: 
  - Removed `navigateToRole()` calls from `LoginScreen`
  - All `Stack.Screen` components now always registered (no conditional rendering)
  - `AppNavigator` uses `navigationRef.reset()` via `useEffect` — runs AFTER re-render commit when target routes exist
  - New file: `src/navigation/navigationRef.ts` — shared ref for both `App.tsx` and `AppNavigator`
- **Still unconfirmed** whether this fully resolves the issue on Android emulator.

### F7: Faculty wrong function params (2026-05-17)
- **Problem**: `SubjectPickerScreen.tsx:78` called `getDetainedStudents(subjectCode, section)` but function expects `(subjectCode, facultyId)`. Second arg `section` (e.g. 'A') didn't match any `facultyId` (e.g. 'FAC_CSE_001') — detention count always 0.
- **Fix**: Changed second arg from `selectedSubject.section` to `facultyId`.
- **File**: `src/screens/SubjectPickerScreen.tsx`

### F8: Faculty broken subjectId mapping (2026-05-17)
- **Problem**: `MarksSubjectPickerScreen` used `item.code` (undefined — should be `item.subjectCode`) and `item.name` (undefined — should be `item.subject`). Even if fixed, the numeric conversion (`2153` from `21CS53`) was prepended with `SUBJ` in `backend.ts` (`getSubjectStudents('SUBJ2153', section)`) while real codes are `'21CS53'`.
- **Fix**: 
  - `item.code` → `item.subjectCode`, `item.name` → `item.subject`
  - `backend.ts`: removed `SUBJ` prefix from `getSubjectStudents()` call
  - `subjectId` param type changed from `number` to `string`
- **Files**: `MarksSubjectPickerScreen.tsx`, `backend.ts`

### F9: Mock data stored as objects not arrays (2026-05-17)
- **Problem**: `mockAttendance` and `mockMarks` are objects keyed by subject code (e.g. `{ CS501: {...}, CS502: {...} }`). `FlatList` requires arrays. The old code assigned the object directly to `records` state — FlatList would render nothing.
- **Fix**: Added `Object.values(data)` conversion in the mock fallback path. The real API returns proper arrays.
- **Files**: `AttendanceScreen.tsx`, `MarksScreen.tsx`

### F10: Student screens wired to real API (2026-05-17)
- **Change**: Attendance, Marks, Notices screens now try `GET /attendance/student/:usn/summary`, `GET /marks/student/:usn`, `GET /notices` first, with mock fallback on failure.
- **Files**: `AttendanceScreen.tsx`, `MarksScreen.tsx`, `NoticesScreen.tsx`

### F11: Faculty submitSession wired to API (2026-05-17)
- **Problem**: `submitSession()` in attendance store was 100% mock — `await new Promise(r => setTimeout(r, 1000))` with no network call.
- **Fix**: Now calls `POST /attendance/mark` with converted studentProfileId + subjectId. Falls back to mock on failure.
- **File**: `src/store/attendance.ts`

---

## SECTION 8 — KNOWN ISSUES

### P0 — CRITICAL (login blocking)

**Issue 1: Login still fails on Android emulator**
- After entering credentials and tapping Login, the app stays on or returns to the Login screen.
- `setAuth()` updates Zustand → `isAuthenticated = true` → React re-renders → `useEffect` fires `navigationRef.reset()` to the role screen.
- **Hypothesized causes** (in order of likelihood):
  1. `navigationRef.isReady()` returns `false` when `useEffect` fires (NavigationContainer not ready yet)
  2. `navigationRef.reset()` fires but the route transition fails silently
  3. A runtime error in the target screen (e.g. `AdminDashboardScreen`) causes React Navigation to revert
  4. Authentication store isn't correctly rehydrated on app start
- **To diagnose**: Add a `setTimeout` delay before navigation, or handle `isReady()` with polling. Check `adb logcat` for crash traces.

**Issue 2: DemoCredentialsScreen shows wrong faculty IDs**
- Shows `FAC_CSE01`, `FAC_CSE02`, `FAC_ECE01` but actual mock users are `FAC_CSE_001`, `FAC_CSE_002`, `FAC_ECE_001`
- Users who try these IDs from the demo screen will get "Invalid credentials"

**Issue 3: Mixed API/mock architecture**
- Dashboard uses real API → breaks if backend is offline (no mock fallback)
- Most other screens use mock data → work without backend but show fake data
- Inconsistent user experience

### P1 — HIGH (feature gaps)

**Issue 4: Faculty attendance 100% mock**
- `submitSession()` now calls `POST /attendance/mark` but fallback is silent mock (no error reported to user)
- All attendance UI screens operate entirely on mock data

**Issue 5: IA marks entry broken pipeline**
- SubjectPickerScreen → IAMarksEntryScreen flow was fixed (subjectId string instead of numeric), but `getAttendanceSessionData` in `backend.ts` may still have issues with certain subject codes

**Issue 6: HOD shortage data is fabricated**
- `SHORTAGE_STUDENTS` array has hardcoded USNs that don't match `mockStudents` data
- Names are invented, not from actual mock records

**Issue 7: Principal DeptDetailScreen dead**
- Navigated to from Dashboard department cards, but shows generic placeholder text
- No API calls, no mock data

**Issue 8: Admin quick-action buttons dead**
- "System Settings", "Manage Users", "View Audit Logs" — all `onPress={() => {}}`

### P2 — MEDIUM

**Issue 9: No timetable UI despite full backend**
- Backend has complete Period + TimetableEntry CRUD
- No frontend screens, no nav tabs, no API calls

**Issue 10: Birthday banner orphaned**
- `BirthdayBanner` component in `src/components/` is never imported anywhere

**Issue 11: FacultyProfile imports wrong store**
- `FacultyDashboardScreen` imports `useAuthStore` from `'../store/auth'` — correct
- But some faculty screens import from `'../../store/authStore'` — inconsistent

**Issue 12: HOD department key mismatch**
- `DEPARTMENTS` map uses keys: `CSE|ECE|AIML|CD|CV|MECH|BASIC_SCIENCE`
- But `user.department` can be: `MCA|ISE|SCIENCE_HUMANITIES` (values that exist in mock data)
- Faculty from these departments see undefined department info

**Issue 13: `sessionType` hardcoded to 'lecture'**
- `SubjectPickerScreen.tsx:115` — never allows 'lab' session type

**Issue 14: No GitHub remote configured**
- Repo cannot be pushed. No backup, no collaboration.

### P3 — LOW (cosmetic / nice-to-have)

**Issue 15: Pull-to-refresh is fake**
- Most screens use `setTimeout(() => setRefreshing(false), 500)` instead of actually refreshing data

**Issue 16: `StudentDashboardScreen.tsx` is dead**
- File at `src/screens/student/StudentDashboardScreen.tsx` contains a single reexport line
- Not imported anywhere — the navigator uses the real `DashboardScreen` instead

**Issue 17: TypeScript implicit-any errors**
- 15 pre-existing TS errors (all implicit `any` types in lambda params)
- Non-blocking for Expo bundling (Babel doesn't typecheck)

**Issue 18: `victory-native` chart library**
- Used in Principal Analytics screen. Known compatibility issues with Hermes engine and React Native 0.81.
- Charts may not render at all on Android

**Issue 19: Faculty audit trail never displayed**
- `edits[]` array collected in Zustand store but never persisted or shown to user
- No UI to view attendance edit history

---

## SECTION 9 — TEST ACCOUNTS

All passwords and credentials. Login flow: try backend API first → fall back to mock.

### Student
| USN | Password | Name | Section | Dept |
|-----|----------|------|---------|------|
| 4VP21CS001 | vcet@123 | Aditya Kumar | A | CSE |
| 4VP21CS002 | vcet@123 | Priya Sharma | A | CSE |
| 4VP21CS003 | vcet@123 | Rajesh Patel | A | CSE |
| 4VP21CS004 | vcet@123 | Neha Gupta | A | CSE |
| 4VP21CS005 | vcet@123 | Vikram Singh | B | CSE |
| 4VP21CS006 | vcet@123 | Divya Menon | B | CSE |
| 4VP21CS007 | vcet@123 | Karthik Rao | B | CSE |
| 4VP21CS008 | vcet@123 | Ananya Singh | C | CSE |
| 4VP21CS009 | vcet@123 | Arjun Nair | C | CSE |
| 4VP21CS010 | vcet@123 | Shreya Iyer | C | CSE |
| 4VP21EC001 | vcet@123 | Ravi Kumar | A | ECE |
| 4VP21EC002 | vcet@123 | Sanjana Desai | A | ECE |
| 4VP21EC003 | vcet@123 | Ashok Verma | B | ECE |
| 4VP21EC004 | vcet@123 | Pooja Rao | B | ECE |
| 4VP21EC005 | vcet@123 | Ramesh Gowda | C | ECE |

### Faculty
| ID | Password | Name | Dept |
|----|----------|------|------|
| FAC_CSE_001 | faculty@123 | Mrs. Akshaya D. Shetty | CSE |
| FAC_CSE_002 | faculty@123 | Mr. Ajay Shastry C G | CSE |
| FAC_ECE_001 | faculty@123 | Mr. Naveenakrishna P V | ECE |

### HOD
| ID | Password | Name | Dept |
|----|----------|------|------|
| HOD_CSE | hod@123 | Prof. Pradeep Kumar KG | CSE |

### Admin
| ID | Password | Name |
|----|----------|------|
| ADMIN | admin@123 | Admin User |

### Principal
| ID | Password | Name |
|----|----------|------|
| PRINCIPAL | principal@123 | Dr. Mahesh Prasanna K |

### Parent
| ID | Password | Name | Ward |
|----|----------|------|------|
| PARENT01 | parent@123 | Mr. Arjun Patel | 4VP21CS001 |

### Admission Cell
| ID | Password | Name |
|----|----------|------|
| ADMISSION | admission@123 | Ms. Anitha K |

---

## SECTION 10 — CURRENT PROJECT STATE

### Completion: ~45%

| Area | % | Notes |
|------|---|-------|
| Frontend screens | 60% | ~40 screens, most render content. 3 dead/placeholder |
| Backend endpoints | 75% | 38 working, ~14 missing areas |
| Mock data coverage | 85% | Covers most roles. Only CSE/ECE departments |
| API integration | 20% | Only Student Dashboard + Principal Dashboard use real APIs consistently |
| Real database integration | <5% | No screens write to real backend database |
| Admission workflow | 95% | Best implemented module (mock, but complete end-to-end) |
| Parent workflow | 60% | Read-only monitoring works. Missing Notices tab |
| Faculty workflow | 40% | All screens exist. All mock. 2 critical bugs FIXED |
| HOD workflow | 39% | Fake analytics, dead reports, fabricated shortage data |
| Principal workflow | 34% | Dashboard real API. Analytics mock. DeptDetail dead |
| Admin workflow | 25% | Dead buttons, read-only user list, cosmetic settings |

### Deployment Readiness: NOT READY

**What works for a demo:**
- All roles can log in with mock credentials
- Student Dashboard shows real API data (if backend running)
- Admission Cell full workflow (mock)
- Parent read-only screens (mock)
- Faculty attendance marking flow (mock, UI complete)
- Faculty IA marks entry flow (mock, UI complete)
- Principal Dashboard (real API)
- Admin login + navigation

**What blocks deployment:**
1. Login → role navigation transition still broken on Android emulator
2. No GitHub remote — no deployment pipeline
3. Half the app uses mock data, half uses real API — confusing UX
4. Backend has no admission endpoints — Admission Cell workflow can't go live
5. No user management — Admin cannot create users
6. Many screens have dead buttons or placeholder content
7. Only CSE/ECE mock data — other departments can't test

### Prototype Readiness: ALPHA

The app demonstrates all intended features at a UI level. Most screens render. The workflow logic is correct. What's missing is the data pipeline (mock → real API) and a handful of screens.

---

## SECTION 11 — NEXT STEPS (Execution Order)

### Phase 1: Login Fix (blocking)
1. **Diagnose login navigation failure** — Add `adb logcat` monitoring, check if `navigationRef.isReady()` returns false, check if target screens throw errors on mount, add retry logic with `setTimeout` for navigation
2. **Fix DemoCredentialsScreen faculty IDs** — Change `FAC_CSE01` → `FAC_CSE_001` (and all other faculty IDs) to match actual mock data. Currently users see wrong IDs on the demo screen
3. **Verify login works for ALL 7 roles** on Android emulator — test each role end-to-end

### Phase 2: API Wiring (data pipeline)
4. **Wire HOD Dashboard** — Replace hardcoded `SHORTAGE_STUDENTS` with real/filtered mock data. Wire detention counts to `getDetainedStudentsList()` mock function
5. **Wire Principal Analytics** — Replace Math.random() data with real API call to `GET /analytics/college`
6. **Wire Parent screens** — Replace mock data with real API calls (`GET /parent/child/:id/attendance`, etc.)
7. **Wire Faculty attendance submission** — Confirm `POST /attendance/mark` works end-to-end
8. **Wire Faculty IA marks entry** — Confirm `POST /marks/ia` works end-to-end

### Phase 3: Missing Features (critical gaps)
9. **Create Student Timetable screen** — Backend is ready (`GET /timetable/day`, `GET /timetable/week`). Create screen + add to StudentNavigator tab
10. **Import BirthdayBanner** — Import into Student Dashboard. Backend ready (`GET /birthdays/today`)
11. **Create Student Profile screen** — Currently inline placeholder. Build proper profile with GPA, academic status, photo, edit functionality
12. **Add Parent Notices tab** — Add to ParentNavigator. Backend ready (`GET /notices`)

### Phase 4: Backend Completion
13. **Build Admission API endpoints** — Create routes/controllers/services for: batch CRUD, student draft CRUD, USN mapping, roll number generation
14. **Build User Management API** — Create POST/PUT/DELETE /admin/users endpoints, role assignment
15. **Build Detention API** — Create DetentionRecord CRUD endpoints (backend model exists)
16. **Build Assignment Marks + CIE Summary API** — Backend models exist, no endpoints

### Phase 5: Deployment
17. **Configure GitHub remote** — `git remote add origin <url>` → push all changes
18. **Create .env.example** — Document required env vars (DATABASE_URL, JWT secrets, PORT)
19. **Deploy backend** to a hosting service (Render, Railway, or on-premise)
20. **Update API base URL** — Change from `10.0.2.2:3000` to the deployed backend URL
21. **Test on physical Android device** over WiFi/LAN

### Phase 6: Polish
22. **Replace fake pull-to-refresh** with actual data refresh on all screens
23. **Remove dead files** — `StudentDashboardScreen.tsx` (re-export only)
24. **Fix TypeScript implicit-any errors** — 15 pre-existing, non-blocking
25. **Fix `victory-native` chart rendering** — Or replace with simpler chart library

---

## SECTION 12 — AI HANDOFF NOTES

### What future AI should NOT do
- **NO architecture rewrites** — Don't restructure navigation, don't change state management approach, don't swap libraries. The current architecture works for a prototype.
- **NO dependency upgrades** — Don't update React Navigation, Expo, Zustand, or any other library. Version bumps introduce breaking changes that waste time.
- **NO mega audits** — The audit in `FLOW_COMPLETENESS_REPORT.md` is comprehensive. Don't re-audit. Use it as reference.
- **NO new features** — Don't add features not listed in Section 11. Focus on fixing existing functionality.
- **NO redesign of existing working screens** — If a screen renders content correctly, don't change its layout or behavior unless it's broken.
- **NO test framework setup** — This is a prototype. Unit tests, E2E tests, CI pipelines are premature.

### What future AI SHOULD do
- **Follow the execution order in Section 11** — Start with Phase 1 (login fix), then Phase 2 (API wiring), etc. Don't skip ahead.
- **Use `SPRINT_PROGRESS.md` for daily tracking** — Update it after each session.
- **Check `FLOW_COMPLETENESS_REPORT.md` before modifying any screen** — Know what's COMPLETE vs BROKEN vs MISSING before making changes.
- **Preserve mock fallback pattern** — All API calls should have a try-catch with mock fallback. The app MUST work offline.
- **Prototype > perfection** — A working screen with mock data is better than a broken screen with real API. Stability > feature count.
- **Keep logs verbose** — `[LOGIN]`, `[NAV]`, `[STORE]`, `[PERSIST]` prefixes. These make debugging possible in CLI-only mode.

### Mobile App Quirks
- `babel.config.js` uses `babel-preset-expo` only — NO `nativewind/babel` plugin (NativeWind v4 incompatibility)
- `automaticPersistence` in NativeWind v4 (no config needed — reads `tailwind.config.js`)
- `@react-navigation/stack` v7 is used (NOT `@react-navigation/native-stack`). They have different APIs.
- Zustand stores use fire-and-forget `.catch()` for persistence to prevent SecureStore hangs
- `api.ts` has offline cache interceptor using React Query — caches successful GET responses
- `10.0.2.2` is Android emulator's loopback to host machine. On physical device, use the machine's LAN IP

### The Login Ambiguity
The login issue has been the #1 unsolved problem across multiple sessions. Here's every detail:

**What happens:**
- User enters credentials, taps Login → loading state appears briefly → app stays on or returns to Login screen
- `console.log` shows: `[LOGIN] setAuth COMPLETED` → `[NAV] useEffect fired, isAuthenticated: true` → `[NAV] *** RESETTING to: Admin`
- After reset, the screen should show `AdminNavigator` but instead shows `Login` again

**What was tried:**
1. `navigation.reset()` from `LoginScreen` (sync after setAuth) — FAILED (route not yet registered)
2. Removed `navigation.reset()` entirely, relied on conditional rendering — FAILED (navigator didn't auto-transition)
3. All screens always registered + `navigationRef.reset()` via `useEffect` — **CURRENT, UNCONFIRMED**

**Remaining hypotheses:**
1. `navigationRef.isReady()` returns `false` → `reset` is never called → navigator stays on Login
2. `navigationRef.reset()` executes but target navigator errors → React Navigation reverts to Login
3. Auth store isn't actually persisting between re-renders (Zustand devtools or StrictMode causing double-render)
4. Some parent component unmounts `AppNavigator` during transition (unlikely given App.tsx structure)

**Diagnostic approach if this file is handed off:**
1. Add `[NAV]` log to check `navigationRef.isReady()` value right before the reset call
2. Wrap `navigationRef.reset()` in a `setTimeout(fn, 100)` to see if timing is the issue
3. Add a `[NAV] ERROR` catch around the reset call
4. Check `adb logcat AndroidRuntime` for any Java-level crash
5. As last resort: force `isAuthenticated` to `true` in `App.tsx` directly (hardcode) to isolate whether the navigation OR the auth state transition is the problem

---

*End of PROJECT_CONTEXT_MASTER.md — This document is self-contained. A future AI reading only this file should understand the entire project.*
