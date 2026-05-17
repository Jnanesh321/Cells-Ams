import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { getFacultySubjects } from '../mock/facultySubjects';
import { DEPARTMENTS } from '../constants/departments';
import { getStudentsForSubject } from '../mock/studentAttendance';
import Card from '../components/Card';
import Button from '../components/Button';

const FacultyDashboardScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const facultyId = user?.id || '';
  const facultySubjects = getFacultySubjects(facultyId);
  const department = user?.department || 'CSE';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getAttendanceStatusColor = (lastMarked?: string): string => {
    if (!lastMarked) return '#ef4444'; // red for not marked
    const today = new Date().toISOString().split('T')[0];
    return lastMarked === today ? '#10b981' : '#f59e0b'; // green for today, amber for past
  };

  const getAttendanceStatusText = (lastMarked?: string): string => {
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

  if (!facultySubjects || facultySubjects.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-white text-lg">No subjects assigned</Text>
      </View>
    );
  }

  const deptInfo = (DEPARTMENTS as any)[department];

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <View className="p-4">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 border-0 mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">{user?.name || 'Faculty'}</Text>
            <Text className="text-blue-100 text-sm mt-2">{deptInfo?.name} • 5th Semester</Text>
            <Text className="text-blue-100 text-sm">Assigned: {facultySubjects.length} Subjects</Text>
          </View>
        </Card>

        {/* Department Info */}
        <View className="mb-4">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            Department
          </Text>
          <View className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <Text className="text-white font-semibold">{deptInfo?.name}</Text>
            <Text className="text-slate-400 text-sm mt-1">HOD: {deptInfo?.hod}</Text>
          </View>
        </View>

        {/* Assigned Subjects */}
        <View className="mb-2">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
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
              <Card className="bg-slate-800 border border-slate-700 mb-3 active:bg-slate-700">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-base">{subject.subject}</Text>
                      {hasDetained && (
                        <View className="bg-red-600/30 border border-red-500 rounded px-2 py-1">
                          <Text className="text-red-300 text-xs font-bold">Detention</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-slate-400 text-sm mt-1">
                      {subject.subjectCode} • Sec {subject.section}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-2">
                      <View className="bg-slate-700 rounded px-2 py-1">
                        <Text className="text-slate-300 text-xs">
                          📚 {subject.enrollmentCount} Students
                        </Text>
                      </View>
                      <View className="bg-slate-700 rounded px-2 py-1">
                        <Text className="text-slate-300 text-xs">Sem {subject.semester}</Text>
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
                    <Text className="text-xs text-slate-400">{statusText}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Quick Stats */}
        <View className="mb-2 mt-4">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
            Statistics
          </Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 bg-slate-800 border border-slate-700">
            <Text className="text-slate-400 text-xs mb-1">Subjects</Text>
            <Text className="text-2xl font-bold text-blue-400">{facultySubjects.length}</Text>
            <Text className="text-slate-500 text-xs mt-1">Active</Text>
          </Card>
          <Card className="flex-1 bg-slate-800 border border-slate-700">
            <Text className="text-slate-400 text-xs mb-1">Total</Text>
            <Text className="text-2xl font-bold text-green-400">
              {facultySubjects.reduce((sum, s) => sum + (s.enrollmentCount || 0), 0)}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">Students</Text>
          </Card>
          <Card className="flex-1 bg-slate-800 border border-slate-700">
            <Text className="text-slate-400 text-xs mb-1">Marked</Text>
            <Text className="text-2xl font-bold text-amber-400">
              {facultySubjects.filter((s) => s.lastUpdated).length}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">Today</Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <Card className="bg-slate-800 border border-slate-700 mb-6">
          <Text className="text-white font-bold text-base mb-3">Quick Actions</Text>
          <Button
            title="Mark Attendance"
            onPress={() => navigation.navigate('SubjectPicker')}
            className="bg-green-600 mb-2"
          />
          <Button
            title="View Detention List"
            onPress={() => Alert.alert('Detention', 'View students with < 75% attendance')}
            className="bg-red-600"
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default FacultyDashboardScreen;