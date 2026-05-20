import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getStudentCounsellingSessions } from '../../mock/counselling';
import Card from '../../components/Card';

export default function StudentCounsellingScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();

  const usn = user?.usn ?? '';
  const sessions = useMemo(() => getStudentCounsellingSessions(usn), [usn]);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Counselling
        </Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
          My Sessions
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
        </Text>

        {sessions.length === 0 && (
          <Card className="mt-4">
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              No counselling sessions recorded yet
            </Text>
          </Card>
        )}

        {sessions.map((s) => (
          <Card
            key={s.id}
            className="mb-3 mt-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="mb-3">
              <Text className="text-xs" style={{ color: colors.textMuted }}>{s.sessionDate}</Text>
              <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                Counsellor: {s.facultyName}
              </Text>
            </View>
            <View className="mb-3">
              <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
                Observation
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>{s.observation}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
                Status
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>{s.studentStatus}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
                Guidance
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>{s.guidance}</Text>
            </View>
            <View>
              <Text className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textSecondary }}>
                Follow-up
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>{s.followUp}</Text>
              {s.nextSessionDate ? (
                <Text className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                  Next: {s.nextSessionDate}
                </Text>
              ) : null}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
