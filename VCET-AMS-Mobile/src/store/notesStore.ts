import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, NotesStoreState } from '../types';
import { getSubjectByCode } from '../mock/subjects';

const MOCK_NOTES: Note[] = [
  { id: 'note_1', title: 'Unit 1 - Data Structures', subjectCode: 'CS501', subjectName: 'Advanced Data Structures', description: 'Arrays, Linked Lists, Stacks, Queues', fileName: 'ADS_Unit1.pdf', fileUri: '', fileType: 'pdf', uploadedBy: 'FAC_CSE_001', uploadedByName: 'Dr. Arvind Patil', uploadedAt: '2026-03-10T10:00:00Z', semester: 6, department: 'CSE', section: 'A' },
  { id: 'note_2', title: 'Unit 2 - Trees & Graphs', subjectCode: 'CS501', subjectName: 'Advanced Data Structures', description: 'Binary Trees, BST, Graph Traversals', fileName: 'ADS_Unit2.pdf', fileUri: '', fileType: 'pdf', uploadedBy: 'FAC_CSE_001', uploadedByName: 'Dr. Arvind Patil', uploadedAt: '2026-03-20T14:30:00Z', semester: 6, department: 'CSE', section: 'A' },
  { id: 'note_3', title: 'DBMS Normalization Notes', subjectCode: 'CS502', subjectName: 'Database Management Systems', fileName: 'DBMS_Normalization.pdf', fileUri: '', fileType: 'pdf', uploadedBy: 'FAC_CSE_002', uploadedByName: 'Prof. Meera Kulkarni', uploadedAt: '2026-04-05T09:00:00Z', semester: 6, department: 'CSE', section: 'B' },
  { id: 'note_4', title: 'SQL Cheatsheet', subjectCode: 'CS502', subjectName: 'Database Management Systems', fileName: 'SQL_Cheatsheet.pdf', fileUri: '', fileType: 'pdf', uploadedBy: 'FAC_CSE_002', uploadedByName: 'Prof. Meera Kulkarni', uploadedAt: '2026-04-12T11:15:00Z', semester: 6, department: 'CSE' },
  { id: 'note_5', title: 'IA1 Question Bank', subjectCode: 'CS503', subjectName: 'Software Engineering', fileName: 'SE_IA1_QB.pdf', fileUri: '', fileType: 'pdf', uploadedBy: 'FAC_CSE_003', uploadedByName: 'Dr. Sunil Rao', uploadedAt: '2026-02-15T08:00:00Z', semester: 6, department: 'CSE' },
  { id: 'note_6', title: 'Network Topologies Diagram', subjectCode: 'CS504', subjectName: 'Computer Networks', fileName: 'CN_Topologies.png', fileUri: '', fileType: 'image', uploadedBy: 'FAC_CSE_004', uploadedByName: 'Prof. Anita Desai', uploadedAt: '2026-03-28T16:45:00Z', semester: 6, department: 'CSE' },
];

export const useNotesStore = create<NotesStoreState>()(
  persist(
    (set, get) => ({
      notes: [],

      loadMockData: () => {
        if (get().notes.length === 0) {
          set({ notes: MOCK_NOTES });
        }
      },

      addNote: (noteData) => {
        const note: Note = {
          ...noteData,
          id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [...state.notes, note] }));
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      },

      getNotesBySubject: (subjectCode) => {
        return get().notes.filter((n) => n.subjectCode === subjectCode);
      },

      getNotesForStudent: (department, semester) => {
        return get().notes.filter(
          (n) => n.department === department && n.semester === semester
        );
      },

      getNotesByFaculty: (uploadedBy) => {
        return get().notes.filter((n) => n.uploadedBy === uploadedBy);
      },
    }),
    {
      name: 'vcet.notes.store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
