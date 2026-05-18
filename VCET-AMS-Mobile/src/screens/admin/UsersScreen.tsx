import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdminStore } from '../../store/adminStore';
import { getAllDepartments } from '../../constants/departments';
import Card from '../../components/Card';
import CreateUserScreen from './CreateUserScreen';

type UserTab = 'all' | 'students' | 'faculty';

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const { adminUsers, loadMockData, addUser, updateUser, deleteUser } = useAdminStore();
  const [tab, setTab] = useState<UserTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-xs uppercase tracking-widest">User Management</Text>
          <Text className="text-white text-2xl font-bold mt-1">All Users</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{adminUsers.length} total</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => navigation.navigate('BulkStudentCreate')} className="bg-green-600 px-3 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">Bulk</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCreateVisible(true)} className="bg-blue-600 px-3 py-2 rounded-lg">
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
        keyExtractor={(item: any) => item.id ?? Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No users found</Text>
          </Card>
        }
      />

      {/* Create User Wizard Modal */}
      <CreateUserScreen visible={createVisible} onClose={() => setCreateVisible(false)} />

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
