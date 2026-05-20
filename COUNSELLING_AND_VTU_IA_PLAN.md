# Counselling & VTU IA System — V1 Implementation Plan

## 1. Overview

Two new academic modules for Cells AMS:

- **Counselling System** — Monthly faculty-student mentoring tracker
- **VTU IA Calculation System** — Proper Q1-Q4 based IA entry with auto-calculation

Both follow existing patterns: mock-first, backend-ready, role-protected.

---

## 2. Counselling System

### 2.1 Database Schema (Prisma)

```prisma
enum CounsellingStatus {
  DUE
  COMPLETED
  OVERDUE
}

model CounsellorCoordinator {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@map("counsellor_coordinators")
}

model CounsellorAssignment {
  id              Int      @id @default(autoincrement())
  facultyUserId   Int
  faculty         User     @relation("CounsellorFaculty", fields: [facultyUserId], references: [id])
  studentUserId   Int
  student         User     @relation("CounsellorStudent", fields: [studentUserId], references: [id])
  departmentId    Int
  department      Department @relation(fields: [departmentId], references: [id])
  academicYear    String
  isActive        Boolean  @default(true)
  assignedById    Int
  assignedBy      User     @relation("CounsellorAssignedBy", fields: [assignedById], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([facultyUserId, studentUserId, academicYear])
  @@index([facultyUserId, isActive])
  @@index([studentUserId])
  @@index([departmentId])
  @@map("counsellor_assignments")
}

model CounsellingSession {
  id                Int      @id @default(autoincrement())
  studentUserId     Int
  student           User     @relation("CounsellingSessionStudent", fields: [studentUserId], references: [id])
  facultyUserId     Int
  faculty           User     @relation("CounsellingSessionFaculty", fields: [facultyUserId], references: [id])
  assignmentId      Int
  assignment        CounsellorAssignment @relation(fields: [assignmentId], references: [id])

  // SECTION 1: Faculty Observation
  observation       String   @db.Text

  // SECTION 2: Student Current Status
  studentStatus     String   @db.Text

  // SECTION 3: Faculty Guidance
  guidance          String   @db.Text

  // SECTION 4: Follow-up
  followUp          String   @db.Text
  nextSessionDate   DateTime? @db.Date

  status            CounsellingStatus @default(DUE)
  sessionDate       DateTime @default(now()) @db.Date
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([assignmentId])
  @@index([studentUserId])
  @@index([facultyUserId])
  @@index([sessionDate])
  @@map("counselling_sessions")
}
```

### 2.2 Types (`src/types/index.ts`)

```typescript
export type CounsellingStatus = 'DUE' | 'COMPLETED' | 'OVERDUE';

export interface CounsellorAssignment {
  id: number;
  facultyUserId: number;
  facultyName: string;
  facultyId: string;
  studentUserId: number;
  studentName: string;
  studentUsn: string;
  department: string;
  academicYear: string;
  isActive: boolean;
  lastSessionDate?: string;
  status: CounsellingStatus;
  attendancePercent?: number;
}

export interface CounsellingSession {
  id: number;
  studentUserId: number;
  studentName: string;
  studentUsn: string;
  facultyUserId: number;
  facultyName: string;
  observation: string;
  studentStatus: string;
  guidance: string;
  followUp: string;
  nextSessionDate?: string;
  sessionDate: string;
  status: CounsellingStatus;
  isOverdue?: boolean;
}

export type CounsellingSessionFormData = {
  observation: string;
  studentStatus: string;
  guidance: string;
  followUp: string;
  nextSessionDate?: string;
};
```

### 2.3 Mock Data

File: `src/mock/counselling.ts`

- Mock counsellor assignments (faculty → 10–20 students)
- Mock counselling sessions (timeline format)
- Support for 28-day overdue detection

### 2.4 Screens

#### Faculty Counselling Screens

| Screen | Purpose |
|--------|---------|
| `CounsellingDashboardScreen` | Assigned students, due/completed/overdue sections |
| `CounsellingStudentDetailScreen` | Timeline of sessions, create new session button |
| `CounsellingSessionFormScreen` | 4-section form with free text |

#### HOD Screens

| Screen | Purpose |
|--------|---------|
| `HodCounsellingSummaryScreen` | Department counselling analytics |
| `CounsellorAssignmentScreen` | Assign faculty to students |

#### Student Screen

| Screen | Purpose |
|--------|---------|
| `StudentCounsellingScreen` | View own counselling history (read-only) |

#### Parent Screen

| Screen | Purpose |
|--------|---------|
| `ParentCounsellingScreen` | View ward's counselling history (read-only) |

### 2.5 Navigation Changes

#### FacultyNavigator: Add "Counselling" tab

```
MarksStack (existing)
CounsellingStack (NEW):
  → CounsellingDashboardScreen
  → CounsellingStudentDetailScreen
  → CounsellingSessionFormScreen
```

#### HodNavigator: Add "Counselling" tab

```
Counselling (NEW):
  → HodCounsellingSummaryScreen
  → CounsellorAssignmentScreen
```

#### StudentNavigator: Add "Counselling" tab

```
Counselling (NEW):
  → StudentCounsellingScreen
```

#### ParentNavigator: Add "Counselling" tab

```
Counselling (NEW):
  → ParentCounsellingScreen
```

### 2.6 Backend Routes

```
POST /counselling/assignments        — HOD only: create assignment
GET  /counselling/assignments/faculty — FACULTY: view assigned students
GET  /counselling/assignments/dept   — HOD/PRINCIPAL: dept summary
POST /counselling/sessions           — FACULTY: create session
GET  /counselling/sessions/student/:studentUserId — FACULTY/STUDENT/PARENT/HOD: view sessions
GET  /counselling/sessions/overdue   — FACULTY: overdue list
```

### 2.7 Overdue Logic

- Compare `lastSessionDate` + 28 days against today
- If no session exists → mark OVERDUE
- Display color: green (within 28d), yellow (warning), red (overdue)

### 2.8 Notification Hooks (V1)

- Add `counselling_overdue` notification type in a future `Notification` model
- V1: UI warning only, no push notifications

---

## 3. VTU IA Calculation System

### 3.1 Current Problem

The existing `IAMark` model stores `marksObtained` as a single float per IA. The VTU requirement is:

- Each IA has 4 questions: Q1, Q2, Q3, Q4 (each 0–25)
- Section A = max(Q1, Q2)
- Section B = max(Q3, Q4)
- IA Total = Section A + Section B (max 50)
- Best 2 of 3 IAs → Final CIE

### 3.2 Database Approach

**New model added alongside existing `IAMark`:**

```prisma
model VTUIAMark {
  id               Int      @id @default(autoincrement())
  studentProfileId Int
  subjectId        Int
  iaNumber         Int           // 1, 2, or 3

  q1               Float    @default(0)  // 0-25
  q2               Float    @default(0)  // 0-25
  q3               Float    @default(0)  // 0-25
  q4               Float    @default(0)  // 0-25

  sectionA         Float    @default(0)  // auto max(q1,q2)
  sectionB         Float    @default(0)  // auto max(q3,q4)
  total            Float    @default(0)  // auto sectionA+sectionB

  enteredByUserId  Int
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  studentProfile StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  subject        Subject        @relation(fields: [subjectId], references: [id])
  enteredBy      User           @relation(fields: [enteredByUserId], references: [id])

  @@unique([studentProfileId, subjectId, iaNumber])
  @@index([studentProfileId])
  @@map("vtu_ia_marks")
}

model VTUCIESummary {
  id               Int      @id @default(autoincrement())
  studentProfileId Int
  subjectId        Int

  ia1Total         Float    @default(0)  // total from VTUIAMark iaNumber=1
  ia2Total         Float    @default(0)  // total from VTUIAMark iaNumber=2
  ia3Total         Float    @default(0)  // total from VTUIAMark iaNumber=3

  bestTwoTotal     Float    @default(0)  // sum of best 2
  finalCIE         Float    @default(0)  // bestTwoTotal (max 50)
  isEligible       Boolean  @default(true)
  finalized        Boolean  @default(false)
  finalizedByUserId Int?

  studentProfile StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  subject        Subject        @relation(fields: [subjectId], references: [id])
  finalizedBy    User?          @relation("VTUFinalizedCIE", fields: [finalizedByUserId], references: [id])

  @@unique([studentProfileId, subjectId])
  @@index([studentProfileId])
  @@map("vtu_cie_summaries")
}
```

### 3.3 Calculation Rules

```
SectionA = max(Q1, Q2)     // each 0-25
SectionB = max(Q3, Q4)     // each 0-25
IATotal  = SectionA + SectionB   // max 50

IA1 = IATotal
IA2 = IATotal
IA3 = IATotal

Best2Average = sum of top 2 IA totals  // max 100
FinalCIE     = Best2Average            // max 100 (but typically Best2Average)
```

**Auto-calculation triggers:**
- When Q1-Q4 are entered → immediately calculate SectionA, SectionB, Total
- When all 3 IAs are entered → compute Best2Average, FinalCIE

### 3.4 Types

```typescript
export interface VTUIAMarkEntry {
  studentProfileId: number;
  usn: string;
  name: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  sectionA: number;
  sectionB: number;
  total: number;
}

export interface VTUIAQuestionData {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
}

export interface VTUCIEDisplay {
  subjectCode: string;
  subjectName: string;
  ia1: VTUIAQuestionData & { total: number };
  ia2: VTUIAQuestionData & { total: number };
  ia3: VTUIAQuestionData & { total: number };
  bestTwoTotal: number;
  finalCIE: number;
}
```

### 3.5 Screens

#### Faculty: `VTUIAMarksEntryScreen` (replaces existing IAMarksEntryScreen)

- One student at a time with Prev/Next
- Display: student name, USN, subject, current IA
- Fields: Q1, Q2, Q3, Q4
- Live calculation: Section A, Section B, Total
- Show Best 2 average
- Phone-optimized layout

#### Student: Updated `MarksScreen`

- Show question-wise breakdown
- IA1, IA2, IA3 totals
- Best 2 average, Final CIE

#### Parent: Updated `MarksScreen`

- Show final IA totals
- Question breakdown optional (collapsible)
- Read-only

### 3.6 Navigation

FacultyNavigator MarksStack:
```
MarksSubjectPicker → VTUIAMarksEntryScreen (NEW, replaces IAMarksEntryScreen)
```

### 3.7 Backend Routes

```
POST /marks/vtu/ia         — FACULTY: save Q1-Q4 data, auto-calculates
GET  /marks/vtu/student/:usn — STUDENT/PARENT/FACULTY/HOD: get VTU CIE data
GET  /marks/vtu/dept/:deptId — HOD/PRINCIPAL: dept VTU summary
POST /marks/vtu/finalize   — HOD/PRINCIPAL: lock CIE summary
```

### 3.8 Auto-Calculation Utility

```typescript
// Replaces existing vtuRules.ts calculateCIE with new VTU IA logic
function calculateVTUIATotal(q1: number, q2: number, q3: number, q4: number): {
  sectionA: number;
  sectionB: number;
  total: number;
} {
  const sectionA = Math.max(q1, q2);
  const sectionB = Math.max(q3, q4);
  return { sectionA, sectionB, total: sectionA + sectionB };
}

function calculateVTUBestTwo(ia1: number, ia2: number, ia3: number): {
  bestTwoTotal: number;
  finalCIE: number;
} {
  const sorted = [ia1, ia2, ia3].sort((a, b) => b - a);
  const bestTwoTotal = sorted[0] + sorted[1];
  return { bestTwoTotal, finalCIE: bestTwoTotal };
}
```

### 3.9 Migration Path

1. Add `VTUIAMark` and `VTUCIESummary` models (new tables, no data loss)
2. Existing `IAMark` table remains untouched (backward compatible)
3. Old `IAMark` data can be migrated via a one-time script
4. All NEW entries use the VTU system
5. Old UI routes remain pointing to old data

---

## 4. Implementation Order (V1)

### Phase 1: Foundation (Mock Data + Types)
1. Create types for counselling + VTU IA in `src/types/index.ts`
2. Create `src/mock/counselling.ts` with assignments + sessions
3. Create `src/mock/vtuIAMarks.ts` with Q1-Q4 data
4. Update VTU calculation utilities

### Phase 2: Faculty Screens
5. Create `CounsellingDashboardScreen.tsx` — assigned students, due/overdue
6. Create `CounsellingStudentDetailScreen.tsx` — session timeline
7. Create `CounsellingSessionFormScreen.tsx` — 4-section form
8. Create `VTUIAMarksEntryScreen.tsx` — Q1-Q4 entry with live calc

### Phase 3: HOD Screens
9. Create `HodCounsellingSummaryScreen.tsx` — dept counselling analytics
10. Create `CounsellorAssignmentScreen.tsx` — assign faculty to students

### Phase 4: Student + Parent Screens
11. Create `StudentCounsellingScreen.tsx` — read-only timeline
12. Create `ParentCounsellingScreen.tsx` — read-only timeline
13. Update `StudentMarksScreen.tsx` — VTU IA display
14. Update `ParentMarksScreen.tsx` — VTU IA display

### Phase 5: Navigation Updates
15. Update `FacultyNavigator.tsx` — add CounsellingStack
16. Update `HodNavigator.tsx` — add Counselling tab
17. Update `StudentNavigator.tsx` — add Counselling tab
18. Update `ParentNavigator.tsx` — add Counselling tab

### Phase 6: Backend (if API integration needed)
19. Add Prisma models for new tables
20. Create routes, controllers, services
21. Run migration

---

## 5. Runtime Risks

| Risk | Mitigation |
|------|------------|
| Data loss of existing IAMark records | Keep old table, add new VTU model alongside |
| Performance with many counselling sessions | Index on studentUserId, facultyUserId, sessionDate |
| Mobile app size increase with new screens | Lazy imports, moderate screen count (5 new total) |
| Overdue logic complexity | Simple 28-day date comparison, no cron jobs in V1 |
| Role confusion in navigation | Follow existing role-based navigator pattern exactly |

---

## 6. Files to Create

### Mobile App (`VCET-AMS-Mobile/src/`)

```
screens/faculty/CounsellingDashboardScreen.tsx
screens/faculty/CounsellingStudentDetailScreen.tsx
screens/faculty/CounsellingSessionFormScreen.tsx
screens/faculty/VTUIAMarksEntryScreen.tsx
screens/hod/HodCounsellingSummaryScreen.tsx
screens/hod/CounsellorAssignmentScreen.tsx
screens/student/StudentCounsellingScreen.tsx
screens/parent/ParentCounsellingScreen.tsx
mock/counselling.ts
mock/vtuIAMarks.ts
types/counselling.ts          (or extend types/index.ts)
types/vtuIA.ts                (or extend types/index.ts)
```

### Backend (`src/`)

```
prisma/schema.prisma          (add new models)
routes/counselling.routes.ts
controllers/counselling.controller.ts
services/counselling.service.ts
routes/vtuIAMarks.routes.ts   (or extend marks.routes.ts)
controllers/vtuIAMarks.controller.ts (or extend marks.controller.ts)
services/vtuIAMarks.service.ts (or extend marks.service.ts)
```

### Files to Modify

```
VCET-AMS-Mobile/src/types/index.ts           — add new types
VCET-AMS-Mobile/src/utils/vtuRules.ts        — add VTU IA calculation
VCET-AMS-Mobile/src/navigation/FacultyNavigator.tsx — add counselling tab
VCET-AMS-Mobile/src/navigation/HodNavigator.tsx      — add counselling tab
VCET-AMS-Mobile/src/navigation/StudentNavigator.tsx  — add counselling tab
VCET-AMS-Mobile/src/navigation/ParentNavigator.tsx   — add counselling tab
VCET-AMS-Mobile/src/screens/student/MarksScreen.tsx  — VTU IA display
VCET-AMS-Mobile/src/screens/parent/MarksScreen.tsx   — VTU IA display
```

---

## 7. Branch Strategy

```
main
└── feature/counselling-vtu-ia-v1
```

All changes in a single PR to avoid merge conflicts.

---

## 8. Acceptance Criteria

### Counselling System
- [ ] Faculty sees assigned students with due/overdue status
- [ ] Faculty can create monthly session with 4 sections
- [ ] Timeline view of all sessions per student
- [ ] HOD sees department counselling summary
- [ ] Student sees own counselling records (read-only)
- [ ] Parent sees ward counselling records (read-only)
- [ ] Overdue shown when >28 days since last session

### VTU IA System
- [ ] Q1-Q4 entry with live SectionA/SectionB/Total calculation
- [ ] Prev/Next navigation for one-student-at-a-time entry
- [ ] Best 2 of 3 IAs auto-calculated
- [ ] Student sees question breakdown + totals
- [ ] Parent sees final IA (optional breakdown)
- [ ] No existing marks data destroyed
