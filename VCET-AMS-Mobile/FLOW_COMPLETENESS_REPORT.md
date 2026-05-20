# VCET-AMS Mobile — Flow Completeness Report

Generated: 2026-05-17  
Scope: All roles, screens, navigation, backend API mapping

---

## COMPLETED FLOWS

### ✅ Student — Login
- Mock credential lookup works (4VP21CS001/vcet@123)
- Dashboard uses real API (attendance summary, marks, notices, calendar)
- Navigation routing correct

### ✅ Student — Dashboard (Partial API)
- Fetches from 4 real backend endpoints via axios
- Pull-to-refresh wired
- **Broken if backend unreachable** — no mock fallback

### ✅ Admin — Login
- Local auth bypass works (ADMIN/admin@123, no backend needed)
- Navigation to AdminNavigator works

### ✅ Admission Cell — Full Workflow
- Batch Create → Bulk Student Entry → USN Mapping
- All forms have validation, async operations, state management
- Fully wired end-to-end (mock, but complete)
- Best implemented module in the app

### ✅ Parent — Read-only Monitoring
- Dashboard (attendance %, GPA, subject breakdown)
- Attendance (subject-wise with progress bars)
- Marks (IA1/IA2/IA3 per subject)
- Proper fallback when no ward linked

### ✅ Backend — Core API (38 endpoints)
- Auth (login, refresh, me)
- Attendance (mark, update, summary, session)
- Marks (IA upsert, student view, dept view)
- Admin (class assignments CRUD)
- Analytics (college-level)
- Reports (student PDF, class PDF)
- Notices (list, create)
- Calendar (read)
- Academic Day (current, advance, overrides, today schedule)
- Timetable (full CRUD + periods)
- Birthdays (today, visibility toggle)

---

## PARTIAL FLOWS

### ⚠️ Student — Attendance Screen
- **Status**: PARTIAL  
- **Screen**: `screens/student/AttendanceScreen.tsx`  
- **Renders content?** Yes — subject-wise with progress bars  
- **Backend dependency**: `GET /attendance/student/:usn/summary` (exists)  
- **Actually called?** **NO** — uses `mockAttendance` only  
- **Navigation**: Tab works  
- **Missing**: Real API integration, detention status badge

### ⚠️ Student — Marks Screen
- **Status**: PARTIAL  
- **Screen**: `screens/student/MarksScreen.tsx`  
- **Renders content?** Yes — IA1/IA2/IA3 color-coded  
- **Backend dependency**: `GET /marks/student/:usn` (exists)  
- **Actually called?** **NO** — uses `mockMarks` only  
- **Navigation**: Tab works  
- **Missing**: Real API integration, subject-wise drill-down

### ⚠️ Student — Notices Screen
- **Status**: PARTIAL  
- **Screen**: `screens/student/NoticesScreen.tsx`  
- **Backend dependency**: `GET /notices` (exists)  
- **Actually called?** **NO** — uses mock backend adapter  
- **Missing**: Real API integration

### ⚠️ Faculty — Attendance Marking Flow
- **Status**: PARTIAL (UI complete, mock-only)  
- **Screens**: SubjectPicker → AttendanceSession → EditAttendance → ReviewSubmit → SuccessConfirmation  
- **All 6 screens render real content**  
- **Backend dependency**: Multiple endpoints (all exist)  
- **Actually called?** **ZERO** — 100% mock  
- **Critical bug 1**: `getDetainedStudents()` called with `section` instead of `facultyId` (SubjectPickerScreen.tsx:78)  
- **Critical bug 2**: SubjectId numeric conversion produces unmatchable IDs for IA marks student lookup  
- **Missing**: Real API integration, Next/Prev navigation in AttendanceSession (exists in IAMarksEntry)

### ⚠️ Faculty — IA Marks Entry Flow
- **Status**: PARTIAL (UI complete, mock-only)  
- **Screens**: MarksSubjectPicker → IAMarksEntry  
- **All 2 screens render real content**  
- **Backend dependency**: `POST /marks/ia`, `GET /marks/student/:usn` (both exist)  
- **Actually called?** **NO** — uses mock backend  
- **Navigation**: Prev/Next student flow works  
- **Broken**: SubjectId derivation doesn't match mock lookup — no students load for any real subject

### ⚠️ HOD — Dashboard
- **Status**: PARTIAL  
- **Screen**: `screens/HodDashboardScreen.tsx`  
- **Renders content?** Yes — widgets, shortage cards, faculty workload (top 5)  
- **Backend dependency**: None — all hardcoded + mock  
- **Critical issue**: `SHORTAGE_STUDENTS` hardcoded array (6 students with USNs not matching mock data)  
- **Faculty workload**: Only 5 entries shown, no dedicated screen  
- **Pull-to-refresh**: Fake setTimeout

### ⚠️ HOD — Faculty Directory
- **Status**: PARTIAL  
- **Screen**: `screens/hod/FacultyScreen.tsx`  
- **Renders content?** Yes — expand/collapse list  
- **Missing**: Subject workload per faculty, attendance stats, contact actions

### ⚠️ Principal — Dashboard
- **Status**: PARTIAL (best API-integrated screen)  
- **Screen**: `screens/principal/DashboardScreen.tsx`  
- **Backend dependency**: `GET /analytics/college`  
- **Actually called?** **YES** — real API via axios  
- **Loading/error/empty states**: All handled  
- **Department cards**: Tappable → navigates to **dead** DeptDetailScreen

### ⚠️ Principal — Analytics
- **Status**: PARTIAL (mock, not API)  
- **Screen**: `screens/principal/AnalyticsScreen.tsx`  
- **Inconsistency**: Dashboard uses real API, Analytics uses mock. Same data type, different sources.  
- **Missing**: Real charts, trend data, subject-level breakdown

### ⚠️ Principal — Notices
- **Status**: PARTIAL  
- **Screen**: `screens/principal/NoticesScreen.tsx`  
- **List**: Works from mock backend  
- **Post button**: Dead — `Alert.alert` stub only

### ⚠️ Admin — Dashboard
- **Status**: PARTIAL  
- **Screen**: `screens/AdminDashboardScreen.tsx`  
- **Renders content?** Yes — metrics from hardcoded + mock  
- **3 Quick Action buttons**: ALL DEAD (`onPress={() => {}}`)  
- **Missing**: No dashboard drives any action

### ⚠️ Admin — Users Screen
- **Status**: PARTIAL  
- **Screen**: `screens/admin/UsersScreen.tsx`  
- **Renders content?** Yes — read-only user list with tab filter  
- **Missing**: No user creation, edit, delete, role assignment, search

---

## PLACEHOLDER / DEAD SCREENS

### ⬜ Faculty — Subjects Tab
- **Status**: PLACEHOLDER  
- **Screen**: Inline in `FacultyNavigator.tsx`  
- **Content**: "Subjects & Sections / Coming Soon"  
- **Action**: None — purely static

### ⬜ HOD — Reports
- **Status**: PLACEHOLDER  
- **Screen**: `screens/hod/ReportsScreen.tsx`  
- **4 report buttons**: All `Alert.alert` stubs  
- **3 "View" buttons**: NO `onPress` handler at all  
- **PDF generation**: Zero implementation  
- **Data source**: None

### ⬜ HOD — Analytics (data quality)
- **Status**: PLACEHOLDER (for real data)  
- **Screen**: `screens/hod/AnalyticsScreen.tsx`  
- **Attendance Distribution bars**: `75 + Math.random() * 20` — completely fake  
- **Low Attendance Alerts**: `Math.floor(60 + Math.random() * 15)` — completely fake  
- **`bySection` object**: Declared but never populated

### ⬜ Principal — DeptDetailScreen
- **Status**: DEAD PLACEHOLDER  
- **Screen**: `screens/principal/DeptDetailScreen.tsx`  
- **Content**: Generic text: "Detailed analytics view for {deptId} department..."  
- **Data source**: NONE — no API calls, no mock data  
- **Navigation target**: It is the target of tappable department cards on Dashboard, but shows nothing useful

### ⬜ Admin — Settings
- **Status**: PLACEHOLDER  
- **Screen**: `screens/admin/SettingsScreen.tsx`  
- **Content**: Hardcoded display values only  
- **"Reset" button**: Fake `Alert.alert` sequence, no actual effect  
- **No settings persistence**: No state, no API, no store

---

## MISSING FLOWS

### ❌ Student — Timetable
- **Backend**: `GET /timetable/day`, `GET /timetable/week` (both exist, fully implemented)  
- **UI**: No screen, no navigator tab, no API call anywhere  
- **Impact**: Complete gap

### ❌ Student — Birthday Visibility
- **Backend**: `GET /birthdays/today`, `GET/PUT /birthdays/visibility` (all exist)  
- **UI**: `BirthdayBanner` component exists but **never imported anywhere**  
- **Mock data**: `mock/birthdays.ts` exists  
- **Impact**: Feature orphaned

### ❌ Student — Detention Status
- **Backend**: Via attendance summary endpoint (exists)  
- **UI**: No dedicated screen, no dashboard badge  
- **DetentionStatus** type exists in types  
- **Impact**: Missing VTU requirement

### ❌ Student — Profile Details
- **Backend**: `GET /auth/me` returns full user profile  
- **UI**: Inline 10-line component — name + email + usn only  
- **Missing**: GPA, academic status, year/semester, photo, edit, change password

### ❌ Faculty — Audit Trail
- **Backend**: No dedicated endpoint (edits collected in memory only)  
- **UI**: `edits[]` stored in Zustand but never displayed or persisted  
- **Impact**: Faculty has no record of attendance changes made

### ❌ Faculty — Timetable
- **Backend**: Exists  
- **UI**: No screen, no navigator tab  
- **Impact**: Complete gap

### ❌ Faculty — Attendance History
- **Backend**: `GET /attendance/session` (exists)  
- **UI**: No screen to view past sessions  
- **Impact**: Faculty cannot review previously submitted attendance

### ❌ HOD — Faculty Workload (Dedicated Screen)
- **Backend**: No dedicated endpoint (would need aggregation)  
- **UI**: Only 5-item preview on Dashboard  
- **Impact**: HOD cannot review full faculty workload distribution

### ❌ HOD — Shortage Analytics (API-Driven)
- **Backend**: `getDetainedStudents()` exists in mock but never wired  
- **UI**: Hardcoded 6 students on Dashboard  
- **Impact**: Shortage data is fictional

### ❌ HOD — Detained Student List
- **Backend**: DetentionRecord model exists in Prisma but has ZERO endpoints  
- **UI**: No screen — "Detention List" button just shows Alert  
- **Impact**: Core VTU feature missing

### ❌ Principal — Department Detail (Real Data)
- **Backend**: Multiple existing endpoints could feed this (marks, attendance, analytics)  
- **UI**: Complete placeholder  
- **Impact**: Department cards on Dashboard navigate to dead screen

### ❌ Principal — College-wide Shortage Overview
- **Backend**: Not implemented at API level  
- **UI**: No screen  
- **Impact**: Principal cannot see cross-department shortage/detention

### ❌ Principal — Notice Posting Form
- **Backend**: `POST /notices` (exists)  
- **UI**: "Post" button is Alert alert stub  
- **Impact**: Principal cannot create notices from mobile

### ❌ Admin — Assignments UI
- **Backend**: `POST /admin/assign-class`, `GET /admin/assign-class`, `DELETE /admin/assign-class/:id` (all exist)  
- **UI**: No screen, no navigator tab, no button  
- **Impact**: Admin cannot manage faculty-class assignments from mobile despite full backend

### ❌ Admin — Role / User Management
- **Backend**: User CRUD endpoints DO NOT EXIST  
- **UI**: No user creation, editing, role assignment  
- **Impact**: Admin cannot manage users

### ❌ Admin — System Actions
- **Backend**: Academic Day advance (`POST /academic-day/advance`) exists  
- **UI**: No system action buttons work (System Settings, Manage Users, View Audit Logs all `() => {}`)  
- **Impact**: Admin dashboard is decorative only

### ❌ Parent — Notices Tab
- **Backend**: `GET /notices` (exists)  
- **UI**: No notices tab or screen in ParentNavigator  
- **Impact**: Parent cannot view school notices

### ❌ All Roles — Profile Edit / Change Password
- **Backend**: No endpoints  
- **UI**: No screens  
- **Impact**: Users cannot update their profile or password

---

## BROKEN / RUNTIME ISSUES

### 🔴 Faculty — Wrong function signature (SubjectPickerScreen.tsx:78)
- `getDetainedStudents(selectedSubject.subjectCode, selectedSubject.section)`  
- Expected: `getStudentsForSubject(subjectCode, facultyId)`  
- Second arg `section` passed where `facultyId` expected — detention counts always wrong/empty

### 🔴 Faculty — Broken subjectId mapping (MarksSubjectPickerScreen.tsx:35 + backend.ts:153-164)
- `parseInt(item.code.replace(/\D/g, '').slice(0, 5) || '1', 10)`  
- Produces IDs like `2153` from `21CS53` which prepend `SUBJ` to become `SUBJ2153`  
- `getSubjectStudents` checks against actual codes like `21CS53` — no match ever

### 🔴 Faculty — `sessionType` hardcoded to `'lecture'`
- SubjectPickerScreen.tsx:115 — never allows `'lab'` sessions

### 🔴 HOD Dashboard — Hardcoded students mismatch
- `SHORTAGE_STUDENTS` USNs don't match actual `mockStudents` data  
- Names are fabricated, not based on real mock entries

### 🔴 FacultyDashboard — Department key mismatch
- `DEPARTMENTS` keys: `CSE|ECE|AIML|CD|CV|MECH|BASIC_SCIENCE`  
- `user.department` can be: `MCA|ISE|SCIENCE_HUMANITIES` — undefined dept info for these

---

## DEPLOYMENT BLOCKERS

| # | Blocker | Severity | Detail |
|---|---------|----------|--------|
| 1 | **Half-API-half-mock architecture** | CRITICAL | Dashboard uses real API → breaks when backend off. Other screens use mock → work without backend. No consistent strategy. |
| 2 | **Login navigation broken** | CRITICAL | `AppNavigator` conditional rendering doesn't auto-navigate after auth. `navigation.reset()` workaround just added but untested. |
| 3 | **SecureStore hanging** | HIGH | `setAuth` → `persistAuthSnapshot` → `SecureStore.setItemAsync` can hang. Fix applied (fire-and-forget persist) but root issue in SecureStore not addressed. |
| 4 | **Mock data limited to CSE/ECE** | HIGH | Only 15 students (10 CSE + 5 ECE). Faculty from other departments cannot test login. |
| 5 | **No user management API** | HIGH | Admin cannot create users. All users must be seeded via Prisma seed script. |
| 6 | **Faculty attendance 100% mock** | HIGH | Marking attendance does nothing — no data sent to backend. |
| 7 | **IA marks entry broken** | HIGH | SubjectId conversion broken — no students load for IA marks. |
| 8 | **DeptDetailScreen dead** | MEDIUM | Principal taps department card → sees placeholder. |

---

## HIGHEST PRIORITY UNFINISHED FLOWS

Ranked by user impact × development cost:

### P0 — CRITICAL (ship-blocking)
1. **Login → Navigation** — Fix the auth-to-dashboard transition (workaround just applied, need to verify)
2. **Faculty attendance submission** — Wire `submitSession()` to real API `POST /attendance/mark`
3. **Faculty IA marks entry** — Fix broken subjectId → student lookup pipeline

### P1 — HIGH (major feature gaps)
4. **Student attendance/marks/notices** — Wire to real API (2+ screens currently mock-only)
5. **HOD shortage/detention data** — Replace hardcoded `SHORTAGE_STUDENTS` with API-drive; wire `getDetainedStudentsList()`
6. **Principal DeptDetailScreen** — Populate with real data from existing endpoints
7. **Admin quick actions** — Wire System Settings, Manage Users, View Audit Logs buttons to actual navigation/screens

### P2 — MEDIUM (important but not blocking)
8. **Student timetable** — Create screen + nav tab (backend ready)
9. **Student birthday banner** — Import `BirthdayBanner` component into Dashboard
10. **HOD reports** — Build real report generation (backend PDF endpoints exist)
11. **Parent notices tab** — Add to ParentNavigator
12. **Faculty timetable screen** — Create (backend ready)
13. **Notice posting form** for Principal/Admin/HOD

### P3 — LOW (nice to have)
14. Student detention status badge
15. Faculty attendance history screen
16. HOD full faculty workload screen
17. Admin assignments UI
18. Admin role/user management
19. Profile screens (edit, change password)
20. Pull-to-refresh that actually refreshes data

---

## COMPLETENESS BY ROLE (Scorecard)

| Role | Score | Best Screen | Worst Screen |
|------|-------|-------------|-------------|
| **Student** | 45/100 | Dashboard (real API) | Timetable (missing) |
| **Faculty** | 40/100 | IAMarksEntry (full UI) | Subjects tab (placeholder) |
| **HOD** | 39/100 | Faculty Directory | Reports (all dead) |
| **Principal** | 34/100 | Dashboard (real API) | DeptDetailScreen (dead) |
| **Admin** | 25/100 | Users List (read-only) | Dashboard actions (all dead) |
| **Admission** | 95/100 | All 4 screens functional | Dashboard quick actions (static cards) |
| **Parent** | 60/100 | Dashboard/Attendance/Marks | Notices tab (missing) |

**Overall App Completeness: ~45%**

---

## APPENDIX: File Status Map

| File Path | Status |
|-----------|--------|
| `src/screens/LoginScreen.tsx` | MODIFIED (admin bypass + navigation.reset) |
| `src/store/authStore.ts` | MODIFIED (fire-and-forget persist) |
| `src/navigation/AppNavigator.tsx` | MODIFIED (debug log added) |
| `src/navigation/StudentNavigator.tsx` | OK |
| `src/screens/student/DashboardScreen.tsx` | OK (real API) |
| `src/screens/student/AttendanceScreen.tsx` | OK (mock-only) |
| `src/screens/student/MarksScreen.tsx` | OK (mock-only) |
| `src/screens/student/NoticesScreen.tsx` | OK (mock adapter) |
| `src/screens/student/StudentDashboardScreen.tsx` | DEAD (re-export only, unused) |
| `src/navigation/FacultyNavigator.tsx` | OK (Subjects tab = placeholder) |
| `src/screens/FacultyDashboardScreen.tsx` | OK (mock) |
| `src/screens/SubjectPickerScreen.tsx` | OK (bug: wrong params) |
| `src/screens/AttendanceSessionScreen.tsx` | OK (mock) |
| `src/screens/EditAttendanceScreen.tsx` | OK (mock) |
| `src/screens/ReviewSubmitScreen.tsx` | OK (mock submit) |
| `src/screens/SuccessConfirmationScreen.tsx` | OK |
| `src/screens/faculty/IAMarksEntryScreen.tsx` | OK (broken subjId lookup) |
| `src/screens/faculty/MarksSubjectPickerScreen.tsx` | OK (broken subjId gen) |
| `src/navigation/HodNavigator.tsx` | OK (no stack = no sub-screens) |
| `src/screens/HodDashboardScreen.tsx` | OK (hardcoded shortage) |
| `src/screens/hod/AnalyticsScreen.tsx` | OK (fake data) |
| `src/screens/hod/FacultyScreen.tsx` | OK |
| `src/screens/hod/ReportsScreen.tsx` | OK (all buttons dead) |
| `src/navigation/PrincipalNavigator.tsx` | OK |
| `src/screens/principal/DashboardScreen.tsx` | OK (real API, best screen) |
| `src/screens/principal/AnalyticsScreen.tsx` | OK (mock, inconsistent) |
| `src/screens/principal/DeptDetailScreen.tsx` | DEAD PLACEHOLDER |
| `src/screens/principal/NoticesScreen.tsx` | OK (list works, post stub) |
| `src/navigation/AdminNavigator.tsx` | OK |
| `src/screens/AdminDashboardScreen.tsx` | OK (3 dead buttons) |
| `src/screens/admin/UsersScreen.tsx` | OK (read-only list) |
| `src/screens/admin/SettingsScreen.tsx` | OK (cosmetic only) |
| `src/navigation/AdmissionNavigator.tsx` | OK |
| `src/screens/admission/DashboardScreen.tsx` | OK |
| `src/screens/admission/BatchCreateScreen.tsx` | OK (complete) |
| `src/screens/admission/BulkStudentEntryScreen.tsx` | OK (complete) |
| `src/screens/admission/USNMappingScreen.tsx` | OK (complete) |
| `src/navigation/ParentNavigator.tsx` | OK (no Notices tab) |
| `src/screens/parent/DashboardScreen.tsx` | OK |
| `src/screens/parent/AttendanceScreen.tsx` | OK |
| `src/screens/parent/MarksScreen.tsx` | OK |
| `src/services/api.ts` | OK (axios configured, unused by screens) |
| `src/store/authStore.ts` | MODIFIED |
| `src/store/attendance.ts` | OK |
| `src/store/admissionStore.ts` | OK |
| `src/types/index.ts` | OK |
| `src/components/BirthdayBanner.tsx` | OK (orphaned) |
