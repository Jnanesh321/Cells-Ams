import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getDepartmentCounsellingSummary, getAllFacultyAssignments } from '../../mock/counselling';
import { getFacultyInfo } from '../../mock/facultySubjects';
import Card from '../../components/Card';
import type { CounsellorAssignment } from '../../types';

export default function HodCounsellingSummaryScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'faculty'>('summary');

  const dept = user?.department ?? 'CSE';

  const summary = useMemo(() => getDepartmentCounsellingSummary(dept), [dept]);
  const allAssignments = useMemo(() => getAllFacultyAssignments(dept), [dept]);

  // Group by faculty
  const facultyGroups = useMemo(() => {
    const groups = new Map<string, CounsellorAssignment[]>();
    allAssignments.forEach((a) => {
      const existing = groups.get(a.facultyUsn) ?? [];
      existing.push(a);
      groups.set(a.facultyUsn, existing);
    });
    return Array.from(groups.entries()).map(([facultyUsn, assignments]) => {
      const info = getFacultyInfo(facultyUsn);
      return {
        facultyUsn,
        facultyName: info?.facultyName ?? assignments[0]?.facultyName ?? 'Unknown',
        totalStudents: assignments.length,
        completed: assignments.filter(a => a.status === 'COMPLETED').length,
        overdue: assignments.filter(a => a.status === 'OVERDUE').length,
        due: assignments.filter(a => a.status === 'DUE').length,
      };
    });
  }, [allAssignments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHod} />}
    >
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Counselling Analytics
        </Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
          {dept} Department
        </Text>

        {/* Summary Cards */}
        <View className="flex-row flex-wrap gap-3 mt-4 mb-4">
          <Card className="flex-1 min-w-[45%]">
            <Text className="text-xs" style={{ color: colors.textMuted }}>Students</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{summary.totalStudents}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]">
            <Text className="text-xs" style={{ color: colors.textMuted }}>Faculty</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{summary.facultyCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#10b98180', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: '#10b981' }}>Done</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>{summary.completedCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#f59e0b80', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: '#f59e0b' }}>Due</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{summary.dueCount}</Text>
          </Card>
          <Card className="flex-1 min-w-[45%]" style={{ borderColor: '#ef444480', borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: '#ef4444' }}>Overdue</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: '#ef4444' }}>{summary.overdueCount}</Text>
          </Card>
        </View>

        {/* View Toggle */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setViewMode('summary')}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: viewMode === 'summary' ? colors.accentHod : colors.bgCard,
              borderColor: viewMode === 'summary' ? colors.accentHod : colors.border,
              borderWidth: 1,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: viewMode === 'summary' ? '#ffffff' : colors.textSecondary }}
            >
              Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('faculty')}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: viewMode === 'faculty' ? colors.accentHod : colors.bgCard,
              borderColor: viewMode === 'faculty' ? colors.accentHod : colors.border,
              borderWidth: 1,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: viewMode === 'faculty' ? '#ffffff' : colors.textSecondary }}
            >
              By Faculty
            </Text>
          </TouchableOpacity>
        </View>

        {/* Faculty List */}
        {viewMode === 'faculty' && (
          <>
            {facultyGroups.map((fg) => (
              <Card key={fg.facultyUsn} className="mb-3" style={{ backgroundColor: colors.bgCard }}>
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center mr-3">
                    <Text className="text-white text-xs font-bold">
                      {fg.facultyName.split(' ').map(s => s[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.text }}>{fg.facultyName}</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{fg.totalStudents} students</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: '#10b98120' }}>
                    <Text className="text-xs font-bold" style={{ color: '#10b981' }}>{fg.completed}</Text>
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>Done</Text>
                  </View>
                  <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: '#f59e0b20' }}>
                    <Text className="text-xs font-bold" style={{ color: '#f59e0b' }}>{fg.due}</Text>
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>Due</Text>
                  </View>
                  <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: '#ef444420' }}>
                    <Text className="text-xs font-bold" style={{ color: '#ef4444' }}>{fg.overdue}</Text>
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>Overdue</Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Summary View — Recent Overdue */}
        {viewMode === 'summary' && (
          <Card className="mb-6">
            <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Pending Attention</Text>
            {allAssignments.filter(a => a.status === 'OVERDUE').slice(0, 5).map((a) => (
              <View key={a.id} className="flex-row items-center rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                <View className="flex-1">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>{a.studentName}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{a.studentUsn}</Text>
                </View>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  {a.facultyName}
                </Text>
              </View>
            ))}
            {allAssignments.filter(a => a.status === 'OVERDUE').length === 0 && (
              <Text className="text-sm" style={{ color: colors.textMuted }}>No overdue counselling sessions</Text>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
