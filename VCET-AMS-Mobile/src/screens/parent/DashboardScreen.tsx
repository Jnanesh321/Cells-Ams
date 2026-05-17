import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { mockStudents, mockAttendance } from '../../mock';
import Card from '../../components/Card';

export default function ParentDashboardScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const child = useMemo(() => {
    if (!user?.usn) return null;
    return mockStudents.find((s) => s.usn === user.usn) ?? null;
  }, [user]);

  const childAttendance = useMemo(() => {
    if (!child) return [];
    return (mockAttendance as any)[child.usn] ?? [];
  }, [child]);

  const overallPercentage = useMemo(() => {
    if (childAttendance.length === 0) return 0;
    return childAttendance.reduce((sum: number, r: any) => sum + (r.percentage ?? 0), 0) / childAttendance.length;
  }, [childAttendance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (!child) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center p-4">
        <Text className="text-slate-400 text-lg text-center">No ward linked to your account</Text>
        <Text className="text-slate-600 text-sm text-center mt-2">Contact the admin to link your ward</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
    >
      <View className="p-4">
        <Card className="bg-gradient-to-r from-cyan-700 to-teal-700 border-0 mb-4">
          <Text className="text-cyan-100 text-xs uppercase tracking-widest">My Ward</Text>
          <Text className="text-white text-2xl font-bold mt-1">{child.name}</Text>
          <Text className="text-cyan-200 text-sm mt-1">
            {child.usn} • {child.department} • Section {child.section}
          </Text>
          <Text className="text-cyan-200 text-xs mt-1">Semester {child.semester} • Year {child.year}</Text>
        </Card>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">Attendance</Text>
            <Text className={`text-3xl font-bold mt-1 ${overallPercentage < 75 ? 'text-red-400' : 'text-cyan-400'}`}>
              {overallPercentage.toFixed(1)}%
            </Text>
          </Card>
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">GPA</Text>
            <Text className="text-cyan-400 text-3xl font-bold mt-1">{child.gpa?.toFixed(1) ?? 'N/A'}</Text>
          </Card>
        </View>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Subject-wise Attendance</Text>
          {childAttendance.length > 0 ? (
            childAttendance.map((r: any, i: number) => (
              <View key={i} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium">{r.subject}</Text>
                  </View>
                  <Text className={`text-sm font-bold ${r.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                    {r.percentage}%
                  </Text>
                </View>
                <View className="bg-slate-800 h-2 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${r.percentage < 75 ? 'bg-red-500' : r.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </View>
                <Text className="text-slate-500 text-xs mt-0.5">{r.present}/{r.total} days</Text>
              </View>
            ))
          ) : (
            <Text className="text-slate-500 text-sm">No attendance records</Text>
          )}
        </Card>

        <Card className="bg-amber-900/40 border border-amber-800/60 mb-4">
          <Text className="text-amber-300 font-semibold text-sm">⚠️ Parent Access</Text>
          <Text className="text-amber-200 text-xs mt-1">
            You have read-only access to monitor your ward's academic progress. Attendance edits and mark entries
            require faculty or HOD intervention.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
