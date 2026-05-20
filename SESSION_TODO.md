# Session Todo — Cells AMS

## What's Running NOW
- Backend: `npm run dev` on port 3000 (PID from `ts-node-dev`)
- Emulator: Pixel_9, Expo app loaded on login screen
- Metro bundler: port 8081

## Today Completed (2026-05-19)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1-3 | Setup + Bug fixes | ✅ | API config, passwords removed, iOS config |
| 4 | FacultyDashboardScreen → API-first | ✅ | New `GET /faculty/my-classes` backend + mobile screen update |
| 5 | HOD dashboard API-backed | ✅ | New `GET /hod/department-summary` backend + mobile screen update |

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Diagnostic: find why app broke post-migration | ✅ | Found 2 critical bugs |
| 2 | Fix LoginScreen `response.data.data` → `response.data` | ✅ | Bug: backend returns flat `{ accessToken }` at `response.data`, not nested `.data.data` |
| 3 | Fix Timetable envelope `res.data` → `res.data.data` | ✅ | Bug: `setWeekData(res.data)` stored `{ success, data, error }` instead of inner data |
| 4 | Make API URL configurable | ✅ | `app.config.js` reads `API_URL` env var, exposed via `expo-constants` |
| 5 | Strip hardcoded passwords from mobile | ✅ | Removed `ADMIN` hardcoded bypass, removed passwords from DemoCredentials + LoginScreen bottom |
| 6 | Add iOS config + conditional cleartext | ✅ | `bundleIdentifier`, `NSAllowsArbitraryLoads`, cleartext auto from API URL scheme |
| 7 | `GET /faculty/my-classes` backend | ✅ | Returns assigned subjects + enrollment count + last attendance date |

## Linked List — Next Tasks (do in order, one at a time)

### 4. FacultyDashboardScreen → API-backed
- **File:** `VCET-AMS-Mobile/src/screens/FacultyDashboardScreen.tsx`
- **What:** Try `GET /faculty/my-classes` first, fallback to `getFacultySubjects()` mock
- **Backend:** Already done — `GET /faculty/my-classes` returns `[{ subjectId, subjectCode, subjectName, section, semester, enrollmentCount, lastAttendanceDate }]`
- **Response shape:** `{ success: true, data: [...] }` (standard envelope, `coerceList` compatible)

### 5. HOD dashboard → API-backed
- **Files:** `VCET-AMS-Mobile/src/screens/HodDashboardScreen.tsx` + backend `GET /hod/my-department`
- **Backend:** Need to create endpoint returning dept stats, low-attendance alerts
- **Mobile:** API-first, mock-fallback

### 6. Password change endpoint + mobile screen
- **Backend:** `POST /auth/change-password` (currentPassword, newPassword)
- **Mobile:** Add change password screen or modal

### 7. VTU IA marks backend routes (Q1-Q4)
- **Backend:** `POST /marks/vtu/ia`, `GET /marks/vtu/student/:usn`
- **Schema:** `VTUIAMark` model already exists, need controller + service

### 8. Parent dashboard → API-backed
- **Mobile:** `ParentDashboardScreen.tsx` — currently 100% mock
- **Backend:** `GET /parent/my-ward` or reuse existing student endpoints

### 9. Counselling API layer
- **Schema:** `CounsellorAssignment` + `CounsellingSession` models exist
- **Backend:** New route `POST/GET /counselling/*`

### 10. Admission/user-creation API
- **Backend:** `POST /admin/users` for creating students/faculty
- **Mobile:** Wire `CreateUserScreen.tsx` to it

### 11. Cleanup
- Remove `_check_db.ts` if still exists
- Update `DATABASE_RUNTIME_STATUS.md`
- Remove `COUNSELLING_AND_VTU_IA_PLAN.md` if superseded

## Key Files
- `src/app.ts` — route mounts
- `src/routes/faculty.routes.ts` — NEW: faculty my-classes endpoint
- `app.config.js` — configurable API URL + conditional cleartext
- `VCET-AMS-Mobile/src/services/api.ts` — reads API URL from Constants

## Commands
```powershell
# Start backend
cd C:\PROJECTS\Cells-AMS && npm run dev

# Start mobile (with custom API URL)
cd VCET-AMS-Mobile && $env:API_URL="http://YOUR_IP:3000"; npx expo start --android

# Test faculty endpoint (after login with faculty@123)
curl http://localhost:3000/faculty/my-classes -H "Authorization: Bearer <JWT>"
```

---

# PROJECT RULE: DATABASE FIRST ARCHITECTURE

From now onward, Cells AMS follows strict institutional data rules.

**IMPORTANT: DO NOT ignore this rule in future TODO chains.**

## SOURCE OF TRUTH RULE

Institutional data MUST NOT permanently stay inside:
- mock files
- frontend stores
- hardcoded arrays
- navigator configs
- local variables
- temporary TypeScript objects

**Database is the SINGLE source of truth.**

Flow:
```
PostgreSQL → Backend API → Frontend → Temporary UI state only
```

Never:
```
Frontend → Hardcoded data → Pretend database exists
```

## MUST USE DATABASE

Store through SQL: Students, Faculty, HOD, Principal, Admin, Parent links, Attendance, VTU IA, CIE, Counselling, Timetable, Subjects, Departments, Academic Day, Semester Cycle, Notices, Calendar Events, Detention, Assignments, Analytics, Birthday records, Faculty workload, Role assignments.

## ALLOWED LOCAL STORAGE

Auth token, Refresh token, Theme, Selected tab, Temporary drafts, Offline unsaved forms, Short-term API cache, Session state, Network state, UI-only settings.

## MOCK DATA RULE

Mock data allowed ONLY IF:
1. Backend route not implemented
2. Database schema not ready

Pattern: `try API → fallback mock`

Once backend exists: **remove permanent mock dependency.**

## REDIS RULE

Redis is NOT a replacement for PostgreSQL. Future Redis use: caching, queue processing, notifications, session acceleration, performance optimization. NOT core institutional storage.

## TODO CHAIN RULE

After every TODO completion check: *Can this work for real VCET institutional use?*

If not → Create NEXT TODO node.

Linked-list workflow: `Finish → Verify → Improve → Continue`

Avoid: feature jumping, architecture rewrites, random refactors.

## FINAL PRIORITY ORDER

1. Working institutional prototype > more features
2. Stability > complexity
3. Database truth > frontend assumptions

---

# NEW FEATURE: VCET INSTITUTION EMAIL LINKING SYSTEM

Institution users already have official VCET mail IDs:
- Student: `4VP24CS038@vcetputtur.ac.in`
- Faculty: `facultyname@vcetputtur.ac.in`

## RULES
- **Keep existing login** (USN for students, ID for faculty/staff)
- Email is LINKED identity, not primary auth
- Mandatory for: Faculty, HOD, Principal, Admin, Admission Cell
- Optional for: Students
- Not applicable: Parents

## DATABASE CHANGES NEEDED
Add to `User` model:
- `email` (unique, domain validation: `@vcetputtur.ac.in`)
- `emailVerified` (boolean)
- `verificationStatus` (enum: NOT_LINKED, PENDING, VERIFIED)
- `lastVerifiedAt` (DateTime?)

## VERIFICATION FLOW V1
1. Enter VCET mail
2. Send OTP or verification link
3. Verify ownership
4. Save linked status

Backend-ready structure first; mock verification allowed temporarily.

## API ROUTES
- `POST /email/link`
- `POST /email/verify`
- `GET /email/status`
- `POST /email/resend`

## UI
Profile section: "VCET Email" with status badge (verified / pending / not linked).

## IMPORTANT
Email is supplementary identity. Do NOT break existing login. USN/role login remains primary.

---

# Session Summary — 2026-05-20

## Completed

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7 | VTU IA backend routes (Q1-Q4) | ✅ | `POST /marks/vtu/ia` upsert Q1-Q4 + auto sectionA/B/total; `GET /marks/vtu/student/:usn`; `GET /marks/vtu/cie/:usn`; `POST /marks/vtu/compute-cie` |
| 8 | Parent dashboard → API-backed | ✅ | All 3 screens (Dashboard, Attendance, Marks) now API-first with mock fallback. `ParentMarksScreen` migrated from mock-only. |
| 9 | Counselling API layer | ✅ | 5 endpoints: `GET /counselling/my-students` (faculty), `GET /counselling/student/:id`, `POST /counselling/session`, `GET /counselling/department` (HOD), `POST /counselling/assign` (HOD), `GET /counselling/my-sessions` (student). Verified working. |
| 10 | Admission/user-creation API | ✅ | `POST /admission/create-student`, `POST /admission/batch/create`, `GET /admission/batches`, `POST /admission/batch/apply` (bulk + auto parent creation). Verified with ADMIN001. |
| 11 | VCET Email linking system | ✅ | New DB fields on `User` (`emailVerified`, `emailVerificationToken`, `emailVerificationSentAt`, `lastVerifiedAt`). Schema pushed via `db push`. 4 routes: `GET /email/status`, `POST /email/link`, `POST /email/verify`, `POST /email/resend`. Token logged to console (V1 mock). |

## New/Modified Files

### Backend routes:
- `src/routes/marks.routes.ts` — 4 VTU IA endpoints
- `src/routes/counselling.routes.ts` — 6 endpoints (faculty, HOD, student roles)
- `src/routes/admission.routes.ts` — 4 endpoints (ADMIN/ADMISSION_CELL only)
- `src/routes/email.routes.ts` — 4 endpoints (any auth)

### Backend services/controllers:
- `src/services/marks.service.ts` — VTU IA upsert, query, CIE compute
- `src/controllers/marks.controller.ts` — 4 VTU IA handlers

### Schema:
- `prisma/schema.prisma` — `User` model: added `emailVerified`, `emailVerificationToken`, `emailVerificationSentAt`, `lastVerifiedAt`

### Mobile:
- `VCET-AMS-Mobile/src/screens/parent/MarksScreen.tsx` — API-first with mock fallback
- `VCET-AMS-Mobile/src/screens/parent/DashboardScreen.tsx` — API-first (prev session)
- `VCET-AMS-Mobile/src/screens/parent/AttendanceScreen.tsx` — API-first (prev session)

### Config:
- `src/app.ts` — mounted `counsellingRoutes`, `admissionRoutes`, `emailRoutes`

## Verified
- Login: `4VP24CS038` / `vcet@123` ✅
- HOD: `HOD_CSE` / `hod@123` ✅
- Faculty my-students counselling: `FAC_CSE_001` / `faculty@123` → 2 assigned students ✅
- HOD counselling dept summary: 5 assignments, all DUE ✅
- Session creation + student my-sessions: working ✅
- Admin batch create + apply: `ADMIN001` / `admin@123` ✅
- Email link/status: `4VP24CS038@vcetputtur.ac.in` → PENDING state ✅
- TypeScript: `npx tsc --noEmit` — clean ✅

## Remaining
- Backend restart needed (was killed). Run: `cd C:\PROJECTS\Cells-AMS && npm run dev`
- Mobile: Profile UI for email linking (status badge + link/verify screen)
- Cleanup temp files + update DATABASE_RUNTIME_STATUS.md
