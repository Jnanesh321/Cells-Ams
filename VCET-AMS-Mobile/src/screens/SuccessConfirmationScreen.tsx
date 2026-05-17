import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';

const SuccessConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

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
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 border-b border-slate-700 px-4 pt-4 pb-3">
        <Text className="text-white text-lg font-bold">Attendance Submitted</Text>
      </View>

      <ScrollView className="flex-1 flex-row" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center p-4">
          {/* Success Icon */}
          <View className="bg-green-900/30 border-2 border-green-600 rounded-full w-20 h-20 items-center justify-center mb-6">
            <Text className="text-green-400 text-5xl">✓</Text>
          </View>

          {/* Success Message */}
          <Card className="bg-gradient-to-r from-green-900 to-green-800 border-0 mb-4 w-full">
            <View className="items-center">
              <Text className="text-green-100 text-base font-bold">Attendance Saved Successfully!</Text>
              <Text className="text-green-200 text-xs mt-2">
                Your attendance has been submitted to the academic system.
              </Text>
            </View>
          </Card>

          {/* Summary Card */}
          <Card className="bg-slate-800 border border-slate-700 mb-4 w-full">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
              Submission Summary
            </Text>

            <View className="bg-slate-700 rounded-lg p-4">
              <View className="mb-3">
                <Text className="text-slate-400 text-xs mb-1">Subject</Text>
                <Text className="text-white font-bold text-base">{subjectName}</Text>
                <Text className="text-slate-400 text-xs">{subjectCode} • Section {section}</Text>
              </View>

              <View className="bg-slate-600 h-px mb-3" />

              <View className="flex-row justify-around mb-3">
                <View className="items-center">
                  <Text className="text-green-400 font-bold text-2xl">{stats.present}</Text>
                  <Text className="text-green-400 text-xs">Present</Text>
                </View>
                <View className="bg-slate-600 w-px" />
                <View className="items-center">
                  <Text className="text-red-400 font-bold text-2xl">{stats.absent}</Text>
                  <Text className="text-red-400 text-xs">Absent</Text>
                </View>
                <View className="bg-slate-600 w-px" />
                <View className="items-center">
                  <Text className="text-amber-400 font-bold text-2xl">{stats.od}</Text>
                  <Text className="text-amber-400 text-xs">OD</Text>
                </View>
              </View>

              <View className="bg-slate-600 h-px mb-3" />

              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Session Attendance</Text>
                <Text className="text-white font-bold text-xl">{attendancePercentage}%</Text>
                <Text className="text-slate-400 text-xs mt-1">
                  {stats.present + stats.od} of {stats.total} students
                </Text>
              </View>
            </View>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-900/20 border border-blue-700/30 mb-6 w-full">
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
      <View className="bg-slate-800 border-t border-slate-700 p-4 flex-row gap-3">
        <Button
          title="Mark Another Subject"
          onPress={() => navigation.navigate('SubjectPicker')}
          className="flex-1 bg-blue-600"
        />
        <Button
          title="Go to Dashboard"
          onPress={handleDone}
          className="flex-1 bg-slate-700"
        />
      </View>
    </View>
  );
};

export default SuccessConfirmationScreen;
