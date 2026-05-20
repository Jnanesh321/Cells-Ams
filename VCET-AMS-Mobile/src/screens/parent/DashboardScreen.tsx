import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mockStudents, mockAttendance } from '../../mock';
import API from '../../services/api';
import Loader from '../../components/Loader';
import Card from '../../components/Card';

export default function ParentDashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiAttendance, setApiAttendance] = useState<any[] | null>(null);

  const childUsn = useMemo(() => user?.wardUsn ?? user?.usn, [user]);

  const child = useMemo(() => {
    if (!childUsn) return null;
    return mockStudents.find((s) => s.usn === childUsn) ?? null;
  }, [childUsn]);

  const fetchAttendance = useCallback(async () => {
    if (!childUsn) return;
    try {
      const res = await API.get(`/attendance/student/${childUsn}/summary`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setApiAttendance(data);
    } catch {
      const mock = (mockAttendance as any)[childUsn] ?? [];
      setApiAttendance(mock);
    }
  }, [childUsn]);

  useEffect(() => {
    setLoading(true);
    fetchAttendance().finally(() => setLoading(false));
  }, [fetchAttendance]);

  const childAttendance = apiAttendance ?? [];

  const overallPercentage = useMemo(() => {
    if (childAttendance.length === 0) return 0;
    return childAttendance.reduce((sum: number, r: any) => sum + (r.percentage ?? 0), 0) / childAttendance.length;
  }, [childAttendance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  }, [fetchAttendance]);

  if (loading) return <Loader />;

  if (!child) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.bg }}>
        <Text className="text-lg text-center" style={{ color: colors.textMuted }}>No ward linked to your account</Text>
        <Text className="text-sm text-center mt-2" style={{ color: colors.textTertiary }}>Contact the admin to link your ward</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
    >
      <View className="p-4">
        <Card className="border-0 mb-4">
          <Text className="text-cyan-100 text-xs uppercase tracking-widest">My Ward</Text>
          <Text className="text-white text-2xl font-bold mt-1">{child.name}</Text>
          <Text className="text-cyan-200 text-sm mt-1">
            {child.usn} • {child.department} • Section {child.section}
          </Text>
          <Text className="text-cyan-200 text-xs mt-1">Semester {child.semester} • Year {child.year}</Text>
        </Card>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Attendance</Text>
            <Text className={`text-3xl font-bold mt-1 ${overallPercentage < 75 ? 'text-red-400' : 'text-cyan-400'}`}>
              {overallPercentage.toFixed(1)}%
            </Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>GPA</Text>
            <Text className="text-cyan-400 text-3xl font-bold mt-1">{child.gpa?.toFixed(1) ?? 'N/A'}</Text>
          </Card>
        </View>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Subject-wise Attendance</Text>
          {childAttendance.length > 0 ? (
            childAttendance.map((r: any, i: number) => (
              <View key={i} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <View className="flex-1">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>{r.subject ?? r.name}</Text>
                  </View>
                  <Text className={`text-sm font-bold ${r.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                    {r.percentage}%
                  </Text>
                </View>
                <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                  <View
                    className={`h-full rounded-full ${r.percentage < 75 ? 'bg-red-500' : r.percentage < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </View>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{r.present}/{r.total} days</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm" style={{ color: colors.textMuted }}>No attendance records</Text>
          )}
        </Card>

        <Card className="mb-4" style={{ backgroundColor: 'rgba(217,119,6,0.4)', borderColor: 'rgba(217,119,6,0.6)', borderWidth: 1 }}>
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
