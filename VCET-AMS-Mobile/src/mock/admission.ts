import type { AdmissionBatch, StudentDraft, RollSequence, AdmissionStats } from '../types';

let _rollSeq: Record<string, number> = {
  'CS_24': 38,
  'EC_24': 23,
  'AI_24': 41,
  'ME_24': 0,
  'CD_24': 0,
  'CV_24': 0,
};

const _batches: AdmissionBatch[] = [
  {
    id: 'BATCH-2024-CS-A',
    department: 'CSE',
    year: 24,
    section: 'A',
    intakeSize: 66,
    startRollNo: 1,
    endRollNo: 66,
    createdAt: '2024-08-01T10:00:00Z',
    studentCount: 38,
    mappedCount: 0,
  },
  {
    id: 'BATCH-2024-EC-A',
    department: 'ECE',
    year: 24,
    section: 'A',
    intakeSize: 66,
    startRollNo: 1,
    endRollNo: 66,
    createdAt: '2024-08-01T10:00:00Z',
    studentCount: 23,
    mappedCount: 0,
  },
];

let _drafts: StudentDraft[] = [
  {
    id: 'DRAFT-001',
    batchId: 'BATCH-2024-CS-A',
    rollNo: '24CS001',
    name: 'Aditya Sharma',
    gender: 'MALE',
    phone: '9845000101',
    parentPhone: '9845000201',
    admissionType: 'CET',
    department: 'CSE',
    section: 'A',
    mappedUSN: null,
    createdAt: '2024-08-05T09:00:00Z',
  },
  {
    id: 'DRAFT-002',
    batchId: 'BATCH-2024-CS-A',
    rollNo: '24CS002',
    name: 'Bhavana Reddy',
    gender: 'FEMALE',
    phone: '9845000102',
    parentPhone: '9845000202',
    admissionType: 'CET',
    department: 'CSE',
    section: 'A',
    mappedUSN: null,
    createdAt: '2024-08-05T09:00:00Z',
  },
  {
    id: 'DRAFT-003',
    batchId: 'BATCH-2024-CS-A',
    rollNo: '24CS003',
    name: 'Chethan Kumar',
    gender: 'MALE',
    phone: '9845000103',
    parentPhone: '9845000203',
    admissionType: 'COMEDK',
    department: 'CSE',
    section: 'A',
    mappedUSN: null,
    createdAt: '2024-08-05T09:00:00Z',
  },
  {
    id: 'DRAFT-004',
    batchId: 'BATCH-2024-CS-A',
    rollNo: '24CS004',
    name: 'Divya Nair',
    gender: 'FEMALE',
    phone: '9845000104',
    parentPhone: '9845000204',
    admissionType: 'MQ',
    department: 'CSE',
    section: 'A',
    mappedUSN: null,
    createdAt: '2024-08-05T09:00:00Z',
  },
];

const DEPT_CODE_MAP: Record<string, string> = {
  CSE: 'CS',
  ECE: 'EC',
  AIML: 'AI',
  MECH: 'ME',
  CD: 'CD',
  CV: 'CV',
  ISE: 'IS',
  BASIC_SCIENCE: 'BS',
};

export function getDeptCode(dept: string): string {
  return DEPT_CODE_MAP[dept] ?? dept.slice(0, 2).toUpperCase();
}

export function generateRollNumber(dept: string, year: number): string {
  const key = `${getDeptCode(dept)}_${year}`;
  const current = _rollSeq[key] ?? 0;
  const next = current + 1;
  _rollSeq[key] = next;
  return `${year}${getDeptCode(dept)}${String(next).padStart(3, '0')}`;
}

export function generateBatchRollNumbers(batch: { department: string; year: number; section: string; intakeSize: number }): string[] {
  const rolls: string[] = [];
  const deptCode = getDeptCode(batch.department);
  const key = `${deptCode}_${batch.year}`;
  let start = _rollSeq[key] ?? 0;
  for (let i = 0; i < batch.intakeSize; i++) {
    start++;
    rolls.push(`${batch.year}${deptCode}${String(start).padStart(3, '0')}`);
  }
  _rollSeq[key] = start;
  return rolls;
}

export function mapRollToUSN(rollNo: string): string {
  const year = rollNo.slice(0, 2);
  const deptCode = rollNo.slice(2, 4);
  const seq = rollNo.slice(4);
  return `4VP${year}${deptCode}${seq}`;
}

export async function getBatches(): Promise<AdmissionBatch[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [..._batches];
}

export async function createBatch(input: { department: string; year: number; section: string; intakeSize: number }): Promise<AdmissionBatch> {
  await new Promise((r) => setTimeout(r, 200));
  const deptCode = getDeptCode(input.department);
  const key = `${deptCode}_${input.year}`;
  const startSeq = (_rollSeq[key] ?? 0) + 1;
  const endSeq = startSeq + input.intakeSize - 1;
  _rollSeq[key] = endSeq;
  const batch: AdmissionBatch = {
    id: `BATCH-${input.year}-${deptCode}-${input.section}`,
    department: input.department,
    year: input.year,
    section: input.section,
    intakeSize: input.intakeSize,
    startRollNo: startSeq,
    endRollNo: endSeq,
    createdAt: new Date().toISOString(),
    studentCount: 0,
    mappedCount: 0,
  };
  _batches.push(batch);
  return batch;
}

export async function getStudentsByBatch(batchId: string): Promise<StudentDraft[]> {
  await new Promise((r) => setTimeout(r, 100));
  return _drafts.filter((d) => d.batchId === batchId);
}

export async function getUnmappedStudents(): Promise<StudentDraft[]> {
  await new Promise((r) => setTimeout(r, 100));
  return _drafts.filter((d) => d.mappedUSN === null);
}

export async function addStudentDraft(input: Omit<StudentDraft, 'id' | 'createdAt'>): Promise<StudentDraft> {
  await new Promise((r) => setTimeout(r, 150));
  const draft: StudentDraft = {
    ...input,
    id: `DRAFT-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  _drafts.push(draft);
  const batch = _batches.find((b) => b.id === input.batchId);
  if (batch) batch.studentCount++;
  return draft;
}

export async function bulkAddStudents(drafts: Omit<StudentDraft, 'id' | 'createdAt'>[]): Promise<number> {
  await new Promise((r) => setTimeout(r, 300));
  for (const d of drafts) {
    _drafts.push({ ...d, id: `DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() });
    const batch = _batches.find((b) => b.id === d.batchId);
    if (batch) batch.studentCount++;
  }
  return drafts.length;
}

export async function updateUSNMapping(draftId: string, usn: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  const draft = _drafts.find((d) => d.id === draftId);
  if (draft) {
    draft.mappedUSN = usn;
    const batch = _batches.find((b) => b.id === draft.batchId);
    if (batch) batch.mappedCount++;
  }
}

export async function bulkMapUSN(mappings: { draftId: string; usn: string }[]): Promise<number> {
  await new Promise((r) => setTimeout(r, 300));
  let count = 0;
  for (const m of mappings) {
    const draft = _drafts.find((d) => d.id === m.draftId);
    if (draft && !draft.mappedUSN) {
      draft.mappedUSN = m.usn;
      count++;
      const batch = _batches.find((b) => b.id === draft.batchId);
      if (batch) batch.mappedCount++;
    }
  }
  return count;
}

export async function getAdmissionStats(): Promise<AdmissionStats> {
  await new Promise((r) => setTimeout(r, 100));
  const totalStudents = _drafts.length;
  const mappedStudents = _drafts.filter((d) => d.mappedUSN !== null).length;
  return {
    totalBatches: _batches.length,
    totalStudents,
    mappedStudents,
    pendingMapping: totalStudents - mappedStudents,
  };
}

export function previewUSNMapping(rollNo: string, department: string): string {
  return mapRollToUSN(rollNo);
}
