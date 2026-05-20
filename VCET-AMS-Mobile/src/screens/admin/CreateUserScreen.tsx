import React, { useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getAllDepartments } from '../../constants/departments';
import { suggestPassword, generateBulkUSNs, suggestParentPassword, validateUSN } from '../../utils/passwordUtils';
import Card from '../../components/Card';

type Mode = 'single' | 'bulk';
type Step = '1' | '2' | '2b' | '3';
type Role = 'STUDENT' | 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'PARENT' | 'ADMISSION_CELL';

const STAFF_ROLES: Role[] = ['FACULTY', 'HOD', 'PRINCIPAL', 'ADMISSION_CELL'];
const ALL_ROLES: Role[] = ['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL', 'PARENT', 'ADMISSION_CELL'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const SEMESTERS = [2, 4, 6, 8];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER'] as const;
const INCOME_SLABS = ['<1L', '1-3L', '3-6L', '6-10L', '>10L'] as const;
const ADMISSION_TYPES = ['REGULAR', 'LATERAL', 'MANAGEMENT', 'NRI'] as const;

type SectionId =
  | 'personal'
  | 'location'
  | 'caste'
  | 'family'
  | 'sslc'
  | 'puc'
  | 'entrance'
  | 'documents';

const SECTION_META: { id: SectionId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'personal', label: 'Personal Information', icon: 'person-outline' },
  { id: 'location', label: 'Birth & Location', icon: 'location-outline' },
  { id: 'caste', label: 'Caste & Category', icon: 'shield-outline' },
  { id: 'family', label: 'Family & Income', icon: 'people-outline' },
  { id: 'sslc', label: 'SSLC Details', icon: 'school-outline' },
  { id: 'puc', label: 'PUC / Diploma', icon: 'book-outline' },
  { id: 'entrance', label: 'CET / JEE / COMEDK', icon: 'trophy-outline' },
  { id: 'documents', label: 'Documents & Admission', icon: 'document-outline' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateUserScreen({ visible, onClose }: Props) {
  const { addUser, getHODForDepartment } = useAdminStore();
  const { colors } = useAppTheme();
  const departments = getAllDepartments();

  const [step, setStep] = useState<Step>('1');
  const [mode, setMode] = useState<Mode>('single');

  const [formRole, setFormRole] = useState<Role>('STUDENT');
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formPassword, setFormPassword] = useState(suggestPassword());
  const [formDepartment, setFormDepartment] = useState('');
  const [formSection, setFormSection] = useState('A');
  const [formSemester, setFormSemester] = useState(2);
  const [formDob, setFormDob] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formWardUsn, setFormWardUsn] = useState('');
  const [formRelationship, setFormRelationship] = useState('Father');

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['personal']));

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [altMobile, setAltMobile] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [hometown, setHometown] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('Karnataka');
  const [nationality, setNationality] = useState('Indian');
  const [motherTongue, setMotherTongue] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [subCaste, setSubCaste] = useState('');
  const [category, setCategory] = useState<string>('GENERAL');
  const [isSC, setIsSC] = useState(false);
  const [isST, setIsST] = useState(false);
  const [isOBC, setIsOBC] = useState(false);
  const [isEWS, setIsEWS] = useState(false);
  const [isGadinudu, setIsGadinudu] = useState(false);
  const [isRural, setIsRural] = useState(false);
  const [isPH, setIsPH] = useState(false);
  const [phType, setPhType] = useState('');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [fatherName, setFatherName] = useState('');
  const [fatherOcc, setFatherOcc] = useState('');
  const [fatherMobile, setFatherMobile] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [fatherQual, setFatherQual] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOcc, setMotherOcc] = useState('');
  const [motherMobile, setMotherMobile] = useState('');
  const [motherEmail, setMotherEmail] = useState('');
  const [motherQual, setMotherQual] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRel, setGuardianRel] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [guardianAddr, setGuardianAddr] = useState('');
  const [sslcBoard, setSslcBoard] = useState('');
  const [sslcSchool, setSslcSchool] = useState('');
  const [sslcPassYear, setSslcPassYear] = useState('');
  const [sslcMax, setSslcMax] = useState('');
  const [sslcObtained, setSslcObtained] = useState('');
  const [sslcPct, setSslcPct] = useState('');
  const [sslcLang, setSslcLang] = useState('');
  const [qualifyingExam, setQualifyingExam] = useState<'PUC' | 'DIPLOMA'>('PUC');
  const [pucBoard, setPucBoard] = useState('');
  const [pucCollege, setPucCollege] = useState('');
  const [pucPassYear, setPucPassYear] = useState('');
  const [pucMax, setPucMax] = useState('');
  const [pucObtained, setPucObtained] = useState('');
  const [pucPct, setPucPct] = useState('');
  const [pucPcmMarks, setPucPcmMarks] = useState('');
  const [pucPcmPct, setPucPcmPct] = useState('');
  const [pucLang, setPucLang] = useState('');
  const [dipBoard, setDipBoard] = useState('');
  const [dipCollege, setDipCollege] = useState('');
  const [dipPassYear, setDipPassYear] = useState('');
  const [dipBranch, setDipBranch] = useState('');
  const [dipPct, setDipPct] = useState('');
  const [cetRank, setCetRank] = useState('');
  const [cetScore, setCetScore] = useState('');
  const [jeeRank, setJeeRank] = useState('');
  const [comedk, setComedk] = useState(false);
  const [comedkRank, setComedkRank] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionType, setAdmissionType] = useState<string>('REGULAR');
  const [hasSslcMarksheet, setHasSslcMarksheet] = useState(false);
  const [hasPucMarksheet, setHasPucMarksheet] = useState(false);
  const [hasCasteCert, setHasCasteCert] = useState(false);
  const [hasIncomeCert, setHasIncomeCert] = useState(false);
  const [hasTc, setHasTc] = useState(false);
  const [hasAadhaar, setHasAadhaar] = useState(false);
  const [hasMigration, setHasMigration] = useState(false);

  const [bulkDept, setBulkDept] = useState('CSE');
  const [bulkSection, setBulkSection] = useState('A');
  const [bulkSemester, setBulkSemester] = useState(2);
  const [bulkAcademicYear, setBulkAcademicYear] = useState('2025-2026');
  const [bulkCount, setBulkCount] = useState('30');
  const [bulkStartUSN, setBulkStartUSN] = useState('4VP25CS001');
  const [bulkPassword, setBulkPassword] = useState(suggestPassword());
  const [bulkDobFrom, setBulkDobFrom] = useState('');
  const [bulkDobTo, setBulkDobTo] = useState('');
  const [bulkPreview, setBulkPreview] = useState<string[]>([]);

  const [createdUser, setCreatedUser] = useState<any>(null);
  const [createdCount, setCreatedCount] = useState(0);

  const sslcPercentage = useMemo(() => {
    const max = parseFloat(sslcMax);
    const obt = parseFloat(sslcObtained);
    if (max > 0 && obt >= 0) return ((obt / max) * 100).toFixed(2);
    return '0.00';
  }, [sslcMax, sslcObtained]);

  const pucPercentage = useMemo(() => {
    const max = parseFloat(pucMax);
    const obt = parseFloat(pucObtained);
    if (max > 0 && obt >= 0) return ((obt / max) * 100).toFixed(2);
    return '0.00';
  }, [pucMax, pucObtained]);

  const pcmPercentage = useMemo(() => {
    const pcm = parseFloat(pucPcmMarks);
    if (pcm > 0) return ((pcm / 300) * 100).toFixed(2);
    return '0.00';
  }, [pucPcmMarks]);

  const calculatedAge = useMemo(() => {
    if (!formDob || formDob.length !== 10) return 'Invalid date';
    const birth = new Date(formDob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 14 || age > 35) return `${age} years ⚠ Unusual age`;
    return `${age} years`;
  }, [formDob]);

  const pctColor = (pct: number): string => {
    if (pct >= 60) return 'text-green-400';
    if (pct >= 45) return 'text-amber-400';
    return 'text-red-400';
  };

  const toggleSection = (sec: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sec)) next.delete(sec);
      else next.add(sec);
      return next;
    });
  };

  const reset = () => {
    setStep('1');
    setMode('single');
    setFormRole('STUDENT');
    setFormName('');
    setFormId('');
    setFormPassword(suggestPassword());
    setFormDepartment('');
    setFormSection('A');
    setFormSemester(2);
    setFormDob('');
    setFormParentPhone('');
    setFormDesignation('');
    setFormWardUsn('');
    setFormRelationship('Father');
    setExpandedSections(new Set(['personal']));
    setFirstName(''); setMiddleName(''); setLastName(''); setGender('MALE'); setBloodGroup('');
    setAadhaarNo(''); setMobileNo(''); setAltMobile(''); setPersonalEmail('');
    setBirthPlace(''); setHometown(''); setDistrict(''); setTaluk(''); setPincode('');
    setState('Karnataka'); setNationality('Indian'); setMotherTongue('');
    setReligion(''); setCaste(''); setSubCaste(''); setCategory('GENERAL');
    setIsSC(false); setIsST(false); setIsOBC(false); setIsEWS(false);
    setIsGadinudu(false); setIsRural(false); setIsPH(false); setPhType('');
    setAnnualIncome('');
    setFatherName(''); setFatherOcc(''); setFatherMobile(''); setFatherEmail(''); setFatherQual('');
    setMotherName(''); setMotherOcc(''); setMotherMobile(''); setMotherEmail(''); setMotherQual('');
    setGuardianName(''); setGuardianRel(''); setGuardianMobile(''); setGuardianAddr('');
    setSslcBoard(''); setSslcSchool(''); setSslcPassYear(''); setSslcMax(''); setSslcObtained('');
    setSslcPct(''); setSslcLang('');
    setQualifyingExam('PUC');
    setPucBoard(''); setPucCollege(''); setPucPassYear(''); setPucMax(''); setPucObtained('');
    setPucPct(''); setPucPcmMarks(''); setPucPcmPct(''); setPucLang('');
    setDipBoard(''); setDipCollege(''); setDipPassYear(''); setDipBranch(''); setDipPct('');
    setCetRank(''); setCetScore(''); setJeeRank(''); setComedk(false); setComedkRank('');
    setAdmissionNo(''); setAdmissionDate(''); setAdmissionType('REGULAR');
    setHasSslcMarksheet(false); setHasPucMarksheet(false); setHasCasteCert(false);
    setHasIncomeCert(false); setHasTc(false); setHasAadhaar(false); setHasMigration(false);
    setBulkDept('CSE'); setBulkSection('A'); setBulkSemester(2);
    setBulkAcademicYear('2025-2026'); setBulkCount('30'); setBulkStartUSN('4VP25CS001');
    setBulkPassword(suggestPassword()); setBulkDobFrom(''); setBulkDobTo('');
    setBulkPreview([]); setCreatedUser(null); setCreatedCount(0);
  };

  const handleClose = () => { reset(); onClose(); };
  const handleSuggestPassword = () => setFormPassword(suggestPassword());

  const handleCreateSingle = () => {
    if (!formName.trim() || !formId.trim()) {
      Alert.alert('Error', 'Name and ID are required');
      return;
    }
    if (formRole === 'HOD') {
      if (!formDepartment) {
        Alert.alert('Error', 'Department is required for HOD accounts');
        return;
      }
      const existing = getHODForDepartment(formDepartment);
      if (existing) {
        Alert.alert(
          'HOD Conflict',
          `HOD already assigned for ${formDepartment} (${existing.name}). Continue?`,
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: doCreateSingle }]
        );
        return;
      }
    }
    doCreateSingle();
  };

  const doCreateSingle = () => {
    if (formRole === 'STUDENT') {
      const studentUser: any = {
        id: formId,
        name: formName.trim(),
        role: 'STUDENT',
        password: formPassword,
        department: formDepartment,
        section: formSection,
        semester: formSemester,
        dateOfBirth: formDob,
        parentPhone: formParentPhone,
        email: `${formId.toLowerCase()}@student.vcet.ac.in`,
        firstName: firstName || formName.trim().split(' ')[0],
        middleName,
        lastName,
        gender,
        bloodGroup,
        aadhaarNo,
        mobileNo,
        alternateMobile: altMobile,
        personalEmail,
        birthPlace,
        hometown,
        district,
        taluk,
        pincode,
        state,
        nationality,
        motherTongue,
        religion,
        caste,
        subCaste,
        category,
        isSC, isST, isOBC, isEWS,
        isGadinuduKannadiga: isGadinudu,
        isRural,
        isPHCandidate: isPH,
        phType,
        annualFamilyIncome: annualIncome,
        fatherName, fatherOccupation: fatherOcc, fatherMobile, fatherEmail, fatherQualification: fatherQual,
        motherName, motherOccupation: motherOcc, motherMobile, motherEmail, motherQualification: motherQual,
        guardianName, guardianRelation: guardianRel, guardianMobile, guardianAddress: guardianAddr,
        sslcBoard, sslcSchool, sslcPassYear: sslcPassYear ? parseInt(sslcPassYear, 10) : 0,
        sslcMaxMarks: sslcMax ? parseInt(sslcMax, 10) : 0,
        sslcObtainedMarks: sslcObtained ? parseInt(sslcObtained, 10) : 0,
        sslcPercentage: sslcPct ? parseFloat(sslcPct) : 0,
        sslcLanguage: sslcLang,
        qualifyingExam,
        pucBoard, pucCollege,
        pucPassYear: qualifyingExam === 'PUC' && pucPassYear ? parseInt(pucPassYear, 10) : 0,
        pucMaxMarks: qualifyingExam === 'PUC' && pucMax ? parseInt(pucMax, 10) : 0,
        pucObtainedMarks: qualifyingExam === 'PUC' && pucObtained ? parseInt(pucObtained, 10) : 0,
        pucPercentage: qualifyingExam === 'PUC' && pucPct ? parseFloat(pucPct) : 0,
        pucPCMMarks: pucPcmMarks ? parseInt(pucPcmMarks, 10) : 0,
        pucPCMPercentage: pucPcmPct ? parseFloat(pucPcmPct) : 0,
        pucLanguage: pucLang,
        diplomaBoard: dipBoard, diplomaCollege: dipCollege,
        diplomaPassYear: qualifyingExam === 'DIPLOMA' && dipPassYear ? parseInt(dipPassYear, 10) : null,
        diplomaBranch: dipBranch,
        diplomaPercentage: qualifyingExam === 'DIPLOMA' && dipPct ? parseFloat(dipPct) : null,
        cetRank: cetRank ? parseInt(cetRank, 10) : null,
        cetScore: cetScore ? parseInt(cetScore, 10) : null,
        jeeRank: jeeRank ? parseInt(jeeRank, 10) : null,
        comedk,
        comdekRank: comedkRank ? parseInt(comedkRank, 10) : null,
        admissionNo, admissionDate, admissionType,
        hasSslcMarksheet, hasPucMarksheet, hasCasteCertificate: hasCasteCert,
        hasIncomeCertificate: hasIncomeCert, hasTransferCertificate: hasTc,
        hasAadhaarCard: hasAadhaar, hasMigrationCertificate: hasMigration,
      };
      addUser(studentUser);
      setCreatedUser(studentUser);
      setStep('3');
      return;
    }

    const user: any = {
      id: formId,
      name: formName.trim(),
      role: formRole,
      password: formPassword,
      department: (['STUDENT', 'FACULTY', 'HOD'].includes(formRole)) ? formDepartment : undefined,
    };
    if (formRole === 'FACULTY') user.designation = formDesignation || 'Assistant Professor';
    if (formRole === 'HOD') user.designation = 'Head of Department';
    if (formRole === 'PRINCIPAL') user.designation = 'Principal';
    if (formRole === 'ADMISSION_CELL') user.designation = formDesignation || 'Admission Officer';
    if (formRole === 'PARENT') {
      user.wardUsn = formWardUsn;
      user.relationship = formRelationship;
      user.password = formPassword || suggestParentPassword(formWardUsn || formId);
    }
    addUser(user);
    setCreatedUser(user);
    setStep('3');
  };

  const handlePreview = () => {
    const count = parseInt(bulkCount, 10);
    if (!count || count < 1 || count > 60) { Alert.alert('Error', 'Enter a count between 1 and 60'); return; }
    if (!validateUSN(bulkStartUSN)) { Alert.alert('Error', 'Invalid starting USN format. Expected: 4VP25CS001'); return; }
    try {
      const usns = generateBulkUSNs(bulkStartUSN, count);
      setBulkPreview(usns);
      setStep('2b');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const randomDateInRange = (from: string, to: string): string => {
    if (!from || !to) return '';
    const start = new Date(from);
    const end = new Date(to);
    const rand = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return rand.toISOString().split('T')[0];
  };

  const handleConfirmBulk = () => {
    const count = parseInt(bulkCount, 10);
    const usns = generateBulkUSNs(bulkStartUSN, count);
    usns.forEach((usn) => {
      const user: any = {
        id: usn,
        name: `Student ${usn.slice(-3)}`,
        role: 'STUDENT',
        password: bulkPassword,
        department: bulkDept,
        section: bulkSection,
        semester: bulkSemester,
        academicYear: bulkAcademicYear,
        dateOfBirth: randomDateInRange(bulkDobFrom, bulkDobTo) || '2005-06-01',
        email: `${usn.toLowerCase()}@student.vcet.ac.in`,
      };
      addUser(user);
    });
    setCreatedCount(count);
    setCreatedUser(null);
    setStep('3');
  };

  const renderCollapsible = (sectionId: SectionId, label: string, icon: keyof typeof Ionicons.glyphMap, children: React.ReactNode) => {
    const isOpen = expandedSections.has(sectionId);
    return (
      <View className="mb-3">
        <TouchableOpacity
          onPress={() => toggleSection(sectionId)}
          className="flex-row items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
        >
          <View className="flex-row items-center gap-2.5">
            <Ionicons name={icon} size={18} color="#6366F1" />
            <Text className="text-white text-sm font-semibold">{label}</Text>
          </View>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#64748b" />
        </TouchableOpacity>
        {isOpen && <View className="px-1 pt-3">{children}</View>}
      </View>
    );
  };

  const renderToggle = (label: string, value: boolean, onToggle: () => void) => (
    <TouchableOpacity
      onPress={onToggle}
      className={`px-3 py-2 rounded-lg ${value ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}
    >
      <Text className={`text-xs font-medium ${value ? 'text-white' : 'text-slate-300'}`}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPillSet = <T extends string>(items: { label: string; value: T }[], selected: T, onSelect: (v: T) => void) => (
    <View className="flex-row flex-wrap gap-1.5 mb-3">
      {items.map((item) => (
        <TouchableOpacity
          key={item.value}
          onPress={() => onSelect(item.value)}
          className={`px-3 py-1.5 rounded-full ${selected === item.value ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}
        >
          <Text className={`text-xs font-medium ${selected === item.value ? 'text-white' : 'text-slate-300'}`}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInput = (label: string, value: string, onChange: (v: string) => void, opts?: { placeholder?: string; keyboard?: any; cap?: any }) => (
    <View className="mb-2.5">
      <Text className="text-slate-400 text-[11px] mb-1">{label}</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 text-sm"
        value={value}
        onChangeText={onChange}
        placeholder={opts?.placeholder ?? ''}
        placeholderTextColor="#475569"
        keyboardType={opts?.keyboard}
        autoCapitalize={opts?.cap}
      />
    </View>
  );

  const renderStudentForm = () => (
    <ScrollView className="flex-1">
      <Text className="text-white text-lg font-bold mb-1">Create Single User</Text>
      <Text className="text-slate-400 text-xs mb-4">All fields in this form are for student admission</Text>

      <Text className="text-slate-300 text-xs mb-1">Full Name *</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={formName}
        onChangeText={setFormName}
        placeholder="Enter full name"
        placeholderTextColor="#64748b"
      />

      <Text className="text-slate-300 text-xs mb-1">USN *</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={formId}
        onChangeText={setFormId}
        placeholder="e.g., 4VP25CS011"
        placeholderTextColor="#64748b"
        autoCapitalize="characters"
      />

      <Text className="text-slate-300 text-xs mb-1">Role</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {ALL_ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => { setFormRole(r); if (r === 'HOD') setFormDesignation('Head of Department'); if (r === 'FACULTY' && !formDesignation) setFormDesignation('Assistant Professor'); if (r === 'STUDENT') setFormDesignation(''); if (r === 'PRINCIPAL') setFormDesignation('Principal'); }}
            className={`px-3 py-1.5 rounded-full ${formRole === r ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <Text className={`text-xs font-medium ${formRole === r ? 'text-white' : 'text-slate-300'}`}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {formRole === 'STUDENT' ? (
        <>
          <Text className="text-slate-300 text-xs mb-1">Department</Text>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {departments.map((d) => (
              <TouchableOpacity key={d.code} onPress={() => setFormDepartment(d.code)} className={`px-3 py-1.5 rounded-full ${formDepartment === d.code ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'}`}>
                <Text className={`text-xs ${formDepartment === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-slate-300 text-xs mb-1">Section</Text>
              <View className="flex-row gap-1">
                {SECTIONS.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setFormSection(s)} className={`px-3 py-1.5 rounded-lg ${formSection === s ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'}`}>
                    <Text className={`text-xs font-semibold ${formSection === s ? 'text-white' : 'text-slate-300'}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-slate-300 text-xs mb-1">Semester</Text>
              <View className="flex-row gap-1">
                {SEMESTERS.map((sem) => (
                  <TouchableOpacity key={sem} onPress={() => setFormSemester(sem)} className={`px-3 py-1.5 rounded-full ${formSemester === sem ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'}`}>
                    <Text className={`text-xs ${formSemester === sem ? 'text-white' : 'text-slate-300'}`}>Sem {sem}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text className="text-slate-300 text-xs mb-1">Password</Text>
          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
              <Text className="text-green-300 font-mono text-sm">{formPassword}</Text>
            </View>
            <TouchableOpacity onPress={handleSuggestPassword} className="bg-slate-700 px-3 py-3 rounded-lg border border-slate-600">
              <Text className="text-white text-xs font-medium">⟳</Text>
            </TouchableOpacity>
          </View>

          {/* ===== 8 COLLAPSIBLE SECTIONS ===== */}
          {renderCollapsible('personal', 'Personal Information', 'person-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('First Name *', firstName, setFirstName)}</View>
                <View className="flex-1">{renderInput('Middle Name', middleName, setMiddleName)}</View>
                <View className="flex-1">{renderInput('Last Name', lastName, setLastName)}</View>
              </View>
              {renderInput('Date of Birth (YYYY-MM-DD)', formDob, setFormDob, { placeholder: '2007-05-18' })}
              {formDob.length === 10 && (
                <Text className="text-slate-400 text-xs mb-2">Age: {calculatedAge}</Text>
              )}
              <Text className="text-slate-400 text-[11px] mb-1">Gender</Text>
              {renderPillSet(GENDERS.map((g) => ({ label: g, value: g })), gender, setGender)}
              <Text className="text-slate-400 text-[11px] mb-1">Blood Group</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity key={bg} onPress={() => setBloodGroup(bg)} className={`px-3 py-1.5 rounded-full ${bloodGroup === bg ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                    <Text className={`text-xs font-medium ${bloodGroup === bg ? 'text-white' : 'text-slate-300'}`}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {renderInput('Aadhaar No', aadhaarNo, setAadhaarNo, { placeholder: '123456789012', keyboard: 'number-pad' })}
              {renderInput('Mobile No', mobileNo, setMobileNo, { placeholder: '9876543210', keyboard: 'phone-pad' })}
              {renderInput('Alternate Mobile', altMobile, setAltMobile, { placeholder: '9876543211', keyboard: 'phone-pad' })}
              {renderInput('Email', personalEmail, setPersonalEmail, { placeholder: 'student@email.com', keyboard: 'email-address' })}
            </View>
          ))}

          {renderCollapsible('location', 'Birth & Location', 'location-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              {renderInput('Birth Place', birthPlace, setBirthPlace, { placeholder: 'Bengaluru' })}
              {renderInput('Hometown', hometown, setHometown, { placeholder: 'Bengaluru' })}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('District', district, setDistrict, { placeholder: 'Bengaluru Urban' })}</View>
                <View className="flex-1">{renderInput('Taluk', taluk, setTaluk, { placeholder: 'Bengaluru East' })}</View>
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Pincode', pincode, setPincode, { placeholder: '560001', keyboard: 'number-pad' })}</View>
                <View className="flex-1">{renderInput('State', state, setState, { placeholder: 'Karnataka' })}</View>
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Nationality', nationality, setNationality, { placeholder: 'Indian' })}</View>
                <View className="flex-1">{renderInput('Mother Tongue', motherTongue, setMotherTongue, { placeholder: 'Kannada' })}</View>
              </View>
            </View>
          ))}

          {renderCollapsible('caste', 'Caste & Category', 'shield-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              {renderInput('Religion', religion, setReligion, { placeholder: 'Hindu' })}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Caste', caste, setCaste, { placeholder: 'Lingayat' })}</View>
                <View className="flex-1">{renderInput('Sub Caste', subCaste, setSubCaste, { placeholder: 'Lingayat' })}</View>
              </View>
              <Text className="text-slate-400 text-[11px] mb-1">Category</Text>
              {renderPillSet(CATEGORIES.map((c) => ({ label: c, value: c })), category, setCategory)}
              <Text className="text-slate-400 text-[11px] mb-1.5">Flags</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {renderToggle('SC', isSC, () => setIsSC(!isSC))}
                {renderToggle('ST', isST, () => setIsST(!isST))}
                {renderToggle('OBC', isOBC, () => setIsOBC(!isOBC))}
                {renderToggle('EWS', isEWS, () => setIsEWS(!isEWS))}
                {renderToggle('Gadinudu Kannadiga', isGadinudu, () => setIsGadinudu(!isGadinudu))}
                {renderToggle('Rural', isRural, () => setIsRural(!isRural))}
                {renderToggle('PH Candidate', isPH, () => setIsPH(!isPH))}
              </View>
              {isPH && renderInput('PH Type', phType, setPhType, { placeholder: 'LOCOMOTOR / VISUAL / HEARING' })}
            </View>
          ))}

          {renderCollapsible('family', 'Family & Income', 'people-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <Text className="text-slate-400 text-[11px] mb-1">Annual Family Income</Text>
              {renderPillSet(INCOME_SLABS.map((s) => ({ label: s, value: s })), annualIncome, setAnnualIncome)}

              <Text className="text-white text-xs font-bold mt-4 mb-2">Father</Text>
              {renderInput('Father Name', fatherName, setFatherName)}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Occupation', fatherOcc, setFatherOcc)}</View>
                <View className="flex-1">{renderInput('Mobile', fatherMobile, setFatherMobile, { keyboard: 'phone-pad' })}</View>
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Email', fatherEmail, setFatherEmail, { keyboard: 'email-address' })}</View>
                <View className="flex-1">{renderInput('Education', fatherQual, setFatherQual)}</View>
              </View>

              <Text className="text-white text-xs font-bold mt-4 mb-2">Mother</Text>
              {renderInput('Mother Name', motherName, setMotherName)}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Occupation', motherOcc, setMotherOcc)}</View>
                <View className="flex-1">{renderInput('Mobile', motherMobile, setMotherMobile, { keyboard: 'phone-pad' })}</View>
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Email', motherEmail, setMotherEmail, { keyboard: 'email-address' })}</View>
                <View className="flex-1">{renderInput('Education', motherQual, setMotherQual)}</View>
              </View>

              <Text className="text-white text-xs font-bold mt-4 mb-2">Guardian</Text>
              {renderInput('Guardian Name', guardianName, setGuardianName)}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Relation', guardianRel, setGuardianRel, { placeholder: 'Father' })}</View>
                <View className="flex-1">{renderInput('Mobile', guardianMobile, setGuardianMobile, { keyboard: 'phone-pad' })}</View>
              </View>
              {renderInput('Address', guardianAddr, setGuardianAddr, { placeholder: 'Full address' })}
            </View>
          ))}

          {renderCollapsible('sslc', 'SSLC Details', 'school-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              {renderInput('Board', sslcBoard, setSslcBoard, { placeholder: 'KSEEB' })}
              {renderInput('School Name', sslcSchool, setSslcSchool, { placeholder: 'St. Joseph\'s High School' })}
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Pass Year', sslcPassYear, setSslcPassYear, { placeholder: '2021', keyboard: 'number-pad' })}</View>
                <View className="flex-1">{renderInput('Language', sslcLang, setSslcLang, { placeholder: 'Kannada' })}</View>
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('Max Marks', sslcMax, setSslcMax, { placeholder: '625', keyboard: 'number-pad' })}</View>
                <View className="flex-1">{renderInput('Obtained', sslcObtained, setSslcObtained, { placeholder: '572', keyboard: 'number-pad' })}</View>
                <View className="flex-1">{renderInput('%', sslcPct, setSslcPct, { placeholder: '91.52', keyboard: 'decimal-pad' })}</View>
              </View>
              {parseFloat(sslcMax) > 0 && (
                <Text className={`text-xs ${pctColor(parseFloat(sslcPercentage))} mb-2`}>Percentage: {sslcPercentage}%</Text>
              )}
            </View>
          ))}

          {renderCollapsible('puc', 'PUC / Diploma', 'book-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <Text className="text-slate-400 text-[11px] mb-1">Qualifying Exam</Text>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity onPress={() => setQualifyingExam('PUC')} className={`px-4 py-2 rounded-lg ${qualifyingExam === 'PUC' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                  <Text className={`text-sm font-medium ${qualifyingExam === 'PUC' ? 'text-white' : 'text-slate-300'}`}>PUC / 12th</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setQualifyingExam('DIPLOMA')} className={`px-4 py-2 rounded-lg ${qualifyingExam === 'DIPLOMA' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                  <Text className={`text-sm font-medium ${qualifyingExam === 'DIPLOMA' ? 'text-white' : 'text-slate-300'}`}>Diploma</Text>
                </TouchableOpacity>
              </View>

              {qualifyingExam === 'PUC' ? (
                <>
                  {renderInput('Board', pucBoard, setPucBoard, { placeholder: 'Dept of Pre-University Education' })}
                  {renderInput('College', pucCollege, setPucCollege, { placeholder: 'Vijaya PU College' })}
                  <View className="flex-row gap-2 mb-2">
                    <View className="flex-1">{renderInput('Pass Year', pucPassYear, setPucPassYear, { placeholder: '2023', keyboard: 'number-pad' })}</View>
                    <View className="flex-1">{renderInput('Language', pucLang, setPucLang, { placeholder: 'English' })}</View>
                  </View>
                  <View className="flex-row gap-2 mb-2">
                    <View className="flex-1">{renderInput('Max Marks', pucMax, setPucMax, { placeholder: '600', keyboard: 'number-pad' })}</View>
                    <View className="flex-1">{renderInput('Obtained', pucObtained, setPucObtained, { placeholder: '543', keyboard: 'number-pad' })}</View>
                    <View className="flex-1">{renderInput('%', pucPct, setPucPct, { placeholder: '90.5', keyboard: 'decimal-pad' })}</View>
                  </View>
                  {parseFloat(pucMax) > 0 && (
                    <Text className={`text-xs ${pctColor(parseFloat(pucPercentage))} mb-2`}>Percentage: {pucPercentage}%</Text>
                  )}
                  <View className="flex-row gap-2 mb-2">
                    <View className="flex-1">{renderInput('PCM Marks (out of 300)', pucPcmMarks, setPucPcmMarks, { placeholder: '265', keyboard: 'number-pad' })}</View>
                    <View className="flex-1">{renderInput('PCM %', pucPcmPct, setPucPcmPct, { placeholder: '88.33', keyboard: 'decimal-pad' })}</View>
                  </View>
                  {parseFloat(pucPcmMarks) > 0 && (
                    <>
                      <Text className={`text-xs ${pctColor(parseFloat(pcmPercentage))} mb-1`}>PCM Percentage: {pcmPercentage}%</Text>
                      {parseFloat(pcmPercentage) < 45 && (
                        <Text className="text-amber-400 text-xs mb-2">Below VTU minimum (45%)</Text>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {renderInput('Board', dipBoard, setDipBoard, { placeholder: 'DTE Karnataka' })}
                  {renderInput('College', dipCollege, setDipCollege, { placeholder: 'Govt Polytechnic' })}
                  <View className="flex-row gap-2 mb-2">
                    <View className="flex-1">{renderInput('Pass Year', dipPassYear, setDipPassYear, { placeholder: '2024', keyboard: 'number-pad' })}</View>
                    <View className="flex-1">{renderInput('Branch', dipBranch, setDipBranch, { placeholder: 'ECE' })}</View>
                    <View className="flex-1">{renderInput('%', dipPct, setDipPct, { placeholder: '78.5', keyboard: 'decimal-pad' })}</View>
                  </View>
                </>
              )}
            </View>
          ))}

          {renderCollapsible('entrance', 'CET / JEE / COMEDK', 'trophy-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <View className="flex-row gap-2 mb-2">
                <View className="flex-1">{renderInput('CET Rank', cetRank, setCetRank, { placeholder: '2450', keyboard: 'number-pad' })}</View>
                <View className="flex-1">{renderInput('CET Score', cetScore, setCetScore, { placeholder: '125', keyboard: 'number-pad' })}</View>
              </View>
              {renderInput('JEE Rank (if any)', jeeRank, setJeeRank, { placeholder: '50000', keyboard: 'number-pad' })}
              <View className="flex-row items-center gap-2 mb-2">
                {renderToggle('COMEDK', comedk, () => setComedk(!comedk))}
              </View>
              {comedk && renderInput('COMEDK Rank', comedkRank, setComedkRank, { placeholder: '5800', keyboard: 'number-pad' })}
            </View>
          ))}

          {renderCollapsible('documents', 'Documents & Admission', 'document-outline', (
            <View className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              {renderInput('Admission No', admissionNo, setAdmissionNo, { placeholder: 'VCET2025001' })}
              {renderInput('Admission Date (YYYY-MM-DD)', admissionDate, setAdmissionDate, { placeholder: '2025-08-01' })}
              <Text className="text-slate-400 text-[11px] mb-1">Admission Type</Text>
              {renderPillSet(ADMISSION_TYPES.map((t) => ({ label: t, value: t })), admissionType, setAdmissionType)}
              <Text className="text-slate-400 text-[11px] mb-1.5 mt-2">Documents Submitted</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {renderToggle('SSLC Marksheet', hasSslcMarksheet, () => setHasSslcMarksheet(!hasSslcMarksheet))}
                {renderToggle('PUC Marksheet', hasPucMarksheet, () => setHasPucMarksheet(!hasPucMarksheet))}
                {renderToggle('Caste Cert', hasCasteCert, () => setHasCasteCert(!hasCasteCert))}
                {renderToggle('Income Cert', hasIncomeCert, () => setHasIncomeCert(!hasIncomeCert))}
                {renderToggle('TC', hasTc, () => setHasTc(!hasTc))}
                {renderToggle('Aadhaar', hasAadhaar, () => setHasAadhaar(!hasAadhaar))}
                {renderToggle('Migration', hasMigration, () => setHasMigration(!hasMigration))}
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={handleCreateSingle} className="bg-green-600 rounded-xl py-3.5 items-center mt-2">
            <Text className="text-white font-bold">Create Student</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* ===== STAFF ROLES ===== */}
          {STAFF_ROLES.includes(formRole) && (
            <>
              <Text className="text-slate-300 text-xs mb-1">Department</Text>
              <View className="flex-row flex-wrap gap-1 mb-3">
                {departments.map((d) => (
                  <TouchableOpacity key={d.code} onPress={() => setFormDepartment(d.code)} className={`px-3 py-1.5 rounded-full ${formDepartment === d.code ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'}`}>
                    <Text className={`text-xs ${formDepartment === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formRole !== 'HOD' && formRole !== 'PRINCIPAL' && (
                <>
                  <Text className="text-slate-300 text-xs mb-1">Designation</Text>
                  <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={formDesignation} onChangeText={setFormDesignation} placeholder="Assistant Professor" placeholderTextColor="#64748b" />
                </>
              )}
              <Text className="text-slate-300 text-xs mb-1">Date of Birth</Text>
              <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={formDob} onChangeText={setFormDob} placeholder="1989-08-22" placeholderTextColor="#64748b" />
            </>
          )}
          {formRole === 'PARENT' && (
            <>
              <Text className="text-slate-300 text-xs mb-1">Ward USN</Text>
              <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={formWardUsn} onChangeText={setFormWardUsn} placeholder="4VP25CS001" placeholderTextColor="#64748b" autoCapitalize="characters" />
              <Text className="text-slate-300 text-xs mb-1">Relationship</Text>
              <View className="flex-row gap-2 mb-3">
                {['Father', 'Mother', 'Guardian'].map((rel) => (
                  <TouchableOpacity key={rel} onPress={() => setFormRelationship(rel)} className={`px-4 py-2 rounded-lg ${formRelationship === rel ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                    <Text className={`text-sm ${formRelationship === rel ? 'text-white' : 'text-slate-300'}`}>{rel}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <Text className="text-slate-300 text-xs mb-1">Password</Text>
          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
              <Text className="text-green-300 font-mono text-sm">{formPassword}</Text>
            </View>
            <TouchableOpacity onPress={handleSuggestPassword} className="bg-slate-700 px-3 py-3 rounded-lg border border-slate-600">
              <Text className="text-white text-xs font-medium">⟳</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity onPress={() => setStep('1')} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateSingle} className="flex-[2] bg-green-600 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Create User</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  const handlePrintAdmission = async () => {
    const data = createdUser;
    if (!data) return;
    const html = generateAdmissionReceiptHTML(data);
    await Print.printAsync({ html });
  };

  function generateAdmissionReceiptHTML(data: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
          .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 20px; }
          .college-name { font-size: 20px; font-weight: bold; }
          .sub { font-size: 13px; color: #555; }
          .title { font-size: 16px; font-weight: bold; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
          .row { display: flex; margin-bottom: 6px; }
          .label { width: 200px; font-weight: 600; color: #333; font-size: 13px; }
          .value { flex: 1; font-size: 13px; }
          .section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 16px; }
          .highlight { background: #f0f9ff; border-color: #3b82f6; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; }
          .pwd { font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="college-name">VCET — Vivekananda College of Engineering & Technology</div>
          <div class="sub">Affiliated to Visvesvaraya Technological University (VTU), Belagavi</div>
          <div class="sub" style="margin-top:8px; font-size:15px; font-weight:600;">STUDENT ADMISSION RECEIPT</div>
        </div>

        <div class="section highlight">
          <div class="title">🎓 Academic Details</div>
          <div class="row"><span class="label">USN</span><span class="value">${data.id ?? '—'}</span></div>
          <div class="row"><span class="label">Admission No</span><span class="value">${data.admissionNo ?? '—'}</span></div>
          <div class="row"><span class="label">Department</span><span class="value">${data.department ?? '—'} — ${data.branch ?? ''}</span></div>
          <div class="row"><span class="label">Semester / Section</span><span class="value">Sem ${data.semester ?? '—'} / Section ${data.section ?? '—'}</span></div>
          <div class="row"><span class="label">Academic Year</span><span class="value">${data.academicYear ?? '2025-26'}</span></div>
          <div class="row"><span class="label">Admission Type</span><span class="value">${data.admissionType ?? '—'}</span></div>
        </div>

        <div class="section">
          <div class="title">👤 Personal Details</div>
          <div class="row"><span class="label">Full Name</span><span class="value">${[data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ')}</span></div>
          <div class="row"><span class="label">Date of Birth</span><span class="value">${data.dateOfBirth ?? '—'}</span></div>
          <div class="row"><span class="label">Gender</span><span class="value">${data.gender ?? '—'}</span></div>
          <div class="row"><span class="label">Mobile</span><span class="value">${data.mobileNo ?? '—'}</span></div>
          <div class="row"><span class="label">Email</span><span class="value">${data.email ?? '—'}</span></div>
          <div class="row"><span class="label">Category</span><span class="value">${data.category ?? '—'}${data.isGadinuduKannadiga ? ' | Gadinadu Kannadiga' : ''}</span></div>
        </div>

        <div class="section">
          <div class="title">📚 Academic Background</div>
          <div class="row"><span class="label">SSLC (10th)</span><span class="value">${data.sslcBoard ?? '—'} | ${data.sslcPercentage ?? 0}%</span></div>
          <div class="row"><span class="label">PUC / 12th</span><span class="value">${data.pucBoard ?? '—'} | ${data.pucPercentage ?? 0}% | PCM: ${data.pucPCMPercentage ?? 0}%</span></div>
          <div class="row"><span class="label">KCET Rank</span><span class="value">${data.cetRank ?? 'Not applicable'}</span></div>
        </div>

        <div class="section">
          <div class="title">👨‍👩‍👦 Family Details</div>
          <div class="row"><span class="label">Father's Name</span><span class="value">${data.fatherName ?? '—'} (${data.fatherMobile ?? '—'})</span></div>
          <div class="row"><span class="label">Mother's Name</span><span class="value">${data.motherName ?? '—'}</span></div>
        </div>

        <div class="section highlight">
          <div class="title">🔐 Login Credentials (Confidential)</div>
          <div class="row"><span class="label">Student Login ID</span><span class="value pwd">${data.id ?? '—'}</span></div>
          <div class="row"><span class="label">Student Password</span><span class="value pwd">${data.password ?? '—'}</span></div>
          <div class="row"><span class="label">Parent Login ID</span><span class="value pwd">${data.id ?? '—'}</span></div>
          <div class="row"><span class="label">Parent Password</span><span class="value pwd">${data.parentPassword ?? '—'}</span></div>
          <div style="margin-top:8px; font-size:11px; color:#e53e3e; font-weight:600;">
            ⚠ Keep these credentials confidential. Change password on first login.
          </div>
        </div>

        <div class="footer">
          Printed on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          &nbsp;|&nbsp; VCET Academic Monitoring System
          &nbsp;|&nbsp; This is a computer-generated document
        </div>
      </body>
      </html>
    `;
  }

  const renderStep1 = () => (
    <View>
      <Text className="text-white text-lg font-bold mb-4">Choose Creation Mode</Text>
      <View className="gap-4">
        <TouchableOpacity onPress={() => { setMode('single'); setStep('2'); }} className="bg-slate-800 border border-slate-700 rounded-xl p-5 active:bg-slate-700">
          <Text className="text-white text-base font-bold">Single User</Text>
          <Text className="text-slate-400 text-sm mt-1">Faculty, HOD, Principal, Parent, Student</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setMode('bulk'); setStep('2b'); }} className="bg-slate-800 border border-slate-700 rounded-xl p-5 active:bg-slate-700">
          <Text className="text-white text-base font-bold">Bulk Students</Text>
          <Text className="text-slate-400 text-sm mt-1">Admission Cell — batch enrollment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBulkForm = () => (
    <ScrollView className="flex-1">
      <Text className="text-white text-lg font-bold mb-4">Bulk Student Creation</Text>
      <Text className="text-slate-400 text-xs mb-4">Admission Cell — batch register students for a semester</Text>
      <Text className="text-slate-300 text-xs mb-1">Department</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {departments.map((d) => (
          <TouchableOpacity key={d.code} onPress={() => setBulkDept(d.code)} className={`px-3 py-1.5 rounded-full ${bulkDept === d.code ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}>
            <Text className={`text-xs ${bulkDept === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-slate-300 text-xs mb-1">Section</Text>
      <View className="flex-row gap-2 mb-3">
        {SECTIONS.map((s) => (
          <TouchableOpacity key={s} onPress={() => setBulkSection(s)} className={`px-4 py-2 rounded-lg ${bulkSection === s ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'}`}>
            <Text className={`text-sm font-semibold ${bulkSection === s ? 'text-white' : 'text-slate-300'}`}>Sec {s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-slate-300 text-xs mb-1">Semester</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {SEMESTERS.map((sem) => (
          <TouchableOpacity key={sem} onPress={() => setBulkSemester(sem)} className={`px-3 py-1.5 rounded-full ${bulkSemester === sem ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'}`}>
            <Text className={`text-xs ${bulkSemester === sem ? 'text-white' : 'text-slate-300'}`}>Sem {sem}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-slate-300 text-xs mb-1">Academic Year</Text>
      <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={bulkAcademicYear} onChangeText={setBulkAcademicYear} placeholder="2025-2026" placeholderTextColor="#64748b" />
      <Text className="text-slate-300 text-xs mb-1">Number of Students (1-60)</Text>
      <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={bulkCount} onChangeText={setBulkCount} keyboardType="number-pad" placeholder="30" placeholderTextColor="#64748b" />
      <Text className="text-slate-300 text-xs mb-1">Starting USN</Text>
      <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700" value={bulkStartUSN} onChangeText={setBulkStartUSN} placeholder="4VP25CS001" placeholderTextColor="#64748b" autoCapitalize="characters" />
      <Text className="text-slate-300 text-xs mb-1">Common Password</Text>
      <View className="flex-row items-center gap-2 mb-3">
        <View className="flex-1 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
          <Text className="text-green-300 font-mono text-sm">{bulkPassword}</Text>
        </View>
        <TouchableOpacity onPress={() => setBulkPassword(suggestPassword())} className="bg-slate-700 px-3 py-3 rounded-lg border border-slate-600">
          <Text className="text-white text-xs font-medium">⟳</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-slate-300 text-xs mb-1">DOB Range (From — To)</Text>
      <View className="flex-row gap-2 mb-3">
        <View className="flex-1">
          <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700" value={bulkDobFrom} onChangeText={setBulkDobFrom} placeholder="From (2005-01-01)" placeholderTextColor="#64748b" />
        </View>
        <View className="flex-1">
          <TextInput className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700" value={bulkDobTo} onChangeText={setBulkDobTo} placeholder="To (2005-12-31)" placeholderTextColor="#64748b" />
        </View>
      </View>
      <View className="flex-row gap-3 mt-2">
        <TouchableOpacity onPress={() => setStep('1')} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePreview} className="flex-[2] bg-indigo-600 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Preview Students</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBulkPreview = () => {
    const usns = bulkPreview;
    const count = parseInt(bulkCount, 10);
    const showFirst = usns.slice(0, 5);
    const showLast = usns.slice(-2);
    const showMiddleEllipsis = count > 7;
    const rows = [...showFirst];
    if (showMiddleEllipsis) rows.push('...');
    rows.push(...showLast);
    return (
      <ScrollView className="flex-1">
        <Text className="text-white text-lg font-bold mb-2">Preview ({count} Students)</Text>
        <Text className="text-slate-400 text-xs mb-4">Dept: {bulkDept} | Section {bulkSection} | Sem {bulkSemester} | Pwd: {bulkPassword}</Text>
        <View className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-4">
          <View className="flex-row bg-slate-700 px-3 py-2">
            <Text className="text-slate-300 text-xs font-bold w-8">#</Text>
            <Text className="text-slate-300 text-xs font-bold flex-1">USN</Text>
            <Text className="text-slate-300 text-xs font-bold flex-1">Name</Text>
            <Text className="text-slate-300 text-xs font-bold w-20">Dob</Text>
          </View>
          {rows.map((row, idx) => {
            if (row === '...') {
              return (
                <View key="ellipsis" className="px-3 py-2 border-b border-slate-700">
                  <Text className="text-slate-500 text-xs text-center">...</Text>
                </View>
              );
            }
            const i = usns.indexOf(row);
            const dob = randomDateInRange(bulkDobFrom, bulkDobTo) || '2005-06-01';
            return (
              <View key={row} className="flex-row items-center px-3 py-2 border-b border-slate-700/50">
                <Text className="text-slate-400 text-xs w-8">{i + 1}</Text>
                <Text className="text-white text-xs flex-1 font-mono">{row}</Text>
                <Text className="text-slate-400 text-xs flex-1">Student {row.slice(-3)}</Text>
                <Text className="text-slate-400 text-xs w-20">{dob}</Text>
              </View>
            );
          })}
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => setBulkPreview([])} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirmBulk} className="flex-[2] bg-green-600 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Confirm Create {count} Students</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSuccess = () => (
    <View>
      {createdUser ? (
        <Card className="bg-slate-900 border-green-700 border mb-4">
          <Text className="text-green-400 font-bold text-base mb-3">✓ User Created</Text>
          <View className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <Text className="text-white text-lg font-bold">{createdUser.name}</Text>
            <Text className="text-slate-300 text-sm mt-1">{createdUser.id}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="bg-indigo-600 rounded-full px-2 py-0.5">
                <Text className="text-white text-[10px] font-bold">{createdUser.role}</Text>
              </View>
              {createdUser.department && <Text className="text-slate-400 text-xs">{createdUser.department}</Text>}
            </View>
            <View className="bg-slate-700 rounded-lg px-3 py-2 mt-3">
              <Text className="text-green-300 font-mono text-sm">{createdUser.password}</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">Password shown once — copy it now</Text>
          </View>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-green-700 border mb-4">
          <Text className="text-green-400 font-bold text-base mb-2">✓ {createdCount} Students Created</Text>
          <Text className="text-slate-300 text-sm">{bulkDept} — Section {bulkSection} — Sem {bulkSemester}</Text>
          <Text className="text-slate-400 text-xs mt-1">Batch password: {bulkPassword}</Text>
        </Card>
      )}
      {createdUser?.role === 'STUDENT' && (
        <TouchableOpacity onPress={handlePrintAdmission} className="bg-indigo-600 rounded-xl py-3 items-center mb-3">
          <Text className="text-white font-semibold text-sm">🖨 Print Admission Form</Text>
        </TouchableOpacity>
      )}
      <View className="flex-row gap-3">
        <TouchableOpacity onPress={() => { reset(); setStep('1'); }} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Create Another</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClose} className="flex-1 bg-green-600 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-slate-950 rounded-t-2xl p-5 max-h-[92%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-400 text-xs uppercase tracking-widest">
              Step {mode === 'bulk' && step === '2b' ? '2' : step} of 3
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-slate-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>
          {step === '1' && renderStep1()}
          {step === '2' && renderStudentForm()}
          {step === '2b' && mode === 'bulk' && bulkPreview.length === 0 && renderBulkForm()}
          {step === '2b' && mode === 'bulk' && bulkPreview.length > 0 && renderBulkPreview()}
          {step === '2b' && mode === 'single' && renderBulkForm()}
          {step === '3' && renderSuccess()}
        </View>
      </View>
    </Modal>
  );
}
