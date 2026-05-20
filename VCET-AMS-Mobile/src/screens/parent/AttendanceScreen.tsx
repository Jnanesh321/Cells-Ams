import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mockStudents, mockAttendance } from '../../mock';
import API from '../../services/api';
import Loader from '../../components/Loader';
import Card from '../../components/Card';

export default function ParentAttendanceScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);

  const childUsn = user?.wardUsn ?? user?.usn;

  const child = useMemo(() => {
    if (!childUsn) return null;
    return mockStudents.find((s) => s.usn === childUsn) ?? null;
  }, [childUsn]);

  const fetchRecords = useCallback(async () => {
    if (!childUsn) return;
    try {
      const res = await API.get(`/attendance/student/${childUsn}/summary`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setRecords(data);
    } catch {
      const mock = (mockAttendance as any)[childUsn] ?? [];
      setRecords(mock);
    }
  }, [childUsn]);

  useEffect(() => {
    setLoading(true);
    fetchRecords().finally(() => setLoading(false));
  }, [fetchRecords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  }, [fetchRecords]);

  if (loading) return <Loader />;

  if (!child) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>No ward data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Attendance Details</Text>
        <Text className="text-xl font-bold mt-1" style={{ color: colors.text }}>{child.name}</Text>
      </View>
      <FlatList
        className="px-4"
        data={records}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
        renderItem={({ item }: any) => (
          <Card className="mb-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>{item.subject ?? item.name}</Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.present}/{item.total} days</Text>
              </View>
              <Text className={`text-lg font-bold ${item.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                {item.percentage}%
              </Text>
            </View>
            <View className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
              <View
                className={`h-full rounded-full ${item.percentage < 75 ? 'bg-red-500' : item.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </View>
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
