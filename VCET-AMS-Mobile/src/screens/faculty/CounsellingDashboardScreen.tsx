import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getFacultyCounsellingAssignments,
  getCounsellingDueAssignments,
  getCounsellingOverdueAssignments,
  getCounsellingCompletedAssignments,
} from '../../mock/counselling';
import Card from '../../components/Card';
import type { CounsellorAssignment } from '../../types';

function getStatusColor(status: string): string {
  switch (status) {
    case 'OVERDUE': return '#ef4444';
    case 'DUE': return '#f59e0b';
    case 'COMPLETED': return '#10b981';
    default: return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'OVERDUE': return 'Overdue';
    case 'DUE': return 'Due';
    case 'COMPLETED': return 'Completed';
    default: return 'Unknown';
  }
}

function getAttendanceColor(pct: number | undefined): string {
  if (pct == null) return '#6b7280';
  if (pct < 75) return '#ef4444';
  if (pct < 85) return '#f59e0b';
  return '#10b981';
}

function StudentCard({
  assignment,
  onPress,
  colors,
}: {
  assignment: CounsellorAssignment;
  onPress: () => void;
  colors: any;
}) {
  const statusColor = getStatusColor(assignment.status);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        className="mb-3"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: statusColor,
          borderWidth: 1,
          borderLeftWidth: 4,
        }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-semibold text-base" style={{ color: colors.text }}>
              {assignment.studentName}
            </Text>
            <Text className="text-xs font-mono mt-0.5" style={{ color: colors.textMuted }}>
              {assignment.studentUsn} • Sec {assignment.studentSection ?? 'A'}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <Text className="text-xs" style={{ color: getAttendanceColor(assignment.attendancePercent) }}>
                Att: {assignment.attendancePercent ?? 'N/A'}%
              </Text>
              {assignment.lastSessionDate ? (
                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                  Last: {assignment.lastSessionDate}
                </Text>
              ) : null}
            </View>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text className="text-xs font-bold" style={{ color: statusColor }}>
              {getStatusLabel(assignment.status)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function CounsellingDashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'DUE' | 'COMPLETED' | 'OVERDUE'>('ALL');

  const facultyUsn = user?.usn ?? 'FAC_CSE_001';

  const allAssignments = useMemo(() => getFacultyCounsellingAssignments(facultyUsn), [facultyUsn]);
  const dueAssignments = useMemo(() => getCounsellingDueAssignments(facultyUsn), [facultyUsn]);
  const overdueAssignments = useMemo(() => getCounsellingOverdueAssignments(facultyUsn), [facultyUsn]);
  const completedAssignments = useMemo(() => getCounsellingCompletedAssignments(facultyUsn), [facultyUsn]);

  const displayedAssignments = useMemo(() => {
    switch (filter) {
      case 'DUE': return dueAssignments;
      case 'OVERDUE': return overdueAssignments;
      case 'COMPLETED': return completedAssignments;
      default: return allAssignments;
    }
  }, [filter, allAssignments, dueAssignments, overdueAssignments, completedAssignments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filters = [
    { key: 'ALL' as const, label: `All (${allAssignments.length})` },
    { key: 'DUE' as const, label: `Due (${dueAssignments.length})` },
    { key: 'COMPLETED' as const, label: `Done (${completedAssignments.length})` },
    { key: 'OVERDUE' as const, label: `Overdue (${overdueAssignments.length})` },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentFaculty} />
      }
    >
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Counselling
        </Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
          My Students
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {allAssignments.length} assigned • {overdueAssignments.length} overdue
        </Text>

        {/* Stats */}
        <View className="flex-row gap-2 mt-4 mb-4">
          <Card className="flex-1" style={{ borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-2xl font-bold" style={{ color: '#10b981' }}>{completedAssignments.length}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Completed</Text>
          </Card>
          <Card className="flex-1" style={{ borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{dueAssignments.length}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Due</Text>
          </Card>
          <Card className="flex-1" style={{ borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-2xl font-bold" style={{ color: '#ef4444' }}>{overdueAssignments.length}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Overdue</Text>
          </Card>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: filter === f.key ? colors.accentFaculty : colors.bgCard,
                  borderColor: filter === f.key ? colors.accentFaculty : colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: filter === f.key ? '#ffffff' : colors.textSecondary }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Students List */}
        {displayedAssignments.map((a) => (
          <StudentCard
            key={a.id}
            assignment={a}
            colors={colors}
            onPress={() =>
              navigation.navigate('CounsellingStudentDetail', {
                studentUserId: a.studentUserId,
                studentName: a.studentName,
                studentUsn: a.studentUsn,
              })
            }
          />
        ))}

        {displayedAssignments.length === 0 && (
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              No students in this category
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
