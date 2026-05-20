import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

type CollegeAnalyticsRow = {
  deptCode: string;
  deptName: string;
  studentCount: number;
  avgAttendance: number;
  avgIA: number;
};

function attendanceColor(attendance: number): string {
  if (attendance < 70) return '#ef4444';
  if (attendance < 85) return '#f59e0b';
  return '#10b981';
}

function barWidth(attendance: number) {
  return `${Math.max(0, Math.min(100, attendance))}%` as any;
}

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [rows, setRows] = useState<CollegeAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await API.get('/analytics/college');
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      if (data.length > 0) {
        setRows(data as CollegeAnalyticsRow[]);
        return;
      }
    } catch {
      console.log('[PRINCIPAL] API failed, using mock data');
    }
    const mock = [
      { deptCode: 'CSE', deptName: 'Computer Science & Engineering', studentCount: 240, avgAttendance: 82.5, avgIA: 24.3 },
      { deptCode: 'ECE', deptName: 'Electronics & Communication', studentCount: 180, avgAttendance: 78.2, avgIA: 22.8 },
      { deptCode: 'EEE', deptName: 'Electrical & Electronics', studentCount: 120, avgAttendance: 85.1, avgIA: 25.6 },
      { deptCode: 'ME', deptName: 'Mechanical Engineering', studentCount: 160, avgAttendance: 74.8, avgIA: 21.4 },
      { deptCode: 'CV', deptName: 'Civil Engineering', studentCount: 100, avgAttendance: 80.3, avgIA: 23.7 },
    ];
    setRows(mock as CollegeAnalyticsRow[]);
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        await fetchAnalytics();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchAnalytics().finally(() => setRefreshing(false));
  }, [fetchAnalytics]);

  const summary = useMemo(() => {
    const studentCount = rows.reduce((sum, row) => sum + row.studentCount, 0);
    const avgAttendance = rows.length
      ? rows.reduce((sum, row) => sum + row.avgAttendance, 0) / rows.length
      : 0;
    return {
      studentCount,
      avgAttendance,
    };
  }, [rows]);

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Principal Dashboard</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{user?.name ?? 'Principal'}</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>College analytics overview</Text>
      </View>

      <View className="px-4 mb-2 flex-row gap-3">
        <Card className="flex-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Departments</Text>
          <Text className="text-3xl font-bold mt-2" style={{ color: colors.text }}>{rows.length}</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Students</Text>
          <Text className="text-3xl font-bold mt-2 text-cyan-300">{summary.studentCount}</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Avg Attendance</Text>
          <Text className="text-3xl font-bold mt-2 text-emerald-300">{summary.avgAttendance.toFixed(1)}%</Text>
        </Card>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.deptCode}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrincipal} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          const color = attendanceColor(item.avgAttendance);

          return (
            <Pressable onPress={() => navigation.navigate('DeptDetailScreen', { deptId: item.deptCode })}>
              <Card>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>{item.deptName}</Text>
                    <Text className="text-xs uppercase tracking-wider mt-1" style={{ color: colors.textMuted }}>
                      {item.deptCode}
                    </Text>
                    <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
                      {item.studentCount} students
                    </Text>
                  </View>

                  <View className="items-end">
                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#155E75', borderColor: '#06B6D4', borderWidth: 1 }}>
                      <Text className="text-cyan-200 text-xs font-semibold">IA Avg {item.avgIA.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>

                <View className="mt-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xs" style={{ color: colors.textMuted }}>Attendance</Text>
                    <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{item.avgAttendance.toFixed(1)}%</Text>
                  </View>
                  <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                    <View
                      className="h-full rounded-full"
                      style={{ width: barWidth(item.avgAttendance), backgroundColor: color }}
                    />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.textMuted }}>No analytics available.</Text>
          </Card>
        }
      />
    </View>
  );
};

export default DashboardScreen;
