# VCET AMS — Backend / API Integration

## Status: In progress — Backend running on port 3000

## Done (Session: Backend Audit + Route Fixes)
- [x] Audited all backend routes (21 route files, all wired in `app.ts`)
- [x] Fixed `detention.service.ts` bug: semester upsert with `""` created duplicate records on re-compute -> now uses real semester value from subjects
- [x] Built backend — `tsc --noEmit` zero errors
- [x] Added missing `GET /subjects` route (`subjects.routes.ts` + `subjects.controller.ts`)
- [x] Added missing `GET /timetable/faculty/:id` route (service + controller + route)
- [x] Seeded DB: 60 students, 60 parents, 10 subjects, 5986 attendance records, 300 IA marks, 300 CIE summaries, 60 counselling assignments

## P0 — Critical (Backend Testing)
- [ ] **Run auth tests** — login for all roles (STUDENT, FACULTY, HOD, PRINCIPAL, ADMIN, PARENT, EXAM_CELL)
- [ ] **Test CIE compute endpoint** — `POST /marks/cie/compute/:subjectId` with seeded data
- [ ] **Test detention compute** — `POST /detention/compute/:department` — verify duplicate-safe after fix
- [ ] **Test IA question paper CRUD** — create paper, add questions/sub-questions, get results
- [ ] **Test notification endpoints** — list, mark read, mark all read
- [ ] **Test student profile** — `GET /student/profile/:usn`

## P1 — Frontend API Integration
- [ ] Wire mobile app API base URL to backend (check `api.ts` config)
- [ ] Test student DashboardScreen — attendance summary, marks, notices, calendar, detention
- [ ] Test HOD CIEManagementScreen — subject list -> compute -> finalize
- [ ] Test HOD DetentionScreen — compute -> list -> exempt -> revoke
- [ ] Test ExamCell QuestionPaperBuilderScreen — create paper
- [ ] Test ExamCell AbsenteeScreen — mark/remove absentees
- [ ] Test Faculty TimetableScreen — `GET /timetable/faculty/:id`
- [ ] Test NotificationBell on all screens

## P2 — Data Integrity
- [ ] Verify CIE computation logic: new IA system vs VTU fallback
- [ ] Verify attendance summary endpoint returns correct percentages
- [ ] Verify HOD department isolation (CSE HOD sees CSE data only)
- [ ] Verify student/parent data ownership middleware

## P3 — Polish
- [ ] Add pull-to-refresh on all mobile list screens
- [ ] Add loading states + error boundaries
- [ ] Add search/filter on list screens

## Backend Running
```
POST http://localhost:3000/auth/login  { "usn": "4VP24CS001", "password": "vcet@123" }
```

## Credentials
| Role | USN | Password |
|------|-----|----------|
| STUDENT CSE | 4VP24CS001 | vcet@123 |
| STUDENT ECE | 4VP24EC001 | vcet@123 |
| FACULTY | FAC_CSE_001 | faculty@123 |
| HOD CSE | HOD_CSE | hod@123 |
| HOD ECE | HOD_ECE | hod@123 |
| ADMIN | ADMIN001 | admin@123 |
| PRINCIPAL | PRINCIPAL | principal@123 |
| PARENT | PARENT_4VP24CS001 | parent@123 |
