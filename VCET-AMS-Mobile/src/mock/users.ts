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

  // Parents (representative sample for testing login)
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

  PARENT02: {
    id: 'PARENT02',
    password: 'parent@123',
    name: 'Aditya Kumar',
    role: 'PARENT' as const,
    email: 'parent.4vp21cs001@vcet.ac.in',
    department: 'CSE',
    usn: '4VP21CS001',
    wardUsn: '4VP21CS001',
  },

  PARENT03: {
    id: 'PARENT03',
    password: 'parent@123',
    name: 'Ravi Kumar',
    role: 'PARENT' as const,
    email: 'parent.4vp21ec001@vcet.ac.in',
    department: 'ECE',
    usn: '4VP21EC001',
    wardUsn: '4VP21EC001',
  },

  PARENT04: {
    id: 'PARENT04',
    password: 'parent@123',
    name: 'Ankit Sharma',
    role: 'PARENT' as const,
    email: 'parent.4vp22cs001@vcet.ac.in',
    department: 'CSE',
    usn: '4VP22CS001',
    wardUsn: '4VP22CS001',
  },

  PARENT05: {
    id: 'PARENT05',
    password: 'parent@123',
    name: 'Farhan Ahmed',
    role: 'PARENT' as const,
    email: 'parent.4vp22ec001@vcet.ac.in',
    department: 'ECE',
    usn: '4VP22EC001',
    wardUsn: '4VP22EC001',
  },

  PARENT06: {
    id: 'PARENT06',
    password: 'parent@123',
    name: 'Ishaan Verma',
    role: 'PARENT' as const,
    email: 'parent.4vp22me001@vcet.ac.in',
    department: 'MECH',
    usn: '4VP22ME001',
    wardUsn: '4VP22ME001',
  },

  PARENT07: {
    id: 'PARENT07',
    password: 'parent@123',
    name: 'Kavya Singh',
    role: 'PARENT' as const,
    email: 'parent.4vp23cs001@vcet.ac.in',
    department: 'CSE',
    usn: '4VP23CS001',
    wardUsn: '4VP23CS001',
  },

  PARENT08: {
    id: 'PARENT08',
    password: 'parent@123',
    name: 'Rahul Pai',
    role: 'PARENT' as const,
    email: 'parent.4vp23ec001@vcet.ac.in',
    department: 'ECE',
    usn: '4VP23EC001',
    wardUsn: '4VP23EC001',
  },

  PARENT09: {
    id: 'PARENT09',
    password: 'parent@123',
    name: 'Umesh Nayak',
    role: 'PARENT' as const,
    email: 'parent.4vp23me001@vcet.ac.in',
    department: 'MECH',
    usn: '4VP23ME001',
    wardUsn: '4VP23ME001',
  },

  PARENT10: {
    id: 'PARENT10',
    password: 'parent@123',
    name: 'Aarav Iyer',
    role: 'PARENT' as const,
    email: 'parent.4vp24cs001@vcet.ac.in',
    department: 'CSE',
    usn: '4VP24CS001',
    wardUsn: '4VP24CS001',
  },

  PARENT11: {
    id: 'PARENT11',
    password: 'parent@123',
    name: 'Ganesh Prabhu',
    role: 'PARENT' as const,
    email: 'parent.4vp24ec001@vcet.ac.in',
    department: 'ECE',
    usn: '4VP24EC001',
    wardUsn: '4VP24EC001',
  },

  PARENT12: {
    id: 'PARENT12',
    password: 'parent@123',
    name: 'Jyothi Shetty',
    role: 'PARENT' as const,
    email: 'parent.4vp24me001@vcet.ac.in',
    department: 'MECH',
    usn: '4VP24ME001',
    wardUsn: '4VP24ME001',
  },

  PARENT13: {
    id: 'PARENT13',
    password: 'parent@123',
    name: 'Manjunath Prabhu',
    role: 'PARENT' as const,
    email: 'parent.4vp25cs001@vcet.ac.in',
    department: 'CSE',
    usn: '4VP25CS001',
    wardUsn: '4VP25CS001',
  },

  PARENT14: {
    id: 'PARENT14',
    password: 'parent@123',
    name: 'Pooja Hegde',
    role: 'PARENT' as const,
    email: 'parent.4vp25ec001@vcet.ac.in',
    department: 'ECE',
    usn: '4VP25EC001',
    wardUsn: '4VP25EC001',
  },

  PARENT15: {
    id: 'PARENT15',
    password: 'parent@123',
    name: 'Tanmay Shet',
    role: 'PARENT' as const,
    email: 'parent.4vp25me001@vcet.ac.in',
    department: 'MECH',
    usn: '4VP25ME001',
    wardUsn: '4VP25ME001',
  },

  PARENT16: {
    id: 'PARENT16',
    password: 'parent@123',
    name: 'Aditi Sharma',
    role: 'PARENT' as const,
    email: 'parent.4vp25ai001@vcet.ac.in',
    department: 'AIML',
    usn: '4VP25AI001',
    wardUsn: '4VP25AI001',
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

  // Parent check ΓÇö allow USN-based parent login when in staff mode
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
