import { mockStudents, mockAttendance, mockMarks, mockLowAttendanceAlerts } from '.';
import { getFacultyInfo, getDepartmentSubjects, getFacultySubjects, getSubjectStudents } from './facultySubjects';
import { getStudentAttendance, getDetainedStudents, getStudentsByDepartment } from './studentAttendance';

export type BackendResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function wrap<T>(data: T): BackendResponse<T> {
  return { success: true, data, error: null };
}

export async function login(usn: string, password: string) {
  await delay(300);
  const student = mockStudents.find((s) => s.usn === usn && s.password === password);
  if (student) {
    return wrap({
      accessToken: `mock_token_${usn}_${Date.now()}`,
      refreshToken: `mock_refresh_${usn}_${Date.now()}`,
      role: 'STUDENT' as const,
      user: { ...student, role: 'STUDENT' as const, departmentId: 1, section: student.section },
    });
  }
  const { mockUsers } = await import('./users');
  const staff = Object.values(mockUsers).find((u: any) => u.id === usn && u.password === password);
  if (staff) {
    return wrap({
      accessToken: `mock_token_${usn}_${Date.now()}`,
      refreshToken: `mock_refresh_${usn}_${Date.now()}`,
      role: staff.role,
      user: {
        id: staff.id,
        usn: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email ?? '',
        department: (staff as any).department,
        departmentId: 1,
        designation: (staff as any).designation ?? 'Staff',
        section: null,
      },
    });
  }
  throw Object.assign(new Error('Invalid credentials'), { status: 401 });
}

export async function getStudentAttendanceSummary(usn: string) {
  await delay(150);
  const records = (mockAttendance as any)[usn];
  if (!records) return wrap([]);
  return wrap(
    records.map((r: any) => ({
      subjectCode: r.code ?? r.subject?.toUpperCase().replace(/\s/g, ''),
      subjectName: r.subject,
      present: r.present,
      total: r.total,
      percentage: r.percentage,
    }))
  );
}

export async function getStudentMarks(usn: string) {
  await delay(150);
  const records = (mockMarks as any)[usn];
  if (!records) return wrap([]);
  return wrap(
    records.map((r: any) => ({
      subjectCode: r.code ?? r.subject?.toUpperCase().replace(/\s/g, ''),
      subjectName: r.subject,
      cie1: r.cia1 ?? null,
      cie2: r.cia2 ?? null,
      cie3: r.cia3 ?? null,
    }))
  );
}

export async function getNotices(role?: string) {
  await delay(100);
  const base = [
    { id: 1, title: '📝 IA2 Examination Schedule', content: 'Internal Assessment 2 will be conducted from December 2-7, 2024. All students must carry their college ID cards. Attendance below 75% candidates will not be permitted.', targetRole: 'STUDENT', createdAt: '2024-11-25T10:00:00Z' },
    { id: 2, title: '⚠️ Attendance Shortage Notice', content: 'Students with attendance below 75% must submit genuine medical certificates to their respective HODs on or before December 10, 2024. Defaulters will be detained from semester examinations.', targetRole: 'STUDENT', createdAt: '2024-11-22T09:00:00Z' },
    { id: 3, title: '📅 Parent-Teacher Meeting', content: 'PTM for semester 5 students will be held on December 15, 2024 at 10:00 AM in the main auditorium. Parents of students with attendance below 70% are requested to meet the faculty personally.', targetRole: 'PARENT', createdAt: '2024-11-20T14:00:00Z' },
    { id: 4, title: '📋 NBA Accreditation Preparation', content: 'All faculty members must submit their course files, lesson plans, and CO-PO attainment records by December 1, 2024. Department NBA coordinators will review the documents.', targetRole: 'FACULTY', createdAt: '2024-11-18T11:00:00Z' },
    { id: 5, title: '🏛️ College Foundation Day', content: 'VCET will celebrate its Foundation Day on November 28, 2024. Chief Guest: Dr. K. N. Subramanya, Former VC of VTU. All students and staff must attend.', targetRole: null, createdAt: '2024-11-15T08:00:00Z' },
    { id: 6, title: '📢 Semester End Exam Schedule Released', content: 'The end semester examination schedule for all departments has been published on the student portal. Practical exams: Dec 10-20, 2024. Theory exams: Dec 22, 2024 - Jan 10, 2025.', targetRole: null, createdAt: '2024-11-28T16:00:00Z' },
    { id: 7, title: '👨‍💻 Hackathon 2024 Registrations', content: 'VCET is hosting a 24-hour Hackathon on December 5-6, 2024. Interested students can register with their team leads. Prizes worth Rs. 50,000.', targetRole: 'STUDENT', createdAt: '2024-11-26T09:00:00Z' },
    { id: 8, title: '📊 IA Marks Publication', content: 'IA1 marks have been published on the portal. Students can check their marks and raise any concerns with the respective faculty within 7 days.', targetRole: 'STUDENT', createdAt: '2024-11-27T14:00:00Z' },
  ];
  return wrap(
    role
      ? base.filter((n) => n.targetRole === null || n.targetRole === role)
      : base
  );
}

export async function getCalendarEvents() {
  await delay(100);
  return wrap([
    { id: 1, title: 'IA1 Results Declaration', description: 'IA1 results will be declared on the student portal', startDate: '2024-11-20', endDate: '2024-11-20', type: 'exam' },
    { id: 2, title: 'CIA Test', description: 'Course Outcome Assessment test for all semesters', startDate: '2024-11-25', endDate: '2024-11-27', type: 'exam' },
    { id: 3, title: 'Semester End Practical Exams', description: 'Practical examinations for all courses', startDate: '2024-12-10', endDate: '2024-12-20', type: 'exam' },
    { id: 4, title: 'Semester Break', description: 'Winter semester break for all students', startDate: '2024-12-21', endDate: '2025-01-05', type: 'holiday' },
  ]);
}

export async function getCollegeAnalytics() {
  await delay(200);
  const deptMap = new Map<string, { studentCount: number; totalAttendance: number; totalIAMarks: number }>();
  const departments = ['CSE', 'ECE', 'AIML', 'MECH', 'CD', 'CV'];
  const deptData = mockStudents.reduce((acc, s) => {
    const d = s.department ?? 'CSE';
    if (!acc.has(d)) acc.set(d, { studentCount: 0, totalAttendance: 0, totalIAMarks: 0 });
    const entry = acc.get(d)!;
    entry.studentCount++;
    const att = (mockAttendance as any)[s.usn];
    if (att) {
      const avg = att.reduce((sum: number, r: any) => sum + (r.percentage ?? 0), 0) / att.length;
      entry.totalAttendance += avg;
    }
    return acc;
  }, deptMap);

  return wrap(
    departments.map((code) => {
      const d = deptData.get(code) ?? { studentCount: 5, totalAttendance: 780, totalIAMarks: 0 };
      return {
        deptCode: code,
        deptName: code === 'CSE' ? 'Computer Science & Engineering'
          : code === 'ECE' ? 'Electronics & Communication'
          : code === 'AIML' ? 'AI & Machine Learning'
          : code === 'MECH' ? 'Mechanical Engineering'
          : code === 'CD' ? 'Computer Networks & Data Science'
          : 'Civil Engineering',
        studentCount: d.studentCount,
        avgAttendance: d.studentCount > 0 ? parseFloat((d.totalAttendance / d.studentCount).toFixed(1)) : 75,
        avgIA: 22.5,
      };
    })
  );
}

export async function getFacultySubjectsList(facultyId: string) {
  await delay(150);
  return wrap(getFacultySubjects(facultyId));
}

export async function getAttendanceSessionData(subjectId: number, section: string, iaNumber?: number) {
  await delay(150);
  const usns = getSubjectStudents(`SUBJ${subjectId}`, section);
  const students = (usns?.length ? usns : mockStudents.filter((s) => s.section === section).slice(0, 10)).map((u: any) => ({
    studentProfileId: parseInt(String(u.id ?? u.usn?.replace(/\D/g, '')?.slice(0, 5) ?? '0'), 10),
    usn: u.usn ?? u,
    name: u.name ?? `Student ${u}`,
    todayStatus: null,
    existingMark: null,
  }));
  return wrap(students);
}

export async function saveIAMarks(subjectId: number, iaNumber: number, entries: any[], maxMarks = 30) {
  await delay(300);
  return wrap({ updated: entries.length });
}

export async function markAttendance(subjectId: number, section: string, date: string, records: any[], userId: number) {
  await delay(300);
  return wrap({ count: records.length });
}

export async function getDetainedStudentsList() {
  await delay(150);
  return wrap(getDetainedStudents());
}

export async function getDepartmentStudentList(dept: string) {
  await delay(150);
  return wrap(getStudentsByDepartment(dept));
}
