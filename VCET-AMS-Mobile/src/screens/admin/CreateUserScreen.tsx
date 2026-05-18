import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useAdminStore } from '../../store/adminStore';
import { getAllDepartments } from '../../constants/departments';
import { suggestPassword, generateBulkUSNs, suggestParentPassword, validateUSN } from '../../utils/passwordUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';

type Mode = 'single' | 'bulk';
type Step = '1' | '2' | '2b' | '3';
type Role = 'STUDENT' | 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'PARENT' | 'ADMISSION_CELL';

const ALL_ROLES: Role[] = ['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL', 'PARENT', 'ADMISSION_CELL'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateUserScreen({ visible, onClose }: Props) {
  const { addUser, getHODForDepartment } = useAdminStore();
  const departments = getAllDepartments();

  // Step state
  const [step, setStep] = useState<Step>('1');
  const [mode, setMode] = useState<Mode>('single');

  // Single user form
  const [formRole, setFormRole] = useState<Role>('STUDENT');
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formPassword, setFormPassword] = useState(suggestPassword());
  const [formDepartment, setFormDepartment] = useState('');
  const [formSection, setFormSection] = useState('A');
  const [formSemester, setFormSemester] = useState(1);
  const [formDob, setFormDob] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formWardUsn, setFormWardUsn] = useState('');
  const [formRelationship, setFormRelationship] = useState('Father');

  // Bulk form
  const [bulkDept, setBulkDept] = useState('CSE');
  const [bulkSection, setBulkSection] = useState('A');
  const [bulkSemester, setBulkSemester] = useState(1);
  const [bulkAcademicYear, setBulkAcademicYear] = useState('2024-25');
  const [bulkCount, setBulkCount] = useState('30');
  const [bulkStartUSN, setBulkStartUSN] = useState('4VP24CS001');
  const [bulkPassword, setBulkPassword] = useState(suggestPassword());
  const [bulkDobFrom, setBulkDobFrom] = useState('');
  const [bulkDobTo, setBulkDobTo] = useState('');
  const [bulkPreview, setBulkPreview] = useState<string[]>([]);

  // Success state
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [createdCount, setCreatedCount] = useState(0);

  const reset = () => {
    setStep('1');
    setMode('single');
    setFormRole('STUDENT');
    setFormName('');
    setFormId('');
    setFormPassword(suggestPassword());
    setFormDepartment('');
    setFormSection('A');
    setFormSemester(1);
    setFormDob('');
    setFormParentPhone('');
    setFormDesignation('');
    setFormWardUsn('');
    setFormRelationship('Father');
    setBulkDept('CSE');
    setBulkSection('A');
    setBulkSemester(1);
    setBulkAcademicYear('2024-25');
    setBulkCount('30');
    setBulkStartUSN('4VP24CS001');
    setBulkPassword(suggestPassword());
    setBulkDobFrom('');
    setBulkDobTo('');
    setBulkPreview([]);
    setCreatedUser(null);
    setCreatedCount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ============ SINGLE USER ============
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
          `HOD already assigned for ${formDepartment} (${existing.name}). Creating this will replace the existing HOD assignment.`,
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: doCreateSingle }]
        );
        return;
      }
    }
    doCreateSingle();
  };

  const doCreateSingle = () => {
    const user: any = {
      id: formId,
      name: formName.trim(),
      role: formRole,
      password: formPassword,
      department: formRole === 'STUDENT' || formRole === 'FACULTY' || formRole === 'HOD' ? formDepartment : undefined,
      designation: formRole !== 'STUDENT' && formRole !== 'PARENT' && formRole !== 'ADMISSION_CELL'
        ? (formDesignation || (formRole === 'HOD' ? 'Head of Department' : ''))
        : undefined,
    };
    if (formRole === 'STUDENT') {
      user.section = formSection;
      user.semester = formSemester;
      user.dateOfBirth = formDob;
      user.parentPhone = formParentPhone;
      user.email = `${formId.toLowerCase()}@student.vcet.ac.in`;
    }
    if (formRole === 'FACULTY') {
      user.dateOfBirth = formDob;
    }
    if (formRole === 'PARENT') {
      user.wardUsn = formWardUsn;
      user.relationship = formRelationship;
      user.password = formPassword || suggestParentPassword(formWardUsn || formId);
    }
    addUser(user);
    setCreatedUser(user);
    setStep('3');
  };

  // ============ BULK ============
  const handlePreview = () => {
    const count = parseInt(bulkCount, 10);
    if (!count || count < 1 || count > 60) {
      Alert.alert('Error', 'Enter a count between 1 and 60');
      return;
    }
    if (!validateUSN(bulkStartUSN)) {
      Alert.alert('Error', 'Invalid starting USN format. Expected: 4VP24CS001');
      return;
    }
    try {
      const usns = generateBulkUSNs(bulkStartUSN, count);
      setBulkPreview(usns);
      setStep('2b');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
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

  // ============ RENDER ============
  const renderStep1 = () => (
    <View>
      <Text className="text-white text-lg font-bold mb-4">Choose Creation Mode</Text>
      <View className="gap-4">
        <TouchableOpacity
          onPress={() => { setMode('single'); setStep('2'); }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 active:bg-slate-700"
        >
          <Text className="text-white text-base font-bold">Single User</Text>
          <Text className="text-slate-400 text-sm mt-1">Any role — one at a time</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setMode('bulk'); setStep('2b'); }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 active:bg-slate-700"
        >
          <Text className="text-white text-base font-bold">Bulk Students</Text>
          <Text className="text-slate-400 text-sm mt-1">One section at a time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSingleForm = () => (
    <ScrollView className="flex-1">
      <Text className="text-white text-lg font-bold mb-4">Create Single User</Text>

      <Text className="text-slate-300 text-xs mb-1">Full Name *</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={formName}
        onChangeText={setFormName}
        placeholder="Enter full name"
        placeholderTextColor="#64748b"
      />

      <Text className="text-slate-300 text-xs mb-1">ID / USN *</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={formId}
        onChangeText={setFormId}
        placeholder="e.g., FAC_CSE_003 or 4VP24CS011"
        placeholderTextColor="#64748b"
        autoCapitalize="characters"
      />

      <Text className="text-slate-300 text-xs mb-1">Role</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {ALL_ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => {
              setFormRole(r);
              if (r === 'HOD' && !formDesignation) setFormDesignation('Head of Department');
              if (r === 'FACULTY' && !formDesignation) setFormDesignation('Assistant Professor');
            }}
            className={`px-3 py-1.5 rounded-full ${formRole === r ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <Text className={`text-xs font-medium ${formRole === r ? 'text-white' : 'text-slate-300'}`}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Department */}
      {(formRole === 'STUDENT' || formRole === 'FACULTY' || formRole === 'HOD') && (
        <>
          <Text className="text-slate-300 text-xs mb-1">
            Department {formRole === 'HOD' ? <Text className="text-red-400">*</Text> : null}
          </Text>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {departments.map((d) => (
              <TouchableOpacity
                key={d.code}
                onPress={() => setFormDepartment(d.code)}
                className={`px-3 py-1.5 rounded-full ${formDepartment === d.code ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs ${formDepartment === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Student fields */}
      {formRole === 'STUDENT' && (
        <>
          <Text className="text-slate-300 text-xs mb-1">Section</Text>
          <View className="flex-row gap-2 mb-3">
            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFormSection(s)}
                className={`px-4 py-2 rounded-lg ${formSection === s ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-sm font-semibold ${formSection === s ? 'text-white' : 'text-slate-300'}`}>Sec {s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-xs mb-1">Semester</Text>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {SEMESTERS.map((sem) => (
              <TouchableOpacity
                key={sem}
                onPress={() => setFormSemester(sem)}
                className={`px-3 py-1.5 rounded-full ${formSemester === sem ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs ${formSemester === sem ? 'text-white' : 'text-slate-300'}`}>Sem {sem}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-xs mb-1">Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formDob}
            onChangeText={setFormDob}
            placeholder="e.g., 2005-06-15"
            placeholderTextColor="#64748b"
          />

          <Text className="text-slate-300 text-xs mb-1">Parent Phone</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formParentPhone}
            onChangeText={setFormParentPhone}
            placeholder="e.g., +91 9845123456"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
          />
        </>
      )}

      {/* Faculty fields */}
      {formRole === 'FACULTY' && (
        <>
          <Text className="text-slate-300 text-xs mb-1">Designation</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formDesignation}
            onChangeText={setFormDesignation}
            placeholder="Assistant Professor"
            placeholderTextColor="#64748b"
          />
          <Text className="text-slate-300 text-xs mb-1">Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formDob}
            onChangeText={setFormDob}
            placeholder="e.g., 1989-08-22"
            placeholderTextColor="#64748b"
          />
        </>
      )}

      {/* HOD fields */}
      {formRole === 'HOD' && (
        <>
          <Text className="text-slate-300 text-xs mb-1">Designation</Text>
          <TextInput
            className="bg-slate-800 text-slate-300 rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formDesignation || 'Head of Department'}
            editable={false}
          />
        </>
      )}

      {/* Parent fields */}
      {formRole === 'PARENT' && (
        <>
          <Text className="text-slate-300 text-xs mb-1">Ward USN (Student USN to link)</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
            value={formWardUsn}
            onChangeText={setFormWardUsn}
            placeholder="e.g., 4VP24CS001"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
          />
          <Text className="text-slate-300 text-xs mb-1">Relationship</Text>
          <View className="flex-row gap-2 mb-3">
            {['Father', 'Mother', 'Guardian'].map((rel) => (
              <TouchableOpacity
                key={rel}
                onPress={() => setFormRelationship(rel)}
                className={`px-4 py-2 rounded-lg ${formRelationship === rel ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-sm ${formRelationship === rel ? 'text-white' : 'text-slate-300'}`}>{rel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Password */}
      <Text className="text-slate-300 text-xs mb-1">
        Password
        {formRole === 'PARENT' && formWardUsn ? (
          <Text className="text-cyan-400 text-xs"> (suggested: {suggestParentPassword(formWardUsn)})</Text>
        ) : null}
      </Text>
      <View className="flex-row items-center gap-2 mb-4">
        <View className="flex-1 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
          <Text className="text-green-300 font-mono text-sm">{formPassword}</Text>
        </View>
        <TouchableOpacity onPress={handleSuggestPassword} className="bg-slate-700 px-3 py-3 rounded-lg border border-slate-600">
          <Text className="text-white text-xs font-medium">⟳</Text>
        </TouchableOpacity>
      </View>
      {formPassword.length < 8 && (
        <Text className="text-amber-400 text-xs -mt-3 mb-3">Weak: password is too short</Text>
      )}
      {formPassword.length >= 8 && /[A-Z]/.test(formPassword) && /\d/.test(formPassword) && /[@#$!&]/.test(formPassword) && (
        <Text className="text-green-400 text-xs -mt-3 mb-3">✓ Strong password</Text>
      )}

      <View className="flex-row gap-3 mt-2">
        <TouchableOpacity onPress={() => setStep('1')} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreateSingle} className="flex-[2] bg-green-600 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Create User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBulkForm = () => (
    <ScrollView className="flex-1">
      <Text className="text-white text-lg font-bold mb-4">Bulk Student Creation</Text>

      <Text className="text-slate-300 text-xs mb-1">Department</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {departments.map((d) => (
          <TouchableOpacity
            key={d.code}
            onPress={() => setBulkDept(d.code)}
            className={`px-3 py-1.5 rounded-full ${bulkDept === d.code ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}
          >
            <Text className={`text-xs ${bulkDept === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-slate-300 text-xs mb-1">Section</Text>
      <View className="flex-row gap-2 mb-3">
        {SECTIONS.slice(0, 3).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setBulkSection(s)}
            className={`px-4 py-2 rounded-lg ${bulkSection === s ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'}`}
          >
            <Text className={`text-sm font-semibold ${bulkSection === s ? 'text-white' : 'text-slate-300'}`}>Sec {s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-slate-300 text-xs mb-1">Semester</Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {SEMESTERS.map((sem) => (
          <TouchableOpacity
            key={sem}
            onPress={() => setBulkSemester(sem)}
            className={`px-3 py-1.5 rounded-full ${bulkSemester === sem ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'}`}
          >
            <Text className={`text-xs ${bulkSemester === sem ? 'text-white' : 'text-slate-300'}`}>Sem {sem}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-slate-300 text-xs mb-1">Academic Year</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={bulkAcademicYear}
        onChangeText={setBulkAcademicYear}
        placeholder="e.g., 2024-25"
        placeholderTextColor="#64748b"
      />

      <Text className="text-slate-300 text-xs mb-1">Number of Students (1-60)</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={bulkCount}
        onChangeText={setBulkCount}
        keyboardType="number-pad"
        placeholder="30"
        placeholderTextColor="#64748b"
      />

      <Text className="text-slate-300 text-xs mb-1">Starting USN</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
        value={bulkStartUSN}
        onChangeText={setBulkStartUSN}
        placeholder="e.g., 4VP24CS001"
        placeholderTextColor="#64748b"
        autoCapitalize="characters"
      />

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
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700"
            value={bulkDobFrom}
            onChangeText={setBulkDobFrom}
            placeholder="From (e.g., 2005-01-01)"
            placeholderTextColor="#64748b"
          />
        </View>
        <View className="flex-1">
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700"
            value={bulkDobTo}
            onChangeText={setBulkDobTo}
            placeholder="To (e.g., 2005-12-31)"
            placeholderTextColor="#64748b"
          />
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
        <Text className="text-slate-400 text-xs mb-4">
          Dept: {bulkDept} | Section {bulkSection} | Sem {bulkSemester} | Pwd: {bulkPassword}
        </Text>

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
              {createdUser.department && (
                <Text className="text-slate-400 text-xs">{createdUser.department}</Text>
              )}
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
          <Text className="text-slate-300 text-sm">
            {bulkDept} — Section {bulkSection} — Sem {bulkSemester}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">Batch password: {bulkPassword}</Text>
        </Card>
      )}

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => { reset(); setStep('1'); }}
          className="flex-1 bg-slate-700 rounded-xl py-3 items-center"
        >
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
          {step === '2' && renderSingleForm()}
          {step === '2b' && mode === 'bulk' && bulkPreview.length === 0 && renderBulkForm()}
          {step === '2b' && mode === 'bulk' && bulkPreview.length > 0 && renderBulkPreview()}
          {step === '2b' && mode === 'single' && renderBulkForm()}
          {    step === '3' && renderSuccess()}
        </View>
      </View>
    </Modal>
  );
}
