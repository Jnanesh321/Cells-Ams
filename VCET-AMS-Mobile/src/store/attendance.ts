import { create } from 'zustand';
import API from '../services/api';
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
    const session = useAttendanceStore.getState().currentSession;
    try {
      if (session) {
        const records = session.students.map((s) => ({
          studentProfileId: parseInt(s.usn.replace(/\D/g, '').slice(0, 8) || '0', 10),
          status: s.status,
        }));
        const subjectId = parseInt(session.subjectCode.replace(/\D/g, '').slice(0, 5) || '1', 10);

        await API.post('/attendance/mark', {
          subjectId,
          section: session.section,
          date: session.date,
          records,
        });
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, status: 'submitted' as const }
          : null,
        submissionLoading: false,
        unsavedChanges: false,
      }));
    }
  },
}));
