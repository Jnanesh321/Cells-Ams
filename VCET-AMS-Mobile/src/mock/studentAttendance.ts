/**
 * VCET Student Attendance Tracking
 * Mock attendance data for students in each faculty subject
 */

export interface StudentAttendanceRecord {
  usn: string;
  name: string;
  section: string;
  department: string;
  enrolledSubjects: {
    subjectCode: string;
    subject: string;
    facultyId: string;
    facultyName: string;
    presentDays: number;
    totalDays: number;
    attendancePercentage: number;
    status: 'PRESENT' | 'ABSENT' | 'OD'; // Current class status
    lastAttendanceDate?: string;
  }[];
}

/**
 * Calculate attendance percentage
 */
const calcPercentage = (present: number, total: number): number => {
  return total === 0 ? 0 : Math.round((present / total) * 100);
};

/**
 * Generate realistic attendance records for students
 */
export const STUDENT_ATTENDANCE: StudentAttendanceRecord[] = [
  // ==================== CSE SECTION A ====================
  {
    usn: '4VP21CS001',
    name: 'Aditya Kumar',
    section: 'A',
    department: 'CSE',
    enrolledSubjects: [
      {
        subjectCode: '21CS53',
        subject: 'Data Structures',
        facultyId: 'FAC_CSE_001',
        facultyName: 'Mrs. Akshaya D. Shetty',
        presentDays: 32,
        totalDays: 42,
        attendancePercentage: calcPercentage(32, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21CS52',
        subject: 'Algorithms',
        facultyId: 'FAC_CSE_002',
        facultyName: 'Mr. Ajay Shastry C G',
        presentDays: 28,
        totalDays: 40,
        attendancePercentage: calcPercentage(28, 40),
        status: 'ABSENT',
        lastAttendanceDate: '2026-05-10',
      },
      {
        subjectCode: '21CS54',
        subject: 'Web Development',
        facultyId: 'FAC_CSE_003',
        facultyName: 'Mrs. Vaishnavi K V',
        presentDays: 35,
        totalDays: 42,
        attendancePercentage: calcPercentage(35, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21CS002',
    name: 'Priya Sharma',
    section: 'A',
    department: 'CSE',
    enrolledSubjects: [
      {
        subjectCode: '21CS53',
        subject: 'Data Structures',
        facultyId: 'FAC_CSE_001',
        facultyName: 'Mrs. Akshaya D. Shetty',
        presentDays: 40,
        totalDays: 42,
        attendancePercentage: calcPercentage(40, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21CS52',
        subject: 'Algorithms',
        facultyId: 'FAC_CSE_002',
        facultyName: 'Mr. Ajay Shastry C G',
        presentDays: 38,
        totalDays: 40,
        attendancePercentage: calcPercentage(38, 40),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21CS54',
        subject: 'Web Development',
        facultyId: 'FAC_CSE_003',
        facultyName: 'Mrs. Vaishnavi K V',
        presentDays: 42,
        totalDays: 42,
        attendancePercentage: calcPercentage(42, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21CS003',
    name: 'Rajesh Patel',
    section: 'A',
    department: 'CSE',
    enrolledSubjects: [
      {
        subjectCode: '21CS53',
        subject: 'Data Structures',
        facultyId: 'FAC_CSE_001',
        facultyName: 'Mrs. Akshaya D. Shetty',
        presentDays: 30,
        totalDays: 42,
        attendancePercentage: calcPercentage(30, 42),
        status: 'OD',
        lastAttendanceDate: '2026-05-09',
      },
      {
        subjectCode: '21CS52',
        subject: 'Algorithms',
        facultyId: 'FAC_CSE_002',
        facultyName: 'Mr. Ajay Shastry C G',
        presentDays: 25,
        totalDays: 40,
        attendancePercentage: calcPercentage(25, 40),
        status: 'ABSENT',
        lastAttendanceDate: '2026-05-08',
      },
      {
        subjectCode: '21CS54',
        subject: 'Web Development',
        facultyId: 'FAC_CSE_003',
        facultyName: 'Mrs. Vaishnavi K V',
        presentDays: 28,
        totalDays: 42,
        attendancePercentage: calcPercentage(28, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-05-09',
      },
    ],
  },
  {
    usn: '4VP21CS004',
    name: 'Neha Gupta',
    section: 'A',
    department: 'CSE',
    enrolledSubjects: [
      {
        subjectCode: '21CS53',
        subject: 'Data Structures',
        facultyId: 'FAC_CSE_001',
        facultyName: 'Mrs. Akshaya D. Shetty',
        presentDays: 32,
        totalDays: 42,
        attendancePercentage: calcPercentage(32, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21CS52',
        subject: 'Algorithms',
        facultyId: 'FAC_CSE_002',
        facultyName: 'Mr. Ajay Shastry C G',
        presentDays: 35,
        totalDays: 40,
        attendancePercentage: calcPercentage(35, 40),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21CS54',
        subject: 'Web Development',
        facultyId: 'FAC_CSE_003',
        facultyName: 'Mrs. Vaishnavi K V',
        presentDays: 38,
        totalDays: 42,
        attendancePercentage: calcPercentage(38, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21CS005',
    name: 'Kavya Singh',
    section: 'A',
    department: 'CSE',
    enrolledSubjects: [
      {
        subjectCode: '21CS53',
        subject: 'Data Structures',
        facultyId: 'FAC_CSE_001',
        facultyName: 'Mrs. Akshaya D. Shetty',
        presentDays: 20,
        totalDays: 42,
        attendancePercentage: calcPercentage(20, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-20',
      },
      {
        subjectCode: '21CS52',
        subject: 'Algorithms',
        facultyId: 'FAC_CSE_002',
        facultyName: 'Mr. Ajay Shastry C G',
        presentDays: 18,
        totalDays: 40,
        attendancePercentage: calcPercentage(18, 40),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-18',
      },
      {
        subjectCode: '21CS54',
        subject: 'Web Development',
        facultyId: 'FAC_CSE_003',
        facultyName: 'Mrs. Vaishnavi K V',
        presentDays: 25,
        totalDays: 42,
        attendancePercentage: calcPercentage(25, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-22',
      },
    ],
  },

  // ==================== ECE SECTION A ====================
  {
    usn: '4VP21EC001',
    name: 'Arjun Singh',
    section: 'A',
    department: 'ECE',
    enrolledSubjects: [
      {
        subjectCode: '21EC53',
        subject: 'Digital Signal Processing',
        facultyId: 'FAC_ECE_001',
        facultyName: 'Mr. Naveenakrishna P V',
        presentDays: 36,
        totalDays: 42,
        attendancePercentage: calcPercentage(36, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21EC54',
        subject: 'Microcontrollers',
        facultyId: 'FAC_ECE_002',
        facultyName: 'Ms. Surekha T',
        presentDays: 40,
        totalDays: 42,
        attendancePercentage: calcPercentage(40, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21EC002',
    name: 'Deepa Reddy',
    section: 'A',
    department: 'ECE',
    enrolledSubjects: [
      {
        subjectCode: '21EC53',
        subject: 'Digital Signal Processing',
        facultyId: 'FAC_ECE_001',
        facultyName: 'Mr. Naveenakrishna P V',
        presentDays: 35,
        totalDays: 42,
        attendancePercentage: calcPercentage(35, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21EC54',
        subject: 'Microcontrollers',
        facultyId: 'FAC_ECE_002',
        facultyName: 'Ms. Surekha T',
        presentDays: 38,
        totalDays: 42,
        attendancePercentage: calcPercentage(38, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21EC003',
    name: 'Sameer Khan',
    section: 'A',
    department: 'ECE',
    enrolledSubjects: [
      {
        subjectCode: '21EC53',
        subject: 'Digital Signal Processing',
        facultyId: 'FAC_ECE_001',
        facultyName: 'Mr. Naveenakrishna P V',
        presentDays: 22,
        totalDays: 42,
        attendancePercentage: calcPercentage(22, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-25',
      },
      {
        subjectCode: '21EC54',
        subject: 'Microcontrollers',
        facultyId: 'FAC_ECE_002',
        facultyName: 'Ms. Surekha T',
        presentDays: 20,
        totalDays: 42,
        attendancePercentage: calcPercentage(20, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-23',
      },
    ],
  },

  // ==================== AIML SECTION A ====================
  {
    usn: '4VP21AI001',
    name: 'Vishal Patel',
    section: 'A',
    department: 'AIML',
    enrolledSubjects: [
      {
        subjectCode: '21AI52',
        subject: 'Machine Learning',
        facultyId: 'FAC_AIML_001',
        facultyName: 'Dr. Ajith Hebbar Hosmata',
        presentDays: 38,
        totalDays: 42,
        attendancePercentage: calcPercentage(38, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21AI53',
        subject: 'Deep Learning',
        facultyId: 'FAC_AIML_002',
        facultyName: 'Ms. Naveena C',
        presentDays: 36,
        totalDays: 40,
        attendancePercentage: calcPercentage(36, 40),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21AI002',
    name: 'Pooja Verma',
    section: 'A',
    department: 'AIML',
    enrolledSubjects: [
      {
        subjectCode: '21AI52',
        subject: 'Machine Learning',
        facultyId: 'FAC_AIML_001',
        facultyName: 'Dr. Ajith Hebbar Hosmata',
        presentDays: 42,
        totalDays: 42,
        attendancePercentage: calcPercentage(42, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21AI53',
        subject: 'Deep Learning',
        facultyId: 'FAC_AIML_002',
        facultyName: 'Ms. Naveena C',
        presentDays: 40,
        totalDays: 40,
        attendancePercentage: calcPercentage(40, 40),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21AI003',
    name: 'Rohan Desai',
    section: 'A',
    department: 'AIML',
    enrolledSubjects: [
      {
        subjectCode: '21AI52',
        subject: 'Machine Learning',
        facultyId: 'FAC_AIML_001',
        facultyName: 'Dr. Ajith Hebbar Hosmata',
        presentDays: 28,
        totalDays: 42,
        attendancePercentage: calcPercentage(28, 42),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-20',
      },
      {
        subjectCode: '21AI53',
        subject: 'Deep Learning',
        facultyId: 'FAC_AIML_002',
        facultyName: 'Ms. Naveena C',
        presentDays: 26,
        totalDays: 40,
        attendancePercentage: calcPercentage(26, 40),
        status: 'ABSENT',
        lastAttendanceDate: '2026-04-18',
      },
    ],
  },

  // ==================== MECH SECTION A ====================
  {
    usn: '4VP21ME001',
    name: 'Amit Kumar',
    section: 'A',
    department: 'MECH',
    enrolledSubjects: [
      {
        subjectCode: '21ME53',
        subject: 'Thermal Engineering',
        facultyId: 'FAC_MECH_001',
        facultyName: 'Mrs. Immaculate Mary',
        presentDays: 34,
        totalDays: 42,
        attendancePercentage: calcPercentage(34, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21ME54',
        subject: 'Machine Design',
        facultyId: 'FAC_MECH_002',
        facultyName: 'Dr. Rajeshwari M',
        presentDays: 32,
        totalDays: 42,
        attendancePercentage: calcPercentage(32, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
  {
    usn: '4VP21ME002',
    name: 'Sneha Nair',
    section: 'A',
    department: 'MECH',
    enrolledSubjects: [
      {
        subjectCode: '21ME53',
        subject: 'Thermal Engineering',
        facultyId: 'FAC_MECH_001',
        facultyName: 'Mrs. Immaculate Mary',
        presentDays: 38,
        totalDays: 42,
        attendancePercentage: calcPercentage(38, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
      {
        subjectCode: '21ME54',
        subject: 'Machine Design',
        facultyId: 'FAC_MECH_002',
        facultyName: 'Dr. Rajeshwari M',
        presentDays: 40,
        totalDays: 42,
        attendancePercentage: calcPercentage(40, 42),
        status: 'PRESENT',
        lastAttendanceDate: '2026-05-11',
      },
    ],
  },
];

/**
 * Get attendance record for a student
 */
export const getStudentAttendance = (usn: string): StudentAttendanceRecord | undefined => {
  return STUDENT_ATTENDANCE.find((sa) => sa.usn === usn);
};

/**
 * Get students with detention (< 75% attendance)
 */
export const getDetainedStudents = (): StudentAttendanceRecord[] => {
  return STUDENT_ATTENDANCE.filter((student) =>
    student.enrolledSubjects.some((subject) => subject.attendancePercentage < 75)
  );
};

/**
 * Get students by department
 */
export const getStudentsByDepartment = (department: string): StudentAttendanceRecord[] => {
  return STUDENT_ATTENDANCE.filter((student) => student.department === department);
};

/**
 * Get students in a faculty's subject section
 */
export const getStudentsForSubject = (
  subjectCode: string,
  facultyId: string
): StudentAttendanceRecord[] => {
  return STUDENT_ATTENDANCE.filter((student) =>
    student.enrolledSubjects.some(
      (subject) => subject.subjectCode === subjectCode && subject.facultyId === facultyId
    )
  );
};
