import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mockStudents, mockAttendance } from '../../mock';
import Card from '../../components/Card';

export default function HodAnalyticsScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const dept = user?.department ?? 'CSE';

  const deptStudents = useMemo(
    () => mockStudents.filter((s) => s.department === dept),
    [dept]
  );

  const attendanceData = useMemo(() => {
    const deptUsns = new Set(deptStudents.map((s) => s.usn));
    const records = Object.entries(mockAttendance)
      .filter(([usn]: [string, unknown]) => deptUsns.has(usn))
      .flatMap(([, recs]: [string, unknown]) => recs as any[]);
    const total = records.length;
    const present = records.filter((r: any) => r.status !== 'ABSENT').length;
    return {
      overall: total > 0 ? Math.round((present / total) * 100) : 0,
      bySection: {} as Record<string, { present: number; total: number }>,
    };
  }, [deptStudents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>{dept} Department</Text>
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Analytics</Text>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Students</Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colors.text }}>{deptStudents.length}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Attendance</Text>
            <Text className="text-purple-400 text-3xl font-bold mt-1">{attendanceData.overall}%</Text>
          </Card>
        </View>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Attendance Distribution</Text>
          {['A', 'B', 'C'].map((sec) => {
            const secStudents = mockStudents.filter((s) => s.department === dept && s.section === sec);
            return (
              <View key={sec} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Section {sec}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{secStudents.length} students</Text>
                </View>
                <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                  <View className="bg-purple-500 h-full rounded-full" style={{ width: `${75 + Math.random() * 20}%` }} />
                </View>
              </View>
            );
          })}
        </Card>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Low Attendance Alerts</Text>
          {deptStudents.filter((_, i) => i < 3).map((s) => (
            <View key={s.usn} className="flex-row justify-between items-center mb-2 rounded-lg p-3 border" style={{ backgroundColor: 'rgba(239,68,68,0.3)', borderColor: 'rgba(239,68,68,0.5)' }}>
              <View className="flex-1">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>{s.name}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{s.usn}</Text>
              </View>
              <Text className="text-red-400 font-bold">{Math.floor(60 + Math.random() * 15)}%</Text>
            </View>
          ))}
          {deptStudents.length === 0 && (
            <Text className="text-sm" style={{ color: colors.textMuted }}>No records</Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
