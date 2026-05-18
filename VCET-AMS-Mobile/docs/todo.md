# VCET AMS — Master Todo

## ✅ Done (Session: User Creation Feature)

| File | What |
|------|------|
| `src/utils/passwordUtils.ts` | `suggestPassword()`, `generateBulkUSNs()`, `validateUSN()`, `suggestParentPassword()` |
| `src/store/adminStore.ts` | Zustand store (`adminUsers` array), pre-loads from `mockUsers` + `mockStudents`, CRUD + `getHODForDepartment` |
| `src/screens/admin/CreateUserScreen.tsx` | 3-step wizard modal (Step 1: single/bulk mode; Step 2A: role-dependent form; Step 2B: bulk preview; Step 3: success card with password copy). Step type = string `'1'|'2'|'2b'|'3'`. HOD conflict warning, parent password suggestion, strength indicator, DOB range for bulk. |
| `src/screens/admin/UsersScreen.tsx` | Reads from `useAdminStore`, opens `CreateUserScreen` modal, edit modal preserved |

## 🔴 High Priority

### Feature 3 — Academic Day Calculator
- [ ] `src/mock/academicCalendar.ts` — term start/end dates, holidays, events
- [ ] `src/utils/academicDayUtils.ts` — pure function `getAcademicDayInfo(date)` → `{ dayNumber, isHoliday, eventName?, weekNumber, progress }`
- [ ] `src/hooks/useAcademicDay.ts` — React hook wrapping util with daily refresh
- [ ] Update `StudentDashboardScreen` — show "Day 47 of 120" banner
- [ ] Update `HodDashboardScreen` — show academic day info

### Feature 2 — Birthday Visibility System
- [ ] Update `BirthdayBanner` component to read DOB from adminStore + mockStudents
- [ ] Update `StudentDashboardScreen` — birthday greeting if today matches
- [ ] Update `StudentProfileScreen` (or create one) — show DOB
- [ ] Update `HodDashboardScreen` — today's birthdays banner

### Feature 4 — Notes/PDF Sharing (Faculty → Students)
- [ ] `src/store/notesStore.ts` — Zustand store with notes array, CRUD, file metadata
- [ ] Faculty `NotesScreen.tsx` — upload PDF (DocumentPicker), title, subject selector
- [ ] Student `NotesScreen.tsx` — browse/download notes by subject
- [ ] Add Notes tab to `FacultyNavigator.tsx`
- [ ] Add Notes tab to `StudentNavigator.tsx`
- [ ] Parent role must never see Notes tab

## 🟠 Medium Priority

- [ ] **Profile screens** — one per role showing user info, logout, edit capability
- [ ] **Fix 16 pre-existing TS errors** — `AttendanceSessionScreen`, `hod/AnalyticsScreen`, `ReviewSubmitScreen`, `authStore.ts`
- [ ] **Populate `src/hooks/`** — `useAcademicDay`, `useNetworkStatus`, `useRoleGuard`

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
