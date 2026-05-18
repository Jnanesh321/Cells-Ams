export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'ADMIN' | 'PARENT' | 'ADMISSION_CELL';

export interface User {
  id?: string;
  usn?: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  year?: number;
  semester?: number;
  section?: string;
  gpa?: number;
  academicStatus?: string;
  wardUsn?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export interface AttendanceSummary {
  subjectCode: string;
  subjectName: string;
  present: number;
  total: number;
  percentage: number;
}

export interface Mark {
  subjectCode: string;
  subjectName: string;
  cie1: number | null;
  cie2: number | null;
  cie3: number | null;
}

export interface Subject {
  code: string;
  name: string;
  credits: number;
}

export interface StudentAttendance {
  usn: string;
  name: string;
  section: string;
  percentage: number;
  present: number;
  total: number;
  isLowAttendance: boolean;
}

export interface DepartmentStats {
  name: string;
  avgAttendance: number;
  studentsCount: number;
  lowAttendanceCount: number;
}

export interface FacultySubject {
  code: string;
  name: string;
  credits: number;
  sections: string[];
  students: string[];
  isLab?: boolean;
  semester: number;
  lastMarked?: string; // ISO date string
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'OD';

export interface StudentAttendanceRecord {
  usn: string;
  name: string;
  section: string;
  status: AttendanceStatus;
  editReason?: string;
  editedBy?: string;
  editedAt?: string;
}

export interface AttendanceSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  sessionType: 'lecture' | 'lab';
  section: string;
  facultyId: string;
  students: StudentAttendanceRecord[];
  createdAt: string;
  status: 'draft' | 'submitted';
  submittedAt?: string;
}

export interface AttendanceEdit {
  usn: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
  editedBy: string;
  editedByName: string;
  timestamp: string;
}

export interface FacultyAttendanceState {
  currentSession: AttendanceSession | null;
  unsavedChanges: boolean;
  editingStudent: StudentAttendanceRecord | null;
  edits: AttendanceEdit[];
  submissionLoading: boolean;
  setCurrentSession: (session: AttendanceSession) => void;
  updateStudentStatus: (usn: string, status: AttendanceStatus) => void;
  setEditingStudent: (student: StudentAttendanceRecord | null) => void;
  addEdit: (edit: AttendanceEdit) => void;
  markAllPresent: () => void;
  resetSession: () => void;
  submitSession: () => Promise<void>;
}

// ==================== DEPARTMENT & FACULTY ====================

export type Department = 'CSE' | 'MCA' | 'MECH' | 'ECE' | 'ISE' | 'SCIENCE_HUMANITIES';

export interface VCETFaculty {
  id: string; // Unique ID: FAC_DEPT_NUM or HOD_DEPT or PRINCIPAL
  name: string;
  department: Department;
  email: string;
  phone?: string;
  designation: string; // Professor, Associate Professor, Assistant Professor, etc.
  isHOD: boolean;
  subjects?: Subject[]; // Taught subjects
  assignedSections?: string[]; // Assigned sections
  yearsOfExperience?: number;
  qualification?: string;
}

export interface VCETDepartment {
  code: Department;
  name: string;
  hod: VCETFaculty;
  faculty: VCETFaculty[];
  studentsCount: number;
  averageAttendance?: number;
}

// ==================== VTU CIE / ACADEMIC RULES ====================

export type CIEMarks = {
  ia1?: number | null;
  ia2?: number | null;
  ia3?: number | null;
  assignment?: number | null;
};

export type CIEBreakdown = {
  subjectCode: string;
  subjectName: string;
  ia1: number | null;
  ia2: number | null;
  ia3: number | null;
  assignment: number | null;
  cieTotal: number;
  isEligible: boolean;
};

export type DetentionStatus = 'safe' | 'warning' | 'critical' | 'detained';

export type StudentAcademicStatus = {
  usn: string;
  name: string;
  section: string;
  attendancePercent: number;
  cieTotal: number;
  status: DetentionStatus;
  reasons: string[];
};

export type SubjectType = 'CORE' | 'ELECTIVE' | 'LAB' | 'AUDIT';

export interface VTUSubject {
  code: string;
  name: string;
  credits: number;
  type: SubjectType;
  department: string;
  semester: number;
  scheme: '2022' | '2021';
}

export type BirthdayRecord = {
  usn: string;
  name: string;
  date: string; // MM-DD
  department?: string;
};

// ==================== ADMISSION / BATCH ====================

export type AdmissionBatch = {
  id: string;
  department: string;
  year: number;
  section: string;
  intakeSize: number;
  startRollNo: number;
  endRollNo: number;
  createdAt: string;
  studentCount: number;
  mappedCount: number;
};

export type StudentDraft = {
  id: string;
  batchId: string;
  rollNo: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  parentPhone: string;
  admissionType: 'CET' | 'COMEDK' | 'MQ';
  department: string;
  section: string;
  mappedUSN: string | null;
  createdAt: string;
};

export type RollSequence = {
  department: string;
  year: number;
  lastRollNo: number;
};

export type AdmissionStats = {
  totalBatches: number;
  totalStudents: number;
  mappedStudents: number;
  pendingMapping: number;
};

// ==================== PERMISSIONS ====================

export type PermissionAction =
  | 'view_attendance'
  | 'mark_attendance'
  | 'edit_attendance'
  | 'approve_attendance_edit'
  | 'view_marks'
  | 'edit_marks'
  | 'view_analytics'
  | 'view_all_departments'
  | 'view_own_department'
  | 'approve_escalations'
  | 'edit_ia_marks'
  | 'request_attendance_edit';

export interface RolePermissions {
  role: UserRole;
  permissions: PermissionAction[];
  description: string;
}

export interface PermissionContext {
  userId: string;
  role: UserRole;
  department?: Department;
  canView: (resource: string, targetDepartment?: Department) => boolean;
  canEdit: (resource: string, targetDepartment?: Department) => boolean;
  canApprove: (resource: string) => boolean;
}
