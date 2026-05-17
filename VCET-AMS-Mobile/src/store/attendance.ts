import { create } from 'zustand';
import {
  FacultyAttendanceState,
  AttendanceSession,
  StudentAttendanceRecord,
  AttendanceEdit,
  AttendanceStatus,
} from '../types';

export const useAttendanceStore = create<FacultyAttendanceState>((set) => ({
  currentSession: null,
  unsavedChanges: false,
  editingStudent: null,
  edits: [],
  submissionLoading: false,

  setCurrentSession: (session: AttendanceSession) =>
    set({
      currentSession: session,
      unsavedChanges: false,
      edits: [],
    }),

  updateStudentStatus: (usn: string, status: AttendanceStatus) =>
    set((state) => {
      if (!state.currentSession) return state;

      const updatedStudents = state.currentSession.students.map((student) =>
        student.usn === usn ? { ...student, status } : student
      );

      return {
        currentSession: {
          ...state.currentSession,
          students: updatedStudents,
        },
        unsavedChanges: true,
      };
    }),

  setEditingStudent: (student: StudentAttendanceRecord | null) =>
    set({ editingStudent: student }),

  addEdit: (edit: AttendanceEdit) =>
    set((state) => ({
      edits: [...state.edits, edit],
      unsavedChanges: true,
    })),

  markAllPresent: () =>
    set((state) => {
      if (!state.currentSession) return state;

      const updatedStudents = state.currentSession.students.map((student) => ({
        ...student,
        status: 'PRESENT' as AttendanceStatus,
      }));

      return {
        currentSession: {
          ...state.currentSession,
          students: updatedStudents,
        },
        unsavedChanges: true,
      };
    }),

  resetSession: () =>
    set({
      currentSession: null,
      unsavedChanges: false,
      editingStudent: null,
      edits: [],
    }),

  submitSession: async () => {
    set({ submissionLoading: true });
    try {
      // Mock API call - will be replaced with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, status: 'submitted' as const }
          : null,
        submissionLoading: false,
        unsavedChanges: false,
      }));
    } catch (error) {
      set({ submissionLoading: false });
      throw error;
    }
  },
}));
