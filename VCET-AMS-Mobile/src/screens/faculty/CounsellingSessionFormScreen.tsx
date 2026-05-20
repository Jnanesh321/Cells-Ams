import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { createCounsellingSession } from '../../mock/counselling';
import type { CounsellingSessionFormData } from '../../types';

export default function CounsellingSessionFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors } = useAppTheme();

  const { studentUserId, studentName, studentUsn } = route.params ?? {};

  const [observation, setObservation] = useState('');
  const [studentStatus, setStudentStatus] = useState('');
  const [guidance, setGuidance] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [saving, setSaving] = useState(false);

  const isFormValid = observation.trim().length > 0 && guidance.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert('Required', 'Faculty observation and guidance are required');
      return;
    }

    setSaving(true);
    try {
      const data: CounsellingSessionFormData = {
        observation: observation.trim(),
        studentStatus: studentStatus.trim(),
        guidance: guidance.trim(),
        followUp: followUp.trim(),
        nextSessionDate: nextSessionDate.trim() || undefined,
      };

      createCounsellingSession({
        id: 0,
        studentUserId: studentUserId ?? 0,
        studentName: studentName ?? '',
        studentUsn: studentUsn ?? '',
        facultyUserId: 2,
        facultyName: user?.name ?? '',
        ...data,
        sessionDate: '',
        status: 'COMPLETED',
      });

      Alert.alert('Saved', 'Counselling session recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.bgTertiary,
    color: colors.text,
    borderColor: colors.border,
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Header */}
          <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
            New Counselling Session
          </Text>
          <Text className="text-xl font-bold mt-1" style={{ color: colors.text }}>
            {studentName ?? 'Student'}
          </Text>
          <Text className="text-sm font-mono mt-0.5" style={{ color: colors.textMuted }}>
            {studentUsn}
          </Text>

          {/* Section 1: Faculty Observation */}
          <View className="mt-6 mb-4">
            <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
              Section 1: Faculty Observation
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.textTertiary }}>
              Examples: student doing well, attendance concern, low confidence, uncomfortable, academic stress
            </Text>
            <TextInput
              className="border rounded-xl p-4 min-h-[100px]"
              style={inputStyle}
              value={observation}
              onChangeText={setObservation}
              placeholder="Describe your observations..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Section 2: Student Current Status */}
          <View className="mb-4">
            <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
              Section 2: Student Current Status
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.textTertiary }}>
              Examples: stress, family issue, health, academic pressure, placement concern
            </Text>
            <TextInput
              className="border rounded-xl p-4 min-h-[100px]"
              style={inputStyle}
              value={studentStatus}
              onChangeText={setStudentStatus}
              placeholder="Describe student's current status..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Section 3: Faculty Guidance */}
          <View className="mb-4">
            <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
              Section 3: Faculty Guidance
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.textTertiary }}>
              Examples: study plan, attendance advice, referrals, mentoring
            </Text>
            <TextInput
              className="border rounded-xl p-4 min-h-[100px]"
              style={inputStyle}
              value={guidance}
              onChangeText={setGuidance}
              placeholder="Describe guidance provided..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Section 4: Follow-up */}
          <View className="mb-4">
            <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
              Section 4: Follow-up
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.textTertiary }}>
              Examples: next action, escalation, next session date
            </Text>
            <TextInput
              className="border rounded-xl p-4 min-h-[80px]"
              style={inputStyle}
              value={followUp}
              onChangeText={setFollowUp}
              placeholder="Follow-up actions..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Next Session Date */}
          <View className="mb-6">
            <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
              Next Session Date (optional)
            </Text>
            <TextInput
              className="border rounded-xl p-4"
              style={inputStyle}
              value={nextSessionDate}
              onChangeText={setNextSessionDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !isFormValid}
            className="bg-green-600 rounded-xl py-4 items-center mb-8"
            style={{ opacity: saving || !isFormValid ? 0.6 : 1 }}
          >
            <Text className="text-white font-bold text-lg">
              {saving ? 'Saving...' : 'Save Session'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
