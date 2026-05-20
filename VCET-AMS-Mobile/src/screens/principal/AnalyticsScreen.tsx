import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSettingsStore } from '../../store/settingsStore';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

type DeptRow = {
  deptCode: string;
  deptName: string;
  studentCount: number;
  avgAttendance: number;
  avgIA: number;
};

export default function PrincipalAnalyticsScreen() {
  const { colors } = useAppTheme();
  const iaMaxMarks = useSettingsStore((s) => s.settings.iaMaxMarks);
  const [rows, setRows] = useState<DeptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { getCollegeAnalytics } = await import('../../mock/backend');
      const res = await getCollegeAnalytics();
      setRows(res.data);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);
  const avgAttendance = rows.length > 0 ? rows.reduce((s, r) => s + r.avgAttendance, 0) / rows.length : 0;

  if (loading) return <Loader />;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>College Analytics</Text>
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Cross-Department Overview</Text>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Total Students</Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colors.text }}>{totalStudents}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Avg Attendance</Text>
            <Text className="text-amber-400 text-3xl font-bold mt-1">{avgAttendance.toFixed(1)}%</Text>
          </Card>
        </View>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>Department Comparison</Text>
          {rows.map((dept) => (
            <View key={dept.deptCode} className="mb-4 last:mb-0">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="font-semibold text-sm" style={{ color: colors.text }}>{dept.deptCode}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{dept.deptName}</Text>
                </View>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{dept.studentCount} students</Text>
              </View>
              <View className="flex-row gap-2 mb-1">
                <View className="flex-1">
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>Attendance</Text>
                    <Text className={`text-[10px] font-semibold ${dept.avgAttendance < 75 ? 'text-red-400' : 'text-green-400'}`}>
                      {dept.avgAttendance}%
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                    <View
                      className={`h-full rounded-full ${dept.avgAttendance < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(dept.avgAttendance, 100)}%` }}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>IA Avg</Text>
                    <Text className="text-amber-400 text-[10px] font-semibold">{dept.avgIA}</Text>
                  </View>
                  <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                    <View className="bg-amber-500 h-full rounded-full" style={{ width: `${(dept.avgIA / iaMaxMarks) * 100}%` }} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Card>

        <Card className="mb-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Key Insights</Text>
          {[
            { label: 'Departments above 75% attendance', value: rows.filter((r) => r.avgAttendance >= 75).length, color: 'text-green-400' },
            { label: 'Departments needing attention', value: rows.filter((r) => r.avgAttendance < 75).length, color: 'text-red-400' },
            { label: 'Highest IA average', value: rows.length > 0 ? Math.max(...rows.map((r) => r.avgIA)).toFixed(1) : 'N/A', color: 'text-amber-400' },
          ].map((insight, i) => (
            <View key={i} className="flex-row justify-between items-center py-2 border-b last:border-0" style={{ borderBottomColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>{insight.label}</Text>
              <Text className={`${insight.color} font-bold`}>{insight.value}</Text>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
