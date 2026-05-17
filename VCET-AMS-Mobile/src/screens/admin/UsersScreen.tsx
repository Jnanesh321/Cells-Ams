import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { mockStudents, mockUsers } from '../../mock';
import { getAllFaculty } from '../../mock/facultyData';
import Card from '../../components/Card';

type UserTab = 'students' | 'faculty' | 'all';

export default function AdminUsersScreen() {
  const [tab, setTab] = useState<UserTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  const users = useMemo(() => {
    const students = mockStudents.map((s) => ({ ...s, role: 'STUDENT', type: 'student' as const }));
    let faculty: any[] = [];
    try { faculty = getAllFaculty().map((f: any) => ({ ...f, role: 'FACULTY', type: 'faculty' as const })); } catch { faculty = []; }
    const staff = Object.values(mockUsers as any).map((u: any) => ({ ...u, type: 'staff' as const }));
    const all = [...students, ...faculty, ...staff];
    if (tab === 'students') return students;
    if (tab === 'faculty') return [...faculty, ...staff];
    return all;
  }, [tab]);

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

  const renderItem = ({ item }: { item: any }) => (
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
  );

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">User Management</Text>
        <Text className="text-white text-2xl font-bold mt-1">All Users</Text>
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
        data={users}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No users found</Text>
          </Card>
        }
      />
    </View>
  );
}
