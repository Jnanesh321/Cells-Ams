/**
 * VCET Department Configuration
 * Centralized configuration for all departments at VCET
 */

export type DepartmentCode = 'CSE' | 'ECE' | 'AIML' | 'CD' | 'CV' | 'MECH' | 'BASIC_SCIENCE';

export interface Department {
  code: DepartmentCode;
  name: string;
  hod: string;
  email?: string;
  phone?: string;
  established?: number;
}

/**
 * All VCET Departments with HODs
 */
export const DEPARTMENTS: Record<DepartmentCode, Department> = {
  CSE: {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    hod: 'Mr. Pradeep Kumar K.G.',
    email: 'cse.hod@vcet.ac.in',
    phone: '+91 9845100301',
  },
  ECE: {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    hod: 'Ms. Roopa G K',
    email: 'ece.hod@vcet.ac.in',
    phone: '+91 9845100401',
  },
  AIML: {
    code: 'AIML',
    name: 'Artificial Intelligence & Machine Learning',
    hod: 'Dr. Ajith Hebbar Hosmata',
    email: 'aiml.hod@vcet.ac.in',
    phone: '+91 9845100501',
  },
  CD: {
    code: 'CD',
    name: 'Computer Networks & Data Science',
    hod: 'Mr. Abhishek Kumar K',
    email: 'cd.hod@vcet.ac.in',
    phone: '+91 9845100601',
  },
  CV: {
    code: 'CV',
    name: 'Civil Engineering',
    hod: 'Dr. Manujesh B J',
    email: 'cv.hod@vcet.ac.in',
    phone: '+91 9845100701',
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical Engineering',
    hod: 'Dr. Manujesh B J',
    email: 'mech.hod@vcet.ac.in',
    phone: '+91 9845100801',
  },
  BASIC_SCIENCE: {
    code: 'BASIC_SCIENCE',
    name: 'Basic Science & Humanities',
    hod: 'Mr. M Ramananda Kamath',
    email: 'science.hod@vcet.ac.in',
    phone: '+91 9845100901',
  },
};

/**
 * Principal information
 */
export const PRINCIPAL = {
  name: 'Dr. Mahesh Prasanna K',
  email: 'principal@vcet.ac.in',
  phone: '+91 9845100001',
  designation: 'Principal',
};

/**
 * Get department by code
 */
export const getDepartment = (code: DepartmentCode): Department | undefined => {
  return DEPARTMENTS[code];
};

/**
 * Get all departments
 */
export const getAllDepartments = (): Department[] => {
  return Object.values(DEPARTMENTS);
};

/**
 * Get HOD for a department
 */
export const getHOD = (departmentCode: DepartmentCode): string => {
  return DEPARTMENTS[departmentCode]?.hod || 'Unknown HOD';
};

/**
 * Get department name by code
 */
export const getDepartmentName = (code: DepartmentCode): string => {
  return DEPARTMENTS[code]?.name || code;
};
