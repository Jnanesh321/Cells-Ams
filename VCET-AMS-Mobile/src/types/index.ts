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

// ==================== SUBJECT & SUBJECT ALLOCATION ====================

export interface Subject {
  code: string;
  name: string;
  department: string;
  scheme: string;
}

export type Section = 'A' | 'B' | 'C';

export interface SubjectAllocation {
  id: string;
  subjectCode: string;
  facultyId: string;
  semester: number;
  section: Section;
  academicYear: string;
  studentUsns: string[];
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
  lastMarked?: string;
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
  date: string;
  time: string;
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

export type Department = 'CSE' | 'MCA' | 'MECH' | 'ECE' | 'ISE' | 'SCIENCE_HUMANITIES';

export interface VCETFaculty {
  id: string;
  name: string;
  department: Department;
  email: string;
  phone?: string;
  designation: string;
  isHOD: boolean;
  subjects?: Subject[];
  assignedSections?: string[];
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
  date: string;
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

export type AcademicYear = string;

// ==================== FILTER / QUERY ====================

export type FilterMatrix = {
  semester?: number;
  department?: string;
  section?: Section;
  usnPattern?: string;
  academicYear?: AcademicYear;
};

export function matchUSNPattern(usn: string, pattern: string): boolean {
  return new RegExp(pattern).test(usn);
}

export function extractDepartmentFromUSN(usn: string): string | null {
  const m = usn.match(/^\d{1}[A-Z]{2}\d{2}([A-Z]{2})\d{3}$/);
  return m ? m[1] : null;
}

export function extractAdmissionYearFromUSN(usn: string): number | null {
  const m = usn.match(/^\d{1}[A-Z]{2}(\d{2})[A-Z]{2}\d{3}$/);
  return m ? parseInt(m[1]) : null;
}

export const USN_DEPARTMENT_MAP: Record<string, string> = {
  CS: 'CSE',
  EC: 'ECE',
  AI: 'AIML',
  CD: 'CD',
  CV: 'CV',
  ME: 'MECH',
  IS: 'ISE',
  MC: 'MCA',
};

// ==================== ACADEMIC DAY CALCULATOR ====================

export type AcademicDayInfo = {
  dayNumber: number;
  totalDays: number;
  isHoliday: boolean;
  eventName: string | null;
  weekNumber: number;
  progress: number;
  termLabel: string;
  termStart: string;
  termEnd: string;
};

// ==================== STREAM CYCLE (Physics / Chemistry) ====================

export type StreamType = 'PHYSICS' | 'CHEMISTRY';

export const STREAM_FIRST_SEMESTER: Record<string, StreamType> = {
  CSE: 'PHYSICS',
  ECE: 'PHYSICS',
  AIML: 'PHYSICS',
  CD: 'PHYSICS',
  CV: 'CHEMISTRY',
  MECH: 'CHEMISTRY',
};

export function getStreamForBranchSemester(branch: string, semester: number): StreamType {
  const first = STREAM_FIRST_SEMESTER[branch] ?? 'PHYSICS';
  if (semester % 2 === 1) return first;
  return first === 'PHYSICS' ? 'CHEMISTRY' : 'PHYSICS';
}

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

// ==================== MARKS STORE ====================

export interface StudentCIERecord {
  usn: string;
  name: string;
  section: string;
  subjectCode: string;
  subjectName: string;
  ia1: number | null;
  ia2: number | null;
  ia3: number | null;
  assignment: number | null;
  locked: boolean;
}

export interface MarksStoreState {
  marks: Record<string, StudentCIERecord[]>;
  setMarksForSubject: (subjectCode: string, records: StudentCIERecord[]) => void;
  updateMark: (usn: string, subjectCode: string, field: 'ia1' | 'ia2' | 'ia3' | 'assignment', value: number | null) => void;
  lockSubject: (subjectCode: string) => void;
  loadMockData: () => void;
}

// ==================== NOTES / PDF SHARING ====================

export interface Note {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  description?: string;
  fileName: string;
  fileUri: string;
  fileType: 'pdf' | 'doc' | 'image' | 'other';
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  semester: number;
  department: string;
  section?: string;
}

export interface NotesStoreState {
  notes: Note[];
  loadMockData: () => void;
  addNote: (note: Omit<Note, 'id' | 'uploadedAt'>) => void;
  deleteNote: (id: string) => void;
  getNotesBySubject: (subjectCode: string) => Note[];
  getNotesForStudent: (department: string, semester: number) => Note[];
  getNotesByFaculty: (uploadedBy: string) => Note[];
}

// ==================== SUBJECT ASSIGNMENT (HOD feature) ====================

export interface SubjectAssignment {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semesterNo: number;
  section: string;
  facultyId: string | null;
  facultyName: string | null;
  credits: number;
  subjectType: 'THEORY' | 'LAB' | 'ELECTIVE';
  academicYear: string;
  isActive: boolean;
}

// ==================== STUDENT ADMISSION (expanded) ====================

export interface StudentAdmission {
  id: string;
  usn: string;
  admissionNo: string;
  admissionDate: string;
  admissionType: 'REGULAR' | 'LATERAL' | 'MANAGEMENT' | 'NRI';
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
  aadhaarNo: string;
  mobileNo: string;
  alternateMobile: string;
  email: string;
  birthPlace: string;
  hometown: string;
  district: string;
  taluk: string;
  pincode: string;
  state: string;
  nationality: string;
  motherTongue: string;
  religion: string;
  caste: string;
  subCaste: string;
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'OTHER';
  isSC: boolean;
  isST: boolean;
  isOBC: boolean;
  isEWS: boolean;
  isGadinuduKannadiga: boolean;
  isRural: boolean;
  isPHCandidate: boolean;
  phType: string;
  annualFamilyIncome: string;
  sslcBoard: string;
  sslcSchool: string;
  sslcPassYear: number;
  sslcMaxMarks: number;
  sslcObtainedMarks: number;
  sslcPercentage: number;
  sslcLanguage: string;
  pucBoard: string;
  pucCollege: string;
  pucPassYear: number;
  pucMaxMarks: number;
  pucObtainedMarks: number;
  pucPercentage: number;
  pucPCMMarks: number;
  pucPCMPercentage: number;
  pucLanguage: string;
  cetRank: number | null;
  cetScore: number | null;
  jeeRank: number | null;
  comedk: boolean;
  comdekRank: number | null;
  qualifyingExam: 'SSLC' | 'PUC' | 'DIPLOMA';
  diplomaBoard: string;
  diplomaCollege: string;
  diplomaPassYear: number | null;
  diplomaBranch: string;
  diplomaPercentage: number | null;
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  fatherEmail: string;
  fatherQualification: string;
  motherName: string;
  motherOccupation: string;
  motherMobile: string;
  motherEmail: string;
  motherQualification: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  guardianAddress: string;
  department: string;
  branch: string;
  semesterNo: number;
  section: string;
  currentYear: number;
  academicYear: string;
  studentPassword: string;
  parentPassword: string;
  hasSslcMarksheet: boolean;
  hasPucMarksheet: boolean;
  hasCasteCertificate: boolean;
  hasIncomeCertificate: boolean;
  hasTransferCertificate: boolean;
  hasAadhaarCard: boolean;
  hasMigrationCertificate: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ==================== TIMETABLE ====================

export type PeriodSlot = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
};

export type TimetableEntry = {
  id: number;
  dayNumber: number;
  periodId: number;
  period: PeriodSlot;
  subjectId?: number;
  subject?: { code: string; name: string; semester: number; credits: number } | null;
  section: string;
  semester: string;
  academicYear: string;
  isActive: boolean;
};

export type WeekTimetable = Record<number, TimetableEntry[]>;

// ==================== COUNSELLING SYSTEM ====================

export type CounsellingStatus = 'DUE' | 'COMPLETED' | 'OVERDUE';

export interface CounsellorAssignment {
  id: number;
  facultyUserId: number;
  facultyName: string;
  facultyUsn: string;
  studentUserId: number;
  studentName: string;
  studentUsn: string;
  studentSection?: string;
  department: string;
  academicYear: string;
  isActive: boolean;
  lastSessionDate?: string;
  status: CounsellingStatus;
  attendancePercent?: number;
}

export interface CounsellingSession {
  id: number;
  studentUserId: number;
  studentName: string;
  studentUsn: string;
  facultyUserId: number;
  facultyName: string;
  observation: string;
  studentStatus: string;
  guidance: string;
  followUp: string;
  nextSessionDate?: string;
  sessionDate: string;
  status: CounsellingStatus;
  isOverdue?: boolean;
}

export interface CounsellingSessionFormData {
  observation: string;
  studentStatus: string;
  guidance: string;
  followUp: string;
  nextSessionDate?: string;
}

// ==================== VTU IA SYSTEM ====================

export interface VTUIAMarkEntry {
  studentProfileId: number;
  usn: string;
  name: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  sectionA: number;
  sectionB: number;
  total: number;
}

export interface VTUIAQuestionData {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
}

export interface VTUIADisplay {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  sectionA: number;
  sectionB: number;
  total: number;
}

export interface VTUCIEDisplay {
  subjectCode: string;
  subjectName: string;
  ia1: VTUIADisplay | null;
  ia2: VTUIADisplay | null;
  ia3: VTUIADisplay | null;
  bestTwoTotal: number;
  finalCIE: number;
  isEligible: boolean;
  finalized: boolean;
}
