import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockStudents, mockUsers } from '../../mock';
import { getAllFaculty } from '../../mock/facultyData';
import { getAllDepartments } from '../../constants/departments';
import Card from '../../components/Card';

type UserTab = 'students' | 'faculty' | 'all';

const AVAILABLE_ROLES = ['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL', 'ADMIN', 'PARENT', 'ADMISSION_CELL'];

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<UserTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formRole, setFormRole] = useState('STUDENT');
  const [formDepartment, setFormDepartment] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDesignation, setFormDesignation] = useState('');

  const departments = useMemo(() => getAllDepartments(), []);

  useEffect(() => {
    const students = mockStudents.map((s) => ({ ...s, role: 'STUDENT', type: 'student' as const }));
    let faculty: any[] = [];
    try { faculty = getAllFaculty().map((f: any) => ({ ...f, role: 'FACULTY', type: 'faculty' as const })); } catch { faculty = []; }
    const staff = Object.values(mockUsers as any).map((u: any) => ({ ...u, type: 'staff' as const }));
    setLocalUsers([...students, ...faculty, ...staff]);
  }, []);

  const filteredUsers = useMemo(() => {
    if (tab === 'students') return localUsers.filter((u) => u.role === 'STUDENT');
    if (tab === 'faculty') return localUsers.filter((u) => u.role !== 'STUDENT');
    return localUsers;
  }, [tab, localUsers]);

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

  const openAddModal = () => {
    setIsNew(true);
    setEditingUser(null);
    setFormName('');
    setFormId('');
    setFormRole('STUDENT');
    setFormDepartment('');
    setFormEmail('');
    setFormPassword('vcet@123');
    setFormDesignation('');
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setIsNew(false);
    setEditingUser(item);
    setFormName(item.name ?? '');
    setFormId(item.usn ?? item.id ?? '');
    setFormRole(item.role ?? 'STUDENT');
    setFormDepartment(item.department ?? '');
    setFormEmail(item.email ?? '');
    setFormPassword(item.password ?? '');
    setFormDesignation(item.designation ?? (item.role === 'HOD' ? 'Head of Department' : ''));
    setModalVisible(true);
  };

  const handleRoleChange = (role: string) => {
    setFormRole(role);
    if (role === 'HOD') {
      if (!formDesignation) setFormDesignation('Head of Department');
    }
  };

  const saveUser = () => {
    if (!formName.trim() || !formId.trim()) {
      Alert.alert('Error', 'Name and ID are required');
      return;
    }

    if (formRole === 'HOD' && !formDepartment.trim()) {
      Alert.alert('Error', 'Department is required for HOD accounts');
      return;
    }

    if (isNew) {
      const newUser = {
        usn: formId,
        id: formId,
        name: formName,
        role: formRole,
        department: formDepartment,
        email: formEmail,
        password: formPassword || 'vcet@123',
        designation: formDesignation || (formRole === 'HOD' ? 'Head of Department' : ''),
        type: formRole === 'STUDENT' ? 'student' as const : 'staff' as const,
      };
      setLocalUsers((prev) => [newUser, ...prev]);
    } else {
      setLocalUsers((prev) =>
        prev.map((u) => {
          if ((u.usn ?? u.id) === (editingUser?.usn ?? editingUser?.id)) {
            return {
              ...u,
              usn: formId,
              id: formId,
              name: formName,
              role: formRole,
              department: formDepartment,
              email: formEmail,
              password: formPassword,
              designation: formDesignation || (formRole === 'HOD' ? 'Head of Department' : ''),
            };
          }
          return u;
        })
      );
    }

    setModalVisible(false);
    Alert.alert('Success', isNew ? `User ${formName} created` : `User ${formName} updated`);
  };

  const deleteUser = () => {
    if (!editingUser) return;
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${editingUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLocalUsers((prev) =>
              prev.filter((u) => (u.usn ?? u.id) !== (editingUser.usn ?? editingUser.id))
            );
            setModalVisible(false);
            Alert.alert('Deleted', `${editingUser.name} removed`);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => openEditModal(item)}>
      <Card className="bg-slate-900 border-slate-800 mb-2">
        <View className="flex-row items-center">
          <View className={`w-9 h-9 ${roleColor(item.role)} rounded-full items-center justify-center mr-3`}>
            <Text className="text-white text-xs font-bold">
              {item.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium text-sm">{item.name}</Text>
            <Text className="text-slate-400 text-xs">
              {item.usn ?? item.id ?? 'N/A'} • {item.role}
            </Text>
          </View>
          <View className="bg-slate-800 rounded px-2 py-1">
            <Text className="text-slate-300 text-[10px] uppercase">{item.department ?? 'N/A'}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const RoleSelector = () => (
    <View className="flex-row flex-wrap gap-1 mb-3">
      {AVAILABLE_ROLES.map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => handleRoleChange(r)}
          className={`px-3 py-1 rounded-full ${formRole === r ? 'bg-blue-600' : 'bg-slate-700'}`}
        >
          <Text className={`text-xs ${formRole === r ? 'text-white' : 'text-slate-300'}`}>{r}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-xs uppercase tracking-widest">User Management</Text>
          <Text className="text-white text-2xl font-bold mt-1">All Users</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => navigation.navigate('BulkStudentCreate')} className="bg-green-600 px-3 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">Bulk</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openAddModal} className="bg-blue-600 px-3 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row px-4 gap-2 mb-4">
        {(['all', 'students', 'faculty'] as UserTab[]).map((t) => (
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

      <FlatList
        className="px-4"
        data={filteredUsers}
        keyExtractor={(item: any) => item.usn ?? item.id ?? item.name ?? Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No users found</Text>
          </Card>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 rounded-t-2xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">{isNew ? 'Add User' : 'Edit User'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-slate-400 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-slate-300 text-xs mb-1">Name *</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={formName}
                onChangeText={setFormName}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
              />

              <Text className="text-slate-300 text-xs mb-1">ID / USN *</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={formId}
                onChangeText={setFormId}
                placeholder="e.g., 4VP21CS001"
                placeholderTextColor="#64748b"
              />

              <Text className="text-slate-300 text-xs mb-1">Role</Text>
              <RoleSelector />

              <Text className="text-slate-300 text-xs mb-1">Department {formRole === 'HOD' ? <Text className="text-red-400">*</Text> : null}</Text>
              {formRole === 'HOD' ? (
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
              ) : (
                <TextInput
                  className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                  value={formDepartment}
                  onChangeText={setFormDepartment}
                  placeholder="e.g., CSE"
                  placeholderTextColor="#64748b"
                />
              )}

              <Text className="text-slate-300 text-xs mb-1">Email</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="email@vcet.ac.in"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
              />

              <Text className="text-slate-300 text-xs mb-1">Password</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                value={formPassword}
                onChangeText={setFormPassword}
                placeholder="password"
                placeholderTextColor="#64748b"
              />

              {formRole !== 'STUDENT' && formRole !== 'PARENT' && formRole !== 'ADMISSION_CELL' ? (
                <>
                  <Text className="text-slate-300 text-xs mb-1">Designation</Text>
                  <TextInput
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-4 border border-slate-700"
                    value={formDesignation}
                    onChangeText={setFormDesignation}
                    placeholder={formRole === 'HOD' ? 'Head of Department' : 'e.g., Assistant Professor'}
                    placeholderTextColor="#64748b"
                  />
                </>
              ) : null}

              <View className="flex-row gap-3">
                {!isNew && (
                  <TouchableOpacity onPress={deleteUser} className="flex-1 bg-red-700 rounded-xl py-3 items-center">
                    <Text className="text-white font-semibold">Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={saveUser} className={`${isNew ? 'flex-1' : 'flex-1'} bg-blue-600 rounded-xl py-3 items-center`}>
                  <Text className="text-white font-semibold">{isNew ? 'Create User' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
