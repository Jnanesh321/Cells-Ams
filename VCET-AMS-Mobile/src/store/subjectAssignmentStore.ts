import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockSubjectAssignments, getFacultyLoadByDept } from '../mock/subjectAssignments';
import type { SubjectAssignment } from '../types';

interface SubjectAssignmentStore {
  assignments: SubjectAssignment[];
  isLoading: boolean;
  lastUpdatedId: string | null;
  isInitialized: boolean;
  initializeIfNeeded: () => void;
  loadMockData: () => void;
  assignFaculty: (assignmentId: string, facultyId: string, facultyName: string) => void;
  forceAssignFaculty: (assignmentId: string, facultyId: string, facultyName: string) => void;
  unassignFaculty: (assignmentId: string) => void;
  getByDept: (dept: string) => SubjectAssignment[];
  getByFaculty: (facultyId: string) => SubjectAssignment[];
  getUnassigned: (dept: string) => SubjectAssignment[];
  getFacultyLoad: (dept: string) => { facultyId: string; facultyName: string; count: number }[];
}

export const useSubjectAssignmentStore = create<SubjectAssignmentStore>()(
  persist(
    (set, get) => ({
      assignments: [],
      isLoading: false,
      lastUpdatedId: null,
      isInitialized: false,

      initializeIfNeeded: () => {
        if (!get().isInitialized) {
          set({ assignments: mockSubjectAssignments, isInitialized: true });
        }
      },

      loadMockData: () => {
        if (!get().isInitialized) {
          get().initializeIfNeeded();
        }
      },

    assignFaculty: (assignmentId, facultyId, facultyName) => {
      const state = get();
      const target = state.assignments.find((a) => a.id === assignmentId);
      if (!target) throw new Error('Assignment not found');

      const deptAssignments = state.assignments.filter(
        (a) => a.department === target.department && a.semesterNo === target.semesterNo && a.facultyId === facultyId
      );
      if (deptAssignments.length >= 3) {
        throw new Error('Faculty already has maximum load for this semester');
      }

      set({
        assignments: state.assignments.map((a) =>
          a.id === assignmentId ? { ...a, facultyId, facultyName } : a
        ),
        lastUpdatedId: assignmentId,
      });
    },

    forceAssignFaculty: (assignmentId, facultyId, facultyName) => {
      const state = get();
      const target = state.assignments.find((a) => a.id === assignmentId);
      if (!target) throw new Error('Assignment not found');

      set({
        assignments: state.assignments.map((a) =>
          a.id === assignmentId ? { ...a, facultyId, facultyName } : a
        ),
        lastUpdatedId: assignmentId,
      });
    },

    unassignFaculty: (assignmentId) => {
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === assignmentId ? { ...a, facultyId: null, facultyName: null } : a
        ),
        lastUpdatedId: assignmentId,
      }));
    },

    getByDept: (dept) => {
      return get().assignments.filter((a) => a.department === dept && a.isActive);
    },

    getByFaculty: (facultyId) => {
      return get().assignments.filter((a) => a.facultyId === facultyId && a.isActive);
    },

    getUnassigned: (dept) => {
      return get().assignments.filter((a) => a.department === dept && a.facultyId === null && a.isActive);
    },

    getFacultyLoad: (dept) => {
      return getFacultyLoadByDept(dept).map((f) => ({
        facultyId: f.facultyId,
        facultyName: f.facultyName,
        count: f.assignedCount,
      }));
    },
  }),
    {
      name: 'subject-assignment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
