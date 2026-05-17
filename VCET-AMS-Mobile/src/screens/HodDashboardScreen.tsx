import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth';
import { mockStudents, mockLowAttendanceAlerts } from '../mock';
import { getFacultySubjects, getFacultyByDepartment } from '../mock/facultySubjects';
import { getAllFaculty } from '../mock/facultyData';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { calcAttendance, getDetentionStatus, getAttendanceWarningLevel, getAttendanceWarningColor, generateDemoCIEMarks } from '../utils/vtuRules';

const SHORTAGE_STUDENTS = [
  { usn: '4VP21CS003', name: 'Rajesh Patel', attendance: 62, shortage: 13, section: 'A', cie: 18 },
  { usn: '4VP21CS007', name: 'Sneha Kumari', attendance: 58, shortage: 17, section: 'A', cie: 12 },
  { usn: '4VP21CS010', name: 'Kavya Singh', attendance: 68, shortage: 7, section: 'B', cie: 22 },
  { usn: '4VP21CS005', name: 'Rohan Pillai', attendance: 71, shortage: 4, section: 'B', cie: 15 },
  { usn: '4VP21CS012', name: 'Tarun Raj', attendance: 45, shortage: 30, section: 'A', cie: 8 },
  { usn: '4VP21CS006', name: 'Fathima Khan', attendance: 51, shortage: 24, section: 'B', cie: 10 },
];

const HodDashboardScreen = () => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const dept = user?.department ?? 'CSE';

  const departmentStudents = useMemo(
    () => mockStudents.filter(s => s.department === dept),
    [dept]
  );

  const departmentLowAttendance = useMemo(
    () => mockLowAttendanceAlerts.filter(
      s => mockStudents.find(st => st.usn === s.usn)?.department === dept
    ),
    [dept]
  );

  const facultyWorkload = useMemo(() => {
    try {
      const facultyList = getAllFaculty().filter((f: any) => f.department === dept);
      const withSubjects = facultyList.map((f: any) => {
        const subjects = getFacultySubjects(f.id);
        return { ...f, subjectCount: subjects?.length ?? 0, studentCount: subjects?.reduce((acc: number, s: any) => acc + (s.students?.length ?? 0), 0) ?? 0 };
      });
      return withSubjects;
    } catch {
      return [];
    }
  }, [dept]);

  const shortageCount = SHORTAGE_STUDENTS.filter((s) => s.attendance < 75).length;
  const detainedCount = SHORTAGE_STUDENTS.filter((s) => s.attendance < 75 && s.cie < 14).length;
  const cieRiskCount = SHORTAGE_STUDENTS.filter((s) => s.cie < 14).length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="p-4">
        <Card className="bg-gradient-to-r from-purple-700 to-purple-900 border-0 mb-4">
          <Text className="text-purple-100 text-xs uppercase tracking-widest">{dept} Department</Text>
          <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          <Text className="text-purple-200 text-sm mt-1">Head of Department</Text>
        </Card>

        <View className="flex-row flex-wrap gap-3 mb-4">
          <Card className="flex-1 min-w-[45%] bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs">Students</Text>
            <Text className="text-white text-2xl font-bold mt-1">{departmentStudents.length}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%] bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-xs">Faculty</Text>
            <Text className="text-white text-2xl font-bold mt-1">{facultyWorkload.length}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%] bg-slate-900 border-red-900/50 border">
            <Text className="text-red-400 text-xs">Att Shortage</Text>
            <Text className="text-red-400 text-2xl font-bold mt-1">{shortageCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%] bg-slate-900 border-orange-900/50 border">
            <Text className="text-orange-400 text-xs">CIE at Risk</Text>
            <Text className="text-orange-400 text-2xl font-bold mt-1">{cieRiskCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%] bg-slate-900 border-amber-900/50 border">
            <Text className="text-amber-400 text-xs">Detained</Text>
            <Text className="text-amber-400 text-2xl font-bold mt-1">{detainedCount}</Text>
          </Card>
        </View>

        {/* VTU Detention Analytics */}
        <Card className="bg-slate-900 border-slate-800 mb-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-white font-bold text-lg">⚠️ VTU Detention Risk</Text>
            <View className="bg-red-900/50 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-red-300 text-xs font-bold">{shortageCount + cieRiskCount}</Text>
            </View>
          </View>
          {SHORTAGE_STUDENTS.map((s) => {
            const det = getDetentionStatus(s.attendance, s.cie);
            const level = getAttendanceWarningLevel(s.attendance);
            const color = getAttendanceWarningColor(level);
            return (
              <View key={s.usn} className="bg-slate-800 rounded-lg p-3 mb-2 border-l-4" style={{ borderLeftColor: color }}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">{s.name}</Text>
                    <Text className="text-slate-400 text-xs">{s.usn} • Sec {s.section}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-sm" style={{ color }}>{s.attendance}%</Text>
                    <Text className="text-xs mt-0.5" style={{ color: s.cie < 14 ? '#f59e0b' : '#94a3b8' }}>
                      CIE: {s.cie}/40
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2 mt-2">
                  {det.reasons.map((r, i) => (
                    <View key={i} className="bg-red-900/30 rounded px-2 py-0.5">
                      <Text className="text-red-300 text-[9px]">⚠️ {r}</Text>
                    </View>
                  ))}
                  {s.attendance < 75 && (
                    <View className="bg-blue-900/30 rounded px-2 py-0.5">
                      <Text className="text-blue-300 text-[9px]">Need +{s.shortage}% att</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {SHORTAGE_STUDENTS.length === 0 && (
            <EmptyState icon="✅" title="No detention risks" subtitle="All students meet VTU attendance and CIE thresholds" />
          )}
        </Card>

        {/* Section Performance */}
        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Section Performance</Text>
          {['A', 'B', 'C'].map((section) => {
            const secStudents = departmentStudents.filter(s => s.section === section);
            const secShortage = SHORTAGE_STUDENTS.filter(s => s.section === section).length;
            return (
              <View key={section} className="bg-slate-800 rounded-lg p-3 mb-2 border border-slate-700">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-semibold">Section {section}</Text>
                  <Text className="text-slate-400 text-xs">{secStudents.length} students</Text>
                </View>
                <View className="bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                  <View
                    className={`h-full rounded-full ${secShortage > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${75 + Math.floor(Math.random() * 20)}%` }}
                  />
                </View>
                {secShortage > 0 && (
                  <Text className="text-red-400 text-[10px] mt-1">{secShortage} student(s) below threshold</Text>
                )}
              </View>
            );
          })}
        </Card>

        {/* Faculty Workload */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <Text className="text-white font-bold text-lg mb-3">📊 Faculty Workload</Text>
          {facultyWorkload.slice(0, 5).map((f: any, i: number) => (
            <View key={f.id ?? i} className="flex-row items-center bg-slate-800 rounded-lg p-3 mb-2 border border-slate-700">
              <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">
                  {f.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">{f.name}</Text>
                <Text className="text-slate-400 text-xs">{f.subjectCount} subjects • {f.studentCount} students</Text>
              </View>
              <View className="bg-slate-700 rounded px-2 py-1">
                <Text className="text-purple-300 text-[10px]">{f.designation?.includes('Professor') ? 'Prof' : 'Asst Prof'}</Text>
              </View>
            </View>
          ))}
          {facultyWorkload.length === 0 && (
            <EmptyState icon="👨‍🏫" title="No faculty data" subtitle="Faculty workload stats unavailable" />
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

export default HodDashboardScreen;
