import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAttendanceStore } from '../store/attendance';
import { useAuthStore } from '../store/auth';
import { AttendanceStatus, StudentAttendanceRecord } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

const EditAttendanceScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentSession, updateStudentStatus, addEdit } = useAttendanceStore();
  const { user } = useAuthStore();

  const student: StudentAttendanceRecord | undefined = route.params?.student;
  const sessionId: string | undefined = route.params?.sessionId;

  if (!student) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center p-4">
        <Text className="text-slate-400 text-lg">Student data not available</Text>
        <Text className="text-slate-600 text-sm mt-2">Unable to load attendance record</Text>
      </View>
    );
  }

  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(student.status);
  const [editReason, setEditReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions: { label: string; value: AttendanceStatus; color: string }[] = [
    { label: 'Present', value: 'PRESENT', color: '#10b981' },
    { label: 'Absent', value: 'ABSENT', color: '#ef4444' },
    { label: 'OD (On Duty)', value: 'OD', color: '#f59e0b' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedStatus !== student.status && !editReason.trim()) {
      newErrors.reason = 'Reason is required when changing status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Update the student status in the session
    updateStudentStatus(student.usn, selectedStatus);

    // Record the edit if status changed
    if (selectedStatus !== student.status) {
      addEdit({
        usn: student.usn,
        oldStatus: student.status,
        newStatus: selectedStatus,
        reason: editReason,
        editedBy: user?.id ?? 'unknown',
        editedByName: user?.name ?? 'Unknown Faculty',
        timestamp: new Date().toISOString(),
      });
    }

    Alert.alert('Success', `Attendance updated for ${student.name}`, [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'PRESENT':
        return '#10b981';
      case 'ABSENT':
        return '#ef4444';
      case 'OD':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 border-b border-slate-700 px-4 pt-4 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-blue-400 font-semibold">← Back</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white text-lg font-bold">{student.name}</Text>
          <Text className="text-slate-400 text-sm">{student.usn}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Student Info Card */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-slate-400 text-sm mb-2">Student Information</Text>
          <View className="bg-slate-700 rounded-lg p-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">USN</Text>
              <Text className="text-white font-semibold">{student.usn}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">Name</Text>
              <Text className="text-white font-semibold">{student.name}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-sm">Section</Text>
              <Text className="text-white font-semibold">{student.section}</Text>
            </View>
          </View>
        </Card>

        {/* Current Status */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-slate-400 text-sm mb-3">Current Status</Text>
          <View
            className="rounded-lg px-4 py-3 border-2 items-center justify-center"
            style={{
              borderColor: getStatusColor(student.status),
              backgroundColor: `${getStatusColor(student.status)}20`,
            }}
          >
            <Text className="text-slate-400 text-xs mb-1">Currently Marked as</Text>
            <Text
              className="text-lg font-bold"
              style={{ color: getStatusColor(student.status) }}
            >
              {student.status}
            </Text>
          </View>
        </Card>

        {/* Status Selection */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-white font-bold text-base mb-3">Change Status To</Text>
          <View className="gap-2">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedStatus(option.value)}
                activeOpacity={0.7}
              >
                <View
                  className={`rounded-lg px-4 py-3 border-2 flex-row items-center justify-between ${
                    selectedStatus === option.value
                      ? 'bg-opacity-20 border-opacity-100'
                      : 'bg-opacity-0 border-opacity-30'
                  }`}
                  style={{
                    borderColor: option.color,
                    backgroundColor: selectedStatus === option.value ? `${option.color}20` : 'transparent',
                  }}
                >
                  <Text
                    className="font-semibold text-base"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                  {selectedStatus === option.value && (
                    <Text style={{ color: option.color }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Edit Reason - Show only if status changed */}
        {selectedStatus !== student.status && (
          <Card className="bg-red-900/20 border border-red-700/30 mb-4">
            <View className="flex-row items-start gap-2 mb-3">
              <Text className="text-red-400 text-lg">⚠️</Text>
              <View className="flex-1">
                <Text className="text-red-200 font-bold">Status Change Detected</Text>
                <Text className="text-red-300 text-xs mt-1">
                  This edit will be logged and requires a reason for audit purposes.
                </Text>
              </View>
            </View>

            {/* Reason Input */}
            <View className="mb-2">
              <Text className="text-white font-bold text-sm mb-2">Reason for Change *</Text>
              <TextInput
                placeholder="e.g., Student produced medical certificate, etc."
                placeholderTextColor="#94a3b8"
                value={editReason}
                onChangeText={setEditReason}
                multiline
                numberOfLines={4}
                className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
              />
              {errors.reason && (
                <Text className="text-red-400 text-xs mt-1">{errors.reason}</Text>
              )}
            </View>

            {/* Edit Info */}
            <View className="bg-slate-800/50 rounded-lg p-2 mt-3">
              <Text className="text-slate-300 text-xs">
                ℹ️ All edits are logged with timestamp and faculty ID for accountability.
              </Text>
            </View>
          </Card>
        )}

        {/* No Change Notice */}
        {selectedStatus === student.status && (
          <Card className="bg-slate-800 border border-slate-700 mb-4">
            <Text className="text-slate-400 text-sm">No status change selected</Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-slate-800 border-t border-slate-700 p-4 flex-row gap-3">
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          className="flex-1 bg-slate-700"
        />
        <Button
          title="Save"
          onPress={handleSave}
          className={`flex-1 ${selectedStatus !== student.status ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}
          disabled={selectedStatus === student.status}
        />
      </View>
    </View>
  );
};

export default EditAttendanceScreen;
