import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { getFacultySubjects, getStudentsForSubject } from '../mock/facultySubjects';
import { getStudentAttendance, getStudentsForSubject as getDetainedStudents } from '../mock/studentAttendance';
import { mockStudents } from '../mock';
import Card from '../components/Card';
import Button from '../components/Button';

interface FacultySubjectAssignment {
  facultyId: string;
  facultyName: string;
  department: string;
  subject: string;
  subjectCode: string;
  section: string;
  semester: number;
  students?: string[];
  enrollmentCount?: number;
  lastUpdated?: string;
}

const SubjectPickerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<FacultySubjectAssignment | null>(
    route.params?.selectedSubject || null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  const facultyId = user?.id || '';
  const facultySubjects = getFacultySubjects(facultyId);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return facultySubjects;
    return facultySubjects.filter((subject) =>
      subject.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, facultySubjects]);

  const getStatusColor = (lastUpdated?: string): string => {
    if (!lastUpdated) return '#ef4444'; // red
    const today = new Date().toISOString().split('T')[0];
    return lastUpdated === today ? '#10b981' : '#f59e0b'; // green or amber
  };

  const getStatusText = (lastUpdated?: string): string => {
    if (!lastUpdated) return 'Not marked';
    const today = new Date().toISOString().split('T')[0];
    return lastUpdated === today ? 'Marked today' : `Last: ${lastUpdated}`;
  };

  const handleSelectSubject = (subject: FacultySubjectAssignment) => {
    setSelectedSubject(subject);
  };

  const getStudentCount = (): number => {
    if (!selectedSubject) return 0;
    return selectedSubject.enrollmentCount || 0;
  };

  const getDetentionCount = (): number => {
    if (!selectedSubject) return 0;
    const detainees = getDetainedStudents(
      selectedSubject.subjectCode,
      selectedSubject.section
    );
    return detainees.filter((student) =>
      student.enrolledSubjects.some(
        (subject) =>
          subject.subjectCode === selectedSubject.subjectCode &&
          subject.attendancePercentage < 75
      )
    ).length;
  };

  const handleProceedToAttendance = () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }

    // Get students for this subject
    const subjectStudents = getStudentsForSubject(
      selectedSubject.subjectCode,
      selectedSubject.section
    );

    if (subjectStudents.length === 0) {
      Alert.alert('Error', 'No students found for this subject');
      return;
    }

    // Create attendance session
    const session = {
      id: `SESSION_${selectedSubject.subjectCode}_${selectedDate}_${selectedTime}`,
      subjectCode: selectedSubject.subjectCode,
      subjectName: selectedSubject.subject,
      date: selectedDate,
      time: selectedTime,
      sessionType: 'lecture' as const,
      section: selectedSubject.section,
      facultyId: facultyId,
      students: subjectStudents.map((usn) => {
        const student = mockStudents.find((s) => s.usn === usn);
        const attendance = getStudentAttendance(usn);
        const subject = attendance?.enrolledSubjects.find(
          (s) => s.subjectCode === selectedSubject.subjectCode
        );
        return {
          usn,
          name: student?.name || 'Unknown',
          section: selectedSubject.section,
          status: subject?.status || ('PRESENT' as const),
        };
      }),
      createdAt: new Date().toISOString(),
      status: 'draft' as const,
    };

    navigation.navigate('AttendanceSession', { session });
  };

  const isFormValid = selectedSubject;

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 border-b border-slate-700 pt-4 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-4">
          <Text className="text-blue-400 font-semibold">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold px-4 mt-2">Select Subject & Date</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              placeholder="Search subjects..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3"
            />
          </View>

          {/* Subjects List */}
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
            Your Subjects ({facultySubjects.length})
          </Text>

          {filteredSubjects.length === 0 ? (
            <Card className="bg-slate-800 border border-slate-700 py-8">
              <Text className="text-slate-400 text-center">
                {facultySubjects.length === 0 ? 'No subjects assigned' : 'No matching subjects'}
              </Text>
            </Card>
          ) : (
            filteredSubjects.map((subject, idx) => {
              const isSelected =
                selectedSubject?.subjectCode === subject.subjectCode &&
                selectedSubject?.section === subject.section;
              const statusColor = getStatusColor(subject.lastUpdated);
              const detainedCount = getDetentionCount();

              return (
                <TouchableOpacity
                  key={`${subject.subjectCode}-${subject.section}-${idx}`}
                  onPress={() => handleSelectSubject(subject)}
                  activeOpacity={0.7}
                >
                  <Card
                    className={`border mb-3 ${
                      isSelected
                        ? 'bg-blue-900 border-blue-600'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text
                            className={`text-base font-bold ${
                              isSelected ? 'text-blue-200' : 'text-white'
                            }`}
                          >
                            {subject.subject}
                          </Text>
                          {detainedCount > 0 && (
                            <View className="bg-red-600/30 border border-red-500 rounded px-2">
                              <Text className="text-red-300 text-xs font-bold">
                                {detainedCount} Detained
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          className={`text-sm ${
                            isSelected ? 'text-blue-300' : 'text-slate-400'
                          }`}
                        >
                          {subject.subjectCode} • Sec {subject.section} • Sem {subject.semester}
                        </Text>
                        <View className="flex-row gap-2 mt-2">
                          <View
                            className={`rounded px-2 py-1 ${
                              isSelected ? 'bg-blue-800' : 'bg-slate-700'
                            }`}
                          >
                            <Text
                              className={`text-xs ${
                                isSelected ? 'text-blue-100' : 'text-slate-300'
                              }`}
                            >
                              📚 {subject.enrollmentCount} Students
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="items-end ml-2">
                        <View
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: `${statusColor}20` }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: statusColor }}
                          >
                            {subject.lastUpdated ? '✓' : '◯'}
                          </Text>
                        </View>
                        <Text className="text-xs text-slate-400 mt-1">
                          {getStatusText(subject.lastUpdated)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}

          {/* Divider */}
          {selectedSubject && (
            <>
              <View className="bg-slate-700 h-px my-6" />

              {/* Subject Summary */}
              <Card className="bg-blue-900/20 border border-blue-700 mb-6">
                <Text className="text-blue-300 text-sm mb-2">Selected Subject</Text>
                <Text className="text-white font-bold text-lg mb-1">
                  {selectedSubject.subject}
                </Text>
                <View className="flex-row gap-3 mt-2">
                  <View className="flex-1">
                    <Text className="text-slate-400 text-xs">Code</Text>
                    <Text className="text-white font-semibold">{selectedSubject.subjectCode}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-xs">Students</Text>
                    <Text className="text-white font-semibold">
                      {getStudentCount()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-xs">Detained</Text>
                    <Text className="text-red-400 font-semibold">{getDetentionCount()}</Text>
                  </View>
                </View>
              </Card>

              {/* Date & Time Selection */}
              <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
                Date & Time
              </Text>

              <Card className="bg-slate-800 border border-slate-700 mb-6">
                <View className="mb-3">
                  <Text className="text-slate-400 text-sm mb-2">Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                    className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                  />
                </View>
                <View>
                  <Text className="text-slate-400 text-sm mb-2">Time</Text>
                  <TextInput
                    placeholder="HH:MM"
                    placeholderTextColor="#94a3b8"
                    value={selectedTime}
                    onChangeText={setSelectedTime}
                    className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                  />
                </View>
              </Card>

              {/* Proceed Button */}
              <Button
                title={`Start Attendance (${getStudentCount()} students)`}
                onPress={handleProceedToAttendance}
                className={`${
                  isFormValid ? 'bg-green-600' : 'bg-slate-700 opacity-50'
                } mb-6`}
                disabled={!isFormValid}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SubjectPickerScreen;
