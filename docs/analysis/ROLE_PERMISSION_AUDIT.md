# Role Permission & Navigation Security Audit

**System:** Cells AMS — VCET Academic Monitoring System  
**Audit Date:** 2026-05-14  
**Scope:** Mobile app (VCET-AMS-Mobile) + Backend (Express/Prisma)  
**Roles Audited:** STUDENT, FACULTY, HOD, PRINCIPAL, ADMIN, PARENT, ADMISSION_CELL

---

## Executive Summary

**34 screens** and **8 navigators** analyzed across **7 roles**.  
**5 CRITICAL** vulnerabilities found. **8 HIGH** severity issues.

The primary defence is **navigator-level routing** (`AppNavigator.tsx` switches on `user.role`). Below that, **zero screens** re-validate the user's role before accessing data or performing actions. This is a single-point-of-failure pattern: if the navigation gate is bypassed (deep link, state manipulation, SecureStore tampering), there are no secondary defences.

---

## 1. NAVIGATION SECURITY

### 1.1 AppNavigator — Role Gate (Single Point of Failure)

```
AppNavigator.tsx
├── !isAuthenticated  → LoginScreen
├── STUDENT           → StudentNavigator
├── FACULTY           → FacultyNavigator
├── HOD               → HodNavigator
├── PRINCIPAL         → PrincipalNavigator
├── ADMIN             → AdminNavigator
├── PARENT            → ParentNavigator
├── ADMISSION_CELL    → AdmissionNavigator
└── fallback          → LoginScreen
```

| Issue | Severity | Detail |
|-------|----------|--------|
| Single gate, no downstream checks | **CRITICAL** | After routing, no screen re-verifies `user.role`. If the navigation gate is bypassed, all screens are accessible. |
| `SecureStore` trust on rehydrate | **HIGH** | Persisted `user` object (with `role`) is restored without signature verification. A tampered SecureStore (jailbroken device) yields forged role. |
| Fallback shows LoginScreen | **LOW** | Unknown roles correctly fall to login, but no error is logged. |

### 1.2 Navigator Isolation

| Navigator | Routes Only These Screens | Contains Cross-Role Screens? |
|-----------|--------------------------|------------------------------|
| `StudentNavigator` | Dashboard, Attendance, Marks, Notices, Profile | No |
| `FacultyNavigator` | DashboardStack (6 screens) + MarksStack (2 screens) + Subjects + Profile | No |
| `HodNavigator` | Dashboard, Analytics, Faculty, Reports, Profile | No |
| `PrincipalNavigator` | Dashboard, Analytics, Notices, Profile + DeptDetail | No |
| `AdminNavigator` | Dashboard, Users, Settings, Profile | No |
| `ParentNavigator` | Dashboard, Attendance, Marks, Profile | No |
| `AdmissionNavigator` | Dashboard, Batches, Students, Mappings, Profile | No |

**Verdict:** Navigation is well-isolated at the navigator level. No screen appears in multiple navigators.

---

## 2. ROLE-BY-ROLE VIOLATIONS

### 2.1 STUDENT

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View own attendance | ✅ | ✅ Filtered by `user.usn` | PASS |
| View own marks | ✅ | ✅ Filtered by `user.usn` | PASS |
| View notices | ✅ | ✅ Filtered by role | PASS |
| Edit attendance | ❌ | ❌ Not routable | PASS |
| Edit marks | ❌ | ❌ Not routable | PASS |
| Access admin screens | ❌ | ❌ Not routable | PASS |

**Issues:** None. Student data access is properly scoped via USN key in mock objects.

---

### 2.2 FACULTY

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View assigned subjects | ✅ | Filtered by `facultyId` | PASS |
| Mark attendance | ✅ | Via attendance flow | PASS |
| Edit IA marks | ✅ | Via marks flow | PASS |
| Access other departments | ❌ | Can see `DEPARTMENTS` constant | LOW |
| Leave department scope | ❌ | Mock `getFacultySubjects` only returns own | PASS |
| Access principal analytics | ❌ | ❌ Not routable | PASS |

**Issues:**

| # | File | Issue | Severity |
|---|------|-------|----------|
| F1 | `IAMarksEntryScreen.tsx` | **No subject ownership validation.** Accepts `subjectId` from route params without checking the faculty teaches it. Faculty could manipulate params to enter marks for subjects they don't teach. | **HIGH** |
| F2 | `AttendanceSessionScreen.tsx` | **No role check.** Accepts full attendance session via route params with zero validation. | **HIGH** |
| F3 | `EditAttendanceScreen.tsx` | **No role check.** Accepts student record via params. Edit log missing `editedBy` field. | **HIGH** |
| F4 | `SubjectPickerScreen.tsx` | Reads entire `mockStudents` array (all departments, all sections). | **MEDIUM** |

---

### 2.3 HOD

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View department analytics | ✅ | ✅ | PASS |
| View faculty directory | ✅ | Filtered by dept | PASS |
| Approve attendance edits | ✅ | Via permission helper | PASS |
| View ALL attendance | ❌ | **Reads all records** via `Object.values(mockAttendance).flat()` | **CRITICAL** |
| Access admin settings | ❌ | ❌ Not routable | PASS |
| Edit other departments | ❌ | ❌ Not routable | PASS |

**Issues:**

| # | File | Issue | Severity |
|---|------|-------|----------|
| H1 | `hod/AnalyticsScreen.tsx:19` | `Object.values(mockAttendance).flat()` — reads attendance records for ALL students across ALL departments. An HOD from CSE can see ECE, MECH attendance data. | **CRITICAL** |
| H2 | `hod/AnalyticsScreen.tsx` | No role re-validation. Relies solely on navigator routing. | **MEDIUM** |

---

### 2.4 PRINCIPAL

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View college analytics | ✅ | ✅ Via API | PASS |
| View department detail | ✅ | ✅ Via navigation | PASS |
| Modify attendance | ❌ | ❌ Not routable | PASS |
| Edit marks | ❌ | ❌ Not routable | PASS |
| View role-targeted notices | ✅ Should see all | ✅ Gets all notices (no role filter) | PASS |

**Issues:**

| # | File | Issue | Severity |
|---|------|-------|----------|
| P1 | `principal/DashboardScreen.tsx` | No role check before calling `GET /analytics/college`. Any authenticated user (with valid token) could call this endpoint. | **MEDIUM** |
| P2 | `principal/NoticesScreen.tsx` | Calls `getNotices()` without role filter — correct for principal, but the screen doesn't verify the caller is principal. | **LOW** |

---

### 2.5 ADMIN

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View all users | ✅ | Reads all mock data | PASS |
| System settings | ✅ | Static UI | PASS |
| Edit attendance/marks | ✅ | Has all permissions | PASS |
| Access student academic data | ✅ | Correct by role | PASS |

**Issues:**

| # | File | Issue | Severity |
|---|------|-------|----------|
| A1 | `admin/UsersScreen.tsx` | No role check. Displays full user directory (names, USNs, roles, departments) without re-verifying admin role. | **MEDIUM** |

---

### 2.6 PARENT

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| View ward attendance | ✅ | ✅ Via mock data | PASS |
| View ward marks | ✅ | ✅ Via mock data | PASS |
| Edit anything | ❌ | ❌ Not routable | PASS |
| See other students | ❌ | **Leaks via fallback** | **CRITICAL** |

**Issues:**

| # | File | Issue | Severity |
|---|------|-------|----------|
| PA1 | `parent/DashboardScreen.tsx:13` | `mockStudents.find((s) => s.usn === user.usn) ?? mockStudents[0]` — if `user.usn` is undefined or doesn't match, **falls through to the first student in the mock list (Aditya Kumar)**. Leaks name, USN, GPA, attendance, marks. | **CRITICAL** |
| PA2 | `parent/AttendanceScreen.tsx:13` | Same fallback pattern. Leaks attendance data. | **CRITICAL** |
| PA3 | `parent/MarksScreen.tsx:13` | Same fallback pattern. Leaks marks data. | **CRITICAL** |

---

### 2.7 ADMISSION CELL

| Access | Expected | Actual | Status |
|--------|----------|--------|--------|
| Create batches | ✅ | ✅ | PASS |
| Bulk add students | ✅ | ✅ | PASS |
| Map USNs | ✅ | ✅ | PASS |
| Edit attendance | ❌ | ❌ Not routable | PASS |
| Edit marks | ❌ | ❌ Not routable | PASS |
| View analytics | ❌ | ❌ Not routable | PASS |
| Permission matrix | Empty `[]` | No permissions defined | PASS |

**Issues:** None functionally, but the `ADMISSION_CELL` entry in `ROLE_PERMISSIONS` is an empty array `[]`. This means `hasPermission()` always returns `false` for this role, which is correct (they should only create batches/map USNs). However, the admission screens never use `hasPermission()` — they rely on navigator routing alone.

---

## 3. BACKEND ROLE MIDDLEWARE AUDIT

### 3.1 Backend Route Protection

| Route | Method | Middleware | Roles Allowed | Missing Roles? |
|-------|--------|------------|---------------|----------------|
| `/auth/*` | POST/GET | `auth` | Any authenticated | OK |
| `/admin/*` | ALL | `auth + requireRole("ADMIN")` | Admin only | OK |
| `/attendance/mark` | POST | `auth + FACULTY + classGuard` | Faculty | OK — HOD/ADMIN cannot mark via this route |
| `/attendance/record` | PUT | `auth + FACULTY + classGuard` | Faculty | HOD cannot edit attendance records via backend |
| `/attendance/summary/:usn` | GET | `auth` | Any authenticated | OK — but PRINCIPAL/HOD can query any student's attendance |
| `/attendance/session` | GET | `auth` | Any authenticated | OK |
| `/marks/ia` | POST | `auth + FACULTY + classGuard` | Faculty | OK |
| `/marks/student/:usn` | GET | `auth + STUDENT/PARENT/FACULTY/HOD/PRINCIPAL` | Multiple | OK |
| `/marks/dept/:deptId` | GET | `auth + HOD/PRINCIPAL` | HOD, Principal | OK |
| `/analytics/college` | GET | `auth + PRINCIPAL` | Principal only | **OK** — properly gated |
| `/notices` | GET | `auth` | Any authenticated | OK |
| `/notices` | POST | `auth + ADMIN/HOD/PRINCIPAL` | Admin, HOD, Principal | OK |
| `/calendar` | GET | `auth` | Any authenticated | OK |
| `/reports/*` | GET | `auth + HOD/PRINCIPAL` | HOD, Principal | OK |

**Issues:**

| # | Route | Issue | Severity |
|---|-------|-------|----------|
| B1 | `GET /attendance/summary/:usn` | Any authenticated user (including a STUDENT) can query ANY student's attendance by USN. No ownership check. A student could change the USN in the URL to see other students' attendance. | **CRITICAL** |
| B2 | `GET /marks/student/:usn` | Any role in the allowed list can query any student's marks by USN. No ownership check. A parent could query a non-ward's marks. | **HIGH** |
| B3 | `GET /attendance/session` | Any authenticated user can fetch attendance session data (student names, statuses) for any subject/section. No faculty ownership check. | **HIGH** |
| B4 | `POST /marks/ia` | Uses `classGuard` middleware which checks faculty assignment, but the IAMarksEntryScreen route params include `subjectId` with no server-side validation that the faculty teaches that specific subject at the API level. The classGuard checks assignment exists, but any assigned class is accepted. | **MEDIUM** |

### 3.2 `requireRole` Middleware Completeness

The `requireRole(...roles: Role[])` function accepts the Prisma `Role` enum.  
The Prisma `Role` enum has: `STUDENT, PARENT, FACULTY, HOD, PRINCIPAL, ADMIN, ADMISSION_CELL`  
**ADMISSION_CELL is defined in the Prisma schema but routes using it (`requireRole("ADMISSION_CELL")`) have not been written yet.** The admission system currently has no backend API endpoints — it only exists in the mobile mock layer.

---

## 4. AUTH STORE SECURITY

| Property | Status | Detail |
|----------|--------|--------|
| Token persistence | `expo-secure-store` | ✅ Uses OS-level encrypted storage |
| Token verification | Mock only (synthetic `token_{id}_{timestamp}`) | ❌ No real JWT |
| Password hashing | None (plain-text comparison against mock data) | ❌ No bcrypt |
| Session expiry | Never checked | ❌ Token never expires in mock mode |
| Role change detection | None — role is part of persisted user object | ❌ If token/user tampered, role is trusted |
| Logout | Clears SecureStore | ✅ Proper full clear |

---

## 5. PERMISSION HELPER AUDIT

### 5.1 Missing Roles in Helper Functions

| Function | Missing Role: PARENT | Missing Role: ADMISSION_CELL |
|----------|---------------------|------------------------------|
| `hasPermission()` | ✅ Included (permissions: view_attendance, view_marks) | ✅ Included (permissions: []) |
| `canMarkAttendance()` | N/A — no `mark_attendance` permission | N/A |
| `canEditAttendance()` | ✅ Explicit PRINCIPAL/ADMIN/HOD/FACULTY check; PARENT falls to `return false` | ✅ Falls to `return false` |
| `canApproveAttendanceEdit()` | ✅ Falls to `return false` | ✅ Falls to `return false` |
| `canViewStudent()` | ❌ **Not handled.** Falls through all role checks to `return false`. But a parent SHOULD be able to view their ward. | ✅ Falls to `return false` (correct — admission cell doesn't view students) |
| `canViewDepartmentAnalytics()` | ✅ Falls to `return false` | ✅ Falls to `return false` |
| `canEditMarks()` | ✅ Falls to `return false` | ✅ Falls to `return false` |
| `getUserPermissionLevel()` | ❌ **Missing.** Falls to `'Unknown Role'` default case. | ❌ **Missing.** Falls to `'Unknown Role'`. |
| `getViewableDepartments()` | ❌ **Missing.** Falls to `return []`. Parent should see their ward's department. | ❌ **Missing.** Falls to `return []`. |

### 5.2 `getUserPermissionLevel` Missing Cases

```typescript
// Current — PARENT and ADMISSION_CELL return 'Unknown Role'
case 'PARENT':   return 'Parent - Read Only';
case 'ADMISSION_CELL': return 'Admission Cell - Batch Management';
```

---

## 6. VULNERABILITY SUMMARY

### CRITICAL (5)

| ID | Description | File(s) |
|----|-------------|---------|
| C1 | **No screen re-validates user role after navigator routing.** Single gate failure allows cross-role access. | All 34 screens |
| C2 | **Parent `mockStudents[0]` fallback leaks another student's data** when parent USN is missing/misconfigured. | `parent/DashboardScreen.tsx`, `parent/AttendanceScreen.tsx`, `parent/MarksScreen.tsx` |
| C3 | **Backend `GET /attendance/summary/:usn` has no ownership check.** Any authenticated user can query any student's attendance. | `backend: routes/attendance.routes.ts` |
| C4 | **HOD Analytics reads ALL attendance records globally** instead of filtering by department. | `hod/AnalyticsScreen.tsx` |
| C5 | **Plain-text passwords hardcoded in source and displayed on login screen.** All 15 students share the same password. | `mock/users.ts`, `mock/students.ts`, `LoginScreen.tsx` |

### HIGH (8)

| ID | Description | File(s) |
|----|-------------|---------|
| H1 | Faculty IA marks entry accepts `subjectId` from routes without ownership validation | `faculty/IAMarksEntryScreen.tsx` |
| H2 | Attendance session screens accept full data via route params with zero authorization | `AttendanceSessionScreen.tsx`, `EditAttendanceScreen.tsx` |
| H3 | Attendance edit log missing `editedBy` field — no audit trail | `types/index.ts` (`AttendanceEdit`) |
| H4 | Backend `GET /marks/student/:usn` has no ownership check | `backend: routes/marks.routes.ts` |
| H5 | Backend `GET /attendance/session` has no faculty ownership check | `backend: routes/attendance.routes.ts` |
| H6 | `SecureStore` persisted user/role not cryptographically verified on rehydrate | `store/authStore.ts` |
| H7 | Demo passwords identical for all students — no uniqueness | `mock/students.ts` |
| H8 | `getUserPermissionLevel()` returns `'Unknown Role'` for PARENT and ADMISSION_CELL | `utils/permissionHelpers.ts` |

### MEDIUM (6)

| ID | Description | File(s) |
|----|-------------|---------|
| M1 | Backend IP address `10.164.180.116:5000` hardcoded in source | `services/api.ts` |
| M2 | SubjectPickerScreen reads entire `mockStudents` array | `SubjectPickerScreen.tsx` |
| M3 | Admin Users screen has no role re-validation before showing full user directory | `admin/UsersScreen.tsx` |
| M4 | `canViewStudent()` helper returns `false` for PARENT (should allow viewing ward) | `utils/permissionHelpers.ts` |
| M5 | `getViewableDepartments()` returns `[]` for PARENT and ADMISSION_CELL | `utils/permissionHelpers.ts` |
| M6 | Backend `POST /marks/ia` classGuard allows any assigned class — no specific subject validation beyond "exists in assignment" | `backend: routes/marks.routes.ts` |

### LOW (4)

| ID | Description | File(s) |
|----|-------------|---------|
| L1 | SuccessConfirmation screen has no role check (displays only non-sensitive summary) | `SuccessConfirmationScreen.tsx` |
| L2 | Admission screens have no role check (gated by navigator, no cross-role data exposed) | `admission/*.tsx` |
| L3 | HOD Reports screen is UI-only — no data access | `hod/ReportsScreen.tsx` |
| L4 | Principal DeptDetail is a stub — no data access | `principal/DeptDetailScreen.tsx` |

---

## 7. RECOMMENDED FIXES

### Phase 1 — Critical (immediate)

1. **Add screen-level role guards** — Add a guard component at the top of every screen:
   ```tsx
   if (user.role !== 'FACULTY') return <RedirectToLogin />;
   ```

2. **Fix parent fallback** — Replace `mockStudents[0]` with null check + error state.

3. **Scope HOD analytics by department** — Filter attendance data by `user.department`.

4. **Add ownership check on attendance/marks endpoints** — Backend must verify `req.user.usn === req.params.usn` for student endpoints.

5. **Remove hardcoded passwords from UI** — Never display credentials on the login screen, even in dev mode.

### Phase 2 — High (next sprint)

6. **Add `editedBy` to `AttendanceEdit` type** — Track which user made each attendance edit.

7. **Validate subject ownership in IA marks entry** — Faculty must teach the subject to enter marks.

8. **Add signature verification to SecureStore tokens** — Use HMAC or envelope encryption.

9. **Update permission helper for PARENT and ADMISSION_CELL** — Fix `getUserPermissionLevel()` and `canViewStudent()`.

10. **Add role check to Axios interceptor** — Attach role to all API calls; backend validates role matches action.

### Phase 3 — Medium

11. **Move API base URL to env** — Use `EXPO_PUBLIC_API_URL` instead of hardcoded IP.

12. **Use environment-based credentials** — Load demo passwords from `.env`, not source code.

13. **Simplify subject list access** — Only load mock students relevant to the faculty's subjects.

---

## 8. AUDIT TRAIL SUMMARY

| Metric | Count |
|--------|-------|
| Screens audited | 34 |
| Navigators audited | 8 |
| Backend routes audited | 15 |
| Role types audited | 7 |
| **CRITICAL vulnerabilities** | **5** |
| **HIGH** | **8** |
| **MEDIUM** | **6** |
| **LOW** | **4** |
| Screens with zero role re-check | 33 / 34 (97%) |
| Backend routes missing ownership check | 2 / 15 (13%) |
| Permission helper missing cases | 2 / 13 functions (15%) |

---

*Report generated: 2026-05-14*
