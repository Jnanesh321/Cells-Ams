import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import {
  FacultyAttendanceState,
  AttendanceSession,
  StudentAttendanceRecord,
  AttendanceEdit,
  AttendanceStatus,
} from '../types';

interface AttendanceStore extends FacultyAttendanceState {
  sessions: AttendanceSession[];
  loadSessions: () => void;
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, state) => ({
      currentSession: null,
      unsavedChanges: false,
      editingStudent: null,
      edits: [],
      submissionLoading: false,
      sessions: [],

      loadSessions: () => {
        const stored = (state as any)?.sessions;
        if (stored && stored.length > 0) return;
      },

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
    }),
    {
      name: 'vcet.attendance.store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
