import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { mockStudents, mockAttendance } from '../../mock';
import Card from '../../components/Card';

export default function ParentAttendanceScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const child = useMemo(() => {
    const childUsn = user?.wardUsn ?? user?.usn;
    if (!childUsn) return null;
    return mockStudents.find((s) => s.usn === childUsn) ?? null;
  }, [user]);

  const records = useMemo(() => {
    if (!child) return [];
    return (mockAttendance as any)[child.usn] ?? [];
  }, [child]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (!child) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-slate-400">No ward data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">Attendance Details</Text>
        <Text className="text-white text-xl font-bold mt-1">{child.name}</Text>
      </View>
      <FlatList
        className="px-4"
        data={records}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
        renderItem={({ item }: any) => (
          <Card className="bg-slate-900 border-slate-800 mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-medium text-sm">{item.subject}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">{item.present}/{item.total} days</Text>
              </View>
              <Text className={`text-lg font-bold ${item.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                {item.percentage}%
              </Text>
            </View>
            <View className="bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <View
                className={`h-full rounded-full ${item.percentage < 75 ? 'bg-red-500' : item.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No attendance records found</Text>
          </Card>
        }
      />
    </View>
  );
}
