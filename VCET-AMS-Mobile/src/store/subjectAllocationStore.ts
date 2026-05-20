import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SubjectAllocation, Section, AcademicYear } from '../types';

interface SubjectAllocationStore {
  allocations: SubjectAllocation[];
  loadMockData: () => void;
  addAllocation: (allocation: SubjectAllocation) => void;
  removeAllocation: (id: string) => void;
  updateAllocation: (id: string, updates: Partial<SubjectAllocation>) => void;
  getBySemester: (semester: number) => SubjectAllocation[];
  getByDepartment: (department: string) => SubjectAllocation[];
  getByFaculty: (facultyId: string) => SubjectAllocation[];
  getByAcademicYear: (academicYear: AcademicYear) => SubjectAllocation[];
  getFiltered: (filters: {
    semester?: number;
    department?: string;
    section?: Section;
    facultyId?: string;
    academicYear?: AcademicYear;
  }) => SubjectAllocation[];
}

export const useSubjectAllocationStore = create<SubjectAllocationStore>()(
  persist(
    (set, get) => ({
      allocations: [],

      loadMockData: () => {
        const current = get().allocations;
        if (current.length > 0) return;
      },

      addAllocation: (allocation) =>
        set((state) => ({
          allocations: [...state.allocations, allocation],
        })),

      removeAllocation: (id) =>
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== id),
        })),

      updateAllocation: (id, updates) =>
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      getBySemester: (semester) =>
        get().allocations.filter((a) => a.semester === semester),

      getByDepartment: (department) =>
        get().allocations.filter((a) => {
          const { getSubjectByCode } = require('../mock/subjects');
          const subject = getSubjectByCode(a.subjectCode);
          return subject?.department === department;
        }),

      getByFaculty: (facultyId) =>
        get().allocations.filter((a) => a.facultyId === facultyId),

      getByAcademicYear: (academicYear) =>
        get().allocations.filter((a) => a.academicYear === academicYear),

      getFiltered: (filters) => {
        let result = get().allocations;
        if (filters.semester !== undefined) {
          result = result.filter((a) => a.semester === filters.semester);
        }
        if (filters.department) {
          result = result.filter((a) => {
            const { getSubjectByCode } = require('../mock/subjects');
            const subject = getSubjectByCode(a.subjectCode);
            return subject?.department === filters.department;
          });
        }
        if (filters.section) {
          result = result.filter((a) => a.section === filters.section);
        }
        if (filters.facultyId) {
          result = result.filter((a) => a.facultyId === filters.facultyId);
        }
        if (filters.academicYear) {
          result = result.filter((a) => a.academicYear === filters.academicYear);
        }
        return result;
      },
    }),
    {
      name: 'vcet.subjectAllocation.store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
