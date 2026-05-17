import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
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
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">College Analytics</Text>
        <Text className="text-white text-2xl font-bold mb-4">Cross-Department Overview</Text>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">Total Students</Text>
            <Text className="text-white text-3xl font-bold mt-1">{totalStudents}</Text>
          </Card>
          <Card className="flex-1 bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs uppercase">Avg Attendance</Text>
            <Text className="text-amber-400 text-3xl font-bold mt-1">{avgAttendance.toFixed(1)}%</Text>
          </Card>
        </View>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-4">Department Comparison</Text>
          {rows.map((dept) => (
            <View key={dept.deptCode} className="mb-4 last:mb-0">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{dept.deptCode}</Text>
                  <Text className="text-slate-400 text-xs">{dept.deptName}</Text>
                </View>
                <Text className="text-slate-400 text-xs">{dept.studentCount} students</Text>
              </View>
              <View className="flex-row gap-2 mb-1">
                <View className="flex-1">
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-slate-500 text-[10px]">Attendance</Text>
                    <Text className={`text-[10px] font-semibold ${dept.avgAttendance < 75 ? 'text-red-400' : 'text-green-400'}`}>
                      {dept.avgAttendance}%
                    </Text>
                  </View>
                  <View className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <View
                      className={`h-full rounded-full ${dept.avgAttendance < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(dept.avgAttendance, 100)}%` }}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-slate-500 text-[10px]">IA Avg</Text>
                    <Text className="text-amber-400 text-[10px] font-semibold">{dept.avgIA}</Text>
                  </View>
                  <View className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <View className="bg-amber-500 h-full rounded-full" style={{ width: `${(dept.avgIA / 30) * 100}%` }} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Card>

        <Card className="bg-slate-900 border-slate-800 mb-6">
          <Text className="text-white font-bold text-lg mb-3">Key Insights</Text>
          {[
            { label: 'Departments above 75% attendance', value: rows.filter((r) => r.avgAttendance >= 75).length, color: 'text-green-400' },
            { label: 'Departments needing attention', value: rows.filter((r) => r.avgAttendance < 75).length, color: 'text-red-400' },
            { label: 'Highest IA average', value: rows.length > 0 ? Math.max(...rows.map((r) => r.avgIA)).toFixed(1) : 'N/A', color: 'text-amber-400' },
          ].map((insight, i) => (
            <View key={i} className="flex-row justify-between items-center py-2 border-b border-slate-800 last:border-0">
              <Text className="text-slate-300 text-sm">{insight.label}</Text>
              <Text className={`${insight.color} font-bold`}>{insight.value}</Text>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
