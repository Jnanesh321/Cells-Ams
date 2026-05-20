import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudentCIERecord, MarksStoreState } from '../types';

export const useMarksStore = create<MarksStoreState>()(
  persist(
    (set, get) => ({
      marks: {},

      setMarksForSubject: (subjectCode, records) =>
        set((state) => ({
          marks: { ...state.marks, [subjectCode]: records },
        })),

      updateMark: (usn, subjectCode, field, value) =>
        set((state) => {
          const subjectMarks = state.marks[subjectCode];
          if (!subjectMarks) return state;
          return {
            marks: {
              ...state.marks,
              [subjectCode]: subjectMarks.map((r) =>
                r.usn === usn ? { ...r, [field]: value } : r
              ),
            },
          };
        }),

      lockSubject: (subjectCode) =>
        set((state) => {
          const subjectMarks = state.marks[subjectCode];
          if (!subjectMarks) return state;
          return {
            marks: {
              ...state.marks,
              [subjectCode]: subjectMarks.map((r) => ({ ...r, locked: true })),
            },
          };
        }),

      loadMockData: () => {
        const current = get().marks;
        if (Object.keys(current).length > 0) return;
      },
    }),
    {
      name: 'vcet.marks.store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
