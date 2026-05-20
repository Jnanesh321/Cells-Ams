import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAttendanceStore } from '../store/attendance';
import { useAppTheme } from '../hooks/useAppTheme';
import type { StudentAttendanceRecord } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

const ReviewSubmitScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentSession, submitSession } = useAttendanceStore();
  const { colors } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = route.params?.session || currentSession;

  const stats = useMemo(() => {
    if (!session) return { present: 0, absent: 0, od: 0, total: 0 };
    return {
      present: session.students.filter((s: StudentAttendanceRecord) => s.status === 'PRESENT').length,
      absent: session.students.filter((s: StudentAttendanceRecord) => s.status === 'ABSENT').length,
      od: session.students.filter((s: StudentAttendanceRecord) => s.status === 'OD').length,
      total: session.students.length,
    };
  }, [session]);

  const attendancePercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.present + stats.od) / stats.total) * 100);
  }, [stats]);

  const shortageStudents = useMemo(() => {
    if (!session) return [];
    // Students with attendance less than 75%
    return session.students
      .filter((s: StudentAttendanceRecord) => s.status === 'ABSENT')
      .slice(0, 5);
  }, [session]);

  const handleSubmit = async () => {
    Alert.alert('Confirm Submission', `Submit attendance for ${stats.total} students?`, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setIsSubmitting(true);
          try {
            await submitSession();
            navigation.navigate('SuccessConfirmation', {
              stats,
              subjectName: session.subjectName,
              subjectCode: session.subjectCode,
              section: session.section,
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to submit attendance. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  if (!session) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>No session data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b" style={{ backgroundColor: colors.bgCard, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-blue-400 font-semibold">← Back</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Review & Submit</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>{session.subjectName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Session Summary */}
          <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
              Session Details
            </Text>
            <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgTertiary }}>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Subject</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>{session.subjectName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Code</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>{session.subjectCode}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Section</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>{session.section}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Date & Time</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>
                  {session.date} {session.time}
                </Text>
              </View>
            </View>
          </Card>

          {/* Attendance Summary Cards */}
          <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
            Attendance Summary
          </Text>

          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1 bg-green-900/30 border border-green-700/50">
              <Text className="text-green-400 text-xs mb-1">Present</Text>
              <Text className="text-green-400 font-bold text-2xl">{stats.present}</Text>
              <Text className="text-green-600 text-xs mt-1">
                {Math.round((stats.present / stats.total) * 100)}%
              </Text>
            </Card>
            <Card className="flex-1 bg-red-900/30 border border-red-700/50">
              <Text className="text-red-400 text-xs mb-1">Absent</Text>
              <Text className="text-red-400 font-bold text-2xl">{stats.absent}</Text>
              <Text className="text-red-600 text-xs mt-1">
                {Math.round((stats.absent / stats.total) * 100)}%
              </Text>
            </Card>
            <Card className="flex-1 bg-amber-900/30 border border-amber-700/50">
              <Text className="text-amber-400 text-xs mb-1">OD</Text>
              <Text className="text-amber-400 font-bold text-2xl">{stats.od}</Text>
              <Text className="text-amber-600 text-xs mt-1">
                {Math.round((stats.od / stats.total) * 100)}%
              </Text>
            </Card>
          </View>

          {/* Overall Attendance Percentage */}
          <Card className="bg-gradient-to-r from-blue-900 to-blue-800 border-0 mb-4">
            <View className="items-center py-2">
              <Text className="text-blue-100 text-sm">Session Attendance</Text>
              <Text className="text-white text-4xl font-bold mt-2">{attendancePercentage}%</Text>
              <Text className="text-blue-200 text-xs mt-2">
                {stats.present + stats.od} / {stats.total} Students
              </Text>
            </View>
          </Card>

          {/* Absent Students */}
          {shortageStudents.length > 0 && (
            <Card className="bg-red-900/20 border border-red-700/30 mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-red-400 text-lg">ℹ️</Text>
                <Text className="text-red-200 font-bold">Absent Students</Text>
              </View>

              <FlatList
                data={shortageStudents}
                keyExtractor={(item) => item.usn}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View
                    className={`flex-row justify-between py-2 ${
                      index < shortageStudents.length - 1 ? 'border-b border-red-700/20' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-red-200 font-semibold text-sm">{item.name}</Text>
                      <Text className="text-red-400 text-xs">{item.usn}</Text>
                    </View>
                  </View>
                )}
              />
            </Card>
          )}

          {/* Attendance Rules */}
          <Card className="mb-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
              Important Notes
            </Text>
            <View className="rounded-lg p-3" style={{ backgroundColor: `${colors.bgTertiary}80` }}>
              <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>
                • This attendance record will be submitted to the academic system.
                {'\n'}• Students absent will be flagged if below 75% threshold.
                {'\n'}• All edits are logged with timestamps for audit purposes.
                {'\n'}• This action cannot be undone after submission.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="p-4 flex-row gap-3 border-t" style={{ backgroundColor: colors.bgCard, borderTopColor: colors.border }}>
        <Button
          title="Back to Attendance"
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: colors.bgTertiary }}
          disabled={isSubmitting}
        />
        <Button
          title={isSubmitting ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

export default ReviewSubmitScreen;
