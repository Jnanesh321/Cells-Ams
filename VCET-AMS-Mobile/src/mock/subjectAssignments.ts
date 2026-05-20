import type { SubjectAssignment } from '../types';

export const mockSubjectAssignments: SubjectAssignment[] = [
  // ==================== CSE - SEM 5 ====================
  { id: 'sa_001', subjectCode: 'CS501', subjectName: 'Data Structures', department: 'CSE', semesterNo: 5, section: 'A', facultyId: 'FAC_CSE_001', facultyName: 'Mr. Prashantha', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_002', subjectCode: 'CS502', subjectName: 'Computer Networks', department: 'CSE', semesterNo: 5, section: 'B', facultyId: 'FAC_CSE_001', facultyName: 'Mr. Prashantha', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_003', subjectCode: 'CS503', subjectName: 'Theory of Computation', department: 'CSE', semesterNo: 5, section: 'A', facultyId: 'FAC_CSE_002', facultyName: 'Dr. Ajith Hebbar Hosmata', credits: 3, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_004', subjectCode: 'CS504', subjectName: 'Software Engineering', department: 'CSE', semesterNo: 5, section: 'A', facultyId: null, facultyName: null, credits: 3, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_005', subjectCode: 'CS505', subjectName: 'DBMS Lab', department: 'CSE', semesterNo: 5, section: 'A', facultyId: 'FAC_CSE_002', facultyName: 'Dr. Ajith Hebbar Hosmata', credits: 2, subjectType: 'LAB', academicYear: '2025-26', isActive: true },
  { id: 'sa_006', subjectCode: 'CS506', subjectName: 'Open Elective: AI Basics', department: 'CSE', semesterNo: 5, section: 'A', facultyId: null, facultyName: null, credits: 3, subjectType: 'ELECTIVE', academicYear: '2025-26', isActive: true },

  // ==================== CSE - SEM 3 ====================
  { id: 'sa_007', subjectCode: 'CS301', subjectName: 'Data Structures', department: 'CSE', semesterNo: 3, section: 'A', facultyId: 'FAC_CSE_003', facultyName: 'Mr. Naveena C', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_008', subjectCode: 'CS302', subjectName: 'Algorithms', department: 'CSE', semesterNo: 3, section: 'B', facultyId: null, facultyName: null, credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_009', subjectCode: 'CS303', subjectName: 'Object Oriented Programming', department: 'CSE', semesterNo: 3, section: 'A', facultyId: 'FAC_CSE_004', facultyName: 'Mr. Ajay Shastry C G', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },

  // ==================== CSE - SEM 7 ====================
  { id: 'sa_010', subjectCode: 'CS701', subjectName: 'Machine Learning', department: 'CSE', semesterNo: 7, section: 'A', facultyId: null, facultyName: null, credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_011', subjectCode: 'CS702', subjectName: 'Cloud Computing', department: 'CSE', semesterNo: 7, section: 'A', facultyId: 'FAC_CSE_005', facultyName: 'Mrs. Akshaya D. Shetty', credits: 3, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },

  // ==================== ECE - SEM 5 ====================
  { id: 'sa_012', subjectCode: 'EC501', subjectName: 'Digital Signal Processing', department: 'ECE', semesterNo: 5, section: 'A', facultyId: 'FAC_ECE_001', facultyName: 'Mr. Naveenakrishna P V', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_013', subjectCode: 'EC502', subjectName: 'Microcontrollers', department: 'ECE', semesterNo: 5, section: 'A', facultyId: null, facultyName: null, credits: 3, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_014', subjectCode: 'EC503', subjectName: 'VLSI Design', department: 'ECE', semesterNo: 5, section: 'B', facultyId: 'FAC_ECE_002', facultyName: 'Ms. Surekha T', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },

  // ==================== MECH - SEM 5 ====================
  { id: 'sa_015', subjectCode: 'ME501', subjectName: 'Thermodynamics', department: 'MECH', semesterNo: 5, section: 'A', facultyId: 'FAC_MECH_001', facultyName: 'Mrs Immaculate Mary', credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_016', subjectCode: 'ME502', subjectName: 'Fluid Mechanics', department: 'MECH', semesterNo: 5, section: 'A', facultyId: null, facultyName: null, credits: 4, subjectType: 'THEORY', academicYear: '2025-26', isActive: true },
  { id: 'sa_017', subjectCode: 'ME503', subjectName: 'CAD/CAM', department: 'MECH', semesterNo: 5, section: 'A', facultyId: 'FAC_MECH_002', facultyName: 'Dr. Rajeshwari M', credits: 3, subjectType: 'LAB', academicYear: '2025-26', isActive: true },
];

export function getAssignmentsByDept(dept: string): SubjectAssignment[] {
  return mockSubjectAssignments.filter((a) => a.department === dept && a.isActive);
}

export function getAssignmentsByFaculty(facultyId: string): SubjectAssignment[] {
  return mockSubjectAssignments.filter((a) => a.facultyId === facultyId && a.isActive);
}

export function getUnassignedByDept(dept: string): SubjectAssignment[] {
  return mockSubjectAssignments.filter((a) => a.department === dept && a.facultyId === null && a.isActive);
}

export function getFacultyLoadByDept(dept: string): { facultyId: string; facultyName: string; assignedCount: number }[] {
  const facultyMap = new Map<string, { facultyId: string; facultyName: string; assignedCount: number }>();
  mockSubjectAssignments
    .filter((a) => a.department === dept && a.facultyId !== null && a.isActive)
    .forEach((a) => {
      const fid = a.facultyId!;
      const prev = facultyMap.get(fid) ?? { facultyId: fid, facultyName: a.facultyName ?? 'Unknown', assignedCount: 0 };
      facultyMap.set(fid, { ...prev, assignedCount: prev.assignedCount + 1 });
    });
  return Array.from(facultyMap.values());
}
