# Faculty Module - Technical Reference

## 🏗️ Architecture Overview

### Component Hierarchy
```
App
└── NavigationContainer
    └── AppNavigator
        └── FacultyNavigator (when role === 'FACULTY')
            └── Tab.Navigator (4 tabs)
                ├── DashboardTab
                │   └── DashboardStackNavigator
                │       ├── FacultyDashboardScreen
                │       ├── SubjectPickerScreen
                │       ├── AttendanceSessionScreen
                │       ├── EditAttendanceScreen
                │       ├── ReviewSubmitScreen
                │       └── SuccessConfirmationScreen
                ├── SubjectsScreen (placeholder)
                ├── MarksScreen (placeholder)
                └── ProfileScreen
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Store (Zustand)                     │
│                  ✓ user (FACULTY object)                    │
│                  ✓ isAuthenticated                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Attendance Store (Zustand)                      │
│  ✓ currentSession (AttendanceSession)                       │
│  ✓ unsavedChanges (boolean)                                 │
│  ✓ editingStudent (StudentAttendanceRecord | null)          │
│  ✓ edits (AttendanceEdit[])                                 │
│  ✓ submissionLoading (boolean)                              │
│  Methods:                                                    │
│  - setCurrentSession                                         │
│  - updateStudentStatus                                       │
│  - setEditingStudent                                         │
│  - addEdit                                                   │
│  - markAllPresent                                            │
│  - resetSession                                              │
│  - submitSession (mock API call)                             │
└─────────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Mock Data     │ │  Mock Data      │ │   Mock Data     │
│ (Faculty IDs)   │ │(Subjects)       │ │(Students)       │
│                 │ │                 │ │                 │
│ FAC_CSE01       │ │ CS501           │ │ 4VP21CS001      │
│ FAC_CSE02       │ │ CS502           │ │ 4VP21CS002      │
│ FAC_ECE01       │ │ CS503           │ │ ...             │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 📊 Screen Navigation Graph

```
FacultyDashboardScreen
    │
    ├─→ [Click Subject Card]
    │        │
    │        ▼
    │   SubjectPickerScreen
    │        │
    │        └─→ [Select Section & Date]
    │                 │
    │                 ▼
    │        AttendanceSessionScreen
    │                 │
    │        ┌────────┼────────┐
    │        ▼        ▼        ▼
    │   [Toggle P/A/OD] [Search] [Mark All P]
    │        │        │        │
    │        └────────┼────────┘
    │                 │
    │    [Tap Row to Edit]
    │                 │
    │                 ▼
    │        EditAttendanceScreen
    │                 │
    │        [Select Status + Reason]
    │                 │
    │                 ▼ [Save]
    │        (Return to AttendanceSession)
    │                 │
    │    [Review & Submit Button]
    │                 │
    │                 ▼
    │        ReviewSubmitScreen
    │                 │
    │        ┌────────┴────────┐
    │        ▼                 ▼
    │    [Back]           [Submit]
    │        │                 │
    │        └──────┬──────────┘
    │              ▼
    │    SuccessConfirmationScreen
    │              │
    │        ┌─────┴─────┐
    │        ▼           ▼
    │  [Mark Another]  [Dashboard]
    │        │           │
    │        └─────┬─────┘
    │              ▼
    └─→ FacultyDashboardScreen (reload)
```

## 🔄 State Update Flow

### Marking Attendance
```
AttendanceSessionScreen
    │
    ▼
User taps status badge
    │
    ▼
toggleStatus(usn)
    │
    ├─→ Find current status (P/A/OD)
    │
    ├─→ Calculate next status
    │   (P → A → OD → P)
    │
    ▼
updateStudentStatus(usn, newStatus)
    │
    ├─→ Update store.currentSession.students[]
    │
    ├─→ Set unsavedChanges = true
    │
    ▼
Component re-renders with new status
```

### Editing with Reason
```
AttendanceSessionScreen
    │
    ▼
User taps student row
    │
    ▼
Navigate to EditAttendanceScreen
    │
    ├─→ Receive student data
    │
    ├─→ Show current status
    │
    ▼
User selects new status + enters reason
    │
    ▼
handleSave()
    │
    ├─→ Validate: reason required if status changed
    │
    ├─→ updateStudentStatus(usn, newStatus)
    │
    ├─→ addEdit({
    │     usn, oldStatus, newStatus,
    │     reason, timestamp
    │   })
    │
    ├─→ Set unsavedChanges = true
    │
    ▼
Navigate back to AttendanceSessionScreen
```

### Submission Flow
```
ReviewSubmitScreen
    │
    ▼
User taps "Submit"
    │
    ├─→ Show confirmation dialog
    │
    ▼
User confirms
    │
    ├─→ Set submissionLoading = true
    │
    ▼
submitSession()
    │
    ├─→ Call mock API (1s delay)
    │
    ├─→ Update currentSession.status = 'submitted'
    │
    ├─→ Set submissionLoading = false
    │
    ├─→ Set unsavedChanges = false
    │
    ▼
Navigate to SuccessConfirmationScreen
```

## 📱 Component Props & Data Passing

### FacultyDashboardScreen
```typescript
Props: None (reads from auth store & mock data)
Route Params: Optional selectedSubject

State:
- refreshing: boolean

Navigates to:
- SubjectPickerScreen (with selectedSubject)
```

### SubjectPickerScreen
```typescript
Props: None
Route Params: {
  selectedSubject?: FacultySubject
}

State:
- searchQuery: string
- selectedSubject: FacultySubject | null
- selectedDate: string (YYYY-MM-DD)
- selectedSection: string
- selectedTime: string (HH:MM)

Navigates to:
- AttendanceSessionScreen (with session object)
```

### AttendanceSessionScreen
```typescript
Props: None
Route Params: {
  session: AttendanceSession
}

State:
- searchQuery: string
- showSearch: boolean

Effects:
- Set currentSession in attendance store

Navigates to:
- EditAttendance (with student & sessionId)
- ReviewSubmit (with session)
```

### EditAttendanceScreen
```typescript
Props: None
Route Params: {
  student: StudentAttendanceRecord
  sessionId: string
}

State:
- selectedStatus: AttendanceStatus
- editReason: string
- errors: Record<string, string>

Validation:
- Reason required if status changed

Navigates to:
- Back to AttendanceSession
```

### ReviewSubmitScreen
```typescript
Props: None
Route Params: {
  session: AttendanceSession
}

Computed:
- stats (P/A/OD counts)
- attendancePercentage
- shortageStudents

Navigates to:
- AttendanceSession (back)
- SuccessConfirmation (with stats)
```

### SuccessConfirmationScreen
```typescript
Props: None
Route Params: {
  stats: { present, absent, od, total }
  subjectName: string
  subjectCode: string
  section: string
}

Effects:
- Auto-redirect to Dashboard after 5s

Navigates to:
- SubjectPicker (mark another)
- Dashboard (go home)
```

## 🎨 Styling Breakdown

### Color Palette
```
Background:  bg-slate-900 (#0f172a)
Cards:       bg-slate-800 (#1e293b)
Borders:     border-slate-700 (#334155)
Disabled:    bg-slate-700 (#475569)

Text:
- Primary:   text-white
- Secondary: text-slate-400
- Muted:     text-slate-500

Accents:
- Primary:   bg-blue-600 (#2563eb)
- Success:   bg-green-600 (#16a34a)
- Error:     bg-red-600 (#dc2626)
- Warning:   bg-amber-600 (#d97706)

Status:
- Present:   #10b981 (green)
- Absent:    #ef4444 (red)
- OD:        #f59e0b (amber)
```

### Spacing
```
Small gap:   gap-1, gap-2 (4-8px)
Normal gap:  gap-3, gap-4 (12-16px)
Large gap:   gap-6 (24px)

Padding:
- Tight:  p-2, p-3 (8-12px)
- Normal: p-4 (16px)
- Loose:  p-6 (24px)

Margin:
- Small:  m-1, m-2 (4-8px)
- Normal: m-3, m-4 (12-16px)
- Large:  m-6 (24px)
```

### Typography
```
Headings:     text-lg, text-xl, text-2xl (font-bold)
Body:         text-sm, text-base (default)
Labels:       text-xs, text-sm
Numbers:      text-2xl (font-bold)
```

## 🔌 API Integration Points

### Current Implementation (Mock)
```typescript
// src/store/attendance.ts
submitSession: async () => {
  set({ submissionLoading: true });
  try {
    // REPLACE THIS:
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // WITH THIS:
    // const response = await fetch('/api/faculty/attendance/session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     subjectCode: currentSession.subjectCode,
    //     date: currentSession.date,
    //     students: currentSession.students
    //   })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.error);
    
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, status: 'submitted' as const }
        : null,
      submissionLoading: false,
      unsavedChanges: false,
    }));
  } catch (error) {
    set({ submissionLoading: false });
    throw error;
  }
};
```

### Prepare These Endpoints
```
POST /api/faculty/attendance/session
POST /api/faculty/attendance/edit
GET /api/faculty/subjects
GET /api/faculty/subjects/:code/students
GET /api/faculty/attendance/history
```

## 🧪 Testing Scenarios

### Scenario 1: Basic Flow
1. Login as FAC_CSE01
2. Dashboard shows 2 subjects
3. Click "Data Structures"
4. Select Section A
5. Mark 3 students present
6. Submit
7. See success

**Expected:** All screens work, data flows correctly

### Scenario 2: Edit with Reason
1. Continue from Scenario 1
2. Tap a student
3. Change status to Absent
4. Enter reason
5. Save
6. Return to session
7. Status updated

**Expected:** Edit screen works, reason captured

### Scenario 3: Mark All Present
1. Start from AttendanceSessionScreen
2. Tap "Mark All P"
3. All students show P status
4. Proceed to review

**Expected:** All students marked present

### Scenario 4: Search Function
1. Start from AttendanceSessionScreen
2. Tap search icon
3. Search "Kumar"
4. See filtered students
5. Toggle status
6. Search cleared

**Expected:** Search works, filtering accurate

## 🐛 Debugging Tips

### Check Store State
```typescript
// In console when developing:
import { useAttendanceStore } from '../store/attendance';
const store = useAttendanceStore();
console.log(store); // All state visible
```

### Verify Mock Data
```typescript
import { mockFacultySubjects, mockStudents } from '../mock';
console.log(mockFacultySubjects);
console.log(mockStudents);
```

### Navigation Issues
```typescript
// Check if routes exist in navigator:
// - FacultyNavigator > DashboardStackNavigator
// Screen names must match exactly:
// - "Dashboard"
// - "SubjectPicker"
// - "AttendanceSession"
// - "EditAttendance"
// - "ReviewSubmit"
// - "SuccessConfirmation"
```

### State Not Updating
```typescript
// Ensure using hooks correctly:
const { currentSession } = useAttendanceStore();
// Not: const store = useAttendanceStore();

// Ensure calling methods correctly:
updateStudentStatus(usn, status);
// Not: store.updateStudentStatus(...)
```

---

**Last Updated:** 2026-05-11
**Document Version:** 1.0
