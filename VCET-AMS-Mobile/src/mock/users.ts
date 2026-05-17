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
