import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { mockAttendance } from '../../mock';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

function coerceList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as any).data)) {
    return (value as any).data as T[];
  }
  return [];
}

export default function StudentAttendanceScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const usn = user?.usn;
    if (!usn) return;
    try {
      const res = await API.get(`/attendance/student/${usn}/summary`);
      setRecords(coerceList<any>(res.data));
    } catch {
      const data = (mockAttendance as any)[usn];
      setRecords(data ? Object.values(data) : []);
    }
  }, [user?.usn]);

  useEffect(() => {
    setLoading(true);
    void fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const overall = records.length > 0
    ? records.reduce((s: number, r: any) => s + (r.percentage ?? 0), 0) / records.length
    : 0;

  if (loading) return <Loader />;

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">Attendance Overview</Text>
        <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
        <Text className={`text-lg font-bold mt-1 ${overall < 75 ? 'text-red-400' : overall < 85 ? 'text-yellow-400' : 'text-green-400'}`}>
          {overall.toFixed(1)}% Overall
        </Text>
      </View>
      <FlatList
        className="px-4"
        data={records}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        renderItem={({ item }: any) => (
          <Card className="bg-slate-900 border-slate-800 mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-medium text-sm">{item.name ?? item.subject}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">{item.present}/{item.total} days</Text>
              </View>
              <Text className={`text-lg font-bold ${item.percentage < 75 ? 'text-red-400' : item.percentage < 85 ? 'text-yellow-400' : 'text-green-400'}`}>
                {item.percentage}%
              </Text>
            </View>
            <View className="bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <View
                className={`h-full rounded-full ${item.percentage < 75 ? 'bg-red-500' : item.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </View>
            {item.percentage < 75 && (
              <View className="bg-red-900/40 rounded-lg p-2 mt-2 border border-red-800/50">
                <Text className="text-red-300 text-xs font-medium">⚠ Below 75% threshold — risk of detention</Text>
              </View>
            )}
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
