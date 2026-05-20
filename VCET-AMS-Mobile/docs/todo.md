# VCET AMS — Master Todo

## ✅ Done (Session: User Creation Feature)

| File | What |
|------|------|
| `src/utils/passwordUtils.ts` | `suggestPassword()`, `generateBulkUSNs()`, `validateUSN()`, `suggestParentPassword()` |
| `src/store/adminStore.ts` | Zustand store (`adminUsers` array), pre-loads from `mockUsers` + `mockStudents`, CRUD + `getHODForDepartment` |
| `src/screens/admin/CreateUserScreen.tsx` | 3-step wizard modal (Step 1: single/bulk mode; Step 2A: role-dependent form; Step 2B: bulk preview; Step 3: success card with password copy). Step type = string `'1'|'2'|'2b'|'3'`. HOD conflict warning, parent password suggestion, strength indicator, DOB range for bulk. |
| `src/screens/admin/UsersScreen.tsx` | Reads from `useAdminStore`, opens `CreateUserScreen` modal, edit modal preserved |

## ✅ Done (Session: Academic Day Calculator)

| File | What |
|------|------|
| `src/types/index.ts` | Added `AcademicDayInfo` type |
| `src/mock/academicCalendar.ts` | Two terms (Odd/Even 2025-26), holidays, events, exams |
| `src/utils/academicDayUtils.ts` | `getAcademicDayInfo(date)` — counts working days, holidays, week number, progress |
| `src/hooks/useAcademicDay.ts` | React hook with midnight-auto-refresh |
| `src/screens/student/DashboardScreen.tsx` | "Day 47 of 100" banner with progress bar & event display |
| `src/screens/HodDashboardScreen.tsx` | Academic day info in header card + progress bar |

## ✅ Done (Session: Birthday Visibility System)

| File | What |
|------|------|
| `src/mock/students.ts` | Added `dateOfBirth` (YYYY-MM-DD) to all 50+ student records (3 on May 18 for testing) |
| `src/mock/birthdays.ts` | Rewritten to dynamically derive from `mockStudents.dateOfBirth`; added `getStudentBirthday(usn)` |
| `src/components/BirthdayBanner.tsx` | Accepts optional `department` prop for filtering |
| `src/screens/student/DashboardScreen.tsx` | Birthday greeting banner when today matches logged-in student |
| `src/screens/student/StudentProfileScreen.tsx` | Created — shows DOB, academic info, personal info, logout |
| `src/navigation/StudentNavigator.tsx` | Replaced inline ProfileScreen with proper `StudentProfileScreen` |
| `src/screens/HodDashboardScreen.tsx` | Department-filtered `BirthdayBanner` in header |

## ✅ Done (Session: Notes/PDF Sharing)

| File | What |
|------|------|
| `src/types/index.ts` | Added `Note` and `NotesStoreState` types |
| `src/store/notesStore.ts` | Zustand store with persist, CRUD, filter methods, 6 mock notes |
| `src/screens/faculty/NotesScreen.tsx` | List + upload modal with title, subject picker (from assigned subjects), delete |
| `src/screens/student/NotesScreen.tsx` | Browse by subject folder, drill into individual notes list |
| `src/navigation/FacultyNavigator.tsx` | Added Notes tab (between Subjects & Marks) |
| `src/navigation/StudentNavigator.tsx` | Added Notes tab (between Attendance & Marks) |

## 🟠 Medium Priority

- [x] **Profile screens** — one per role showing user info, logout, edit capability → All 7 roles (Student, Faculty, HOD, Principal, Admin, Admission, Parent) have dedicated profile screens
- [x] **Fix 16 pre-existing TS errors** — `AttendanceSessionScreen`, `hod/AnalyticsScreen`, `ReviewSubmitScreen`, `authStore.ts` → **0 errors remaining**
- [x] **Populate `src/hooks/`** — `useAcademicDay`, `useNetworkStatus`, `useRoleGuard` → all 3 created

## 🟢 Low Priority / Polish

- [ ] Enrich mock data — more students, realistic attendance, proper parent-ward links
- [ ] Pull-to-refresh on all list screens (Attendance, Marks, Notices)
- [ ] Consistent search/filter on all list screens
- [ ] Loading states & error boundaries everywhere
- [ ] `src/mock/birthdays.ts` — wire into birthday flow if not already used

## ⚠️ Critical Context for Next Session

- **Expo v54.0.34**, RN 0.81.5, TypeScript 5.9.2
- **Step type is string literals** (`'1'`/`'2'`/`'2b'`/`'3'`) — `2b` is invalid as numeric literal
- **All mock data** in `src/mock/`, stores in `src/store/`
- **No backend** — everything offline, Zustand stores hydrate from mock files
- **Pre-existing TS errors** (16 total, unrelated to these features)
- `expo-print` already installed (used for HOD reports)
- No `expo-document-picker` needed — Expo SDK 54 has it built-in
- Parent role must never see Notes tab
