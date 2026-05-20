import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, FlatList, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import API from '../../services/api';
import Card from '../../components/Card';
import { computeIAResult } from '../../utils/iaCalculation';

type SubQuestionCol = { id: number; label: string; maxMarks: number; questionNumber: number };
type Row = {
  studentProfileId: number;
  usn: string;
  name: string;
  isAbsent: boolean;
  marks: Record<number, string>;
};

export default function IAMarksEntryScreen() {
  const route = useRoute<any>();
  const { colors } = useAppTheme();

  const params = route.params ?? {};
  const paperId = params.paperId;
  const subjectName = params.subjectName ?? 'Subject';

  const [subQuestions, setSubQuestions] = useState<SubQuestionCol[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!paperId) return;
    setLoading(true);
    API.get(`/ia/marks/${paperId}`).then((res) => {
      const data = res.data?.data ?? res.data;
      const cols: SubQuestionCol[] = [];
      for (const q of data?.paper?.questions ?? []) {
        for (const sq of q.subQuestions ?? []) {
          cols.push({ id: sq.id, label: sq.label, maxMarks: sq.maxMarks, questionNumber: q.questionNumber });
        }
      }
      setSubQuestions(cols);

      const studentRows: Row[] = (data?.rows ?? []).map((r: any) => {
        const marks: Record<number, string> = {};
        for (const [sqId, val] of Object.entries(r.marks ?? {})) {
          marks[Number(sqId)] = String(val);
        }
        return {
          studentProfileId: r.studentProfileId,
          usn: r.usn,
          name: r.name,
          isAbsent: r.isAbsent ?? false,
          marks,
        };
      });
      setRows(studentRows);
    }).catch(() => {
      Alert.alert('Error', 'Failed to load marks data');
    }).finally(() => setLoading(false));
  }, [paperId]);

  const setMark = useCallback((studentProfileId: number, subQuestionId: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.studentProfileId === studentProfileId
          ? { ...r, marks: { ...r.marks, [subQuestionId]: value } }
          : r
      )
    );
  }, []);

  const questionTotals = useMemo(() => {
    const qNums = [...new Set(subQuestions.map((sq) => sq.questionNumber))].sort();
    const totals: { qNum: number; cols: SubQuestionCol[]; studentTotals: Record<number, number> }[] = [];
    for (const qNum of qNums) {
      const cols = subQuestions.filter((sq) => sq.questionNumber === qNum);
      const studentTotals: Record<number, number> = {};
      for (const row of rows) {
        let total = 0;
        for (const col of cols) {
          const val = parseFloat(row.marks[col.id] ?? '0');
          if (!isNaN(val)) total += val;
        }
        studentTotals[row.studentProfileId] = total;
      }
      totals.push({ qNum, cols, studentTotals });
    }
    return totals;
  }, [subQuestions, rows]);

  const results = useMemo(() => {
    return rows.map((row) => {
      const subMarks = subQuestions.map((sq) => ({
        label: sq.label,
        maxMarks: sq.maxMarks,
        marksObtained: row.isAbsent ? 0 : parseFloat(row.marks[sq.id] ?? '0') || 0,
        questionNumber: sq.questionNumber,
        questionMaxMarks: subQuestions
          .filter((s) => s.questionNumber === sq.questionNumber)
          .reduce((sum, s) => sum + s.maxMarks, 0),
      }));
      return computeIAResult({
        usn: row.usn,
        name: row.name,
        isAbsent: row.isAbsent,
        subMarks,
        paperMaxMarks: 50,
      });
    });
  }, [rows, subQuestions]);

  const handleSave = async () => {
    const entries: { studentProfileId: number; subQuestionId: number; marksObtained: number }[] = [];
    for (const row of rows) {
      if (row.isAbsent) continue;
      for (const sq of subQuestions) {
        const val = parseFloat(row.marks[sq.id] ?? '0');
        if (!isNaN(val)) {
          entries.push({
            studentProfileId: row.studentProfileId,
            subQuestionId: sq.id,
            marksObtained: val,
          });
        }
      }
    }

    setSaving(true);
    try {
      await API.put(`/ia/marks/${paperId}`, { entries });
      Alert.alert('Saved', `Marks saved for ${entries.length} entries`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>Loading...</Text>
      </View>
    );
  }

  if (!paperId) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>No paper selected</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          IA Marks Entry
        </Text>
        <Text className="text-lg font-bold mt-0.5" style={{ color: colors.text }}>{subjectName}</Text>
      </View>

      <FlatList
        className="px-4"
        data={rows}
        keyExtractor={(r) => String(r.studentProfileId)}
        ListHeaderComponent={
          <View className="flex-row mb-2">
            <View className="w-16" />
            <View className="flex-1 flex-row">
              {subQuestions.map((sq) => (
                <View key={sq.id} className="flex-1 items-center">
                  <Text className="text-[10px] font-bold" style={{ color: colors.textMuted }}>
                    Q{sq.questionNumber}{sq.label}
                  </Text>
                </View>
              ))}
              {questionTotals.map((qt) => (
                <View key={qt.qNum} className="w-10 items-center">
                  <Text className="text-[10px] font-bold" style={{ color: colors.textMuted }}>
                    Q{qt.qNum}
                  </Text>
                </View>
              ))}
              <View className="w-14 items-center">
                <Text className="text-[10px] font-bold" style={{ color: colors.textMuted }}>
                  Total
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const total = results[index]?.grandTotal ?? 0;
          return (
            <View
              className="flex-row items-center mb-1 rounded-lg px-2 py-2"
              style={{
                backgroundColor: item.isAbsent ? '#450a0a' : index % 2 === 0 ? colors.bgCard : colors.bgTertiary,
                borderColor: item.isAbsent ? '#dc2626' : 'transparent',
                borderWidth: item.isAbsent ? 1 : 0,
                opacity: item.isAbsent ? 0.6 : 1,
              }}
            >
              {/* Student Info */}
              <View className="w-16">
                <Text className="text-[10px] font-mono font-bold" style={{ color: item.isAbsent ? '#fca5a5' : colors.text }}>
                  {item.usn.slice(-5)}
                </Text>
              </View>

              {/* Marks Inputs */}
              <View className="flex-1 flex-row">
                {subQuestions.map((sq) => {
                  const val = item.marks[sq.id] ?? '';
                  return (
                    <View key={sq.id} className="flex-1 px-0.5">
                      {item.isAbsent ? (
                        <View className="h-8 rounded items-center justify-center bg-red-900">
                          <Text className="text-red-300 text-[10px] font-bold">ABS</Text>
                        </View>
                      ) : (
                        <TextInput
                          className="h-8 rounded text-center text-xs font-bold border"
                          style={{
                            backgroundColor: colors.bgTertiary,
                            color: colors.text,
                            borderColor: colors.border,
                          }}
                          value={val}
                          onChangeText={(v) => setMark(item.studentProfileId, sq.id, v)}
                          keyboardType="decimal-pad"
                          maxLength={4}
                          selectTextOnFocus
                        />
                      )}
                    </View>
                  );
                })}

                {/* Question Totals */}
                {questionTotals.map((qt) => {
                  const qTotal = qt.studentTotals[item.studentProfileId] ?? 0;
                  return (
                    <View key={qt.qNum} className="w-10 items-center justify-center">
                      <Text className="text-[10px] font-bold" style={{ color: colors.textMuted }}>
                        {item.isAbsent ? 0 : qTotal}
                      </Text>
                    </View>
                  );
                })}

                {/* Grand Total */}
                <View className="w-14 items-center justify-center">
                  <Text
                    className="text-xs font-bold"
                    style={{ color: total >= 25 ? '#10b981' : total >= 14 ? '#f59e0b' : '#ef4444' }}
                  >
                    {item.isAbsent ? 0 : total}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-green-600 rounded-xl py-4 items-center mt-4 mb-8"
          >
            <Text className="text-white font-bold text-lg">
              {saving ? 'Saving...' : 'Save All Marks'}
            </Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              No students found
            </Text>
          </Card>
        }
      />
    </View>
  );
}
