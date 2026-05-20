import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import API from '../../services/api';
import Card from '../../components/Card';

type SubQuestionInput = { label: string; maxMarks: string };
type QuestionInput = {
  questionNumber: number;
  maxMarks: string;
  subQuestions: SubQuestionInput[];
};

const DEFAULT_SUBQ: SubQuestionInput[] = [
  { label: 'a', maxMarks: '6' },
  { label: 'b', maxMarks: '7' },
  { label: 'c', maxMarks: '6' },
];

const INITIAL_QUESTIONS: QuestionInput[] = [1, 2, 3, 4].map((n) => ({
  questionNumber: n,
  maxMarks: '25',
  subQuestions: DEFAULT_SUBQ.map((sq) => ({ ...sq })),
}));

export default function QuestionPaperBuilderScreen() {
  const { colors } = useAppTheme();

  const [subjects, setSubjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [iaNumber, setIaNumber] = useState(1);
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [questions, setQuestions] = useState<QuestionInput[]>(INITIAL_QUESTIONS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/subjects').then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setSubjects(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const setSubQ = useCallback((qIdx: number, sqIdx: number, field: keyof SubQuestionInput, value: string) => {
    setQuestions((prev) => {
      const next = prev.map((q) => ({ ...q, subQuestions: q.subQuestions.map((sq) => ({ ...sq })) }));
      next[qIdx].subQuestions[sqIdx][field] = value;
      return next;
    });
  }, []);

  const addSubQuestion = useCallback((qIdx: number) => {
    setQuestions((prev) => {
      const next = prev.map((q) => ({ ...q, subQuestions: q.subQuestions.map((sq) => ({ ...sq })) }));
      const labels = ['a', 'b', 'c', 'd'];
      const existing = next[qIdx].subQuestions.length;
      if (existing >= 4) return prev;
      next[qIdx].subQuestions.push({ label: labels[existing], maxMarks: '6' });
      return next;
    });
  }, []);

  const removeSubQuestion = useCallback((qIdx: number) => {
    setQuestions((prev) => {
      const next = prev.map((q) => ({ ...q, subQuestions: q.subQuestions.map((sq) => ({ ...sq })) }));
      if (next[qIdx].subQuestions.length <= 1) return prev;
      next[qIdx].subQuestions.pop();
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!subjectId) { Alert.alert('Error', 'Select a subject'); return; }

    const payload = {
      subjectId,
      iaNumber,
      semester: '',
      section,
      academicYear,
      questions: questions.map((q) => ({
        questionNumber: q.questionNumber,
        maxMarks: parseFloat(q.maxMarks) || 25,
        subQuestions: q.subQuestions.map((sq) => ({
          label: sq.label,
          maxMarks: parseFloat(sq.maxMarks) || 6,
        })),
      })),
    };

    setSaving(true);
    try {
      await API.post('/ia/question-paper', payload);
      Alert.alert('Saved', 'Question paper created successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4" style={{ backgroundColor: colors.bg }} keyboardShouldPersistTaps="handled">
      <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
        Question Paper Builder
      </Text>
      <Text className="text-lg font-bold mt-1 mb-4" style={{ color: colors.text }}>
        Create New Paper
      </Text>

      {/* Subject Picker */}
      <Text className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>Subject</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSubjectId(s.id)}
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: subjectId === s.id ? '#3b82f6' : colors.bgCard,
                borderColor: subjectId === s.id ? '#3b82f6' : colors.border,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: subjectId === s.id ? '#fff' : colors.textSecondary }}>
                {s.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* IA Number */}
      <Text className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>IA</Text>
      <View className="flex-row gap-2 mb-3">
        {[1, 2, 3].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setIaNumber(n)}
            className="px-6 py-2 rounded-xl"
            style={{
              backgroundColor: iaNumber === n ? '#3b82f6' : colors.bgCard,
              borderColor: iaNumber === n ? '#3b82f6' : colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: iaNumber === n ? '#fff' : colors.textSecondary }}>IA {n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section */}
      <Text className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>Section</Text>
      <View className="flex-row gap-2 mb-3">
        {['A', 'B', 'C'].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSection(s)}
            className="px-6 py-2 rounded-xl"
            style={{
              backgroundColor: section === s ? '#3b82f6' : colors.bgCard,
              borderColor: section === s ? '#3b82f6' : colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: section === s ? '#fff' : colors.textSecondary }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Academic Year */}
      <TextInput
        className="rounded-xl px-4 py-3 mb-4 border"
        style={{ backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.border }}
        value={academicYear}
        onChangeText={setAcademicYear}
        placeholder="e.g. 2025-2026"
        placeholderTextColor={colors.textTertiary}
      />

      {/* Questions */}
      {questions.map((q, qi) => (
        <Card key={q.questionNumber} className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-sm font-bold mb-2" style={{ color: colors.text }}>
            Question {q.questionNumber}
          </Text>

          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-xs" style={{ color: colors.textMuted }}>Max:</Text>
            <TextInput
              className="rounded-lg px-3 py-1.5 border w-20 text-center"
              style={{ backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border }}
              value={q.maxMarks}
              onChangeText={(v) => {
                setQuestions((prev) => {
                  const next = [...prev];
                  next[qi] = { ...next[qi], maxMarks: v };
                  return next;
                });
              }}
              keyboardType="decimal-pad"
              maxLength={3}
            />
          </View>

          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity onPress={() => addSubQuestion(qi)} className="px-3 py-1 rounded-lg bg-blue-600">
              <Text className="text-white text-xs">+ SubQ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeSubQuestion(qi)} className="px-3 py-1 rounded-lg bg-red-600">
              <Text className="text-white text-xs">- SubQ</Text>
            </TouchableOpacity>
          </View>

          {q.subQuestions.map((sq, sqi) => (
            <View key={sq.label} className="flex-row items-center gap-2 mb-1">
              <Text className="text-sm font-bold w-6" style={{ color: colors.textSecondary }}>
                {sq.label}
              </Text>
              <TextInput
                className="flex-1 rounded-lg px-3 py-1.5 border text-center"
                style={{ backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border }}
                value={sq.maxMarks}
                onChangeText={(v) => setSubQ(qi, sqi, 'maxMarks', v)}
                keyboardType="decimal-pad"
                maxLength={3}
              />
            </View>
          ))}
        </Card>
      ))}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="bg-green-600 rounded-xl py-4 items-center mb-8"
      >
        <Text className="text-white font-bold text-lg">
          {saving ? 'Saving...' : 'Create Question Paper'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
