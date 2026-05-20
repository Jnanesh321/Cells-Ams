import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAttendanceStore } from '../store/attendance';
import type { AttendanceStatus, StudentAttendanceRecord } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

const AttendanceSessionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const { setCurrentSession, updateStudentStatus, markAllPresent } = useAttendanceStore();
  
  const session = route.params?.session;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  React.useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session, setCurrentSession]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery || !session) return session.students;
    const query = searchQuery.toLowerCase();
    return session.students.filter(
      (student: StudentAttendanceRecord) =>
        student.name.toLowerCase().includes(query) ||
        student.usn.toLowerCase().includes(query)
    );
  }, [searchQuery, session]);

  const stats = useMemo(() => {
    if (!session) return { present: 0, absent: 0, od: 0 };
    return {
      present: session.students.filter((s: StudentAttendanceRecord) => s.status === 'PRESENT').length,
      absent: session.students.filter((s: StudentAttendanceRecord) => s.status === 'ABSENT').length,
      od: session.students.filter((s: StudentAttendanceRecord) => s.status === 'OD').length,
    };
  }, [session]);

  const toggleStatus = (usn: string) => {
    const student = session.students.find((s: StudentAttendanceRecord) => s.usn === usn);
    if (!student) return;

    let newStatus: AttendanceStatus;
    if (student.status === 'PRESENT') {
      newStatus = 'ABSENT';
    } else if (student.status === 'ABSENT') {
      newStatus = 'OD';
    } else {
      newStatus = 'PRESENT';
    }

    updateStudentStatus(usn, newStatus);
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

  const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
      case 'PRESENT':
        return 'P';
      case 'ABSENT':
        return 'A';
      case 'OD':
        return 'OD';
      default:
        return '';
    }
  };

  const handleReview = () => {
    navigation.navigate('ReviewSubmit', { session });
  };

  const handleMarkAllPresent = () => {
    Alert.alert('Mark All Present', 'Mark all students as present?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          markAllPresent();
        },
      },
    ]);
  };

  if (!session) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>No session data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="border-b px-4 pt-4 pb-3" style={{ backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="font-semibold" style={{ color: colors.accentStudent }}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>{session.subjectName}</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            {session.subjectCode} • Section {session.section} • {session.date} {session.time}
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View className="border-b px-4 py-3 flex-row justify-between" style={{ backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }}>
        <View className="flex-1 items-center">
          <Text className="font-bold text-lg text-green-400">{stats.present}</Text>
          <Text className="text-green-400 text-xs">Present</Text>
        </View>
        <View className="w-px" style={{ backgroundColor: colors.border }} />
        <View className="flex-1 items-center">
          <Text className="font-bold text-lg text-red-400">{stats.absent}</Text>
          <Text className="text-red-400 text-xs">Absent</Text>
        </View>
        <View className="w-px" style={{ backgroundColor: colors.border }} />
        <View className="flex-1 items-center">
          <Text className="font-bold text-lg text-amber-400">{stats.od}</Text>
          <Text className="text-amber-400 text-xs">OD</Text>
        </View>
      </View>

      {/* Search & Quick Actions */}
      <View className="border-b px-4 py-3 flex-row justify-between items-center gap-2" style={{ backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }}>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="flex-1 rounded-lg px-3 py-2"
          style={{ backgroundColor: colors.bgInput }}
        >
          <Text className="text-sm" style={{ color: colors.textMuted }}>🔍 Search...</Text>
        </TouchableOpacity>
        <Button
          title="Mark All P"
          onPress={handleMarkAllPresent}
          variant="success"
          className="flex-1 py-2"
        />
      </View>

      {/* Search Input (Conditional) */}
      {showSearch && (
        <View className="border-b px-4 py-3" style={{ backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }}>
          <TextInput
            placeholder="Search by name or USN..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            className="border rounded-lg px-3 py-2"
            style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border }}
          />
        </View>
      )}

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.usn}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EditAttendance', {
                student: item,
                sessionId: session.id,
              });
            }}
            activeOpacity={0.7}
          >
            <View className="border-b px-4 py-3 flex-row items-center justify-between" style={{ backgroundColor: colors.bg, borderBottomColor: colors.borderLight }}>
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: colors.text }}>{item.name}</Text>
                <Text className="text-sm" style={{ color: colors.textMuted }}>{item.usn}</Text>
              </View>

              {/* Status Toggle */}
              <TouchableOpacity
                onPress={() => toggleStatus(item.usn)}
                activeOpacity={0.7}
              >
                <View
                  className="rounded-lg px-4 py-2 border-2 items-center justify-center"
                  style={{
                    borderColor: getStatusColor(item.status),
                    backgroundColor: `${getStatusColor(item.status)}20`,
                  }}
                >
                  <Text
                    className="font-bold text-sm"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />

      {/* Bottom Action Bar */}
      <View className="border-t p-4" style={{ backgroundColor: colors.bgSecondary, borderTopColor: colors.border }}>
        <Button
          title={`Review & Submit (${session.students.length} students)`}
          onPress={handleReview}
          variant="primary"
        />
      </View>
    </View>
  );
};

export default AttendanceSessionScreen;
