/**
 * VCET Faculty Subject Assignments
 * Realistic mock data of faculty teaching assignments across departments
 */

export interface FacultySubjectAssignment {
  facultyId: string;
  facultyName: string;
  department: string;
  subject: string;
  subjectCode: string;
  section: string;
  semester: number;
  students?: string[]; // Array of student USNs
  enrollmentCount?: number;
  lastUpdated?: string;
}

/**
 * Faculty subject assignments across all departments
 */
export const FACULTY_SUBJECTS: FacultySubjectAssignment[] = [
  // ==================== CSE DEPARTMENT ====================
  {
    facultyId: 'FAC_CSE_001',
    facultyName: 'Mrs. Akshaya D. Shetty',
    department: 'CSE',
    subject: 'Data Structures',
    subjectCode: '21CS53',
    section: 'A',
    semester: 5,
    enrollmentCount: 45,
    students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_CSE_001',
    facultyName: 'Mrs. Akshaya D. Shetty',
    department: 'CSE',
    subject: 'Database Management Systems',
    subjectCode: '21CS53',
    section: 'B',
    semester: 5,
    enrollmentCount: 42,
    students: ['4VP21CS006', '4VP21CS007', '4VP21CS008', '4VP21CS009', '4VP21CS010'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_CSE_002',
    facultyName: 'Mr. Ajay Shastry C G',
    department: 'CSE',
    subject: 'Algorithms',
    subjectCode: '21CS52',
    section: 'A',
    semester: 5,
    enrollmentCount: 45,
    students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_CSE_003',
    facultyName: 'Mrs. Vaishnavi K V',
    department: 'CSE',
    subject: 'Web Development',
    subjectCode: '21CS54',
    section: 'A',
    semester: 5,
    enrollmentCount: 48,
    students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005'],
    lastUpdated: '2026-05-09',
  },
  {
    facultyId: 'FAC_CSE_004',
    facultyName: 'Mr. Venkatesh Y C',
    department: 'CSE',
    subject: 'Software Engineering',
    subjectCode: '21CS55',
    section: 'A',
    semester: 5,
    enrollmentCount: 47,
    students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005'],
    lastUpdated: '2026-05-08',
  },
  {
    facultyId: 'FAC_CSE_005',
    facultyName: 'Mrs. Shruthi S Bangera',
    department: 'CSE',
    subject: 'Operating Systems',
    subjectCode: '21CS56',
    section: 'B',
    semester: 5,
    enrollmentCount: 43,
    students: ['4VP21CS006', '4VP21CS007', '4VP21CS008', '4VP21CS009', '4VP21CS010'],
    lastUpdated: '2026-05-10',
  },

  // ==================== ECE DEPARTMENT ====================
  {
    facultyId: 'FAC_ECE_001',
    facultyName: 'Mr. Naveenakrishna P V',
    department: 'ECE',
    subject: 'Digital Signal Processing',
    subjectCode: '21EC53',
    section: 'A',
    semester: 5,
    enrollmentCount: 44,
    students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004', '4VP21EC005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_ECE_002',
    facultyName: 'Ms. Surekha T',
    department: 'ECE',
    subject: 'Microcontrollers',
    subjectCode: '21EC54',
    section: 'A',
    semester: 5,
    enrollmentCount: 44,
    students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004', '4VP21EC005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_ECE_003',
    facultyName: 'Mr. Naveen S P',
    department: 'ECE',
    subject: 'VLSI Design',
    subjectCode: '21EC55',
    section: 'A',
    semester: 5,
    enrollmentCount: 44,
    students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004', '4VP21EC005'],
    lastUpdated: '2026-05-09',
  },
  {
    facultyId: 'FAC_ECE_004',
    facultyName: 'Mr. Deepak Kumar Shetty K',
    department: 'ECE',
    subject: 'Communication Systems',
    subjectCode: '21EC56',
    section: 'A',
    semester: 5,
    enrollmentCount: 44,
    students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004', '4VP21EC005'],
    lastUpdated: '2026-05-08',
  },

  // ==================== AIML DEPARTMENT ====================
  {
    facultyId: 'FAC_AIML_001',
    facultyName: 'Dr. Ajith Hebbar Hosmata',
    department: 'AIML',
    subject: 'Machine Learning',
    subjectCode: '21AI52',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21AI001', '4VP21AI002', '4VP21AI003', '4VP21AI004', '4VP21AI005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_AIML_002',
    facultyName: 'Ms. Naveena C',
    department: 'AIML',
    subject: 'Deep Learning',
    subjectCode: '21AI53',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21AI001', '4VP21AI002', '4VP21AI003', '4VP21AI004', '4VP21AI005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_AIML_003',
    facultyName: 'Mr. Prashantha',
    department: 'AIML',
    subject: 'Natural Language Processing',
    subjectCode: '21AI54',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21AI001', '4VP21AI002', '4VP21AI003', '4VP21AI004', '4VP21AI005'],
    lastUpdated: '2026-05-09',
  },

  // ==================== MECHANICAL ENGINEERING ====================
  {
    facultyId: 'FAC_MECH_001',
    facultyName: 'Mrs. Immaculate Mary',
    department: 'MECH',
    subject: 'Thermal Engineering',
    subjectCode: '21ME53',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21ME001', '4VP21ME002', '4VP21ME003', '4VP21ME004', '4VP21ME005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_MECH_002',
    facultyName: 'Dr. Rajeshwari M',
    department: 'MECH',
    subject: 'Machine Design',
    subjectCode: '21ME54',
    section: 'A',
    semester: 5,
    enrollmentCount: 48,
    students: ['4VP21ME001', '4VP21ME002', '4VP21ME003', '4VP21ME004', '4VP21ME005'],
    lastUpdated: '2026-05-10',
  },
  {
    facultyId: 'FAC_MECH_003',
    facultyName: 'Dr. Subrahmanya R M',
    department: 'MECH',
    subject: 'Fluid Mechanics',
    subjectCode: '21ME55',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21ME001', '4VP21ME002', '4VP21ME003', '4VP21ME004', '4VP21ME005'],
    lastUpdated: '2026-05-09',
  },
  {
    facultyId: 'FAC_MECH_004',
    facultyName: 'Ms. Sheethal S K',
    department: 'MECH',
    subject: 'Control Systems',
    subjectCode: '21ME56',
    section: 'A',
    semester: 5,
    enrollmentCount: 50,
    students: ['4VP21ME001', '4VP21ME002', '4VP21ME003', '4VP21ME004', '4VP21ME005'],
    lastUpdated: '2026-05-08',
  },
];

/**
 * Get subjects taught by a faculty member
 */
export const getFacultySubjects = (facultyId: string): FacultySubjectAssignment[] => {
  return FACULTY_SUBJECTS.filter((fs) => fs.facultyId === facultyId);
};

/**
 * Get subjects in a department
 */
export const getDepartmentSubjects = (department: string): FacultySubjectAssignment[] => {
  return FACULTY_SUBJECTS.filter((fs) => fs.department === department);
};

/**
 * Get all faculty in a department
 */
export const getDepartmentFaculty = (department: string): string[] => {
  const faculties = FACULTY_SUBJECTS.filter((fs) => fs.department === department).map(
    (fs) => fs.facultyId
  );
  return [...new Set(faculties)]; // Remove duplicates
};

/**
 * Get faculty info by ID
 */
export const getFacultyInfo = (facultyId: string) => {
  const firstEntry = FACULTY_SUBJECTS.find((fs) => fs.facultyId === facultyId);
  if (!firstEntry) return null;
  return {
    facultyId: firstEntry.facultyId,
    facultyName: firstEntry.facultyName,
    department: firstEntry.department,
    subjects: getFacultySubjects(facultyId),
  };
};

/**
 * Get total enrollment for a subject
 */
export const getSubjectEnrollment = (subjectCode: string): number => {
  const subject = FACULTY_SUBJECTS.find((fs) => fs.subjectCode === subjectCode);
  return subject?.enrollmentCount || 0;
};

/**
 * Get students for a subject
 */
export const getSubjectStudents = (subjectCode: string, section: string): string[] => {
  const subject = FACULTY_SUBJECTS.find((fs) => fs.subjectCode === subjectCode && fs.section === section);
  return subject?.students || [];
};

// Alias for backward compatibility
export const getStudentsForSubject = getSubjectStudents;

/**
 * Get faculty by department
 */
export const getFacultyByDepartment = (department: string): FacultySubjectAssignment[] => {
  return FACULTY_SUBJECTS.filter((fs) => fs.department === department);
};
