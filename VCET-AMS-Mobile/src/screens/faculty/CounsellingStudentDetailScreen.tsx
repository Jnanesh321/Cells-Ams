import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getStudentCounsellingSessions } from '../../mock/counselling';
import Card from '../../components/Card';
import type { CounsellingSession } from '../../types';

function SessionCard({ session, colors }: { session: CounsellingSession; colors: any }) {
  return (
    <Card
      className="mb-3"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
    >
      <View className="mb-3">
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          {session.sessionDate}
        </Text>
        <View
          className="self-start rounded-full px-2 py-0.5 mt-1"
          style={{ backgroundColor: '#10b98120' }}
        >
          <Text className="text-[10px] font-bold text-green-400">Completed</Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
          Faculty Observation
        </Text>
        <Text className="text-sm" style={{ color: colors.text }}>{session.observation}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
          Student Status
        </Text>
        <Text className="text-sm" style={{ color: colors.text }}>{session.studentStatus}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
          Guidance Given
        </Text>
        <Text className="text-sm" style={{ color: colors.text }}>{session.guidance}</Text>
      </View>

      <View>
        <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
          Follow-up
        </Text>
        <Text className="text-sm" style={{ color: colors.text }}>{session.followUp}</Text>
        {session.nextSessionDate ? (
          <Text className="text-xs mt-1" style={{ color: '#f59e0b' }}>
            Next session: {session.nextSessionDate}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

export default function CounsellingStudentDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  const { studentUserId, studentName, studentUsn } = route.params ?? {};

  const sessions = useMemo(() => {
    if (!studentUsn) return [];
    return getStudentCounsellingSessions(studentUsn);
  }, [studentUsn]);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        {/* Student Info */}
        <Card
          className="mb-4 border-0"
          style={{ backgroundColor: colors.accentFaculty }}
        >
          <Text className="text-white text-xl font-bold">{studentName ?? 'Student'}</Text>
          <Text className="text-white/80 text-sm mt-1">{studentUsn}</Text>
          <Text className="text-white/60 text-xs mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
          </Text>
        </Card>

        {/* Create Session Button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CounsellingSessionForm', {
              studentUserId,
              studentName,
              studentUsn,
            })
          }
          className="bg-blue-600 rounded-xl py-3 items-center mb-4"
        >
          <Text className="text-white font-bold text-base">+ New Counselling Session</Text>
        </TouchableOpacity>

        {/* Session Timeline */}
        <Text className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
          Session Timeline
        </Text>

        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} colors={colors} />
        ))}

        {sessions.length === 0 && (
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              No counselling sessions recorded yet
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
