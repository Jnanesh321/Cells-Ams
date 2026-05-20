import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getVTUIAMarks, saveVTUIAMarks } from '../../mock/vtuIAMarks';
import { calcVTUIATotal, calcVTUBestTwo, validateVTUQuestion } from '../../utils/vtuRules';
import Card from '../../components/Card';
import type { VTUIAMarkEntry } from '../../types';

function QuestionInput({
  label,
  value,
  onChange,
  colors,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
  onSubmit?: () => void;
}) {
  return (
    <View className="flex-1">
      <Text className="text-xs text-center mb-1" style={{ color: colors.textMuted }}>{label}</Text>
      <TextInput
        className="rounded-xl py-3 text-center text-lg font-bold border"
        style={{
          backgroundColor: colors.bgTertiary,
          color: colors.text,
          borderColor: colors.border,
        }}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        maxLength={3}
        selectTextOnFocus
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}

export default function VTUIAMarksEntryScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors } = useAppTheme();

  const params = route.params ?? {};
  const subjectCode = params.subjectCode ?? params.subjectId;
  const subjectName = params.subjectName ?? 'Subject';
  const section = params.section ?? 'A';

  if (!subjectCode) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.bg }}>
        <Text className="text-lg" style={{ color: colors.textMuted }}>Subject not specified</Text>
      </View>
    );
  }

  const [students, setStudents] = useState<VTUIAMarkEntry[]>([]);
  const [iaNumber, setIANumber] = useState(1);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Input state: q1_q2_q3_q4 strings per studentProfileId
  const [inputs, setInputs] = useState<Record<string, { q1: string; q2: string; q3: string; q4: string }>>({});

  useEffect(() => {
    setLoading(true);
    const data = getVTUIAMarks(subjectCode, section, iaNumber);
    setStudents(data);
    const initialInputs: Record<string, { q1: string; q2: string; q3: string; q4: string }> = {};
    data.forEach((s) => {
      initialInputs[String(s.studentProfileId)] = {
        q1: s.q1 != null ? String(s.q1) : '',
        q2: s.q2 != null ? String(s.q2) : '',
        q3: s.q3 != null ? String(s.q3) : '',
        q4: s.q4 != null ? String(s.q4) : '',
      };
    });
    setInputs(initialInputs);
    setIndex(0);
    setLoading(false);
  }, [subjectCode, section, iaNumber]);

  const current = students[index];
  const currentInputs = current ? inputs[String(current.studentProfileId)] : null;

  const setQ = useCallback((field: 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
    if (!current) return;
    const numVal = parseFloat(value);
    if (value !== '' && (isNaN(numVal) || !validateVTUQuestion(numVal))) return;
    setInputs((prev) => ({
      ...prev,
      [String(current.studentProfileId)]: {
        ...prev[String(current.studentProfileId)],
        [field]: value,
      },
    }));
  }, [current]);

  const calcResult = useMemo(() => {
    if (!currentInputs) return { sectionA: 0, sectionB: 0, total: 0 };
    return calcVTUIATotal(
      currentInputs.q1 ? parseFloat(currentInputs.q1) : null,
      currentInputs.q2 ? parseFloat(currentInputs.q2) : null,
      currentInputs.q3 ? parseFloat(currentInputs.q3) : null,
      currentInputs.q4 ? parseFloat(currentInputs.q4) : null,
    );
  }, [currentInputs]);

  // Calculate IA totals for all 3 IAs for the current student
  const iaTotals = useMemo(() => {
    const iaValues: number[] = [];
    for (let ia = 1; ia <= 3; ia++) {
      const data = getVTUIAMarks(subjectCode, section, ia);
      const studentData = data.find(s => s.studentProfileId === current?.studentProfileId);
      if (studentData) {
        const storedInputs = inputs[String(studentData.studentProfileId)];
        const q1 = storedInputs?.q1 ? parseFloat(storedInputs.q1) : (studentData.q1 ?? null);
        const q2 = storedInputs?.q2 ? parseFloat(storedInputs.q2) : (studentData.q2 ?? null);
        const q3 = storedInputs?.q3 ? parseFloat(storedInputs.q3) : (studentData.q3 ?? null);
        const q4 = storedInputs?.q4 ? parseFloat(storedInputs.q4) : (studentData.q4 ?? null);
        const r = calcVTUIATotal(q1, q2, q3, q4);
        iaValues.push(r.total);
      } else {
        iaValues.push(0);
      }
    }
    return iaValues;
  }, [subjectCode, section, current, inputs]);

  const bestTwoResult = useMemo(() => {
    return calcVTUBestTwo(iaTotals[0], iaTotals[1], iaTotals[2]);
  }, [iaTotals]);

  const goNext = useCallback(() => {
    if (index < students.length - 1) setIndex((i) => i + 1);
  }, [index, students.length]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  const handleSaveAll = async () => {
    const entries = students.map((s) => {
      const inp = inputs[String(s.studentProfileId)];
      return {
        studentProfileId: s.studentProfileId,
        q1: inp?.q1 ? parseFloat(inp.q1) : 0,
        q2: inp?.q2 ? parseFloat(inp.q2) : 0,
        q3: inp?.q3 ? parseFloat(inp.q3) : 0,
        q4: inp?.q4 ? parseFloat(inp.q4) : 0,
      };
    });

    setSaving(true);
    try {
      saveVTUIAMarks(subjectCode, section, iaNumber, entries);
      Alert.alert('Saved', `IA${iaNumber} marks saved for ${entries.length} students`);
    } catch {
      Alert.alert('Error', 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>Loading students...</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>No students found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} keyboardShouldPersistTaps="handled">
      <View className="p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
            VTU IA Marks Entry
          </Text>
          <Text className="text-lg font-bold mt-0.5" style={{ color: colors.text }}>{subjectName}</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Section {section} • {subjectCode}
          </Text>
        </View>

        {/* IA Picker */}
        <View className="flex-row gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => { setIndex(0); setIANumber(n); }}
              className="flex-1 py-3 rounded-xl"
              style={{
                backgroundColor: iaNumber === n ? '#3b82f6' : colors.bgCard,
                borderColor: iaNumber === n ? '#3b82f6' : colors.border,
                borderWidth: iaNumber === n ? 0 : 1,
              }}
            >
              <Text
                className="text-sm font-bold text-center"
                style={{ color: iaNumber === n ? '#ffffff' : colors.textSecondary }}
              >
                IA {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Single Student Focus Card */}
        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: '#1e40af', borderWidth: 2 }}>
          {/* Student Info */}
          <View className="items-center mb-4 pt-2">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-3">
              <Text className="text-white text-xl font-bold">
                {current.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <Text className="text-xl font-bold text-center" style={{ color: colors.text }}>{current.name}</Text>
            <Text className="text-sm font-mono mt-1" style={{ color: colors.textMuted }}>
              {current.usn} • {index + 1} / {students.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            className="h-2 rounded-full mb-4 overflow-hidden"
            style={{ backgroundColor: colors.bgTertiary }}
          >
            <View
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${((index + 1) / students.length) * 100}%` }}
            />
          </View>

          {/* Q1-Q4 Input Fields */}
          <Text className="text-sm font-bold text-center mb-3" style={{ color: colors.text }}>
            Enter Question Marks (0-25 each)
          </Text>

          <View className="flex-row gap-2 mb-4">
            <QuestionInput
              label="Q1"
              value={currentInputs?.q1 ?? ''}
              onChange={(v) => setQ('q1', v)}
              colors={colors}
            />
            <QuestionInput
              label="Q2"
              value={currentInputs?.q2 ?? ''}
              onChange={(v) => setQ('q2', v)}
              colors={colors}
            />
            <QuestionInput
              label="Q3"
              value={currentInputs?.q3 ?? ''}
              onChange={(v) => setQ('q3', v)}
              colors={colors}
            />
            <QuestionInput
              label="Q4"
              value={currentInputs?.q4 ?? ''}
              onChange={(v) => setQ('q4', v)}
              colors={colors}
            />
          </View>

          {/* Live Calculation */}
          <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: colors.bgTertiary }}>
            <Text className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
              VTU Calculation (Auto)
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: colors.bgCard }}>
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>Section A</Text>
                <Text className="text-lg font-bold" style={{ color: '#3b82f6' }}>{calcResult.sectionA}</Text>
                <Text className="text-[10px]" style={{ color: colors.textTertiary }}>max(Q1,Q2)</Text>
              </View>
              <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: colors.bgCard }}>
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>Section B</Text>
                <Text className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{calcResult.sectionB}</Text>
                <Text className="text-[10px]" style={{ color: colors.textTertiary }}>max(Q3,Q4)</Text>
              </View>
              <View className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: colors.bgCard }}>
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>Total</Text>
                <Text className="text-lg font-bold" style={{ color: '#10b981' }}>{calcResult.total}</Text>
                <Text className="text-[10px]" style={{ color: colors.textTertiary }}>/ 50</Text>
              </View>
            </View>
          </View>

          {/* Best 2 Average */}
          <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#1e3a5f' }}>
            <Text className="text-xs uppercase tracking-wider mb-2 text-blue-200">
              Best 2 of 3 IA (Live Preview)
            </Text>
            <View className="flex-row gap-2">
              {[0, 1, 2].map((i) => (
                <View key={i} className="flex-1 rounded-lg p-2 items-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-[10px] text-blue-200">IA{i + 1}</Text>
                  <Text className="text-sm font-bold text-white">{iaTotals[i] > 0 ? iaTotals[i] : '-'}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.2)' }}>
              <View>
                <Text className="text-xs text-blue-200">Best 2 Total</Text>
                <Text className="text-lg font-bold text-white">{bestTwoResult.bestTwoTotal}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-blue-200">Final CIE</Text>
                <Text className="text-lg font-bold text-green-400">{bestTwoResult.finalCIE}</Text>
              </View>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row gap-3 mb-2">
            <TouchableOpacity
              onPress={goPrev}
              disabled={index === 0}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.bgTertiary, opacity: index === 0 ? 0.5 : 1 }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.textSecondary }}>◀ Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              disabled={index >= students.length - 1}
              className="flex-1 py-4 rounded-xl items-center"
              style={{
                backgroundColor: index >= students.length - 1 ? colors.bgTertiary : '#3b82f6',
                opacity: index >= students.length - 1 ? 0.5 : 1,
              }}
            >
              <Text className="text-white text-base font-semibold">Next ▶</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Stats */}
        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-xs" style={{ color: colors.textMuted }}>Entered</Text>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                {Object.values(inputs).filter((i) => i.q1 !== '' || i.q2 !== '' || i.q3 !== '' || i.q4 !== '').length}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs" style={{ color: colors.textMuted }}>Pending</Text>
              <Text className="text-yellow-400 text-lg font-bold">
                {students.length - Object.values(inputs).filter((i) => i.q1 !== '' || i.q2 !== '' || i.q3 !== '' || i.q4 !== '').length}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs" style={{ color: colors.textMuted }}>IA</Text>
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
          <Text className="text-white font-bold text-lg">
            {saving ? 'Saving...' : `Save All IA${iaNumber} Marks`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
