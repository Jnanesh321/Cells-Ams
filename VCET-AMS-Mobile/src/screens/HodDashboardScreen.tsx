import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAcademicDay } from '../hooks/useAcademicDay';
import { useSubjectAssignmentStore } from '../store/subjectAssignmentStore';
import { mockStudents, mockLowAttendanceAlerts } from '../mock';
import { getFacultySubjects, getFacultyByDepartment } from '../mock/facultySubjects';
import { getAllFaculty } from '../mock/facultyData';
import API from '../services/api';
import Loader from '../components/Loader';
import BirthdayBanner from '../components/BirthdayBanner';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { calcAttendance, getDetentionStatus, getAttendanceWarningLevel, getAttendanceWarningColor, generateDemoCIEMarks } from '../utils/vtuRules';

function SubjectAssignmentCard({ dept }: { dept: string }) {
  const { getByDept, getUnassigned } = useSubjectAssignmentStore();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const allSubjects = getByDept(dept);
  const unassigned = getUnassigned(dept);
  const assignedCount = allSubjects.length - unassigned.length;

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-bold text-lg" style={{ color: colors.text }}>📋 Subject Assignments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Assignments' as never)}>
          <Text className="text-xs font-semibold" style={{ color: colors.accentHod }}>View All →</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 rounded-lg p-3 items-center" style={{ backgroundColor: colors.bgTertiary }}>
          <Text className="text-lg font-bold" style={{ color: colors.success }}>{assignedCount}</Text>
          <Text className="text-[10px]" style={{ color: colors.textMuted }}>Assigned</Text>
        </View>
        <View className="flex-1 rounded-lg p-3 items-center" style={{ backgroundColor: colors.bgTertiary }}>
          <Text className="text-lg font-bold" style={{ color: colors.warning }}>{unassigned.length}</Text>
          <Text className="text-[10px]" style={{ color: colors.textMuted }}>Unassigned</Text>
        </View>
        <View className="flex-1 rounded-lg p-3 items-center" style={{ backgroundColor: colors.bgTertiary }}>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>{allSubjects.length}</Text>
          <Text className="text-[10px]" style={{ color: colors.textMuted }}>Total</Text>
        </View>
      </View>
      {unassigned.length > 0 && (
        <>
          <Text className="text-xs mb-2" style={{ color: colors.textMuted }}>Unassigned subjects:</Text>
          {unassigned.slice(0, 3).map((s) => (
            <View key={s.id} className="rounded-lg px-3 py-2 mb-1.5" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs font-medium" style={{ color: colors.text }}>{s.subjectName}</Text>
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>{s.subjectCode} · Sem {s.semesterNo} · Sec {s.section}</Text>
            </View>
          ))}
          {unassigned.length > 3 && (
            <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>+{unassigned.length - 3} more</Text>
          )}
        </>
      )}
      <TouchableOpacity
        onPress={() => navigation.navigate('Assignments' as never)}
        className="bg-indigo-600 rounded-xl py-2.5 items-center mt-2"
      >
        <Text className="text-white font-semibold text-sm">Assign Faculty →</Text>
      </TouchableOpacity>
    </Card>
  );
}

type DeptSummary = {
  studentCount: number;
  facultyCount: number;
  sections: string[];
  sectionStats: { section: string; count: number }[];
  attendanceShortage: { usn: string; name: string; section: string; attendance: number; shortage: number }[];
  shortageCount: number;
  facultyWorkload: { usn: string; name: string; designation: string; subjectCount: number; sectionCount: number }[];
  subjectAssignments: { totalSlots: number; assignedSlots: number; unassignedSlots: number; unassignedList: any[] };
};

const SHORTAGE_FALLBACK: any[] = [];

const HodDashboardScreen = () => {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const { academicDay } = useAcademicDay();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deptData, setDeptData] = useState<DeptSummary | null>(null);

  const dept = user?.department ?? 'CSE';

  const fetchDeptData = useCallback(async () => {
    try {
      const res = await API.get('/hod/department-summary');
      setDeptData(res.data?.data ?? null);
    } catch {
      setDeptData(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDeptData().finally(() => setLoading(false));
  }, [fetchDeptData]);

  const departmentStudents = useMemo(
    () => mockStudents.filter(s => s.department === dept),
    [dept]
  );

  const shortageStudents = deptData?.attendanceShortage ?? SHORTAGE_FALLBACK;
  const shortageCount = shortageStudents.length;
  const detainedCount = 0; // VTU detention needs CIE data
  const cieRiskCount = 0;

  const facultyWorkload = deptData?.facultyWorkload ?? (() => {
    try {
      const facultyList = getAllFaculty().filter((f: any) => f.department === dept);
      return facultyList.map((f: any) => {
        const subjects = getFacultySubjects(f.id);
        return { usn: f.id, name: f.name, designation: f.designation ?? 'Assistant Professor', subjectCount: subjects?.length ?? 0, sectionCount: 0 };
      });
    } catch {
      return [];
    }
  })();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeptData();
    setRefreshing(false);
  }, [fetchDeptData]);

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHod} />}
    >
      <View className="p-4">
        <Card className="border-0 mb-4" style={{ backgroundColor: colors.accentHod }}>
          <Text className="text-white/80 text-xs uppercase tracking-widest">{dept} Department</Text>
          <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          <Text className="text-white/70 text-sm mt-1">Head of Department</Text>
          {academicDay && (
            <View className="bg-white/10 rounded-lg px-3 py-2 mt-3">
              <Text className="text-white/80 text-xs">
                {academicDay.termLabel} — Day {academicDay.dayNumber} of {academicDay.totalDays} (Week {academicDay.weekNumber})
              </Text>
              <View className="bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                <View
                  className="h-full rounded-full bg-purple-300"
                  style={{ width: `${Math.min(academicDay.progress * 100, 100)}%` }}
                />
              </View>
              {academicDay.eventName && (
                <Text className="text-amber-200 text-[10px] mt-1">
                  {academicDay.isHoliday ? '🎉 ' : ''}{academicDay.eventName}
                </Text>
              )}
            </View>
          )}
        </Card>

        <BirthdayBanner department={dept} />

        {/* Subject Assignment Summary Card */}
        <SubjectAssignmentCard dept={dept} />

        <View className="flex-row flex-wrap gap-3 mb-4">
          <Card className="flex-1 min-w-[45%]">
            <Text className="text-xs" style={{ color: colors.textMuted }}>Students</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{deptData?.studentCount ?? departmentStudents.length}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]">
            <Text className="text-xs" style={{ color: colors.textMuted }}>Faculty</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{deptData?.facultyCount ?? facultyWorkload.length}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#ef444480', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: colors.error }}>Att Shortage</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.error }}>{shortageCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#f59e0b80', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: colors.warning }}>CIE at Risk</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>{cieRiskCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#f59e0b80', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: colors.warning }}>Detained</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>{detainedCount}</Text>
          </Card>
        </View>

        {/* VTU Detention Analytics */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>⚠️ VTU Detention Risk</Text>
            <View className="bg-red-900/50 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-red-300 text-xs font-bold">{shortageCount + cieRiskCount}</Text>
            </View>
          </View>
          {shortageStudents.map((s) => {
            const level = getAttendanceWarningLevel(s.attendance);
            const color = getAttendanceWarningColor(level);
            return (
              <View key={s.usn} className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderLeftWidth: 4, borderLeftColor: color }}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-sm" style={{ color: colors.text }}>{s.name}</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{s.usn} • Sec {s.section}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-sm" style={{ color }}>{s.attendance}%</Text>
                  </View>
                </View>
                <View className="flex-row gap-2 mt-2">
                  {s.attendance < 75 && (
                    <View className="bg-blue-900/30 rounded px-2 py-0.5">
                      <Text className="text-blue-300 text-[9px]">Need +{s.shortage}% att</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {shortageStudents.length === 0 && (
            <EmptyState icon="✅" title="No detention risks" subtitle="All students meet VTU attendance and CIE thresholds" />
          )}
        </Card>

        {/* Section Performance */}
        <Card className="mb-4">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Section Performance</Text>
          {(deptData?.sections ?? ['A', 'B']).map((section) => {
            const sectionStat = deptData?.sectionStats?.find((s) => s.section === section);
            const secCount = sectionStat?.count ?? departmentStudents.filter((s) => s.section === section).length;
            const secShortage = shortageStudents.filter(s => s.section === section).length;
            return (
              <View key={section} className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border, borderWidth: 1 }}>
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold" style={{ color: colors.text }}>Section {section}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{secCount} students</Text>
                </View>
                <View className="h-2 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: colors.bg }}>
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
        <Card className="mb-6">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>📊 Faculty Workload</Text>
          {facultyWorkload.slice(0, 5).map((f: any, i: number) => (
            <View key={f.id ?? i} className="flex-row items-center rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border, borderWidth: 1 }}>
              <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">
                  {f.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium" style={{ color: colors.text }}>{f.name}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{f.subjectCount} subjects • {f.sectionCount ?? 0} sections</Text>
              </View>
              <View className="rounded px-2 py-1" style={{ backgroundColor: colors.bg }}>
                <Text className="text-[10px]" style={{ color: colors.accentHod }}>{f.designation?.includes('Professor') ? 'Prof' : 'Asst Prof'}</Text>
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
