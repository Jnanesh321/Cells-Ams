# Database Runtime Status — Post-Migration Diagnostic

**Date:** 2026-05-19  
**Project:** Cells-AMS (VCET Academic Monitoring System)

---

## 1. Backend Health

| Check | Status | Details |
|-------|--------|---------|
| Server starts | ✅ | `npm run dev` → listening on :3000 |
| Prisma connects | ✅ | No connection errors |
| PostgreSQL accessible | ✅ | DATABASE_URL valid |
| GET /health | ✅ | `{ success: true, message: "VCET AMS Backend Running" }` |

## 2. Database Data (4VP24CS038 / Jnanesh Sharma H)

| Entity | Count | Notes |
|--------|-------|-------|
| User | 1 | role=STUDENT, dept=CSE(id=1), sem=2, sec=A |
| Attendance records | 22 | Via studentProfileId=1 |
| Old IA marks | 24 | Via studentProfileId=1 |
| New VTU IA marks | 16 | Via studentProfileId=1 |

## 3. Totals

| Entity | Count |
|--------|-------|
| Users | 21 |
| Students (profiles) | 10 |
| Attendance records | 220 |
| Old IA marks | 240 |
| VTU IA marks | 160 |

## 4. Login API

| Check | Result |
|-------|--------|
| POST /auth/login (4VP24CS038 / vcet@123) | ✅ JWT returned, role=STUDENT |
| POST /auth/login (FAC_CSE_001 / faculty@123) | ✅ JWT returned, role=FACULTY |
| POST /auth/login (HOD_CSE / hod@123) | ✅ JWT returned, role=HOD |

## 5. API Response Format (Backend)

| Endpoint | Response Structure |
|----------|-------------------|
| POST /auth/login | Flat: `{ success, accessToken, refreshToken, role, user }` |
| All other endpoints | Wrapped: `{ success, data: <actual>, error }` |

## 6. Mobile API URL

| Check | Value |
|-------|-------|
| api.ts baseURL | `http://10.0.2.2:3000` ✅ (correct for Android emulator) |

## 7. Backend Data Verification (Live)

### GET /marks/student/4VP24CS038 ✅
```json
{"success":true,"data":[{"code":"24CS21","name":"Data Structures & Algorithms","ia1":25,"ia2":19,"ia3":20},...]}
```

### GET /attendance/student/4VP24CS038/summary ✅
```json
{"success":true,"data":[{"name":"Data Structures & Algorithms","code":"24CS21","present":3,"total":4,"percentage":75},...]}
```

### GET /notices ✅
```json
{"success":true,"data":[{"id":5,"title":"College Foundation Day",...},...]}
```

## 8. Critical Bugs Found & Fixed

### Bug 1: Login response parsing (CRITICAL)
- **File:** `VCET-AMS-Mobile/src/screens/LoginScreen.tsx:143-144`
- **Symptom:** Login throws on real backend, falls to mock fallback
- **Root cause:** `response.data.data` is `undefined` — backend returns flat `{ accessToken }` at `response.data`, not nested under `.data`. Also expects field `token` but backend returns `accessToken`.
- **Fix applied:** Changed to `response.data.accessToken` and `response.data.user`

### Bug 2: Timetable envelope (CRITICAL)
- **Files:** `VCET-AMS-Mobile/src/screens/student/TimetableScreen.tsx:25-26`, `.../faculty/TimetableScreen.tsx:25-26`
- **Symptom:** Timetable renders empty
- **Root cause:** `res.data` stores the full envelope `{ success, data, error }` instead of `res.data.data`
- **Fix applied:** Changed to `setWeekData(res.data.data)`

### Bug 3: Student Dashboard marks shape (WARNING)
- **File:** `VCET-AMS-Mobile/src/screens/student/DashboardScreen.tsx:121`
- **Symptom:** If API succeeds, marks show undefined values
- **Root cause:** `MarksItem` type expects `{ subjectCode, subjectName, cie1 }` but backend returns `{ code, name, ia1 }`
- **Fix:** Not yet applied — mock fallback currently masks this

## 9. Screen Status Summary

| Screen | Data Source | Status |
|--------|-------------|--------|
| Login | API → mock fallback | ✅ Fixed |
| Student Dashboard | API → mock fallback | Working (mock) |
| Student Attendance | API → mock fallback | Working (coerceList) |
| Student Marks | API → mock fallback | Working (coerceList) |
| Student Timetable | API → mock fallback | ✅ Fixed |
| Student Notices | API → mock fallback | Working (coerceList) |
| Faculty Timetable | API → mock fallback | ✅ Fixed |
| All Counselling screens | Mock only | Not migrated to API yet |
| All Parent screens | Mock only | Not migrated to API yet |
| Principal screens | Mock only | Not migrated to API yet |
