import { User, UserRole, PermissionAction, Department } from '../types';
import { getFacultyById, getHODForDepartment, VCET_DEPARTMENTS } from '../mock/facultyData';

/**
 * Role-based permission matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  PRINCIPAL: [
    'view_attendance',
    'view_marks',
    'view_analytics',
    'view_all_departments',
    'approve_escalations',
    'approve_attendance_edit',
  ],
  HOD: [
    'view_attendance',
    'view_marks',
    'view_own_department',
    'edit_attendance',
    'edit_marks',
    'edit_ia_marks',
    'approve_attendance_edit',
  ],
  FACULTY: [
    'view_attendance',
    'mark_attendance',
    'edit_attendance',
    'view_marks',
    'edit_marks',
    'edit_ia_marks',
    'request_attendance_edit',
  ],
  STUDENT: ['view_attendance', 'view_marks'],
  PARENT: ['view_attendance', 'view_marks'],
  ADMISSION_CELL: [],
  ADMIN: [
    'view_attendance',
    'mark_attendance',
    'edit_attendance',
    'approve_attendance_edit',
    'view_marks',
    'edit_marks',
    'edit_ia_marks',
    'view_analytics',
    'view_all_departments',
    'approve_escalations',
  ],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User, permission: PermissionAction): boolean => {
  return ROLE_PERMISSIONS[user.role].includes(permission);
};

/**
 * Check if user can mark attendance
 */
export const canMarkAttendance = (user: User): boolean => {
  return hasPermission(user, 'mark_attendance');
};

/**
 * Check if user can edit attendance
 */
export const canEditAttendance = (
  user: User,
  targetFacultyId?: string,
  targetDepartment?: Department
): boolean => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'HOD') {
    // HOD can edit if target faculty is in their department
    if (targetFacultyId && targetDepartment) {
      const targetFaculty = getFacultyById(targetFacultyId);
      return (
        hasPermission(user, 'edit_attendance') &&
        targetFaculty?.department === user.department
      );
    }
    return hasPermission(user, 'edit_attendance');
  }

  if (user.role === 'FACULTY') {
    // Faculty can only edit their own attendance or request edit
    return targetFacultyId === user.id && hasPermission(user, 'edit_attendance');
  }

  return false;
};

/**
 * Check if user can approve attendance edits
 */
export const canApproveAttendanceEdit = (user: User, departmentOfRequest?: Department): boolean => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'HOD') {
    // HOD can approve edits for their department only
    return (
      hasPermission(user, 'approve_attendance_edit') &&
      departmentOfRequest === user.department
    );
  }

  return false;
};

/**
 * Check if user can view student data
 */
export const canViewStudent = (
  user: User,
  studentDepartment?: Department
): boolean => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'HOD') {
    return studentDepartment === user.department;
  }

  if (user.role === 'FACULTY') {
    return true;
  }

  if (user.role === 'STUDENT') {
    return true;
  }

  if (user.role === 'PARENT') {
    return true;
  }

  return false;
};

/**
 * Check if user can view department analytics
 */
export const canViewDepartmentAnalytics = (
  user: User,
  department?: Department
): boolean => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'HOD') {
    // HOD can view analytics for their department
    return department === user.department;
  }

  return false;
};

/**
 * Check if user can view all departments
 */
export const canViewAllDepartments = (user: User): boolean => {
  return user.role === 'PRINCIPAL' || user.role === 'ADMIN';
};

/**
 * Check if user can edit marks
 */
export const canEditMarks = (
  user: User,
  targetFacultyId?: string,
  targetDepartment?: Department
): boolean => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'HOD') {
    // HOD can edit marks for faculty in their department
    if (targetFacultyId && targetDepartment) {
      const targetFaculty = getFacultyById(targetFacultyId);
      return (
        hasPermission(user, 'edit_marks') &&
        targetFaculty?.department === user.department
      );
    }
    return hasPermission(user, 'edit_marks');
  }

  if (user.role === 'FACULTY') {
    // Faculty can edit their own IA marks
    return targetFacultyId === user.id && hasPermission(user, 'edit_marks');
  }

  return false;
};

/**
 * Check if user can request attendance edit
 */
export const canRequestAttendanceEdit = (user: User): boolean => {
  return user.role === 'FACULTY' && hasPermission(user, 'request_attendance_edit');
};

/**
 * Get user's viewable departments
 */
export const getViewableDepartments = (user: User): Department[] => {
  if (user.role === 'PRINCIPAL' || user.role === 'ADMIN') {
    return Object.keys(VCET_DEPARTMENTS) as Department[];
  }

  if (user.role === 'HOD' && user.department) {
    return [user.department as Department];
  }

  if (user.role === 'FACULTY' && user.department) {
    return [user.department as Department];
  }

  if (user.role === 'PARENT' && user.department) {
    return [user.department as Department];
  }

  return [];
};

/**
 * Get user display text for permissions context
 */
export const getUserPermissionLevel = (user: User): string => {
  switch (user.role) {
    case 'PRINCIPAL':
      return 'Principal - Full Access';
    case 'HOD':
      return `HOD - ${user.department} Department`;
    case 'FACULTY':
      return 'Faculty - Own Records Only';
    case 'STUDENT':
      return 'Student - View Only';
    case 'PARENT':
      return 'Parent - Read Only';
    case 'ADMISSION_CELL':
      return 'Admission Cell - Batch Management';
    case 'ADMIN':
      return 'Admin - Full Access';
    default:
      return 'Unknown Role';
  }
};

/**
 * Check if user can escalate or approve requests
 */
export const canHandleEscalations = (user: User): boolean => {
  return user.role === 'PRINCIPAL' || user.role === 'ADMIN';
};

/**
 * Validate if user has action permission with detailed context
 */
export const validatePermission = (
  user: User,
  action: PermissionAction,
  context?: {
    targetDepartment?: Department;
    targetFacultyId?: string;
    targetUserId?: string;
  }
): boolean => {
  const basePermission = hasPermission(user, action);

  if (!basePermission) {
    return false;
  }

  // Additional context-based validation
  if (action === 'edit_attendance' || action === 'edit_marks') {
    if (context?.targetDepartment && user.role === 'HOD') {
      return context.targetDepartment === user.department;
    }
  }

  if (action === 'approve_attendance_edit') {
    if (context?.targetDepartment && user.role === 'HOD') {
      return context.targetDepartment === user.department;
    }
  }

  if (action === 'view_own_department') {
    if (user.role === 'HOD' && context?.targetDepartment) {
      return context.targetDepartment === user.department;
    }
  }

  return true;
};
