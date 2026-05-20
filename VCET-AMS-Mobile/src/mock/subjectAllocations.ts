import type { SubjectAllocation } from '../types';

export const MOCK_SUBJECT_ALLOCATIONS: SubjectAllocation[] = [
  // ==================== SEMESTER 2 (First Year) ====================
  // CSE Sem 2 - Chemistry Stream
  { id: 'ALLOC_S2_CSE_A_01', subjectCode: 'BCS201', facultyId: 'FAC_BS_001', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25CS001', '4VP25CS002', '4VP25CS003'] },
  { id: 'ALLOC_S2_CSE_A_02', subjectCode: 'BCS202', facultyId: 'FAC_BS_002', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25CS001', '4VP25CS002', '4VP25CS003'] },
  { id: 'ALLOC_S2_CSE_A_03', subjectCode: 'BCS203', facultyId: 'FAC_BS_003', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25CS001', '4VP25CS002', '4VP25CS003'] },
  // ECE Sem 2 - Physics Stream
  { id: 'ALLOC_S2_EC_A_01', subjectCode: 'BEC201', facultyId: 'FAC_BS_004', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25EC001', '4VP25EC002', '4VP25EC003'] },
  { id: 'ALLOC_S2_EC_A_02', subjectCode: 'BEC202', facultyId: 'FAC_BS_002', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25EC001', '4VP25EC002', '4VP25EC003'] },
  { id: 'ALLOC_S2_EC_A_03', subjectCode: 'BEC203', facultyId: 'FAC_BS_005', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25EC001', '4VP25EC002', '4VP25EC003'] },
  // MECH Sem 2 - Physics Stream
  { id: 'ALLOC_S2_ME_A_01', subjectCode: 'BME201', facultyId: 'FAC_BS_004', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25ME001', '4VP25ME002', '4VP25ME003'] },
  { id: 'ALLOC_S2_ME_A_02', subjectCode: 'BME202', facultyId: 'FAC_BS_002', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25ME001', '4VP25ME002', '4VP25ME003'] },
  { id: 'ALLOC_S2_ME_A_03', subjectCode: 'BME203', facultyId: 'FAC_BS_005', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25ME001', '4VP25ME002', '4VP25ME003'] },
  // AIML Sem 2 - Chemistry Stream
  { id: 'ALLOC_S2_AI_A_01', subjectCode: 'BAI201', facultyId: 'FAC_BS_001', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25AI001', '4VP25AI002', '4VP25AI003'] },
  { id: 'ALLOC_S2_AI_A_02', subjectCode: 'BAI202', facultyId: 'FAC_BS_002', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25AI001', '4VP25AI002', '4VP25AI003'] },
  { id: 'ALLOC_S2_AI_A_03', subjectCode: 'BAI203', facultyId: 'FAC_BS_003', semester: 2, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP25AI001', '4VP25AI002', '4VP25AI003'] },

  // ==================== SEMESTER 4 (Second Year) ====================
  { id: 'ALLOC_S4_CS_A_01', subjectCode: 'BCS401', facultyId: 'FAC_CSE_002', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24CS001', '4VP24CS002', '4VP24CS003'] },
  { id: 'ALLOC_S4_CS_A_02', subjectCode: 'BCS402', facultyId: 'FAC_CSE_003', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24CS001', '4VP24CS002', '4VP24CS003'] },
  { id: 'ALLOC_S4_CS_A_03', subjectCode: 'BCS403', facultyId: 'FAC_CSE_001', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24CS001', '4VP24CS002', '4VP24CS003'] },
  { id: 'ALLOC_S4_CS_A_04', subjectCode: 'BCS404', facultyId: 'FAC_CSE_004', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24CS001', '4VP24CS002', '4VP24CS003'] },
  { id: 'ALLOC_S4_CS_A_05', subjectCode: 'BCS405A', facultyId: 'FAC_CSE_005', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24CS001', '4VP24CS002', '4VP24CS003'] },
  { id: 'ALLOC_S4_CS_B_01', subjectCode: 'BCS401', facultyId: 'FAC_CSE_002', semester: 4, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP24CS004', '4VP24CS005'] },
  { id: 'ALLOC_S4_CS_B_02', subjectCode: 'BCS402', facultyId: 'FAC_CSE_003', semester: 4, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP24CS004', '4VP24CS005'] },
  { id: 'ALLOC_S4_CS_B_03', subjectCode: 'BCS403', facultyId: 'FAC_CSE_001', semester: 4, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP24CS004', '4VP24CS005'] },
  // ECE Sem 4
  { id: 'ALLOC_S4_EC_A_01', subjectCode: 'BEC401', facultyId: 'FAC_ECE_001', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24EC001', '4VP24EC002', '4VP24EC003'] },
  { id: 'ALLOC_S4_EC_A_02', subjectCode: 'BEC402', facultyId: 'FAC_ECE_002', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24EC001', '4VP24EC002', '4VP24EC003'] },
  { id: 'ALLOC_S4_EC_A_03', subjectCode: 'BEC403', facultyId: 'FAC_ECE_003', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24EC001', '4VP24EC002', '4VP24EC003'] },
  { id: 'ALLOC_S4_EC_A_04', subjectCode: 'BEC404', facultyId: 'FAC_ECE_004', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24EC001', '4VP24EC002', '4VP24EC003'] },
  // MECH Sem 4
  { id: 'ALLOC_S4_ME_A_01', subjectCode: 'BME401', facultyId: 'FAC_MECH_001', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24ME001', '4VP24ME002', '4VP24ME003'] },
  { id: 'ALLOC_S4_ME_A_02', subjectCode: 'BME402', facultyId: 'FAC_MECH_002', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24ME001', '4VP24ME002', '4VP24ME003'] },
  { id: 'ALLOC_S4_ME_A_03', subjectCode: 'BME403', facultyId: 'FAC_MECH_003', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24ME001', '4VP24ME002', '4VP24ME003'] },
  { id: 'ALLOC_S4_ME_A_04', subjectCode: 'BME404', facultyId: 'FAC_MECH_004', semester: 4, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP24ME001', '4VP24ME002', '4VP24ME003'] },

  // ==================== SEMESTER 6 (Third Year) ====================
  { id: 'ALLOC_S6_CS_A_01', subjectCode: 'BCS601', facultyId: 'FAC_CSE_005', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23CS001', '4VP23CS002', '4VP23CS003'] },
  { id: 'ALLOC_S6_CS_A_02', subjectCode: 'BCS602', facultyId: 'FAC_CSE_003', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23CS001', '4VP23CS002', '4VP23CS003'] },
  { id: 'ALLOC_S6_CS_A_03', subjectCode: 'BCS603', facultyId: 'FAC_CSE_004', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23CS001', '4VP23CS002', '4VP23CS003'] },
  { id: 'ALLOC_S6_CS_A_04', subjectCode: 'BCS604A', facultyId: 'FAC_CSE_001', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23CS001', '4VP23CS002', '4VP23CS003'] },
  { id: 'ALLOC_S6_CS_B_01', subjectCode: 'BCS601', facultyId: 'FAC_CSE_005', semester: 6, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP23CS004', '4VP23CS005'] },
  { id: 'ALLOC_S6_CS_B_02', subjectCode: 'BCS602', facultyId: 'FAC_CSE_003', semester: 6, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP23CS004', '4VP23CS005'] },
  // ECE Sem 6
  { id: 'ALLOC_S6_EC_A_01', subjectCode: 'BEC601', facultyId: 'FAC_ECE_002', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23EC001', '4VP23EC002', '4VP23EC003'] },
  { id: 'ALLOC_S6_EC_A_02', subjectCode: 'BEC602', facultyId: 'FAC_ECE_003', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23EC001', '4VP23EC002', '4VP23EC003'] },
  { id: 'ALLOC_S6_EC_A_03', subjectCode: 'BEC603', facultyId: 'FAC_ECE_001', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23EC001', '4VP23EC002', '4VP23EC003'] },
  // MECH Sem 6
  { id: 'ALLOC_S6_ME_A_01', subjectCode: 'BME601', facultyId: 'FAC_MECH_002', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23ME001', '4VP23ME002'] },
  { id: 'ALLOC_S6_ME_A_02', subjectCode: 'BME602', facultyId: 'FAC_MECH_003', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23ME001', '4VP23ME002'] },
  { id: 'ALLOC_S6_ME_A_03', subjectCode: 'BME603', facultyId: 'FAC_MECH_004', semester: 6, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP23ME001', '4VP23ME002'] },

  // ==================== SEMESTER 8 (Final Year) ====================
  { id: 'ALLOC_S8_CS_A_01', subjectCode: 'BCS801', facultyId: 'FAC_CSE_001', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22CS001', '4VP22CS002', '4VP22CS003'] },
  { id: 'ALLOC_S8_CS_A_02', subjectCode: 'BCS802A', facultyId: 'FAC_CSE_002', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22CS001', '4VP22CS002'] },
  { id: 'ALLOC_S8_CS_A_03', subjectCode: 'BCS803B', facultyId: 'FAC_CSE_003', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22CS003'] },
  { id: 'ALLOC_S8_CS_B_01', subjectCode: 'BCS801', facultyId: 'FAC_CSE_004', semester: 8, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP22CS004', '4VP22CS005'] },
  { id: 'ALLOC_S8_CS_B_02', subjectCode: 'BCS802B', facultyId: 'FAC_CSE_005', semester: 8, section: 'B', academicYear: '2025-2026', studentUsns: ['4VP22CS004', '4VP22CS005'] },
  // ECE Sem 8
  { id: 'ALLOC_S8_EC_A_01', subjectCode: 'BEC801', facultyId: 'FAC_ECE_001', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22EC001', '4VP22EC002', '4VP22EC003'] },
  { id: 'ALLOC_S8_EC_A_02', subjectCode: 'BEC802A', facultyId: 'FAC_ECE_002', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22EC001', '4VP22EC002'] },
  // MECH Sem 8
  { id: 'ALLOC_S8_ME_A_01', subjectCode: 'BME801', facultyId: 'FAC_MECH_001', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22ME001', '4VP22ME002'] },
  { id: 'ALLOC_S8_ME_A_02', subjectCode: 'BME802A', facultyId: 'FAC_MECH_002', semester: 8, section: 'A', academicYear: '2025-2026', studentUsns: ['4VP22ME001'] },
];
