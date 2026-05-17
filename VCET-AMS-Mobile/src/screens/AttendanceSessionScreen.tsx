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
import { useAttendanceStore } from '../store/attendance';
import { AttendanceStatus } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

const AttendanceSessionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setCurrentSession, updateStudentStatus, markAllPresent } = useAttendanceStore();
  
  const session = route.params?.session;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Set the session in the store
  React.useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session, setCurrentSession]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery || !session) return session.students;
    const query = searchQuery.toLowerCase();
    return session.students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.usn.toLowerCase().includes(query)
    );
  }, [searchQuery, session]);

  const stats = useMemo(() => {
    if (!session) return { present: 0, absent: 0, od: 0 };
    return {
      present: session.students.filter((s) => s.status === 'PRESENT').length,
      absent: session.students.filter((s) => s.status === 'ABSENT').length,
      od: session.students.filter((s) => s.status === 'OD').length,
    };
  }, [session]);

  const toggleStatus = (usn: string) => {
    const student = session.students.find((s) => s.usn === usn);
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
        return '#10b981'; // green
      case 'ABSENT':
        return '#ef4444'; // red
      case 'OD':
        return '#f59e0b'; // amber
      default:
        return '#94a3b8'; // slate
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
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-white">No session data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 border-b border-slate-700 px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-blue-400 font-semibold">← Back</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white text-lg font-bold">{session.subjectName}</Text>
          <Text className="text-slate-400 text-sm">
            {session.subjectCode} • Section {session.section} • {session.date} {session.time}
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex-row justify-between">
        <View className="flex-1 items-center">
          <Text className="text-green-400 font-bold text-lg">{stats.present}</Text>
          <Text className="text-green-400 text-xs">Present</Text>
        </View>
        <View className="bg-slate-700 w-px" />
        <View className="flex-1 items-center">
          <Text className="text-red-400 font-bold text-lg">{stats.absent}</Text>
          <Text className="text-red-400 text-xs">Absent</Text>
        </View>
        <View className="bg-slate-700 w-px" />
        <View className="flex-1 items-center">
          <Text className="text-amber-400 font-bold text-lg">{stats.od}</Text>
          <Text className="text-amber-400 text-xs">OD</Text>
        </View>
      </View>

      {/* Search & Quick Actions */}
      <View className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex-row justify-between items-center gap-2">
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="flex-1 bg-slate-700 rounded-lg px-3 py-2"
        >
          <Text className="text-slate-400 text-sm">🔍 Search...</Text>
        </TouchableOpacity>
        <Button
          title="Mark All P"
          onPress={handleMarkAllPresent}
          className="bg-green-600/20 border border-green-600 flex-1 py-2"
        />
      </View>

      {/* Search Input (Conditional) */}
      {showSearch && (
        <View className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <TextInput
            placeholder="Search by name or USN..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
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
              // Navigate to edit screen
              navigation.navigate('EditAttendance', {
                student: item,
                sessionId: session.id,
              });
            }}
            activeOpacity={0.7}
          >
            <View className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-semibold">{item.name}</Text>
                <Text className="text-slate-400 text-sm">{item.usn}</Text>
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
      <View className="bg-slate-800 border-t border-slate-700 p-4">
        <Button
          title={`Review & Submit (${session.students.length} students)`}
          onPress={handleReview}
          className="bg-blue-600 font-bold"
        />
      </View>
    </View>
  );
};

export default AttendanceSessionScreen;
