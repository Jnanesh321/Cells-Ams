import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSubjectAssignmentStore } from '../../store/subjectAssignmentStore';
import { getFacultyByDept, type FacultyMember } from '../../mock/faculty';
import type { SubjectAssignment } from '../../types';
import Card from '../../components/Card';

const SEMESTERS = [3, 5, 7];
const SECTIONS = ['A', 'B'];

const MAX_FACULTY_LOAD = 3;

export default function SubjectAssignmentScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const { assignments, loadMockData, assignFaculty, forceAssignFaculty, unassignFaculty } = useSubjectAssignmentStore();

  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSem, setSelectedSem] = useState(5);
  const [selectedSection, setSelectedSection] = useState('A');
  const [pickerAssignment, setPickerAssignment] = useState<SubjectAssignment | null>(null);
  const [showAssigned, setShowAssigned] = useState(false);

  useEffect(() => {
    loadMockData();
  }, [loadMockData]);

  const deptFaculty = useMemo(
    () => getFacultyByDept(user?.department ?? selectedDept),
    [user?.department, selectedDept]
  );

  const deptAssignments = useMemo(
    () => assignments.filter((a) => a.department === selectedDept && a.semesterNo === selectedSem && a.section === selectedSection && a.isActive),
    [assignments, selectedDept, selectedSem, selectedSection]
  );

  const facultyLoadCount = useCallback(
    (facultyId: string): number => {
      return assignments.filter(
        (a) => a.facultyId === facultyId && a.department === selectedDept && a.semesterNo === selectedSem && a.isActive
      ).length;
    },
    [assignments, selectedDept, selectedSem]
  );

  const handleAssign = useCallback(
    (assignmentId: string, facultyId: string, facultyName: string) => {
      try {
        assignFaculty(assignmentId, facultyId, facultyName);
        setPickerAssignment(null);
      } catch (e: any) {
        Alert.alert('Assignment Error', e.message);
      }
    },
    [assignFaculty]
  );

  const handleForceAssign = useCallback(
    (assignmentId: string, facultyId: string, facultyName: string) => {
      Alert.alert(
        'Faculty Load Limit',
        'Faculty load limit reached. Proceeding will exceed recommended limit.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Assign Anyway', style: 'destructive', onPress: () => { forceAssignFaculty(assignmentId, facultyId, facultyName); setPickerAssignment(null); } },
        ]
      );
    },
    [forceAssignFaculty]
  );

  const handleUnassign = useCallback(
    (assignmentId: string, currentFaculty: string) => {
      Alert.alert('Unassign Faculty', `Remove ${currentFaculty} from this subject?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unassign', style: 'destructive', onPress: () => unassignFaculty(assignmentId) },
      ]);
    },
    [unassignFaculty]
  );

  const renderAssignment = ({ item }: { item: SubjectAssignment }) => {
    const assigned = item.facultyId !== null;
    return (
      <Card className="mb-2.5" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-semibold text-base flex-1" style={{ color: colors.text }}>{item.subjectName}</Text>
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: item.subjectType === 'LAB' ? 'rgba(234,88,12,0.5)' : item.subjectType === 'ELECTIVE' ? 'rgba(147,51,234,0.5)' : 'rgba(59,130,246,0.5)', borderColor: item.subjectType === 'LAB' ? '#ea580c' : item.subjectType === 'ELECTIVE' ? '#9333ea' : '#3b82f6', borderWidth: 1 }}>
                <Text className="text-[10px] font-bold text-white">{item.subjectType}</Text>
              </View>
            </View>
            <Text className="text-xs font-mono" style={{ color: colors.textMuted }}>{item.subjectCode} · Sem {item.semesterNo} · Sec {item.section}</Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>{item.credits} credits</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (assigned) {
                handleUnassign(item.id, item.facultyName ?? '');
              } else {
                setPickerAssignment(item);
              }
            }}
            className="rounded-xl px-3 py-2"
            style={{ backgroundColor: assigned ? 'rgba(217,119,6,0.5)' : '#4f46e5', borderColor: assigned ? 'rgba(217,119,6,0.5)' : '#4f46e5', borderWidth: assigned ? 1 : 0 }}
          >
            <Text className="text-xs font-semibold" style={{ color: assigned ? '#fcd34d' : '#ffffff' }}>
              {assigned ? item.facultyName : 'Assign'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderPickerModal = () => {
    if (!pickerAssignment) return null;
    const sortedFaculty = [...deptFaculty].sort((a, b) => a.name.localeCompare(b.name));
    return (
      <Modal visible animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View className="rounded-t-2xl p-5 max-h-[80%]" style={{ backgroundColor: colors.bg }}>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>Assign Faculty</Text>
                <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{pickerAssignment.subjectName} ({pickerAssignment.subjectCode})</Text>
              </View>
              <TouchableOpacity onPress={() => setPickerAssignment(null)}>
                <Text className="text-lg" style={{ color: colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={sortedFaculty}
              keyExtractor={(f) => f.id}
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Text style={{ color: colors.textMuted }}>No faculty in {selectedDept}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const load = facultyLoadCount(item.id);
                const isFull = load >= MAX_FACULTY_LOAD;
                const showWarning = load === MAX_FACULTY_LOAD - 1;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (isFull) {
                        handleForceAssign(pickerAssignment.id, item.id, item.name);
                        return;
                      }
                      handleAssign(pickerAssignment.id, item.id, item.name);
                    }}
                    className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-2"
                    style={{ backgroundColor: isFull ? `${colors.bgCard}80` : colors.bgCard, borderColor: isFull ? colors.border : colors.border, borderWidth: isFull ? 0 : 1 }}
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-semibold" style={{ color: isFull ? colors.textMuted : colors.text }}>{item.name}</Text>
                      <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.designation} · {load} assigned this semester</Text>
                      {showWarning && !isFull && (
                        <Text className="text-amber-400 text-[10px] mt-1">⚠ Only 1 slot left</Text>
                      )}
                      {isFull && (
                        <Text className="text-amber-400 text-[10px] mt-1">⚠ High Load</Text>
                      )}
                    </View>
                    <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: load === 0 ? 'rgba(22,163,74,0.5)' : load >= MAX_FACULTY_LOAD - 1 ? 'rgba(217,119,6,0.5)' : colors.bgTertiary, borderColor: load === 0 ? 'rgba(22,163,74,0.5)' : load >= MAX_FACULTY_LOAD - 1 ? 'rgba(217,119,6,0.5)' : colors.border, borderWidth: load === 0 || load >= MAX_FACULTY_LOAD - 1 ? 1 : 0 }}>
                      <Text className="text-xs font-bold" style={{ color: load === 0 ? '#86efac' : load >= MAX_FACULTY_LOAD - 1 ? '#fcd34d' : colors.textSecondary }}>
                        {load}/{MAX_FACULTY_LOAD}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const assignedList = deptAssignments.filter((a) => a.facultyId !== null);
  const unassignedList = deptAssignments.filter((a) => a.facultyId === null);
  const displayData = showAssigned ? assignedList : unassignedList;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="px-4 pt-16 pb-4 border-b" style={{ backgroundColor: colors.bg, borderBottomColor: colors.border }}>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>Subject Assignments</Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{selectedDept} · Sem {selectedSem} · Sec {selectedSection}</Text>
      </View>

      {/* Department Pills */}
      <View className="flex-row px-4 py-3 gap-1.5 border-b" style={{ borderBottomColor: colors.border }}>
        {['CSE', 'ECE', 'MECH', 'ISE', 'MCA'].map((dept) => (
          <TouchableOpacity
            key={dept}
            onPress={() => { setSelectedDept(dept); setShowAssigned(false); }}
            className={`px-3 py-1.5 rounded-full ${selectedDept === dept ? '' : ''}`}
            style={{ backgroundColor: selectedDept === dept ? '#4f46e5' : colors.bgCard, borderColor: selectedDept === dept ? '#4f46e5' : colors.border, borderWidth: selectedDept === dept ? 0 : 1 }}
          >
            <Text className="text-xs font-medium" style={{ color: selectedDept === dept ? '#ffffff' : colors.textSecondary }}>{dept}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Semester & Section Filters */}
      <View className="flex-row items-center px-4 py-2 gap-3 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row gap-1.5 flex-1">
          {SEMESTERS.map((sem) => (
            <TouchableOpacity
              key={sem}
              onPress={() => { setSelectedSem(sem); setShowAssigned(false); }}
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: selectedSem === sem ? '#06b6d4' : colors.bgCard, borderColor: selectedSem === sem ? '#06b6d4' : colors.border, borderWidth: selectedSem === sem ? 0 : 1 }}
            >
              <Text className="text-xs font-semibold" style={{ color: selectedSem === sem ? '#ffffff' : colors.textSecondary }}>Sem {sem}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-1.5">
          {SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => setSelectedSection(sec)}
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: selectedSection === sec ? '#16a34a' : colors.bgCard, borderColor: selectedSection === sec ? '#16a34a' : colors.border, borderWidth: selectedSection === sec ? 0 : 1 }}
            >
              <Text className="text-xs font-semibold" style={{ color: selectedSection === sec ? '#ffffff' : colors.textSecondary }}>Sec {sec}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Toggle Assigned / Unassigned */}
      <View className="flex-row px-4 py-3 gap-2">
        <TouchableOpacity
          onPress={() => setShowAssigned(false)}
          className="flex-1 py-2 rounded-xl items-center"
          style={{ backgroundColor: !showAssigned ? '#4f46e5' : colors.bgCard, borderColor: !showAssigned ? '#4f46e5' : colors.border, borderWidth: !showAssigned ? 0 : 1 }}
        >
          <Text className="text-sm font-semibold" style={{ color: !showAssigned ? '#ffffff' : colors.textSecondary }}>
            Unassigned ({unassignedList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowAssigned(true)}
          className="flex-1 py-2 rounded-xl items-center"
          style={{ backgroundColor: showAssigned ? '#4f46e5' : colors.bgCard, borderColor: showAssigned ? '#4f46e5' : colors.border, borderWidth: showAssigned ? 0 : 1 }}
        >
          <Text className="text-sm font-semibold" style={{ color: showAssigned ? '#ffffff' : colors.textSecondary }}>
            Assigned ({assignedList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons name={showAssigned ? 'people-outline' : 'book-outline'} size={48} color={colors.textMuted} />
            <Text className="text-sm mt-3" style={{ color: colors.textMuted }}>
              {showAssigned ? 'No assigned subjects' : 'All subjects are assigned'}
            </Text>
          </View>
        }
        renderItem={renderAssignment}
      />

      {renderPickerModal()}
    </View>
  );
}
