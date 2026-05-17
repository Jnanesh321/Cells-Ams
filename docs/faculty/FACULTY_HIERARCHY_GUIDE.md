# VCET Faculty Hierarchy & Department Integration Guide

## Overview
This document describes the realistic VCET department structure and faculty hierarchy integrated into the Faculty Attendance Workflow.

---

## Department Structure

### 7 Departments
1. **CSE** - Computer Science & Engineering
   - HOD: Mr. Pradeep Kumar K.G.
   - Email: pradeep.kg@vcet.ac.in
   - Phone: +91 9830321019

2. **ECE** - Electronics & Communication Engineering
   - HOD: Ms. Roopa G K
   - Email: roopa.gk@vcet.ac.in
   - Phone: +91 9880411247

3. **AIML** - Artificial Intelligence & Machine Learning
   - HOD: Dr. Nandini Sidnal
   - Email: nandini.sidnal@vcet.ac.in
   - Phone: +91 9945127382

4. **CD** - Computational Design
   - HOD: Mr. Kiran Kumar D
   - Email: kiran.kumar@vcet.ac.in
   - Phone: +91 9620451298

5. **CV** - Civil Engineering
   - HOD: Dr. Mithun Kumar S
   - Email: mithun.kumar@vcet.ac.in
   - Phone: +91 9740126734

6. **MECH** - Mechanical Engineering
   - HOD: Dr. Manujesh B J
   - Email: manujesh.bj@vcet.ac.in
   - Phone: +91 9845671234

7. **BASIC_SCIENCE** - Basic Science
   - HOD: Mr. M Ramananda Kamath
   - Email: ramananda.kamath@vcet.ac.in
   - Phone: +91 9866542891

### Principal
- **Name**: Dr. Mahesh Prasanna K
- **Email**: principal@vcet.ac.in
- **Phone**: +91 9880000000
- **Designation**: Principal

---

## Faculty & Subject Assignments

### Current Assignments (18 Faculty-Subject Pairs)

#### CSE Department
- **Mrs. Akshaya D. Shetty** (FAC_CSE_001)
  - Design Patterns (21CS53, Sec A, 50 students, Sem 5)
  - Web Technologies (21CS54, Sec B, 48 students, Sem 5)

- **Mrs. Anusha N K** (FAC_CSE_002)
  - Cloud Computing (21CS55, Sec A, 49 students, Sem 5)

- **Dr. Ajith Hebbar** (FAC_CSE_003)
  - Machine Learning (21CS56, Sec B, 47 students, Sem 5)

- **Mr. Darshan K** (FAC_CSE_004)
  - Software Testing (21CS57, Sec A, 50 students, Sem 5)

- **Ms. Sharanya S** (FAC_CSE_005)
  - Database Design (21CS58, Sec B, 48 students, Sem 5)

#### ECE Department
- **Mr. Naveenakrishna P V** (FAC_ECE_001)
  - Digital Signal Processing (21EC53, Sec A, 45 students, Sem 5)
  - Communication Systems (21EC54, Sec B, 44 students, Sem 5)

- **Ms. Kavya S** (FAC_ECE_002)
  - Microwave Engineering (21EC55, Sec A, 46 students, Sem 5)

- **Dr. Vinod Kumar** (FAC_ECE_003)
  - Power Systems (21EC56, Sec B, 44 students, Sem 5)

- **Ms. Priya Nair** (FAC_ECE_004)
  - Control Systems (21EC57, Sec A, 45 students, Sem 5)

#### AIML Department
- **Dr. Ajith Hebbar Hosmata** (FAC_AIML_001)
  - Deep Learning (21AI52, Sec A, 42 students, Sem 5)

- **Mr. Vikram Singh** (FAC_AIML_002)
  - NLP & Text Analytics (21AI53, Sec B, 40 students, Sem 5)

- **Ms. Anjali Sharma** (FAC_AIML_003)
  - Computer Vision (21AI54, Sec A, 41 students, Sem 5)

#### MECH Department
- **Mrs. Immaculate Mary** (FAC_MECH_001)
  - Thermodynamics (21ME53, Sec A, 50 students, Sem 5)

- **Mr. Rajesh Kumar** (FAC_MECH_002)
  - Fluid Mechanics (21ME54, Sec B, 48 students, Sem 5)

- **Dr. Suresh Babu** (FAC_MECH_003)
  - Finite Element Analysis (21ME55, Sec A, 49 students, Sem 5)

- **Ms. Divya Reddy** (FAC_MECH_004)
  - Manufacturing Processes (21ME56, Sec B, 47 students, Sem 5)

---

## Student Attendance & Detention Logic

### Detention Threshold
**< 75% attendance** = Student marked for detention (red badge)

### Mock Student Data
- **18 Student Records**: Realistic attendance tracking across multiple subjects
- **Enrolled Subjects**: Each student has multi-subject enrollment
- **Attendance Tracking**: Present (P), Absent (A), On-Duty (OD)
- **Detention Detection**: Automatic for students below 75%

### Example Detention Cases
- **4VP21CS005** (CSE): ~48% attendance across all subjects (DETAINED)
- **4VP21EC003** (ECE): ~52% attendance (DETAINED)
- **4VP21AI003** (AIML): ~67% attendance (DETAINED)
- **Priya Sharma** (CSE): 100% attendance all subjects (GOOD STANDING)

---

## Role-Based Access Control

### Principal
- **Access**: Full system access to all departments
- **Actions**: View all departments, monitor detention lists, access analytics
- **Screens**: Principal Dashboard (upcoming), All department views

### HOD (Head of Department)
- **Access**: Department-specific data only
- **Actions**: Monitor faculty, approve attendance edits, view detention lists
- **Screens**: HOD Dashboard (upcoming), Department analytics

### Faculty
- **Access**: Own subjects and assigned students only
- **Actions**: Mark attendance, edit records, view detention students
- **Screens**: Faculty Dashboard, Subject Picker, Attendance Session, Review Submit

### Student
- **Access**: Own records only
- **Actions**: View own attendance, view marks
- **Screens**: Student Dashboard (read-only)

---

## Test User Credentials

Use these test users to explore the faculty hierarchy:

```typescript
// Principal - Full access
loginTestUser('principal')
// ID: PRINCIPAL_01

// CSE Faculty - Can mark attendance for CSE subjects
loginTestUser('cse_faculty')
// ID: FAC_CSE_001

// ECE Faculty
loginTestUser('ece_faculty')
// ID: FAC_ECE_001

// AIML Faculty
loginTestUser('aiml_faculty')
// ID: FAC_AIML_001

// MECH Faculty
loginTestUser('mech_faculty')
// ID: FAC_MECH_001

// HOD Accounts
loginTestUser('cse_hod')    // HOD_CSE
loginTestUser('ece_hod')    // HOD_ECE
loginTestUser('aiml_hod')   // HOD_AIML

// Student
loginTestUser('student')
// USN: 4VP21CS001
```

---

## File Structure

### Data Layer
- `src/constants/departments.ts` - Department configuration
- `src/mock/facultySubjects.ts` - Faculty-subject assignments
- `src/mock/studentAttendance.ts` - Student attendance records with detention logic

### Updated Screens
- `src/screens/FacultyDashboardScreen.tsx` - Shows assigned subjects with detention indicators
- `src/screens/SubjectPickerScreen.tsx` - Select subject for attendance marking

### State Management
- `src/store/auth.ts` - Updated test users for new departments

---

## Faculty Attendance Workflow

### Step 1: Faculty Dashboard
1. Faculty logs in (e.g., `cse_faculty`)
2. Dashboard displays:
   - Faculty name and department
   - HOD information
   - Assigned subjects with:
     - Subject code and enrollment count
     - Detention badge (red) if any student < 75%
     - Attendance marking status
   - Quick stats: Total subjects, total students, marked today

### Step 2: Subject Selection
1. Click "Mark Attendance" button
2. Search and select subject
3. View:
   - Subject code and enrollment
   - Number of detained students
   - Last attendance date

### Step 3: Attendance Marking
1. Select date and time
2. View student list
3. Mark P/A/OD for each student
4. See detention warnings for < 75% students

### Step 4: Review & Submit
1. Review all marked attendance
2. Confirm detention cases
3. Submit attendance record

---

## Integration Points

### Database Schema (Ready for Backend)
```sql
-- Departments
departments (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  hod VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20)
)

-- Faculty
faculty (
  faculty_id VARCHAR(50) PRIMARY KEY,
  faculty_name VARCHAR(255),
  department_code VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(20),
  FOREIGN KEY (department_code) REFERENCES departments(code)
)

-- Faculty Subject Assignments
faculty_subject_assignments (
  assignment_id INT PRIMARY KEY AUTO_INCREMENT,
  faculty_id VARCHAR(50),
  subject_code VARCHAR(50),
  subject_name VARCHAR(255),
  section VARCHAR(10),
  semester INT,
  enrollment_count INT,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
)

-- Student Attendance
student_attendance (
  record_id INT PRIMARY KEY AUTO_INCREMENT,
  student_usn VARCHAR(50),
  subject_code VARCHAR(50),
  date DATE,
  status ENUM('PRESENT', 'ABSENT', 'OD'),
  faculty_id VARCHAR(50),
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
)
```

---

## Next Steps

1. **Create HOD Dashboard**
   - Department-specific detention monitoring
   - Attendance approval workflows
   - Department analytics

2. **Create Principal Dashboard**
   - College-wide detention list
   - Department comparisons
   - System-wide analytics

3. **Implement Backend API**
   - Replace mock data with REST endpoints
   - Database persistence
   - Real authentication

4. **Add Email Notifications**
   - Detention alerts to students
   - Daily attendance summaries to faculty
   - Department reports to HOD

---

## Code Examples

### Getting Faculty Subjects
```typescript
import { getFacultySubjects } from '../mock/facultySubjects';

const facultyId = 'FAC_CSE_001';
const subjects = getFacultySubjects(facultyId);
// Returns: 2 subjects (Design Patterns, Web Technologies)
```

### Checking for Detention Students
```typescript
import { getStudentsForSubject } from '../mock/studentAttendance';

const detainedCount = getStudentsForSubject(
  '21CS53', // subjectCode
  'A'       // section
).filter(student => 
  student.enrolledSubjects.some(s => 
    s.subjectCode === '21CS53' && 
    s.attendancePercentage < 75
  )
).length;
```

### Getting Department Info
```typescript
import { DEPARTMENTS } from '../constants/departments';

const cseInfo = DEPARTMENTS.CSE;
// Returns: { code, name, hod, email, phone, established }
```

---

## Troubleshooting

### No subjects showing on Faculty Dashboard
- Verify faculty ID matches a key in FACULTY_SUBJECTS
- Check that the faculty ID exists in mock data
- Ensure getFacultySubjects is returning data

### Detention badge not showing
- Verify student has attendance < 75% for that subject
- Check studentAttendance.ts for correct enrollment
- Ensure hasDetainedStudents function is called

### Missing department information
- Verify department code is in DEPARTMENTS object
- Check that HOD name matches constant format
- Ensure email and phone are present

---

## Contact & Support

- **Project**: VCET Attendance Management System
- **Version**: 1.0
- **Last Updated**: 2025-01-01
