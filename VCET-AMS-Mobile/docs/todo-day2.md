# VCET AMS — Tomorrow's Todo (Day 2)

## 🔴 P0 — Must finish first (blocking everything else)

- [ ] **Confirm login works for ALL 7 roles end to end on emulator**
  - ADMIN, STUDENT, FACULTY, HOD, PRINCIPAL, PARENT, ADMISSION
  - Each must land on correct home screen without crashing
  - Do not proceed to anything else until this is verified

- [ ] **Confirm tab icons are fixed on every role**
  - Session 1 Task 1A from the prompt — Ionicons replacing broken ☒ icons
  - Test every tab on every role after icon fix

## 🟠 P1 — Core features to implement tomorrow

- [ ] **Student/Parent login split** (Session 1 Task 1B)
  - Two tab switcher on login screen
  - Student tab vs Staff/Parent tab
  - Same USN for student and parent, different passwords

- [ ] **Faculty subjects not blank** (Fix 3 from analysis prompt)
  - FAC_CSE_001 must see their assigned subjects
  - Not "No subjects assigned"
  - Fix mock lookup key mismatch

- [ ] **Student Dashboard showing 0.0%** (Fix 2 from analysis prompt)
  - Add mock fallback when API returns empty
  - Must show real-looking attendance and marks

- [ ] **HOD department isolation**
  - Prepend the HOD scoping rule prompt before any HOD work
  - Make sure HOD_CSE only sees CSE data
  - HOD name comes from auth store, never hardcoded

## 🟡 P2 — Start if P1 is fully done

- [ ] **VTU 2022 scheme subjects file**
  - Create `src/mock/subjects.ts`
  - Semesters 3, 4, 5, 6 with correct BCS401 format codes
  - Export helper functions (`getCoreSubjects`, `getElectiveSubjects`)
  - Update `VTUSubject` type in `types/index.ts`

- [ ] **Admin bulk student creation** (Session 2 Task 2A)
  - Department + Section selector
  - Strong password suggestion with regenerate button
  - Preview before confirm

- [ ] **Admin can create HOD accounts**
  - Role = HOD shows Department dropdown (mandatory)
  - Designation pre-filled as "Head of Department"

## 🟢 P3 — Only if ahead of schedule

- [ ] **Subject management screen for Admin/Principal** (Session 2 Task 2B)
  - Filter by department and semester
  - Add subject modal with CORE/ELECTIVE type
  - Seeded with VTU 2022 scheme data

- [ ] **HOD PDF reports**
  - Only start if subjects file is confirmed working
  - Three new files: `pdfHelper.ts`, `pdfTemplates.ts`, `ReportsScreen.tsx`
  - Four report types: individual, class, defaulters, parent letter

## 📋 Carry forward — not blocking, do when possible

- [ ] DemoCredentialsScreen faculty IDs (FAC_CSE01 → FAC_CSE_001) — tiny fix, 2 minutes
- [ ] Admin Add User — wire Create User button to local state
- [ ] Birthday banner imported into StudentDashboardScreen
- [ ] Parent Notices tab added to ParentNavigator
- [ ] Admin quick-action buttons navigate instead of empty onPress

## ⚠️ Rules to follow tomorrow

1. One file per Deepseek response, confirm before next
2. Start every Deepseek session by pasting the master context prompt
3. Test on emulator after every single file change
4. If something breaks a working screen, revert immediately — do not debug for more than 15 minutes, move on
5. Keep Metro terminal visible at all times for logs

## 📊 Today's progress summary

| Area | Start of day | End of day |
|------|--------------|------------|
| Login navigation | Broken | Fixed ✅ |
| Tab icons | Broken ☒ | Pending 🟡 |
| Student screens | Partial mock | Partial API ✅ |
| Faculty subjects | Blank screen | Pending 🟡 |
| HOD reports | Alert stubs | Prompt ready ✅ |
| VTU subjects | Old scheme | Prompt ready ✅ |
| PDF generation | Nothing | Prompt ready ✅ |
| Admin HOD creation | Missing | Prompt ready ✅ |

**Realistic goal for tomorrow:** P0 + P1 fully done, P2 halfway done. That gets the app to a clean demonstrable state for every role with correct data showing.
