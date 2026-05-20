import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '../mock/users';
import { mockStudents } from '../mock/students';
import type { StudentAdmission } from '../types';

export type AdminUser = {
  id: string;
  name: string;
  role: string;
  password: string;
  department?: string;
  section?: string;
  semester?: number;
  email?: string;
  designation?: string;
  phone?: string;
  dateOfBirth?: string;
  parentPhone?: string;
  wardUsn?: string;
  relationship?: string;
  academicYear?: string;
};

interface AdminStore {
  adminUsers: AdminUser[];
  studentAdmissions: StudentAdmission[];
  loadMockData: () => void;
  addUser: (user: AdminUser) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => AdminUser | undefined;
  getUsersByRole: (role: string) => AdminUser[];
  getHODForDepartment: (dept: string) => AdminUser | undefined;
  addStudentAdmission: (admission: StudentAdmission) => void;
  updateStudentAdmission: (id: string, updates: Partial<StudentAdmission>) => void;
  deleteStudentAdmission: (id: string) => void;
  getStudentAdmissionById: (id: string) => StudentAdmission | undefined;
  getAllStudentAdmissions: () => StudentAdmission[];
}

function mapMockUser(key: string, u: any): AdminUser {
  return {
    id: u.id ?? key,
    name: u.name ?? '',
    role: u.role ?? 'STUDENT',
    password: u.password ?? 'vcet@123',
    department: u.department,
    section: u.section,
    semester: u.semester,
    email: u.email,
    designation: u.designation,
    phone: u.phone,
    wardUsn: u.wardUsn,
  };
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      adminUsers: [],
      studentAdmissions: [],

      loadMockData: () => {
        const current = get().adminUsers;
        if (current.length > 0) return;

        const staffUsers = Object.entries(mockUsers as Record<string, any>).map(
          ([key, u]) => mapMockUser(key, u)
        );
        const studentUsers = mockStudents.map((s: any) => ({
          id: s.usn,
          name: s.name,
          role: 'STUDENT',
          password: s.password ?? 'vcet@123',
          department: s.department,
          section: s.section,
          semester: s.semester,
          email: s.email,
          phone: s.phone,
          dateOfBirth: s.dateOfBirth,
        }));
        set({ adminUsers: [...staffUsers, ...studentUsers] });
      },

      addUser: (user) =>
        set((state) => ({ adminUsers: [user, ...state.adminUsers] })),

      updateUser: (id, updates) =>
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          adminUsers: state.adminUsers.filter((u) => u.id !== id),
        })),

      getUserById: (id) => get().adminUsers.find((u) => u.id === id),

      getUsersByRole: (role) =>
        get().adminUsers.filter((u) => u.role === role),

      getHODForDepartment: (dept) =>
        get().adminUsers.find((u) => u.role === 'HOD' && u.department === dept),

      addStudentAdmission: (admission) =>
        set((state) => ({ studentAdmissions: [admission, ...state.studentAdmissions] })),

      updateStudentAdmission: (id, updates) =>
        set((state) => ({
          studentAdmissions: state.studentAdmissions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      deleteStudentAdmission: (id) =>
        set((state) => ({
          studentAdmissions: state.studentAdmissions.filter((a) => a.id !== id),
        })),

      getStudentAdmissionById: (id) => get().studentAdmissions.find((a) => a.id === id),

      getAllStudentAdmissions: () => get().studentAdmissions,
    }),
    {
      name: 'vcet.admin.store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
