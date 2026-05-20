import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import * as Print from 'expo-print';
import { useNavigation } from '@react-navigation/native';
import { useAdminStore } from '../../store/adminStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getAllDepartments } from '../../constants/departments';
import Card from '../../components/Card';
import CreateUserScreen from './CreateUserScreen';
import type { StudentAdmission } from '../../types';

type UserTab = 'all' | 'students' | 'faculty' | 'admissions';

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { adminUsers, studentAdmissions, loadMockData, addUser, updateUser, deleteUser, getStudentAdmissionById } = useAdminStore();
  const [tab, setTab] = useState<UserTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<StudentAdmission | null>(null);
  const [admissionSearch, setAdmissionSearch] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDesignation, setEditDesignation] = useState('');

  const departments = useMemo(() => getAllDepartments(), []);

  useEffect(() => {
    if (adminUsers.length === 0) {
      loadMockData();
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (tab === 'students') return adminUsers.filter((u) => u.role === 'STUDENT');
    if (tab === 'faculty') return adminUsers.filter((u) => u.role !== 'STUDENT');
    return adminUsers;
  }, [tab, adminUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const roleColor = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'bg-blue-600';
      case 'FACULTY': return 'bg-green-600';
      case 'HOD': return 'bg-purple-600';
      case 'ADMIN': return 'bg-red-600';
      case 'PRINCIPAL': return 'bg-amber-600';
      default: return 'bg-slate-600';
    }
  };

  const openEdit = (item: any) => {
    setEditingUser(item);
    setEditName(item.name ?? '');
    setEditId(item.id ?? '');
    setEditRole(item.role ?? 'STUDENT');
    setEditDept(item.department ?? '');
    setEditEmail(item.email ?? '');
    setEditPassword(item.password ?? '');
    setEditDesignation(item.designation ?? '');
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    if (!editName.trim() || !editId.trim()) {
      Alert.alert('Error', 'Name and ID are required');
      return;
    }
    updateUser(editingUser.id, {
      name: editName.trim(),
      id: editId,
      role: editRole,
      department: editDept,
      email: editEmail,
      password: editPassword,
      designation: editDesignation,
    });
    setEditModalVisible(false);
    Alert.alert('Success', `${editName} updated`);
  };

  const handleDelete = () => {
    if (!editingUser) return;
    Alert.alert('Delete User', `Remove ${editingUser.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteUser(editingUser.id);
          setEditModalVisible(false);
        },
      },
    ]);
  };

  const filteredAdmissions = useMemo(() => {
    if (!admissionSearch.trim()) return studentAdmissions;
    const q = admissionSearch.toLowerCase();
    return studentAdmissions.filter(
      (a) => a.firstName.toLowerCase().includes(q) || a.lastName.toLowerCase().includes(q) || a.usn.toLowerCase().includes(q) || a.department.toLowerCase().includes(q)
    );
  }, [studentAdmissions, admissionSearch]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => openEdit(item)}>
      <Card className="bg-slate-900 border-slate-800 mb-2">
        <View className="flex-row items-center">
          <View className={`w-9 h-9 ${roleColor(item.role)} rounded-full items-center justify-center mr-3`}>
            <Text className="text-white text-xs font-bold">
              {item.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium text-sm">{item.name}</Text>
            <Text className="text-slate-400 text-xs">{item.id} • {item.role}</Text>
          </View>
          <View className="bg-slate-800 rounded px-2 py-1">
            <Text className="text-slate-300 text-[10px] uppercase">{item.department ?? 'N/A'}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderAdmissionItem = ({ item }: { item: StudentAdmission }) => (
    <TouchableOpacity onPress={() => { setSelectedAdmission(item); setDetailModalVisible(true); }}>
      <Card className="bg-slate-900 border-slate-800 mb-2">
        <View className="flex-row items-start">
          <View className="w-9 h-9 rounded-full bg-blue-600 items-center justify-center mr-3">
            <Text className="text-white text-xs font-bold">{item.firstName[0]}{item.lastName[0]}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-medium text-sm flex-1">{item.firstName} {item.lastName}</Text>
              <View className={`rounded-full px-2 py-0.5 ${item.admissionType === 'LATERAL' ? 'bg-purple-900/50 border border-purple-700' : item.admissionType === 'MANAGEMENT' ? 'bg-amber-900/50 border border-amber-700' : 'bg-green-900/50 border border-green-700'}`}>
                <Text className="text-[9px] font-bold text-white">{item.admissionType}</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs font-mono mt-0.5">{item.usn}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-slate-500 text-[10px]">{item.department} · Sem {item.semesterNo} · Sec {item.section}</Text>
              <View className={`rounded px-1.5 py-0.5 ${item.category === 'SC' ? 'bg-red-900/50' : item.category === 'ST' ? 'bg-orange-900/50' : item.category === 'OBC' ? 'bg-blue-900/50' : 'bg-slate-800'}`}>
                <Text className="text-[9px] text-white">{item.category}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-slate-500 text-[10px]">SSLC: {item.sslcPercentage}%</Text>
              <Text className="text-slate-500 text-[10px]">| PUC: {item.pucPercentage}%</Text>
              <Text className="text-slate-500 text-[10px]">| PCM: {item.pucPCMPercentage}%</Text>
            </View>
            <Text className="text-slate-600 text-[9px] mt-1">Admitted: {item.admissionDate}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderAdmissionDetailModal = () => {
    if (!selectedAdmission) return null;
    const a = selectedAdmission;
    const categories = [
      { label: 'Personal Info', content: `Name: ${a.firstName} ${a.middleName} ${a.lastName}\nDOB: ${a.dateOfBirth}\nGender: ${a.gender}\nBlood: ${a.bloodGroup}\nAadhaar: ${a.aadhaarNo}\nMobile: ${a.mobileNo}\nEmail: ${a.email}` },
      { label: 'Location', content: `Birth Place: ${a.birthPlace}\nHometown: ${a.hometown}\nDistrict: ${a.district}\nTaluk: ${a.taluk}\nPincode: ${a.pincode}\nState: ${a.state}\nNationality: ${a.nationality}` },
      { label: 'Caste & Category', content: `Religion: ${a.religion}\nCaste: ${a.caste}\nCategory: ${a.category}\nSC: ${a.isSC ? 'Yes' : 'No'} | ST: ${a.isST ? 'Yes' : 'No'} | OBC: ${a.isOBC ? 'Yes' : 'No'} | EWS: ${a.isEWS ? 'Yes' : 'No'}\nGadinadu: ${a.isGadinuduKannadiga ? 'Yes' : 'No'} | Rural: ${a.isRural ? 'Yes' : 'No'}` },
      { label: 'Family & Income', content: `Income: ${a.annualFamilyIncome}\nFather: ${a.fatherName} (${a.fatherMobile})\nMother: ${a.motherName} (${a.motherMobile})\nGuardian: ${a.guardianName} (${a.guardianMobile})` },
      { label: 'SSLC', content: `${a.sslcBoard}\n${a.sslcSchool}\nYear: ${a.sslcPassYear}\nMarks: ${a.sslcObtainedMarks}/${a.sslcMaxMarks} (${a.sslcPercentage}%)` },
      { label: 'PUC / Diploma', content: a.qualifyingExam === 'PUC'
        ? `${a.pucBoard}\n${a.pucCollege}\nYear: ${a.pucPassYear}\nMarks: ${a.pucObtainedMarks}/${a.pucMaxMarks} (${a.pucPercentage}%)\nPCM: ${a.pucPCMMarks}/300 (${a.pucPCMPercentage}%)`
        : `${a.diplomaBoard}\n${a.diplomaCollege}\nYear: ${a.diplomaPassYear}\nBranch: ${a.diplomaBranch}\nPercentage: ${a.diplomaPercentage}%` },
      { label: 'Entrance', content: `CET: ${a.cetRank ?? 'N/A'} (${a.cetScore ?? 'N/A'})\nJEE: ${a.jeeRank ?? 'N/A'}\nCOMEDK: ${a.comedk ? a.comdekRank : 'N/A'}` },
      { label: 'Documents', content: `SSLC Ms: ${a.hasSslcMarksheet ? '✓' : '✗'} | PUC Ms: ${a.hasPucMarksheet ? '✓' : '✗'} | Caste: ${a.hasCasteCertificate ? '✓' : '✗'} | Income: ${a.hasIncomeCertificate ? '✓' : '✗'} | TC: ${a.hasTransferCertificate ? '✓' : '✗'} | Aadhaar: ${a.hasAadhaarCard ? '✓' : '✗'} | Migration: ${a.hasMigrationCertificate ? '✓' : '✗'}` },
    ];
    return (
      <Modal visible animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-950 rounded-t-2xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">{a.firstName} {a.lastName}</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Text className="text-slate-400 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories.map((cat) => (
                <View key={cat.label} className="bg-slate-800 rounded-xl p-3 mb-2 border border-slate-700">
                  <Text className="text-indigo-400 text-xs font-bold mb-1 uppercase tracking-wider">{cat.label}</Text>
                  <Text className="text-slate-300 text-xs leading-5">{cat.content}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={async () => {
                  const html = `
                    <!DOCTYPE html>
                    <html><head><meta charset="utf-8"><style>
                      body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
                      .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 20px; }
                      .title { font-size: 16px; font-weight: bold; margin: 16px 0 8px; }
                      .row { display: flex; margin-bottom: 6px; }
                      .label { width: 200px; font-weight: 600; font-size: 13px; }
                      .value { flex: 1; font-size: 13px; }
                      .section { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 16px; }
                      .footer { text-align: center; font-size: 11px; color: #888; margin-top: 32px; }
                    </style></head><body>
                      <div class="header"><h2>VCET — Student Admission Details</h2></div>
                      <div class="section">
                        ${categories.map((c) => `<div class="title">${c.label}</div><pre style="font-size:13px; font-family:Arial; white-space:pre-wrap;">${c.content}</pre>`).join('')}
                      </div>
                      <div class="footer">Printed on ${new Date().toLocaleDateString('en-IN')} | VCET AMS</div>
                    </body></html>`;
                  await Print.printAsync({ html });
                }}
                className="bg-indigo-600 rounded-xl py-3 items-center mb-4"
              >
                <Text className="text-white font-semibold text-sm">🖨 Print</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>User Management</Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
            {tab === 'admissions' ? 'Admissions' : 'All Users'}
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            {tab === 'admissions' ? `${studentAdmissions.length} admissions` : `${adminUsers.length} total`}
          </Text>
        </View>
        <View className="flex-row gap-2">
          {tab !== 'admissions' && (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('BulkStudentCreate')} className="bg-green-600 px-3 py-2 rounded-lg">
                <Text className="text-white font-semibold text-sm">Bulk</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCreateVisible(true)} className="bg-blue-600 px-3 py-2 rounded-lg">
                <Text className="text-white font-semibold text-sm">+ Add</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="flex-row px-4 gap-2 mb-4">
        {(['all', 'students', 'faculty', 'admissions'] as UserTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`px-4 py-2 rounded-full ${tab === t ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Text className={`text-xs font-semibold ${tab === t ? 'text-white' : 'text-slate-300'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'admissions' ? (
        <>
          <View className="px-4 mb-3">
            <TextInput
              className="bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 text-sm"
              value={admissionSearch}
              onChangeText={setAdmissionSearch}
              placeholder="Search by name, USN, dept..."
              placeholderTextColor="#475569"
            />
          </View>
          <FlatList
            className="px-4"
            data={filteredAdmissions}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
            renderItem={renderAdmissionItem}
            ListEmptyComponent={
              <Card className="bg-slate-900 border-slate-800">
                <Text className="text-slate-400 text-sm text-center">No admissions found</Text>
              </Card>
            }
          />
        </>
      ) : (
        <FlatList
          className="px-4"
          data={filteredUsers}
          keyExtractor={(item: any) => item.id ?? Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
          renderItem={renderItem}
          ListEmptyComponent={
            <Card className="bg-slate-900 border-slate-800">
              <Text className="text-slate-400 text-sm text-center">No users found</Text>
            </Card>
          }
        />
      )}

      {/* Create User Wizard Modal */}
      <CreateUserScreen visible={createVisible} onClose={() => setCreateVisible(false)} />

      {/* Admission Detail Modal */}
      {detailModalVisible && renderAdmissionDetailModal()}

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 rounded-t-2xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Edit User</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text className="text-slate-400 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text className="text-slate-300 text-xs mb-1">Name</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={editName}
                onChangeText={setEditName}
              />
              <Text className="text-slate-300 text-xs mb-1">ID</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={editId}
                onChangeText={setEditId}
              />
              <Text className="text-slate-300 text-xs mb-1">Role</Text>
              <Text className="text-white text-sm mb-3 bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">{editRole}</Text>
              <Text className="text-slate-300 text-xs mb-1">Department</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={editDept}
                onChangeText={setEditDept}
              />
              <Text className="text-slate-300 text-xs mb-1">Email</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />
              <Text className="text-slate-300 text-xs mb-1">Password</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={editPassword}
                onChangeText={setEditPassword}
              />
              <Text className="text-slate-300 text-xs mb-1">Designation</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-4 border border-slate-700"
                value={editDesignation}
                onChangeText={setEditDesignation}
              />
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={handleDelete} className="flex-1 bg-red-700 rounded-xl py-3 items-center">
                  <Text className="text-white font-semibold">Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditSave} className="flex-[2] bg-blue-600 rounded-xl py-3 items-center">
                  <Text className="text-white font-semibold">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
