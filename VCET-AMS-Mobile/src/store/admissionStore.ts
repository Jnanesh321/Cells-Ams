import { create } from 'zustand';
import type { AdmissionBatch, StudentDraft, AdmissionStats } from '../types';
import * as admission from '../mock/admission';

type BatchForm = {
  department: string;
  year: number;
  section: string;
  intakeSize: number;
};

type StudentForm = {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  parentPhone: string;
  admissionType: 'CET' | 'COMEDK' | 'MQ';
};

type AdmissionStoreState = {
  batches: AdmissionBatch[];
  currentBatch: AdmissionBatch | null;
  students: StudentDraft[];
  stats: AdmissionStats | null;
  loading: boolean;
  batchForm: BatchForm;
  studentForm: StudentForm;

  setBatchForm: (field: keyof BatchForm, value: any) => void;
  setStudentForm: (field: keyof StudentForm, value: any) => void;
  resetBatchForm: () => void;
  resetStudentForm: () => void;

  loadBatches: () => Promise<void>;
  loadStudents: (batchId: string) => Promise<void>;
  loadStats: () => Promise<void>;
  createBatch: () => Promise<AdmissionBatch>;
  addStudent: (rollNo: string, batchId: string, department: string, section: string) => Promise<void>;
  bulkAddStudents: (entries: { rollNo: string; name: string; gender: string; phone: string; parentPhone: string; admissionType: string }[], batchId: string, department: string, section: string) => Promise<number>;
  mapUSN: (draftId: string, usn: string) => Promise<void>;
  bulkMapUSN: (mappings: { draftId: string; usn: string }[]) => Promise<number>;
  getUnmapped: () => Promise<StudentDraft[]>;
};

const defaultBatchForm: BatchForm = {
  department: 'CSE',
  year: 24,
  section: 'A',
  intakeSize: 66,
};

const defaultStudentForm: StudentForm = {
  name: '',
  gender: 'MALE',
  phone: '',
  parentPhone: '',
  admissionType: 'CET',
};

export const useAdmissionStore = create<AdmissionStoreState>((set, get) => ({
  batches: [],
  currentBatch: null,
  students: [],
  stats: null,
  loading: false,
  batchForm: { ...defaultBatchForm },
  studentForm: { ...defaultStudentForm },

  setBatchForm: (field, value) => set((s) => ({ batchForm: { ...s.batchForm, [field]: value } })),
  setStudentForm: (field, value) => set((s) => ({ studentForm: { ...s.studentForm, [field]: value } })),
  resetBatchForm: () => set({ batchForm: { ...defaultBatchForm } }),
  resetStudentForm: () => set({ studentForm: { ...defaultStudentForm } }),

  loadBatches: async () => {
    set({ loading: true });
    const batches = await admission.getBatches();
    set({ batches, loading: false });
  },

  loadStudents: async (batchId) => {
    set({ loading: true });
    const students = await admission.getStudentsByBatch(batchId);
    set({ students, loading: false });
  },

  loadStats: async () => {
    const stats = await admission.getAdmissionStats();
    set({ stats });
  },

  createBatch: async () => {
    const { batchForm } = get();
    const batch = await admission.createBatch(batchForm);
    await get().loadBatches();
    return batch;
  },

  addStudent: async (rollNo, batchId, department, section) => {
    const { studentForm } = get();
    await admission.addStudentDraft({
      batchId,
      rollNo,
      name: studentForm.name,
      gender: studentForm.gender,
      phone: studentForm.phone,
      parentPhone: studentForm.parentPhone,
      admissionType: studentForm.admissionType,
      department,
      section,
      mappedUSN: null,
    });
    set({ studentForm: { ...defaultStudentForm } });
    await get().loadStudents(batchId);
    await get().loadStats();
  },

  bulkAddStudents: async (entries, batchId, department, section) => {
    const drafts = entries.map((e) => ({
      batchId,
      rollNo: e.rollNo,
      name: e.name,
      gender: e.gender as any,
      phone: e.phone,
      parentPhone: e.parentPhone,
      admissionType: e.admissionType as any,
      department,
      section,
      mappedUSN: null,
    }));
    const count = await admission.bulkAddStudents(drafts);
    await get().loadStudents(batchId);
    await get().loadStats();
    return count;
  },

  mapUSN: async (draftId, usn) => {
    await admission.updateUSNMapping(draftId, usn);
    await get().loadStats();
  },

  bulkMapUSN: async (mappings) => {
    const count = await admission.bulkMapUSN(mappings);
    await get().loadStats();
    return count;
  },

  getUnmapped: async () => {
    return admission.getUnmappedStudents();
  },
}));
