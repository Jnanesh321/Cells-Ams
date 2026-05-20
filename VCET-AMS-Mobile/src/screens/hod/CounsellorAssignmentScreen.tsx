import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { MOCK_COUNSELLOR_ASSIGNMENTS, getAllFacultyAssignments } from '../../mock/counselling';
import { getFacultySubjects, getFacultyInfo } from '../../mock/facultySubjects';
import { mockStudents } from '../../mock/students';
import Card from '../../components/Card';
import type { CounsellorAssignment } from '../../types';

export default function CounsellorAssignmentScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const dept = user?.department ?? 'CSE';

  const currentAssignments = useMemo(() => getAllFacultyAssignments(dept), [dept]);

  // Get unique faculty in this department
  const facultyList = useMemo(() => {
    const uniqueIds = [...new Set(
      getFacultySubjects('').length > 0
        ? MOCK_COUNSELLOR_ASSIGNMENTS.filter(a => a.department === dept).map(a => a.facultyUsn)
        : []
    )];
    // Fallback: derive from faculty subjects
    const allSubjects = getFacultySubjects(user?.usn ?? '');
    return uniqueIds.map(id => getFacultyInfo(id)).filter(Boolean);
  }, [dept, user]);

  // Students without counsellor
  const unassignedStudents = useMemo(() => {
    const assignedUsns = new Set(currentAssignments.map(a => a.studentUsn));
    return mockStudents.filter(s => s.department === dept && !assignedUsns.has(s.usn));
  }, [dept, currentAssignments]);

  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  const handleAssign = (studentUsn: string) => {
    if (!selectedFaculty) {
      Alert.alert('Select Faculty', 'Please select a faculty member first');
      return;
    }
    Alert.alert(
      'Confirm Assignment',
      `Assign ${studentUsn} to ${currentAssignments.find(a => a.facultyUsn === selectedFaculty)?.facultyName ?? selectedFaculty}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => Alert.alert('Success', 'Counsellor assigned (mock)'),
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Counsellor Assignments
        </Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
          {dept} Department
        </Text>

        {/* Current Assignments Summary */}
        <View className="flex-row gap-2 mt-4 mb-4">
          <Card className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{currentAssignments.length}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Assigned</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{unassignedStudents.length}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Unassigned</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {[...new Set(currentAssignments.map(a => a.facultyUsn))].length}
            </Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>Faculty</Text>
          </Card>
        </View>

        {/* Faculty List */}
        <Text className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
          Counselling Faculty
        </Text>

        {[...new Set(currentAssignments.map(a => a.facultyUsn))].map((facultyUsn) => {
          const info = getFacultyInfo(facultyUsn);
          const count = currentAssignments.filter(a => a.facultyUsn === facultyUsn).length;
          const isSelected = selectedFaculty === facultyUsn;
          return (
            <TouchableOpacity
              key={facultyUsn}
              onPress={() => setSelectedFaculty(isSelected ? null : facultyUsn)}
              className="mb-2"
            >
              <Card
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: isSelected ? colors.accentHod : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center mr-3">
                    <Text className="text-white text-xs font-bold">
                      {info?.facultyName?.split(' ').map(s => s[0]).join('').slice(0, 2) ?? 'NA'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                      {info?.facultyName ?? facultyUsn}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                      {count} student{count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="bg-indigo-600 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-bold">Selected</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Unassigned Students */}
        {unassignedStudents.length > 0 && (
          <>
            <Text className="font-bold text-sm uppercase tracking-wider mt-4 mb-3" style={{ color: colors.textSecondary }}>
              Unassigned Students ({unassignedStudents.length})
            </Text>
            {unassignedStudents.slice(0, 10).map((s) => (
              <View key={s.usn} className="flex-row items-center rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary }}>
                <View className="flex-1">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>{s.name}</Text>
                  <Text className="text-xs font-mono" style={{ color: colors.textMuted }}>{s.usn}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleAssign(s.usn)}
                  className="bg-indigo-600 rounded-lg px-3 py-2"
                  style={{ opacity: selectedFaculty ? 1 : 0.5 }}
                >
                  <Text className="text-white text-xs font-bold">
                    {selectedFaculty ? 'Assign' : 'Select faculty'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            {unassignedStudents.length > 10 && (
              <Text className="text-xs text-center mt-2" style={{ color: colors.textMuted }}>
                +{unassignedStudents.length - 10} more
              </Text>
            )}
          </>
        )}

        {unassignedStudents.length === 0 && (
          <Card className="mt-4">
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              All students have counsellors assigned
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
