export const mockUsers = {
  // Admin
  ADMIN: {
    id: 'ADMIN',
    password: 'admin@123',
    name: 'Admin User',
    role: 'ADMIN' as const,
    email: 'admin@vcet.ac.in',
  },

  // Principal
  PRINCIPAL: {
    id: 'PRINCIPAL',
    password: 'principal@123',
    name: 'Dr. Mahesh Prasanna K',
    role: 'PRINCIPAL' as const,
    email: 'principal@vcet.ac.in',
    designation: 'Principal',
  },

  // HOD CSE
  HOD_CSE: {
    id: 'HOD_CSE',
    password: 'hod@123',
    name: 'Prof. Pradeep Kumar KG',
    role: 'HOD' as const,
    email: 'hod.cse@vcet.ac.in',
    department: 'CSE',
    designation: 'Head of Department',
  },

  // Faculty (IDs match facultySubjects.ts assignments)
  FAC_CSE_001: {
    id: 'FAC_CSE_001',
    password: 'faculty@123',
    name: 'Mrs. Akshaya D. Shetty',
    role: 'FACULTY' as const,
    email: 'akshaya.shetty@vcet.ac.in',
    department: 'CSE',
    phone: '+91 9845123456',
    designation: 'Assistant Professor',
  },

  FAC_CSE_002: {
    id: 'FAC_CSE_002',
    password: 'faculty@123',
    name: 'Mr. Ajay Shastry C G',
    role: 'FACULTY' as const,
    email: 'ajay.shastry@vcet.ac.in',
    department: 'CSE',
    phone: '+91 9845123457',
    designation: 'Assistant Professor',
  },

  FAC_ECE_001: {
    id: 'FAC_ECE_001',
    password: 'faculty@123',
    name: 'Mr. Naveenakrishna P V',
    role: 'FACULTY' as const,
    email: 'naveenakrishna@vcet.ac.in',
    department: 'ECE',
    phone: '+91 9845123458',
    designation: 'Assistant Professor',
  },

  // Parent
  PARENT01: {
    id: 'PARENT01',
    password: 'parent@123',
    name: 'Mr. Arjun Patel',
    role: 'PARENT' as const,
    email: 'parent.arjun@vcet.ac.in',
    department: 'CSE',
    usn: '4VP21CS001',
    wardUsn: '4VP21CS001',
  },

  // Admission Cell
  ADMISSION: {
    id: 'ADMISSION',
    password: 'admission@123',
    name: 'Ms. Anitha K',
    role: 'ADMISSION_CELL' as const,
    email: 'admissions@vcet.ac.in',
    department: 'CSE',
    designation: 'Admission Officer',
  },
};

export const isStudentUSN = (id: string): boolean => {
  // VTU USN format: 4VP21CS001
  return /^\d{1}[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(id);
};

export const getStudentDepartment = (usn: string): string => {
  const match = usn.match(/^\d{1}[A-Z]{2}\d{2}([A-Z]{2})\d{3}$/);
  return match ? match[1] : '';
};

export const getStudentYear = (usn: string): number => {
  const match = usn.match(/^\d{1}[A-Z]{2}(\d{2})[A-Z]{2}\d{3}$/);
  return match ? parseInt(match[1]) : 0;
};

import type { UserRole } from '../types';

export function getMockUser(id: string, password: string, loginMode?: 'student' | 'staff'): {
  usn: string; name: string; role: UserRole; token: string; refreshToken: string;
  department?: string; designation?: string; email?: string; phone?: string;
  section?: string; semester?: number; year?: number; departmentId?: number | null;
  wardUsn?: string;
} | null {
  const trimmedId = id.trim().toUpperCase();

  // Student check
  if (isStudentUSN(trimmedId) && loginMode !== 'staff') {
    const { mockStudents } = require('./students');
    const student = mockStudents.find((s: any) => s.usn === trimmedId);
    if (student && student.password === password) {
      return {
        usn: student.usn,
        name: student.name,
        role: 'STUDENT',
        department: student.department,
        section: student.section,
        semester: student.semester,
        year: student.year,
        email: student.email,
        phone: student.phone,
        token: `token_${trimmedId}_${Date.now()}`,
        refreshToken: `refresh_${trimmedId}_${Date.now()}`,
      };
    }
    return null;
  }

  // Parent check — allow USN-based parent login when in staff mode
  if (isStudentUSN(trimmedId) && loginMode === 'staff') {
    const { mockParents } = require('./parents');
    const parent = mockParents.find((p: any) => p.wardUsn === trimmedId);
    if (parent && parent.password === password) {
      return {
        usn: parent.usn,
        name: parent.name,
        role: 'PARENT',
        department: parent.department,
        email: parent.email,
        phone: parent.phone,
        wardUsn: parent.wardUsn,
        token: `token_${parent.usn}_${Date.now()}`,
        refreshToken: `refresh_${parent.usn}_${Date.now()}`,
      };
    }
    return null;
  }

  // Staff check
  const staffUser = mockUsers[trimmedId as keyof typeof mockUsers];
  if (staffUser && staffUser.password === password) {
    return {
      usn: staffUser.id,
      name: staffUser.name,
      role: staffUser.role,
      department: (staffUser as any).department,
      designation: (staffUser as any).designation,
      email: staffUser.email,
      phone: (staffUser as any).phone,
      wardUsn: (staffUser as any).wardUsn,
      token: `token_${trimmedId}_${Date.now()}`,
      refreshToken: `refresh_${trimmedId}_${Date.now()}`,
    };
  }

  return null;
}
