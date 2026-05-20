import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { useAppTheme } from '../hooks/useAppTheme';
import { getFacultySubjects } from '../mock/facultySubjects';
import { DEPARTMENTS } from '../constants/departments';
import { getStudentsForSubject } from '../mock/studentAttendance';
import API from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';

type FacultySubject = {
  facultyId: string;
  subjectCode: string;
  subject: string;
  section: string;
  semester: number;
  enrollmentCount: number;
  lastUpdated: string | null;
};

const FacultyDashboardScreen = () => {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [facultySubjects, setFacultySubjects] = useState<FacultySubject[]>([]);

  const facultyId = user?.usn || 'FAC_CSE_001';
  const department = user?.department || 'CSE';

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await API.get('/faculty/my-classes');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setFacultySubjects(
        data.map((s: any) => ({
          facultyId,
          subjectCode: s.subjectCode,
          subject: s.subjectName,
          section: s.section,
          semester: Number(s.semester),
          enrollmentCount: s.enrollmentCount ?? 0,
          lastUpdated: s.lastAttendanceDate ?? null,
        }))
      );
    } catch {
      const mock = getFacultySubjects(facultyId);
      setFacultySubjects(
        mock.map((s) => ({
          facultyId: s.facultyId,
          subjectCode: s.subjectCode,
          subject: s.subject,
          section: s.section,
          semester: s.semester,
          enrollmentCount: s.enrollmentCount ?? 0,
          lastUpdated: s.lastUpdated ?? null,
        }))
      );
    }
  }, [facultyId]);

  useEffect(() => {
    setLoading(true);
    fetchSubjects().finally(() => setLoading(false));
  }, [fetchSubjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  }, [fetchSubjects]);

  const getAttendanceStatusColor = (lastMarked: string | null): string => {
    if (!lastMarked) return '#ef4444';
    const today = new Date().toISOString().split('T')[0];
    return lastMarked === today ? '#10b981' : '#f59e0b';
  };

  const getAttendanceStatusText = (lastMarked: string | null): string => {
    if (!lastMarked) return 'Not marked';
    const today = new Date().toISOString().split('T')[0];
    return lastMarked === today ? 'Marked today' : `Last: ${lastMarked}`;
  };

  const hasDetainedStudents = (subjectCode: string, facultyId: string): boolean => {
    const students = getStudentsForSubject(subjectCode, facultyId);
    return students.some(
      (student: any) =>
        student.enrolledSubjects.some(
          (subject: any) =>
            subject.subjectCode === subjectCode && subject.attendancePercentage < 75
        )
    );
  };

  const handleStartAttendance = (subject: any) => {
    navigation.navigate('SubjectPicker', {
      selectedSubject: {
        code: subject.subjectCode,
        name: subject.subject,
        section: subject.section,
        semester: subject.semester,
        enrollmentCount: subject.enrollmentCount,
      },
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (facultySubjects.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text className="text-lg" style={{ color: colors.text }}>No subjects assigned</Text>
      </View>
    );
  }

  const deptInfo = (DEPARTMENTS as any)[department];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentFaculty} />}
    >
      <View className="p-4">
        {/* Welcome Card */}
        <Card className="border-0 mb-4" style={{ backgroundColor: colors.accentFaculty }}>
          <View>
            <Text className="text-white text-2xl font-bold">{user?.name || 'Faculty'}</Text>
            <Text className="text-white/80 text-sm mt-2">{deptInfo?.name} • 5th Semester</Text>
            <Text className="text-white/80 text-sm">Assigned: {facultySubjects.length} Subjects</Text>
          </View>
        </Card>

        {/* Department Info */}
        <View className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
            Department
          </Text>
          <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="font-semibold" style={{ color: colors.text }}>{deptInfo?.name}</Text>
            <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>HOD: {deptInfo?.hod}</Text>
          </View>
        </View>

        {/* Assigned Subjects */}
        <View className="mb-2">
          <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
            Assigned Subjects
          </Text>
        </View>

        {facultySubjects.map((subject, idx) => {
          const hasDetained = hasDetainedStudents(subject.subjectCode, subject.facultyId);
          const statusColor = getAttendanceStatusColor(subject.lastUpdated);
          const statusText = getAttendanceStatusText(subject.lastUpdated);

          return (
            <TouchableOpacity
              key={`${subject.subjectCode}-${subject.section}-${idx}`}
              onPress={() => handleStartAttendance(subject)}
              activeOpacity={0.8}
            >
              <Card className="mb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-bold text-base" style={{ color: colors.text }}>{subject.subject}</Text>
                      {hasDetained && (
                        <View className="bg-red-600/30 border border-red-500 rounded px-2 py-1">
                          <Text className="text-red-300 text-xs font-bold">Detention</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
                      {subject.subjectCode} • Sec {subject.section}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-2">
                      <View className="rounded px-2 py-1" style={{ backgroundColor: colors.bgTertiary }}>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                          📚 {subject.enrollmentCount} Students
                        </Text>
                      </View>
                      <View className="rounded px-2 py-1" style={{ backgroundColor: colors.bgTertiary }}>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>Sem {subject.semester}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end ml-2">
                    <View
                      className="rounded-full px-3 py-1 mb-2"
                      style={{ backgroundColor: `${statusColor}20` }}
                    >
                      <Text className="text-xs font-bold" style={{ color: statusColor }}>
                        {subject.lastUpdated ? '✓' : '◯'}
                      </Text>
                    </View>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{statusText}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Quick Stats */}
        <View className="mb-2 mt-4">
          <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
            Statistics
          </Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Subjects</Text>
            <Text className="text-2xl font-bold" style={{ color: colors.accentStudent }}>{facultySubjects.length}</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Active</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Total</Text>
            <Text className="text-2xl font-bold" style={{ color: colors.success }}>
              {facultySubjects.reduce((sum, s) => sum + (s.enrollmentCount || 0), 0)}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Students</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Marked</Text>
            <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
              {facultySubjects.filter((s) => s.lastUpdated).length}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Today</Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <Card className="mb-6">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Quick Actions</Text>
          <Button
            title="Mark Attendance"
            onPress={() => navigation.navigate('SubjectPicker')}
            variant="success"
            className="mb-2"
          />
          <Button
            title="View Detention List"
            onPress={() => Alert.alert('Detention', 'View students with < 75% attendance')}
            variant="danger"
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default FacultyDashboardScreen;
