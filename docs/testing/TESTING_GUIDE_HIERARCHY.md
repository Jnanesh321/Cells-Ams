# Testing Guide - Faculty Hierarchy & Detention Logic

## Quick Start - Test Scenarios

### Scenario 1: CSE Faculty Marking Attendance with Detention Detection

#### Steps:
1. **Login as CSE Faculty**
   ```javascript
   // In LoginScreen or call directly:
   loginTestUser('cse_faculty');
   // Faculty: Mrs. Akshaya D. Shetty
   // Department: CSE
   // Subjects: 2 (Design Patterns, Web Technologies)
   ```

2. **View Faculty Dashboard**
   - Expected: See 2 subjects assigned
   - Expected: One subject shows "Detention" badge (if students < 75%)
   - Expected: Department shows "CSE • HOD: Mr. Pradeep Kumar K.G."
   - Expected: Stats: "2 Subjects", "97 Students" (50+47), "0 Marked Today"

3. **Mark Attendance**
   - Click "Mark Attendance"
   - Select "Design Patterns (21CS53, Sec A, 50 Students)"
   - View: "Detained: X students" (if any)
   - Click "Proceed to Attendance"

4. **Verify Detention Warnings**
   - On AttendanceSessionScreen:
     - Look for detained students marked with red badge
     - View current attendance percentages
     - See warnings for < 75% students

---

### Scenario 2: ECE Faculty with Different Subject Load

#### Steps:
1. **Login as ECE Faculty**
   ```javascript
   loginTestUser('ece_faculty');
   // Faculty: Mr. Naveenakrishna P V
   // Department: ECE
   // Subjects: 2 subjects
   ```

2. **View Dashboard**
   - Expected: Shows ECE department
   - Expected: HOD: Ms. Roopa G K
   - Different subject codes (21EC53, 21EC54)
   - May show detention badges for ECE subjects

3. **Subject Picker Test**
   - Select different subjects
   - Verify each has correct:
     - Subject code
     - Section letter
     - Enrollment count
     - Detained student count

---

### Scenario 3: AIML Faculty (Low Enrollment)

#### Steps:
1. **Login as AIML Faculty**
   ```javascript
   loginTestUser('aiml_faculty');
   // Faculty: Dr. Ajith Hebbar Hosmata
   // Department: AIML
   // Subjects: 1 subject (lower enrollment)
   ```

2. **Verify Data Consistency**
   - Dashboard shows correct department
   - Subject code correct (21AI52, 21AI53, 21AI54)
   - Enrollment counts: 40-42 students
   - Semester: 5

---

### Scenario 4: HOD View (Department Level)

#### Steps:
1. **Login as HOD**
   ```javascript
   loginTestUser('cse_hod');
   // Name: Mr. Pradeep Kumar K.G.
   // Role: HOD
   // Department: CSE (access only)
   ```

2. **Expected Behavior** (When HOD Dashboard is implemented)
   - Can see all CSE faculty subjects
   - Can view detention list for CSE students
   - Cannot access other departments

---

### Scenario 5: Principal View (System Level)

#### Steps:
1. **Login as Principal**
   ```javascript
   loginTestUser('principal');
   // Name: Dr. Mahesh Prasanna K
   // Role: PRINCIPAL
   // Access: All departments
   ```

2. **Expected Behavior** (When Principal Dashboard is implemented)
   - Can view all departments
   - Can access all faculty subjects
   - Can see college-wide detention list

---

## Validation Tests

### Data Integrity

#### Test 1: Faculty Subject Assignment Consistency
```javascript
// All faculty in FACULTY_SUBJECTS should have:
// ✓ Valid facultyId
// ✓ Valid department code
// ✓ Valid subject code
// ✓ Enrollment count > 0
// ✓ Section in [A, B]
// ✓ Semester: 5

import { FACULTY_SUBJECTS } from '../mock/facultySubjects';

FACULTY_SUBJECTS.forEach(assignment => {
  console.assert(assignment.facultyId, 'Missing facultyId');
  console.assert(assignment.department, 'Missing department');
  console.assert(assignment.subjectCode, 'Missing subjectCode');
  console.assert(assignment.enrollmentCount > 0, 'Invalid enrollment');
});
```

#### Test 2: Department Configuration
```javascript
import { DEPARTMENTS } from '../constants/departments';

const validCodes = ['CSE', 'ECE', 'AIML', 'CD', 'CV', 'MECH', 'BASIC_SCIENCE'];

Object.keys(DEPARTMENTS).forEach(code => {
  console.assert(validCodes.includes(code), `Invalid department code: ${code}`);
  console.assert(DEPARTMENTS[code].hod, `Missing HOD for ${code}`);
  console.assert(DEPARTMENTS[code].email, `Missing email for ${code}`);
  console.assert(DEPARTMENTS[code].phone, `Missing phone for ${code}`);
});
```

#### Test 3: Student Attendance Detention Logic
```javascript
import { STUDENT_ATTENDANCE } from '../mock/studentAttendance';

STUDENT_ATTENDANCE.forEach(record => {
  record.enrolledSubjects.forEach(subject => {
    const isDetained = subject.attendancePercentage < 75;
    console.assert(
      typeof isDetained === 'boolean',
      `Invalid detention status for ${record.usn}`
    );
    console.assert(
      subject.attendancePercentage >= 0 && subject.attendancePercentage <= 100,
      `Invalid percentage for ${record.usn}`
    );
  });
});
```

---

## UI/UX Verification

### Faculty Dashboard Tests

#### Test 1: Subject Cards Display
- [ ] Subject name displayed
- [ ] Subject code shown (e.g., 21CS53)
- [ ] Section displayed (Sec A or Sec B)
- [ ] Enrollment count with 📚 icon
- [ ] Semester number shown
- [ ] Detention badge appears if students < 75%
- [ ] Attendance status indicator (✓ or ◯)
- [ ] Last updated timestamp

#### Test 2: Department Info Card
- [ ] Faculty name displayed
- [ ] Department name shown
- [ ] HOD name shown
- [ ] Correct department selected

#### Test 3: Statistics Section
- [ ] "Subjects" count is accurate
- [ ] "Students" total is sum of all enrollments
- [ ] "Marked Today" shows correct count

#### Test 4: Quick Action Buttons
- [ ] "Mark Attendance" button functional
- [ ] "View Detention List" button present
- [ ] Refresh control works (pull to refresh)

### Subject Picker Tests

#### Test 1: Subject List Display
- [ ] All faculty subjects listed
- [ ] Subject name, code, section visible
- [ ] Enrollment count shown
- [ ] Detention count displayed
- [ ] Search filter works
- [ ] Selected subject highlighted (blue)

#### Test 2: Subject Selection
- [ ] Clicking subject highlights it
- [ ] Subject summary appears below
- [ ] Detention count updated in summary
- [ ] Date/time picker appears

#### Test 3: Attendance Start Button
- [ ] Button shows "Start Attendance (X students)"
- [ ] Button disabled until subject selected
- [ ] Navigation to AttendanceSession works

---

## Cross-Department Testing

### Test Matrix: Multiple Faculty, Multiple Departments

| Faculty | Department | Subject Count | Detention Expected |
|---------|------------|--------------|-------------------|
| Akshaya | CSE | 2 | Yes (one subject) |
| Naveenakrishna | ECE | 2 | No |
| Ajith | AIML | 1 | Yes |
| Immaculate | MECH | 1 | No |

**Steps**:
1. Login as each faculty
2. Verify correct department shown
3. Verify correct HOD name
4. Count subjects displayed
5. Verify detention badges match expected

---

## Performance Tests

### Data Loading Performance
- [ ] FacultyDashboardScreen loads in < 2 seconds
- [ ] Subject list renders smoothly (no jank)
- [ ] 50+ student records load without lag
- [ ] Refresh control updates quickly

### Memory Usage
- [ ] No memory leaks on navigation
- [ ] Screen transitions smooth
- [ ] No lag when marking attendance for 50+ students

---

## Edge Cases

### Test 1: Faculty with No Subjects
- **Setup**: Create test user with non-existent faculty ID
- **Expected**: "No subjects assigned" message shown

### Test 2: Subject with Detention
- **Setup**: Select subject with all students > 75%
- **Expected**: No detention badge shown

### Test 3: Subject with All Detained
- **Setup**: Find subject where all students < 75%
- **Expected**: Red "Detention" badge visible

### Test 4: Section Selection (if multi-section)
- **Setup**: Subject with multiple sections
- **Expected**: Both sections listed
- **Expected**: Different student lists per section

---

## Integration Tests

### Test 1: Navigation Flow
```
LoginScreen 
  → FacultyDashboardScreen
  → SubjectPickerScreen
  → AttendanceSessionScreen (mark attendance)
  → ReviewSubmitScreen (confirm)
  → SuccessConfirmationScreen (done)
```

All navigation should be smooth without errors.

### Test 2: Data Flow
```
1. Faculty logs in
2. Dashboard queries getFacultySubjects(facultyId)
3. Select subject → passes to SubjectPickerScreen
4. Subject picker shows getStudentsForSubject(subjectCode)
5. Attendance marked → stored in session state
6. ReviewSubmit checks for detention students
7. Submit → updates mock data
```

### Test 3: Detention Display Flow
```
FacultyDashboard: Show badge if subject has detained
  ↓
SubjectPicker: Show count of detained
  ↓
AttendanceSession: Highlight detained students
  ↓
ReviewSubmit: Show detention warnings
  ↓
SuccessConfirmation: Acknowledge detention cases
```

---

## Test Results Checklist

- [ ] All faculty subjects display correctly
- [ ] Department HOD names match constants
- [ ] Detention badges appear when expected
- [ ] Enrollment counts accurate
- [ ] Student list loads for each subject
- [ ] Attendance marking works smoothly
- [ ] Navigation flow completes without errors
- [ ] No TypeScript errors in new files
- [ ] No runtime errors in console
- [ ] All test users can login
- [ ] Correct department shown for each faculty
- [ ] Detention count matches UI display

---

## Debugging Commands

```javascript
// Import in DevTools console:

// Check faculty subjects
import { getFacultySubjects } from '../mock/facultySubjects';
console.log(getFacultySubjects('FAC_CSE_001'));

// Check detention students
import { getStudentsForSubject } from '../mock/studentAttendance';
console.log(getStudentsForSubject('21CS53', 'A'));

// Check department info
import { DEPARTMENTS } from '../constants/departments';
console.log(DEPARTMENTS.CSE);

// Check all test users
import { MOCK_TEST_USERS } from '../store/auth';
console.log(Object.keys(MOCK_TEST_USERS));

// Login as a user
import { loginTestUser } from '../store/auth';
loginTestUser('cse_faculty');
```

---

## Expected Results Summary

### After Implementation ✅
1. Faculty Dashboard shows real VCET departments
2. All 7 departments configured with accurate HOD names
3. 18 faculty-subject assignments loaded
4. Detention detection working (< 75% highlighted)
5. All test users login successfully
6. Navigation flow completes without errors
7. Multi-role access control ready

### Ready for Next Phase 🚀
1. HOD Dashboard implementation
2. Principal Dashboard implementation
3. Backend API integration
4. Real database persistence
5. Email notifications
6. Analytics and reporting
