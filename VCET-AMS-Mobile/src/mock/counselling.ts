import type { CounsellorAssignment, CounsellingSession } from '../types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export const MOCK_COUNSELLOR_ASSIGNMENTS: CounsellorAssignment[] = [
  {
    id: 1,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 1,
    studentName: 'Aditya Kumar',
    studentUsn: '4VP21CS001',
    studentSection: 'A',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: daysAgo(20),
    status: 'COMPLETED',
    attendancePercent: 88,
  },
  {
    id: 2,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 2,
    studentName: 'Priya Sharma',
    studentUsn: '4VP21CS002',
    studentSection: 'A',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: daysAgo(35),
    status: 'OVERDUE',
    attendancePercent: 95,
  },
  {
    id: 3,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 3,
    studentName: 'Rajesh Patel',
    studentUsn: '4VP21CS003',
    studentSection: 'A',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: daysAgo(10),
    status: 'COMPLETED',
    attendancePercent: 72,
  },
  {
    id: 4,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 4,
    studentName: 'Neha Gupta',
    studentUsn: '4VP21CS004',
    studentSection: 'A',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: undefined,
    status: 'DUE',
    attendancePercent: 91,
  },
  {
    id: 5,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 5,
    studentName: 'Vikram Singh',
    studentUsn: '4VP21CS005',
    studentSection: 'B',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: daysAgo(50),
    status: 'OVERDUE',
    attendancePercent: 62,
  },
  {
    id: 6,
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    facultyUsn: 'FAC_CSE_001',
    studentUserId: 6,
    studentName: 'Divya Menon',
    studentUsn: '4VP21CS006',
    studentSection: 'B',
    department: 'CSE',
    academicYear: '2025-2026',
    isActive: true,
    lastSessionDate: daysAgo(15),
    status: 'COMPLETED',
    attendancePercent: 82,
  },
];

export const MOCK_COUNSELLING_SESSIONS: CounsellingSession[] = [
  {
    id: 1,
    studentUserId: 1,
    studentName: 'Aditya Kumar',
    studentUsn: '4VP21CS001',
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    observation: 'Student is performing well in academics. Attendance is regular. Shows good understanding of core subjects.',
    studentStatus: 'No stress reported. Student is confident and managing coursework well.',
    guidance: 'Continue with current study plan. Focus on DSC and Algorithm practice. Recommended to participate in coding competitions.',
    followUp: 'Monitor DSC progress. Consider suggesting internship opportunities.',
    nextSessionDate: daysAgo(5),
    sessionDate: daysAgo(20),
    status: 'COMPLETED',
  },
  {
    id: 2,
    studentUserId: 2,
    studentName: 'Priya Sharma',
    studentUsn: '4VP21CS002',
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    observation: 'Attendance concern. Student has missed several classes in the past month. Needs improvement in consistency.',
    studentStatus: 'Health issues reported. Student mentioned recurring headaches affecting attendance.',
    guidance: 'Suggested regular health checkup. Provided notes for missed classes. Arranged peer mentoring.',
    followUp: 'Check health status in 2 weeks. Monitor attendance improvement.',
    nextSessionDate: daysAgo(10),
    sessionDate: daysAgo(35),
    status: 'COMPLETED',
  },
  {
    id: 3,
    studentUserId: 3,
    studentName: 'Rajesh Patel',
    studentUsn: '4VP21CS003',
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    observation: 'Student seems uncomfortable in group activities. Low confidence observed during presentations.',
    studentStatus: 'Academic pressure reported. Student feels overwhelmed by multiple assignments.',
    guidance: 'Suggested time management techniques. Recommended joining study groups. Assigned a peer mentor.',
    followUp: 'Review confidence improvement in next session. Check assignment submission regularity.',
    sessionDate: daysAgo(10),
    status: 'COMPLETED',
  },
  {
    id: 4,
    studentUserId: 5,
    studentName: 'Vikram Singh',
    studentUsn: '4VP21CS005',
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    observation: 'Significant attendance concern. Attendance below 65%. Student appears disengaged.',
    studentStatus: 'Family issues reported. Student mentioned personal challenges affecting concentration.',
    guidance: 'Counselling referral suggested. Academic support plan created. Meeting scheduled with parents.',
    followUp: 'Escalation to HOD if no improvement in 2 weeks. Parent meeting required.',
    sessionDate: daysAgo(50),
    status: 'COMPLETED',
  },
  {
    id: 5,
    studentUserId: 6,
    studentName: 'Divya Menon',
    studentUsn: '4VP21CS006',
    facultyUserId: 2,
    facultyName: 'Mrs. Akshaya D. Shetty',
    observation: 'Student is doing well. Placement preparation in progress. Good academic standing.',
    studentStatus: 'Placement concern raised. Student is anxious about campus placements and company preparations.',
    guidance: 'Suggested focused preparation on core companies. Provided placement preparation resources. Mock interview scheduling.',
    followUp: 'Track placement preparation progress. Provide mock interview feedback.',
    sessionDate: daysAgo(15),
    status: 'COMPLETED',
  },
];

export function getFacultyCounsellingAssignments(facultyUsn: string): CounsellorAssignment[] {
  return MOCK_COUNSELLOR_ASSIGNMENTS.filter(a => a.facultyUsn === facultyUsn && a.isActive);
}

export function getStudentCounsellingSessions(studentUsn: string): CounsellingSession[] {
  return MOCK_COUNSELLING_SESSIONS.filter(s => s.studentUsn === studentUsn)
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
}

export function getCounsellingDueAssignments(facultyUsn: string): CounsellorAssignment[] {
  return getFacultyCounsellingAssignments(facultyUsn).filter(a => a.status === 'DUE');
}

export function getCounsellingOverdueAssignments(facultyUsn: string): CounsellorAssignment[] {
  return getFacultyCounsellingAssignments(facultyUsn).filter(a => a.status === 'OVERDUE');
}

export function getCounsellingCompletedAssignments(facultyUsn: string): CounsellorAssignment[] {
  return getFacultyCounsellingAssignments(facultyUsn).filter(a => a.status === 'COMPLETED');
}

export function createCounsellingSession(data: CounsellingSession): CounsellingSession {
  const session: CounsellingSession = {
    ...data,
    id: MOCK_COUNSELLING_SESSIONS.length + 1,
    sessionDate: new Date().toISOString().split('T')[0],
    status: 'COMPLETED',
  };
  MOCK_COUNSELLING_SESSIONS.unshift(session);
  const assignment = MOCK_COUNSELLOR_ASSIGNMENTS.find(
    a => a.studentUserId === data.studentUserId && a.facultyUserId === data.facultyUserId
  );
  if (assignment) {
    assignment.lastSessionDate = session.sessionDate;
    assignment.status = 'COMPLETED';
  }
  return session;
}

export function getDepartmentCounsellingSummary(department: string): {
  totalStudents: number;
  assignedStudents: number;
  dueCount: number;
  completedCount: number;
  overdueCount: number;
  facultyCount: number;
} {
  const deptAssignments = MOCK_COUNSELLOR_ASSIGNMENTS.filter(a => a.department === department);
  return {
    totalStudents: deptAssignments.length,
    assignedStudents: deptAssignments.filter(a => a.isActive).length,
    dueCount: deptAssignments.filter(a => a.status === 'DUE').length,
    completedCount: deptAssignments.filter(a => a.status === 'COMPLETED').length,
    overdueCount: deptAssignments.filter(a => a.status === 'OVERDUE').length,
    facultyCount: [...new Set(deptAssignments.map(a => a.facultyUsn))].length,
  };
}

export function getAllFacultyAssignments(department: string): CounsellorAssignment[] {
  return MOCK_COUNSELLOR_ASSIGNMENTS.filter(a => a.department === department && a.isActive);
}
