# PostgreSQL Migration Status

## Overview

Migration from mock-only to DB-backed prototype for Cells AMS.

---

## Status: COMPLETED

### What was done

1. **Prisma schema** — Added 5 new models:
   - `CounsellorAssignment` — faculty-student assignment
   - `CounsellingSession` — 4-section monthly session records
   - `VTUIAMark` — Q1-Q4 IA marks with auto-calculated totals
   - `VTUCIESummary` — Best 2 of 3 IA aggregation
   - Plus `CounsellingStatus` enum (DUE, COMPLETED, OVERDUE)

2. **Fresh migration** — Old unapplied migrations deleted. Schema pushed via `prisma db push`.

3. **Seed data** — `prisma/seed.ts` rewritten with:
   - 4 departments (CSE, AIML, ECE, MECH)
   - 16 subjects (Semester 2 for CSE + AIML)
   - Admin, HOD (CSE + AIML), Principal, 4 Faculty
   - **7 real students** + 3 demo students:
     - `4VP24CS038` Jnanesh Sharma H (CSE)
     - `4VP24CS089` Shankar (CSE)
     - `4VP24CS074` Kiran (CSE)
     - `4VP24CS049` Ananya M (CSE)
     - `4VP24CS060` Muralikrishna (CSE)
     - `4VP24CS051` Manish DP (CSE)
     - `4VP24AI037` Samved Balike (AIML)
   - 3 parents linked to students
   - 30 days attendance records per student
   - IA marks (old system) — 3 IAs per subject
   - VTU IA marks (new Q1-Q4 system) — IA1+IA2 entered, IA3 pending
   - VTU CIE summaries computed
   - 5 counselling assignment placeholders
   - 5 notices + 3 calendar events

4. **Passwords** (all bcrypt-hashed):
   - Students: `vcet@123`
   - Faculty: `faculty@123`
   - HOD: `hod@123`
   - Admin: `admin@123`
   - Principal: `principal@123`
   - Parent: `parent@123`

---

## Verified

| Check | Status |
|-------|--------|
| `prisma generate` | ✅ Pass |
| `prisma db push` | ✅ Pass |
| `prisma migrate reset --force` | ✅ Pass |
| Seed executes clean | ✅ 10 students, 16 subjects |
| Login: `4VP24CS038` / `vcet@123` | ✅ JWT returned, role=STUDENT |
| User data in DB | ✅ name, dept, sem, section correct |
| Attendance records in DB | ✅ 22 records per student |
| IA marks (old) in DB | ✅ 24 marks per student |
| VTU IA marks (new) in DB | ✅ 16 marks per student |

---

## Still Mock

| Feature | Status | Notes |
|---------|--------|-------|
| Counselling screens (mobile) | Mock | DB models exist, screens use mock/counselling.ts |
| VTU IA screens (mobile) | Mock | DB models exist, screens use mock/vtuIAMarks.ts |
| Backend counselling routes | Not implemented | Counselling controller/service not created |
| Backend VTU IA routes | Not implemented | VTU IA controller/service not created |
| Principal dashboard | Mock | Uses mock data directly |
| HOD analytics (advanced) | Mock | Some data from DB, some from mock |
| Student dashboard (events) | Mock | Calendar events from DB, notices from DB |

---

## Real API → Fallback Mock (Mobile)

| Screen | DB API tried first? | Mock fallback? |
|--------|-------------------|----------------|
| Student Dashboard | ✅ Yes | ✅ Falls back to `MOCK_ATTENDANCE` etc. |
| Student Attendance | ✅ Yes | ✅ Falls back to `mock/attendance.ts` |
| Student Marks (old) | ✅ Yes | ✅ Falls back to `mock/marks.ts` |
| Student Marks (VTU) | ❌ No API | ✅ Uses `mock/vtuIAMarks.ts` |
| Student Profile | ✅ Yes | ✅ Falls back to mock users |
| Faculty Dashboard | ❌ No API | ✅ Uses `mock/facultySubjects.ts` |
| HOD Dashboard | ❌ No API | ✅ Uses mock data directly |

---

## Next Steps

1. **Backend routes for Counselling**: `routes/counselling.routes.ts`, controller, service
2. **Backend routes for VTU IA**: POST/GET marks/vtu/* endpoints
3. **CIESummary auto-calculation**: Service to compute best 2 from VTUIAMark
4. **Counselling session backend**: CRUD routes for sessions and assignments
5. **Mobile → DB migration**: Update mobile screens to use API first, then mock fallback

---

## Migration Commands

```bash
# Push schema (creates tables, no history)
npx prisma db push

# Run seed
npx ts-node --project tsconfig.json prisma/seed.ts

# Or both:
npm run db:seed

# Full reset (drops all data!)
npx prisma migrate reset --force
npm run db:seed
```

## Schema Compatibility

- **Existing `IAMark` table**: Untouched, still used by old marks system
- **New `VTUIAMark` table**: Parallel system, does not replace IAMark
- **New `Counselling` tables**: Fresh, no migration from old data needed
- **No breaking changes** to existing models
