import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { getAttendanceSessionData, saveIAMarks } from '../../mock/backend';
import Card from '../../components/Card';
import { calculateCIE, VTU_RULES, getAttendanceWarningColor } from '../../utils/vtuRules';

type Student = {
  studentProfileId: number;
  usn: string;
  name: string;
  existingMark?: number | null;
};

export default function IAMarksEntryScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const params = route.params ?? {};
  const subjectId = params.subjectId;
  const subjectName = params.subjectName ?? 'Subject';
  const section = params.section ?? 'A';

  if (!subjectId) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center p-4">
        <Text className="text-slate-400 text-lg">Subject not specified</Text>
        <Text className="text-slate-600 text-sm mt-2">Please select a subject first</Text>
      </View>
    );
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [iaNumber, setIANumber] = useState(1);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    void fetchStudents();
  }, [subjectId, section, iaNumber]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await getAttendanceSessionData(subjectId, section, iaNumber);
      const list: Student[] = res.data;
      setStudents(list);
      const existing: Record<number, string> = {};
      list.forEach((s) => {
        if (s.existingMark != null) existing[s.studentProfileId] = String(s.existingMark);
      });
      setMarks(existing);
    } catch {
      Alert.alert('Error', 'Could not load students');
    } finally {
      setLoading(false);
    }
  };

  const current = useMemo(() => students[index], [students, index]);
  const total = students.length;

  const goNext = useCallback(() => {
    if (index < total - 1) setIndex((i) => i + 1);
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  const setMark = useCallback((value: string) => {
    if (!current) return;
    const num = parseFloat(value);
    if (value !== '' && (isNaN(num) || num < 0 || num > 30)) return;
    setMarks((prev) => ({ ...prev, [current.studentProfileId]: value }));
    setHasChanges(true);
  }, [current]);

  const handleSaveAll = async () => {
    const entries = students
      .map((s) => ({
        studentProfileId: s.studentProfileId,
        marksObtained: parseFloat(marks[s.studentProfileId] ?? '0'),
      }))
      .filter((e) => !isNaN(e.marksObtained));

    if (entries.some((e) => e.marksObtained < 0 || e.marksObtained > 30)) {
      Alert.alert('Validation', 'Marks must be between 0 and 30');
      return;
    }

    setSaving(true);
    try {
      await saveIAMarks(subjectId, iaNumber, entries, 30);
      Alert.alert('Saved', `IA${iaNumber} marks saved for ${entries.length} students`);
      setHasChanges(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGoToStudent = (idx: number) => {
    if (hasChanges) {
      Alert.alert('Unsaved Changes', 'Save before navigating?', [
        { text: 'Discard', style: 'destructive', onPress: () => setIndex(idx) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      setIndex(idx);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-slate-400">Loading students...</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-slate-400">No students found</Text>
      </View>
    );
  }

  const markValue = marks[current.studentProfileId] ?? '';

  return (
    <ScrollView className="flex-1 bg-slate-950" keyboardShouldPersistTaps="handled">
      <View className="p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-slate-400 text-xs uppercase tracking-widest">IA Marks Entry</Text>
          <Text className="text-white text-lg font-bold mt-0.5">{subjectName}</Text>
          <Text className="text-slate-400 text-sm">Section {section}</Text>
        </View>

        {/* IA Picker */}
        <View className="flex-row gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => { setIndex(0); setIANumber(n); }}
              className={`flex-1 py-3 rounded-xl ${iaNumber === n ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}
            >
              <Text className={`text-sm font-bold text-center ${iaNumber === n ? 'text-white' : 'text-slate-300'}`}>IA {n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Student Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-1.5">
            {students.map((s, i) => (
              <TouchableOpacity
                key={s.studentProfileId}
                onPress={() => handleGoToStudent(i)}
                className={`px-3 py-2 rounded-lg ${i === index ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs font-mono ${i === index ? 'text-white' : i === index ? 'text-white' : 'text-slate-300'}`}>
                  {s.usn.slice(-3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Single Student Focus Card */}
        <Card className="bg-slate-900 border-blue-800 border-2 mb-4">
          {/* Student Info */}
          <View className="items-center mb-6 pt-2">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-3">
              <Text className="text-white text-xl font-bold">
                {current.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold text-center">{current.name}</Text>
            <Text className="text-slate-400 text-sm font-mono mt-1">
              {current.usn} • {index + 1} / {total}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
            <View className="bg-blue-500 h-full rounded-full" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </View>

          {/* Marks Input */}
          <View className="items-center mb-6">
            <Text className="text-slate-400 text-sm mb-2">Enter Marks (max 30)</Text>
            <View className="flex-row items-center gap-4">
              <TextInput
                ref={inputRef}
                className="bg-slate-800 rounded-2xl px-8 py-5 text-white text-5xl font-bold text-center border-2 border-blue-600 w-44"
                value={markValue}
                onChangeText={setMark}
                keyboardType="decimal-pad"
                maxLength={4}
                autoFocus
                selectTextOnFocus
              />
            </View>
            <Text className="text-slate-500 text-xs mt-2">/ 30 marks</Text>
          </View>

          {/* CIE Calculation */}
          <View className="bg-slate-800 rounded-xl p-3 mb-4 border border-slate-700">
            <Text className="text-slate-400 text-[10px] uppercase tracking-wider mb-2">VTU CIE Calculation</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3].map((n) => {
                const val = n === iaNumber ? (markValue ? parseFloat(markValue) : undefined) : undefined;
                const color = val != null ? (val >= 20 ? '#10b981' : val >= 14 ? '#f59e0b' : '#ef4444') : '#334155';
                return (
                  <View key={n} className="flex-1 bg-slate-900 rounded-lg p-2 items-center border" style={{ borderColor: n === iaNumber ? '#3b82f6' : '#334155' }}>
                    <Text className="text-slate-400 text-xs">IA{n}</Text>
                    <Text className="text-sm font-bold mt-0.5" style={{ color }}>{val != null ? val : '-'}</Text>
                  </View>
                );
              })}
              <View className="flex-1 bg-slate-900 rounded-lg p-2 items-center border border-slate-700">
                <Text className="text-slate-400 text-xs">Asgn</Text>
                <Text className="text-sm font-bold mt-0.5 text-cyan-400">-</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-700">
              <Text className="text-xs text-slate-400">Expected CIE (best 2 IA + Asgn)</Text>
              <Text className="text-sm font-bold text-white">
                {markValue && !isNaN(parseFloat(markValue))
                  ? `~${Math.min(parseFloat(markValue) + (current.existingMark ?? 0), 30)}/${VTU_RULES.CIE_TOTAL}`
                  : 'Enter marks to calculate'}
              </Text>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row gap-3 mb-2">
            <TouchableOpacity
              onPress={goPrev}
              disabled={index === 0}
              className={`flex-1 py-4 rounded-xl items-center ${index === 0 ? 'bg-slate-800 opacity-50' : 'bg-slate-800'}`}
            >
              <Text className="text-slate-300 text-base font-semibold">◀ Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              disabled={index >= total - 1}
              className={`flex-1 py-4 rounded-xl items-center ${index >= total - 1 ? 'bg-slate-800 opacity-50' : 'bg-blue-600'}`}
            >
              <Text className="text-white text-base font-semibold">Next ▶</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-slate-900 border-slate-800 mb-4">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-xs">Entered</Text>
              <Text className="text-white text-lg font-bold">
                {Object.keys(marks).filter((k) => marks[Number(k)] !== '').length}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-xs">Pending</Text>
              <Text className="text-yellow-400 text-lg font-bold">
                {total - Object.keys(marks).filter((k) => marks[Number(k)] !== '').length}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-xs">IA</Text>
              <Text className="text-blue-400 text-lg font-bold">{iaNumber}</Text>
            </View>
          </View>
        </Card>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveAll}
          disabled={saving}
          className="bg-green-600 rounded-xl py-4 items-center mb-8"
        >
          <Text className="text-white font-bold text-lg">{saving ? 'Saving...' : `Save All IA${iaNumber} Marks`}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
