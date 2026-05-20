import { FacultySubject, AttendanceSession, StudentAttendanceRecord } from '../types';
import { getFacultyByDepartment, getAllFaculty } from './facultyData';

// ==================== REALISTIC SUBJECT ASSIGNMENTS ====================
// Map real VCET faculty to subjects they teach

export const mockFacultySubjects: Record<string, FacultySubject[]> = {
  // CSE Faculty assignments
  FAC_CSE_001: [
    {
      code: 'CS301',
      name: 'Data Structures',
      credits: 4,
      sections: ['A', 'B'],
      students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005', '4VP21CS006'],
      semester: 3,
      lastMarked: '2026-05-10',
    },
    {
      code: 'CS302',
      name: 'Algorithms',
      credits: 3,
      sections: ['A', 'B', 'C'],
      students: ['4VP21CS001', '4VP21CS002', '4VP21CS007', '4VP21CS008', '4VP21CS009', '4VP21CS010'],
      semester: 3,
      lastMarked: '2026-05-08',
    },
  ],
  FAC_CSE_002: [
    {
      code: 'CS401',
      name: 'Database Systems',
      credits: 4,
      sections: ['B', 'C'],
      students: ['4VP21CS005', '4VP21CS006', '4VP21CS007', '4VP21CS008', '4VP21CS009', '4VP21CS010'],
      semester: 4,
      lastMarked: '2026-05-09',
    },
    {
      code: 'CS402',
      name: 'Web Development',
      credits: 4,
      sections: ['A'],
      students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004'],
      semester: 4,
      lastMarked: '2026-05-07',
    },
  ],
  FAC_CSE_003: [
    {
      code: 'CS305',
      name: 'Object Oriented Programming',
      credits: 4,
      sections: ['A', 'B'],
      students: ['4VP21CS001', '4VP21CS002', '4VP21CS003', '4VP21CS004', '4VP21CS005', '4VP21CS006'],
      semester: 3,
      lastMarked: '2026-05-06',
    },
  ],

  // ECE Faculty assignments
  FAC_ECE_001: [
    {
      code: 'EC301',
      name: 'Digital Signal Processing',
      credits: 4,
      sections: ['A', 'B'],
      students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004', '4VP21EC005', '4VP21EC006'],
      semester: 3,
      lastMarked: '2026-05-10',
    },
    {
      code: 'EC302',
      name: 'Microcontrollers',
      credits: 3,
      sections: ['A'],
      students: ['4VP21EC001', '4VP21EC002', '4VP21EC003', '4VP21EC004'],
      semester: 3,
      isLab: true,
      lastMarked: '2026-05-09',
    },
  ],
  FAC_ECE_002: [
    {
      code: 'EC303',
      name: 'Analog Electronics',
      credits: 4,
      sections: ['B', 'C'],
      students: ['4VP21EC005', '4VP21EC006', '4VP21EC007', '4VP21EC008', '4VP21EC009', '4VP21EC010'],
      semester: 3,
      lastMarked: '2026-05-08',
    },
  ],

  // MCA Faculty assignments
  FAC_MCA_001: [
    {
      code: 'MCA501',
      name: 'Advanced Database Systems',
      credits: 4,
      sections: ['A'],
      students: ['4VP21MCA001', '4VP21MCA002', '4VP21MCA003', '4VP21MCA004', '4VP21MCA005', '4VP21MCA006'],
      semester: 5,
      lastMarked: '2026-05-10',
    },
  ],

  // ISE Faculty assignments
  FAC_ISE_001: [
    {
      code: 'IS301',
      name: 'Software Engineering',
      credits: 4,
      sections: ['A', 'B'],
      students: ['4VP21IS001', '4VP21IS002', '4VP21IS003', '4VP21IS004', '4VP21IS005', '4VP21IS006'],
      semester: 3,
      lastMarked: '2026-05-09',
    },
  ],
};

// ==================== STUDENT LISTS BY SECTION ====================
// Realistic student data mapped to sections

const studentsBySection: Record<string, Array<{ usn: string; name: string; section: string }>> = {
  // CSE Section A
  'CSE_A': [
    { usn: '4VP21CS001', name: 'Aarav Kumar', section: 'A' },
    { usn: '4VP21CS002', name: 'Priya Sharma', section: 'A' },
    { usn: '4VP21CS003', name: 'Rohan Patel', section: 'A' },
    { usn: '4VP21CS004', name: 'Anjali Verma', section: 'A' },
    { usn: '4VP21CS005', name: 'Kavya Singh', section: 'A' },
    { usn: '4VP21CS006', name: 'Arjun Nair', section: 'A' },
  ],
  // CSE Section B
  'CSE_B': [
    { usn: '4VP21CS007', name: 'Divya Gupta', section: 'B' },
    { usn: '4VP21CS008', name: 'Nikhil Reddy', section: 'B' },
    { usn: '4VP21CS009', name: 'Sneha Iyer', section: 'B' },
    { usn: '4VP21CS010', name: 'Vikram Rao', section: 'B' },
    { usn: '4VP21CS011', name: 'Isha Desai', section: 'B' },
    { usn: '4VP21CS012', name: 'Shiva Kumar', section: 'B' },
  ],
  // ECE Section A
  'ECE_A': [
    { usn: '4VP21EC001', name: 'Aditya Kulkarni', section: 'A' },
    { usn: '4VP21EC002', name: 'Neha Menon', section: 'A' },
    { usn: '4VP21EC003', name: 'Sanjay Pillai', section: 'A' },
    { usn: '4VP21EC004', name: 'Meera Bhat', section: 'A' },
    { usn: '4VP21EC005', name: 'Ramesh Rao', section: 'A' },
    { usn: '4VP21EC006', name: 'Sakshi Nair', section: 'A' },
  ],
  // MCA Section A
  'MCA_A': [
    { usn: '4VP21MCA001', name: 'Akshay Hegde', section: 'A' },
    { usn: '4VP21MCA002', name: 'Deepika Sharma', section: 'A' },
    { usn: '4VP21MCA003', name: 'Rajesh Kumar', section: 'A' },
    { usn: '4VP21MCA004', name: 'Priya Sinha', section: 'A' },
    { usn: '4VP21MCA005', name: 'Vikas Desai', section: 'A' },
    { usn: '4VP21MCA006', name: 'Ananya Pathak', section: 'A' },
  ],
  // ISE Section A
  'ISE_A': [
    { usn: '4VP21IS001', name: 'Arjun Singh', section: 'A' },
    { usn: '4VP21IS002', name: 'Sanya Gupta', section: 'A' },
    { usn: '4VP21IS003', name: 'Harsh Reddy', section: 'A' },
    { usn: '4VP21IS004', name: 'Priti Verma', section: 'A' },
    { usn: '4VP21IS005', name: 'Nitin Patel', section: 'A' },
    { usn: '4VP21IS006', name: 'Shreya Iyer', section: 'A' },
  ],
};

export const getStudentsBySection = (
  section: string
): StudentAttendanceRecord[] => {
  const students: Array<{ usn: string; name: string; section: string }> = studentsBySection[section] || [];
  return students.map((s) => ({
    ...s,
    status: 'PRESENT' as const,
  }));
};

// ==================== SAMPLE ATTENDANCE SESSIONS ====================
export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: 'SESSION_001',
    subjectCode: 'CS301',
    subjectName: 'Data Structures',
    date: '2026-05-10',
    time: '09:00',
    sessionType: 'lecture',
    section: 'A',
    facultyId: 'FAC_CSE_001',
    students: [
      { usn: '4VP21CS001', name: 'Aarav Kumar', section: 'A', status: 'PRESENT' },
      { usn: '4VP21CS002', name: 'Priya Sharma', section: 'A', status: 'PRESENT' },
      { usn: '4VP21CS003', name: 'Rohan Patel', section: 'A', status: 'ABSENT' },
      { usn: '4VP21CS004', name: 'Anjali Verma', section: 'A', status: 'PRESENT' },
      { usn: '4VP21CS005', name: 'Kavya Singh', section: 'A', status: 'OD' },
      { usn: '4VP21CS006', name: 'Arjun Nair', section: 'A', status: 'PRESENT' },
    ],
    createdAt: '2026-05-10T08:00:00Z',
    status: 'submitted',
    submittedAt: '2026-05-10T10:30:00Z',
  },
  {
    id: 'SESSION_002',
    subjectCode: 'EC301',
    subjectName: 'Digital Signal Processing',
    date: '2026-05-10',
    time: '10:00',
    sessionType: 'lecture',
    section: 'A',
    facultyId: 'FAC_ECE_001',
    students: [
      { usn: '4VP21EC001', name: 'Aditya Kulkarni', section: 'A', status: 'PRESENT' },
      { usn: '4VP21EC002', name: 'Neha Menon', section: 'A', status: 'PRESENT' },
      { usn: '4VP21EC003', name: 'Sanjay Pillai', section: 'A', status: 'PRESENT' },
      { usn: '4VP21EC004', name: 'Meera Bhat', section: 'A', status: 'ABSENT' },
      { usn: '4VP21EC005', name: 'Ramesh Rao', section: 'A', status: 'PRESENT' },
      { usn: '4VP21EC006', name: 'Sakshi Nair', section: 'A', status: 'PRESENT' },
    ],
    createdAt: '2026-05-10T09:00:00Z',
    status: 'submitted',
    submittedAt: '2026-05-10T11:15:00Z',
  },
];

// ==================== LEGACY EXPORTS (for backwards compatibility) ====================
export const mockFacultyStudents = [
  // CSE Students
  { usn: '4VP21CS001', name: 'Aarav Kumar', department: 'CSE', section: 'A' },
  { usn: '4VP21CS002', name: 'Priya Sharma', department: 'CSE', section: 'A' },
  { usn: '4VP21CS003', name: 'Rohan Patel', department: 'CSE', section: 'A' },
  { usn: '4VP21CS004', name: 'Anjali Verma', department: 'CSE', section: 'A' },
  { usn: '4VP21CS005', name: 'Kavya Singh', department: 'CSE', section: 'A' },
  { usn: '4VP21CS006', name: 'Arjun Nair', department: 'CSE', section: 'A' },
  { usn: '4VP21CS007', name: 'Divya Gupta', department: 'CSE', section: 'B' },
  { usn: '4VP21CS008', name: 'Nikhil Reddy', department: 'CSE', section: 'B' },
  { usn: '4VP21CS009', name: 'Sneha Iyer', department: 'CSE', section: 'B' },
  { usn: '4VP21CS010', name: 'Vikram Rao', department: 'CSE', section: 'B' },
  // ECE Students
  { usn: '4VP21EC001', name: 'Aditya Kulkarni', department: 'ECE', section: 'A' },
  { usn: '4VP21EC002', name: 'Neha Menon', department: 'ECE', section: 'A' },
  { usn: '4VP21EC003', name: 'Sanjay Pillai', department: 'ECE', section: 'A' },
  { usn: '4VP21EC004', name: 'Meera Bhat', department: 'ECE', section: 'A' },
  { usn: '4VP21EC005', name: 'Ramesh Rao', department: 'ECE', section: 'A' },
  { usn: '4VP21EC006', name: 'Sakshi Nair', department: 'ECE', section: 'A' },
];

// Helper to generate faculty attendance data
export const generateFacultySubjectsByDepartment = (department: string): FacultySubject[] => {
  const subjects = Object.values(mockFacultySubjects);
  return subjects.flat().filter((s) => s.name);
};

// ==================== FACULTY MEMBER LIST (for HOD subject assignment picker) ====================
export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
}

export const mockFacultyMembers: FacultyMember[] = [
  { id: 'FAC_CSE01', name: 'Prof. Suresh Kumar',   department: 'CSE',  designation: 'Assistant Professor', email: 'suresh@vcet.edu.in',   phone: '9876543201' },
  { id: 'FAC_CSE02', name: 'Prof. Anita Rao',       department: 'CSE',  designation: 'Assistant Professor', email: 'anita@vcet.edu.in',    phone: '9876543202' },
  { id: 'FAC_CSE03', name: 'Dr. Ramesh Bhat',       department: 'CSE',  designation: 'Associate Professor', email: 'ramesh@vcet.edu.in',   phone: '9876543203' },
  { id: 'FAC_ECE01', name: 'Prof. Deepa Nair',      department: 'ECE',  designation: 'Assistant Professor', email: 'deepa@vcet.edu.in',    phone: '9876543204' },
  { id: 'FAC_ECE02', name: 'Prof. Kiran Patil',     department: 'ECE',  designation: 'Assistant Professor', email: 'kiran@vcet.edu.in',    phone: '9876543205' },
  { id: 'FAC_MECH01', name: 'Dr. Vijay Gowda',      department: 'MECH', designation: 'Associate Professor', email: 'vijay@vcet.edu.in',    phone: '9876543206' },
  { id: 'FAC_MECH02', name: 'Prof. Meera Hegde',    department: 'MECH', designation: 'Assistant Professor', email: 'meera@vcet.edu.in',    phone: '9876543207' },
];

export function getFacultyByDept(department: string): FacultyMember[] {
  return mockFacultyMembers.filter((f) => f.department === department);
}
