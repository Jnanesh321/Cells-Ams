import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { mockStudents, mockAttendance } from '../../mock';
import Card from '../../components/Card';

export default function HodAnalyticsScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const dept = user?.department ?? 'CSE';

  const deptStudents = useMemo(
    () => mockStudents.filter((s) => s.department === dept),
    [dept]
  );

  const attendanceData = useMemo(() => {
    const deptUsns = new Set(deptStudents.map((s) => s.usn));
    const records = (Object.entries(mockAttendance) as any)
      .filter(([usn]) => deptUsns.has(usn))
      .flatMap(([, recs]) => recs);
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
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">{dept} Department</Text>
        <Text className="text-white text-2xl font-bold mb-4">Analytics</Text>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">Students</Text>
            <Text className="text-white text-3xl font-bold mt-1">{deptStudents.length}</Text>
          </Card>
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">Attendance</Text>
            <Text className="text-purple-400 text-3xl font-bold mt-1">{attendanceData.overall}%</Text>
          </Card>
        </View>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Attendance Distribution</Text>
          {['A', 'B', 'C'].map((sec) => {
            const secStudents = mockStudents.filter((s) => s.department === dept && s.section === sec);
            return (
              <View key={sec} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-300 text-sm font-medium">Section {sec}</Text>
                  <Text className="text-slate-400 text-xs">{secStudents.length} students</Text>
                </View>
                <View className="bg-slate-800 h-2 rounded-full overflow-hidden">
                  <View className="bg-purple-500 h-full rounded-full" style={{ width: `${75 + Math.random() * 20}%` }} />
                </View>
              </View>
            );
          })}
        </Card>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Low Attendance Alerts</Text>
          {deptStudents.filter((_, i) => i < 3).map((s) => (
            <View key={s.usn} className="flex-row justify-between items-center mb-2 bg-red-900/30 rounded-lg p-3 border border-red-800/50">
              <View className="flex-1">
                <Text className="text-white font-medium text-sm">{s.name}</Text>
                <Text className="text-slate-400 text-xs">{s.usn}</Text>
              </View>
              <Text className="text-red-400 font-bold">{Math.floor(60 + Math.random() * 15)}%</Text>
            </View>
          ))}
          {deptStudents.length === 0 && (
            <Text className="text-slate-500 text-sm">No records</Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
