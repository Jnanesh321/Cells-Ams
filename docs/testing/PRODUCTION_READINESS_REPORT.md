# Cells AMS — Production Readiness Report

**System:** VCET Academic Monitoring System  
**Audit Date:** 2026-05-14  
**Audit Scope:** Backend (Express/Prisma), Database Schema, Mobile (React Native)  
**Prepared for:** Vivekananda College of Engineering & Technology, Puttur

---

## Executive Summary

A full production-readiness assessment was conducted across 38 backend source files, 17 Prisma models, 15 backend API routes, 34 mobile screens, 3 Zustand stores, and the Axios API layer.

**Issues found by severity:**

| Severity | Count | Must fix before deployment |
|----------|-------|---------------------------|
| **CRITICAL** | 8 | ✅ Yes |
| **HIGH** | 24 | ✅ Yes |
| **MEDIUM** | 34 | ⚠️ Recommended |
| **LOW** | 16 | ❌ Can postpone |
| **Total** | **82** | |

**Verdict:** The system is **NOT production-ready**. It is a well-structured demo/MVP. Approximately **3-4 weeks of engineering work** is needed to reach production grade for a single-department deployment with 500-1000 users.

---

## 1. Deployment Blockers (MUST Fix Before Go-Live)

### 1.1 CRITICAL: CORS Configuration (app.ts:19)

```typescript
app.use(cors({ origin: env.CORS_ORIGIN || true, credentials: true }));
```

When `CORS_ORIGIN` env var is not set, it falls back to `true`, which reflects the request `Origin` header — effectively **allowing any website to make API calls**. In production, this enables CSRF-style attacks where any website can read student data if a user is logged in.

**Fix:** Make `CORS_ORIGIN` required in production env validation, or default to the specific college domain.

### 1.2 CRITICAL: No Audit Logging

**Zero audit logging exists anywhere in the codebase.** No record of:
- Who logged in and when
- Who marked attendance
- Who modified marks
- Who generated reports
- Who created/deleted notices

For a college ERP, audit trails are legally required for grade disputes, attendance challenges, and accreditation evidence (NBA, NAAC).

**Fix:** Add an `AuditLog` model and middleware that captures all state-changing operations.

### 1.3 CRITICAL: IA Marks Upsert Without Transaction

```typescript
// services/marks.service.ts:10-31
const results = await Promise.all(entries.map((e) =>
  prisma.iAMark.upsert({...})
));
```

`Promise.all` runs multiple upserts concurrently with NO `$transaction`. If the 5th upsert fails, the first 4 succeed — **partial data corruption**. Two faculty members can also silently overwrite each other's marks.

**Fix:** Wrap in `prisma.$transaction(...batchedUpserts)`.

### 1.4 CRITICAL: Attendance Edit Reason Discarded (attendance.service.ts:57)

```typescript
void reason;  // reason is accepted, validated, then DISCARDED
```

The `reason` field is collected from faculty when they edit attendance, validated in the controller (min 1 char), passed to the service, and then... thrown away. This is a clear bug — the reason is never stored.

**Fix:** Add a `reason` field to `AttendanceRecord` model or create an `AttendanceEdit` model.

### 1.5 CRITICAL: No Rate Limiting

The `/auth/login` endpoint has **no rate limiting**. A brute-force attack can try unlimited passwords. No lockout mechanism exists.

Similarly, `/marks/ia` and `/attendance/mark` have no rate limiting — a script could flood the system.

**Fix:** Add `express-rate-limit` — strict limits on auth endpoints, moderate limits on data endpoints.

### 1.6 CRITICAL: Missing Security Headers

No `helmet` middleware. No:
- `X-Content-Type-Options` (MIME sniffing protection)
- `X-Frame-Options` (clickjacking protection)  
- `Content-Security-Policy` (XSS mitigation)
- `Strict-Transport-Security` (HTTPS enforcement)

**Fix:** Add `helmet` middleware.

### 1.7 CRITICAL: Request Body Size Limit

```typescript
app.use(express.json());  // No size limit
```

An attacker can send a multi-gigabyte JSON payload and exhaust server memory.

**Fix:** `app.use(express.json({ limit: '1mb' }))`.

### 1.8 CRITICAL: No Graceful Shutdown

```typescript
// server.ts — missing:
process.on('SIGTERM', () => { server.close(); prisma.$disconnect(); });
process.on('unhandledRejection', (err) => { console.error(err); process.exit(1); });
```

Killing the process abruptly leaves database connections open until timeout. Unhandled promise rejections crash silently.

**Fix:** Add process signal handlers and unhandled rejection/exception handlers.

---

## 2. Database Schema Issues

### 2.1 Missing Indexes

| Model | Missing Index | Impact |
|-------|---------------|--------|
| `User` | `@@index([role])` | Role-based queries scan entire table |
| `User` | `@@index([isActive])` | Active-user queries scan entire table |
| `StudentProfile` | `@@index([semester, section])` | Core query pattern for attendance/marks |
| `Subject` | `@@index([semester])` | Semester filtering |
| `SubjectMapping` | `@@index([facultyProfileId])` | Faculty subject lookup |
| `IAMark` | `@@index([subjectId])` | Subject marks queries |
| `ParentStudent` | `@@index([parentId])` | Parent-child lookup |
| `AttendanceRecord` | `@@index([markedByUserId])` | Faculty attendance history |

**Impact at scale (1000+ students, 10+ subjects):** Queries that should take <10ms will take 100-500ms with sequential scans. Connection pool exhaustion under concurrent load.

### 2.2 Missing Cascade Deletes

10+ relations lack `onDelete` rules. Deleting a department, subject, or faculty member will fail with foreign-key violations. No model has a `deletedAt` field for proper soft-delete.

**Fix:** Add explicit `onDelete: Cascade`, `SetNull`, or `Restrict` to all relations. Add `deletedAt: DateTime?` to key models.

### 2.3 Data Type Issues

| Model.Field | Current | Should Be |
|-------------|---------|-----------|
| `StudentProfile.semester` | `String` | `Int` |
| `Subject.semester` | `String` | `Int` |
| `ClassAssignment.semester` | `String` | `Int` |
| `AcademicCalendar.type` | `String` | `CalendarEventType` enum |
| `StudentDraft.gender` | `String` | `Gender` enum |
| `StudentDraft.admissionType` | `String` | `AdmissionType` enum |

### 2.4 Missing Audit Model

```prisma
model AuditLog {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  action     String
  entity     String
  entityId   Int
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 3. Backend Security Issues

| Issue | Location | Severity | Detail |
|-------|----------|----------|--------|
| CORS allows any origin | `app.ts:19` | **CRITICAL** | `true` fallback when env var unset |
| JWT error messages leak | `middleware/auth.ts:36` | HIGH | `jwt expired`, `invalid signature` sent to client |
| Faculty can access any student | `middleware/ownership.ts:34` | HIGH | `["FACULTY", ...].includes(role)` — no class-scope check |
| Refresh secret fallback | `utils/jwt.ts:21` | HIGH | `JWT_REFRESH_SECRET || JWT_ACCESS_SECRET` |
| Auth uses throw-based parse | `controllers/auth.controller.ts:17` | HIGH | `parse()` instead of `safeParse()` — Zod errors as 500s |
| Error messages leak internals | `middleware/error.ts:22` | MEDIUM | Prisma errors, constraint names sent to client |
| Login has no audit trail | `controllers/auth.controller.ts` | MEDIUM | No logging of success/failure |
| Stale JWT department claims | `middleware/auth.ts:71` | MEDIUM | Old dept access via old token |
| Two response utility files | `utils/response.ts` + `apiResponse.ts` | MEDIUM | Inconsistent API response shapes |

---

## 4. Mobile Resilience Issues

| Issue | Location | Severity | Detail |
|-------|----------|----------|--------|
| No retry logic | `queryClient.ts:15` | **CRITICAL** | `retry: 0` — every API failure is permanent |
| No 401 auto-refresh | `api.ts:60-90` | **CRITICAL** | `refreshToken` stored but never used |
| No form draft persistence | All form screens | **CRITICAL** | App crash during entry = total data loss |
| No Error Boundary | Entire app | **CRITICAL** | Render crash = white screen, no recovery |
| No offline UX | All screens | HIGH | Offline errors show as generic alerts |
| Memory leaks (8 screens) | Multiple screen files | HIGH | No `useEffect` cleanup for async ops |
| Stats loading unguarded | `admission/DashboardScreen.tsx` | HIGH | `load()` with no try/catch |
| Bulk submit no guard | `BulkStudentEntryScreen.tsx` | HIGH | No double-tap prevention |
| Admission store no loading | `admissionStore.ts` | HIGH | `loadStats()` has no loading flag |

---

## 5. Operational Risks

### 5.1 Concurrent Attendance Editing

Two faculty members can mark attendance for the same class simultaneously. The second submission will `skipDuplicates: true` (line 25 of `attendance.service.ts`), but with `createMany` there is no control over which record wins. The result is non-deterministic.

**Severity:** HIGH  
**Mitigation:** Add a "session lock" — when a faculty starts marking, lock the session for 30 minutes. Or use optimistic locking with timestamps.

### 5.2 IA Mark Collisions

Two faculty members holding the same subject can upsert IA marks concurrently. Since `upsert` is not wrapped in a transaction, the last write wins silently. No notification to either faculty.

**Severity:** HIGH  
**Mitigation:** Wrap marks upsert in `prisma.$transaction`. Consider adding `lastModifiedAt` with conflict detection.

### 5.3 USN Remapping Safety

The `USNMappingScreen` allows bulk remapping of roll numbers to USNs. If a student has existing attendance/marks under their roll number, and the USN is changed after data has been entered, there is no mechanism to migrate the existing records to the new USN.

**Severity:** MEDIUM  
**Mitigation:** The mock adapter handles this, but the real Prisma `StudentDraft.mappedUSN` field has no linkage to actual `User` or `StudentProfile` records. A migration script is needed.

### 5.4 Accidental Deletion

No model has soft-delete via `deletedAt`. The `removeAssignment` endpoint does set `isActive: false`, but:
- No confirmation is required
- No undo capability exists
- No audit log tracks who removed what

**Severity:** MEDIUM  
**Mitigation:** Add confirmation dialogs in UI, `deletedAt` fields in schema, and restore endpoints.

### 5.5 Faculty Mistake Recovery

If a faculty marks a student PRESENT instead of ABSENT (or vice versa), the correction flow is:
1. Faculty opens EditAttendanceScreen
2. Changes status
3. Provides reason
4. Saves

However, the reason is **never stored** (see §1.4). There is no visible history of changes for the student or HOD to review.

**Severity:** HIGH  
**Mitigation:** Store reasons. Display edit history on student profile.

---

## 6. Deployment Architecture Recommendations

### Option A: Local LAN Deployment (Recommended for Initial Rollout)

```
Architecture:
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ Mobile App  │────▶│ Express API  │────▶│ PostgreSQL │
│ (React Nat.)│     │ (1 server)   │     │ (1 server) │
└─────────────┘     └──────────────┘     └───────────┘
                    Port 3000             Port 5432
                    Internal LAN only
```

**Pros:**
- No internet dependency — works within college LAN
- Low latency (sub-5ms API calls)
- Simple backup (pg_dump to network drive)
- No cloud costs
- Easy to maintain by one IT staff

**Cons:**
- Not accessible from outside campus
- Requires campus Wi-Fi infrastructure
- Server hardware cost (~₹50,000 one-time)
- Manual updates

**Estimated cost:** ₹0/month (cloud) + ₹50,000 (server) + ₹20,000 (UPS/network)

**Recommended for:** First 6-12 months of deployment

### Option B: Cloud VPS Deployment

```
Architecture:
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│ Mobile App  │────▶│ Cloud VPS        │────▶│ Managed DB    │
│ (React Nat.)│     │ Express + Nginx  │     │ (AWS RDS /    │
│             │     │ PM2 process mgr  │     │  Aiven PG)    │
└─────────────┘     └──────────────────┘     └───────────────┘
                    HTTPS (Let's Encrypt)     Automated backups
```

**Pros:**
- Accessible from anywhere
- Automatic backups (managed DB)
- HTTPS built-in
- Scales vertically

**Cons:**
- Monthly cost (₹1,000-3,000/month)
- Requires internet for access
- More complex setup
- Latency depends on VPS location

**Estimated cost:** ₹1,500-3,000/month (VPS + managed DB)

**Recommended for:** After LAN stabilization, when off-campus access is needed

### Option C: Hybrid (Recommended Long-term)

```
Architecture:
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ Mobile App  │────▶│ Express API  │────▶│ PostgreSQL    │
│ (React Nat.)│     │ (College LAN)│     │ (College LAN) │
│             │     │              │     │               │
│ Offline     │     │ Nginx proxy  │     │ Daily backup  │
│ cache layer │     │ (optional    │     │ → Cloud       │
│ (React Qry) │     │  VPN access) │     │               │
└─────────────┘     └──────────────┘     └───────────────┘
```

**Pros:**
- Primary operation on LAN (fast, free)
- VPN/cloud backup for off-campus access
- Data safety with off-site backups
- Best of both worlds

**Cons:**
- More complex setup
- Requires VPN infrastructure
- Backup automation needed

**Recommended for:** Long-term deployment after proving stability on LAN

---

## 7. Implementation Priorities

### Phase 1 — Week 1-2 (Critical)

| # | Task | Area | Effort |
|---|------|------|--------|
| 1 | Fix CORS — make origin required in production | Backend | 1 hour |
| 2 | Add `helmet` middleware + body size limit | Backend | 1 hour |
| 3 | Add `express-rate-limit` on auth endpoints | Backend | 2 hours |
| 4 | Wrap marks upsert in `$transaction` | Backend | 2 hours |
| 5 | Fix attendance reason — store in DB | Backend | 4 hours |
| 6 | Add graceful shutdown handlers | Backend | 1 hour |
| 7 | Add `safeParse` to auth controller | Backend | 30 min |
| 8 | Add Error Boundary component | Mobile | 2 hours |

### Phase 2 — Week 3-4 (High)

| # | Task | Area | Effort |
|---|------|------|--------|
| 9 | Add `AuditLog` model + logging middleware | Both | 8 hours |
| 10 | Add missing DB indexes | Schema | 2 hours |
| 11 | Add cascade delete rules to schema | Schema | 2 hours |
| 12 | Fix `semester` String → Int (3 models) | Schema | 2 hours |
| 13 | Add `express.json({ limit })` | Backend | 30 min |
| 14 | Add 401 interceptor + token refresh flow | Mobile | 4 hours |
| 15 | Add retry logic to React Query | Mobile | 1 hour |
| 16 | Add offline banner to all screens | Mobile | 3 hours |
| 17 | Add `useEffect` cleanup to 8 screens | Mobile | 2 hours |

### Phase 3 — Week 5-6 (Medium)

| # | Task | Area | Effort |
|---|------|------|--------|
| 18 | Restructure analytics to avoid N+1 queries | Backend | 4 hours |
| 19 | Add pagination to notices, calendar | Backend | 4 hours |
| 20 | Add form draft persistence (AsyncStorage) | Mobile | 4 hours |
| 21 | Add admission store loading guards | Mobile | 2 hours |
| 22 | Add `deletedAt` soft-delete to key models | Schema | 4 hours |
| 23 | Standardize API response shape (remove `response.ts`) | Backend | 2 hours |
| 24 | Add USN migration script for existing records | Backend | 4 hours |
| 25 | Add rate limiting on marks/attendance endpoints | Backend | 2 hours |

### Phase 4 — Week 7-8 (Operational)

| # | Task | Area | Effort |
|---|------|------|--------|
| 26 | Create backup scripts (pg_dump to NAS/cloud) | Ops | 3 hours |
| 27 | Add structured logging (morgan + file rotation) | Backend | 3 hours |
| 28 | Set up PM2 process management | Ops | 2 hours |
| 29 | Create deployment documentation | Docs | 4 hours |
| 30 | Create restore procedure + test | Ops | 3 hours |
| 31 | Add soft-delete restore endpoints | Backend | 4 hours |

---

## 8. What Is Safe to Postpone

These items are **not required** for initial deployment:

| Item | Reason |
|------|--------|
| Docker/Kubernetes | Overkill for college LAN deployment |
| Push notifications | Can be added later — app works without them |
| Biometric auth | Nice-to-have; password auth sufficient for start |
| CI/CD pipeline | Manual deploy via SSH is fine for 1-2 servers |
| Real-time updates (WebSocket) | Pull-to-refresh is adequate for current use cases |
| Dark mode toggle | Built-in dark theme is sufficient |
| Multi-language (i18n) | All users are English-speaking in this context |
| Data export (CSV/Excel) | Important but not a blocker — PDF reports exist |
| Full-text search | Not needed — students/faculty are searched by USN/name |
| OAuth/SSO integration | Would add complexity without clear benefit for LAN use |
| Performance optimization (query optimization) | Only needed at scale (1000+ users) |

---

## 9. Deployment Checklist

### Pre-Deployment

- [ ] CORS restricted to college domain/IP
- [ ] Helmet middleware enabled
- [ ] Rate limiting configured on auth endpoints
- [ ] Body size limit set (1mb)
- [ ] JWT secrets changed from defaults
- [ ] JWT_REFRESH_SECRET explicitly set (different from ACCESS_SECRET)
- [ ] Database indexes applied
- [ ] Prisma migrations run
- [ ] Error Boundary added to mobile app
- [ ] Auth token refresh flow implemented
- [ ] Attendance reason field added + stored
- [ ] Marks upsert wrapped in transaction

### Deployment Day

- [ ] Database backup taken
- [ ] Server hardware verified (RAM, disk, network)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] PM2 or systemd service configured
- [ ] Firewall rules applied (only ports 3000, 5432)
- [ ] SSL certificate installed (if cloud)
- [ ] Environment variables configured (.env)
- [ ] Seed data loaded (optional — for demo/testing)
- [ ] Smoke test: login as each role
- [ ] Smoke test: mark attendance
- [ ] Smoke test: view analytics
- [ ] Wi-Fi/cellular connectivity verified

### Post-Deployment (Week 1)

- [ ] Monitor error logs daily
- [ ] Verify backup script runs
- [ ] Test restore procedure
- [ ] Collect user feedback from each role
- [ ] Document known issues

---

## 10. Recommended Deployment Order

```
Month 1 ─┬─ Fix Critical/Hardening (Phase 1)
          ├─ Fix Schema Issues (Phase 2 starts)
          ├─ Add Audit Logging
          └─ Deploy to LAN Server

Month 2 ─┬─ Add Retry/Offline (Phase 2 completes)
          ├─ Memory leak fixes
          ├─ Performance optimization
          └─ User training + documentation

Month 3 ─┬─ Medium/Hardening (Phase 3)
          ├─ Pagination, form persistence
          ├─ Soft-delete, restore endpoints
          └─ Operational scripts

Month 4+ ─┬─ Cloud backup integration
           ├─ Optional: cloud deployment
           ├─ Feature enhancements (notifications, export)
           └─ Scale monitoring
```

---

## 11. Summary

| Metric | Status |
|--------|--------|
| **Architecture quality** | 🟢 Good — clean separation of concerns |
| **Schema design** | 🟡 Acceptable — needs indexes, cascades, enums |
| **API validation** | 🟡 Mostly good — 2 controllers use throw-based parse |
| **Authentication** | 🟡 Missing refresh flow, rate limiting |
| **Authorization** | 🟡 Ownership middleware works but faculty scope too broad |
| **Audit logging** | 🔴 **Missing entirely** |
| **Mobile offline** | 🟢 Good infrastructure, no user-facing UX |
| **Mobile resilience** | 🔴 No retry, no form persistence, no error boundary |
| **Mobile memory safety** | 🟡 8 of 14 async effects lack cleanup |
| **Operational readiness** | 🔴 No backup scripts, no monitoring, no deployment docs |

**Overall: 4/10 — Pre-alpha stage for production. 3-4 weeks of focused engineering work needed for a safe single-department deployment.**

---

*Report prepared: 2026-05-14*
