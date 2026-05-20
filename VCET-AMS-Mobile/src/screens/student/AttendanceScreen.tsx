import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';
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
  const { colors } = useAppTheme();
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
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Attendance Overview</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{user?.name}</Text>
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
          <Card className="mb-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>{item.name ?? item.subject}</Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.present}/{item.total} days</Text>
              </View>
              <Text className={`text-lg font-bold ${item.percentage < 75 ? 'text-red-400' : item.percentage < 85 ? 'text-yellow-400' : 'text-green-400'}`}>
                {item.percentage}%
              </Text>
            </View>
            <View className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
              <View
                className={`h-full rounded-full ${item.percentage < 75 ? 'bg-red-500' : item.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </View>
            {item.percentage < 75 && (
              <View className="rounded-lg p-2 mt-2 border" style={{ backgroundColor: 'rgba(239,68,68,0.4)', borderColor: 'rgba(239,68,68,0.5)' }}>
                <Text className="text-red-300 text-xs font-medium">⚠ Below 75% threshold — risk of detention</Text>
              </View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No attendance records found</Text>
          </Card>
        }
      />
    </View>
  );
}
