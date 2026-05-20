import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import Card from '../components/Card';
import Button from '../components/Button';

const SuccessConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();

  const stats = route.params?.stats || { present: 0, absent: 0, od: 0, total: 0 };
  const subjectName = route.params?.subjectName || '';
  const subjectCode = route.params?.subjectCode || '';
  const section = route.params?.section || '';

  useEffect(() => {
    // Auto-dismiss after 3 seconds if user doesn't interact
    const timer = setTimeout(() => {
      handleDone();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDone = () => {
    navigation.navigate('Dashboard');
  };

  const attendancePercentage = Math.round(
    ((stats.present + stats.od) / stats.total) * 100
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b" style={{ backgroundColor: colors.bgCard, borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>Attendance Submitted</Text>
      </View>

      <ScrollView className="flex-1 flex-row" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center p-4">
          {/* Success Icon */}
          <View className="bg-green-900/30 border-2 border-green-600 rounded-full w-20 h-20 items-center justify-center mb-6">
            <Text className="text-green-400 text-5xl">✓</Text>
          </View>

          {/* Success Message */}
          <Card className="border-0 mb-4 w-full">
            <View className="items-center">
              <Text className="text-green-100 text-base font-bold">Attendance Saved Successfully!</Text>
              <Text className="text-green-200 text-xs mt-2">
                Your attendance has been submitted to the academic system.
              </Text>
            </View>
          </Card>

          {/* Summary Card */}
          <Card className="mb-4 w-full" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
              Submission Summary
            </Text>

            <View className="rounded-lg p-4" style={{ backgroundColor: colors.bgTertiary }}>
              <View className="mb-3">
                <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Subject</Text>
                <Text className="font-bold text-base" style={{ color: colors.text }}>{subjectName}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{subjectCode} • Section {section}</Text>
              </View>

              <View className="h-px mb-3" style={{ backgroundColor: colors.border }} />

              <View className="flex-row justify-around mb-3">
                <View className="items-center">
                  <Text className="text-green-400 font-bold text-2xl">{stats.present}</Text>
                  <Text className="text-green-400 text-xs">Present</Text>
                </View>
                <View className="w-px" style={{ backgroundColor: colors.border }} />
                <View className="items-center">
                  <Text className="text-red-400 font-bold text-2xl">{stats.absent}</Text>
                  <Text className="text-red-400 text-xs">Absent</Text>
                </View>
                <View className="w-px" style={{ backgroundColor: colors.border }} />
                <View className="items-center">
                  <Text className="text-amber-400 font-bold text-2xl">{stats.od}</Text>
                  <Text className="text-amber-400 text-xs">OD</Text>
                </View>
              </View>

              <View className="h-px mb-3" style={{ backgroundColor: colors.border }} />

              <View className="items-center">
                <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Session Attendance</Text>
                <Text className="font-bold text-xl" style={{ color: colors.text }}>{attendancePercentage}%</Text>
                <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {stats.present + stats.od} of {stats.total} students
                </Text>
              </View>
            </View>
          </Card>

          {/* Info Card */}
          <Card className="mb-6 w-full" style={{ backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.3)', borderWidth: 1 }}>
            <View className="flex-row gap-2">
              <Text className="text-blue-400 text-xl">ℹ️</Text>
              <View className="flex-1">
                <Text className="text-blue-200 font-bold text-sm mb-1">What's Next?</Text>
                <Text className="text-blue-300 text-xs leading-5">
                  You can mark attendance for another subject or close this session. All records
                  have been saved to the backend.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 flex-row gap-3 border-t" style={{ backgroundColor: colors.bgCard, borderTopColor: colors.border }}>
        <Button
          title="Mark Another Subject"
          onPress={() => navigation.navigate('SubjectPicker')}
          style={{ backgroundColor: '#3b82f6' }}
        />
        <Button
          title="Go to Dashboard"
          onPress={handleDone}
          style={{ backgroundColor: colors.bgTertiary }}
        />
      </View>
    </View>
  );
};

export default SuccessConfirmationScreen;
