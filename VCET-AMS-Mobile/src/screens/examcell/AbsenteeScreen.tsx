import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, FlatList, Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth';
import API from '../../services/api';
import Card from '../../components/Card';

type Paper = { id: number; subject: { code: string; name: string }; iaNumber: number; section: string };
type StudentRow = { studentProfileId: number; usn: string; name: string; isAbsent: boolean };

export default function AbsenteeScreen() {
  const { colors } = useAppTheme();
  const userRole = useAuthStore((s) => s.user?.role);
  const isExamCell = userRole === 'EXAM_CELL';

  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/ia/question-papers').then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setPapers(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fetchAbsentees = useCallback(async (paperId: number) => {
    setLoading(true);
    setSelectedPaperId(paperId);
    try {
      const res = await API.get(`/ia/absentees/${paperId}`);
      const data = res.data?.data ?? res.data;
      setStudents(data?.students ?? []);
    } catch {
      Alert.alert('Error', 'Failed to load absentees');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAbsent = async (studentProfileId: number, currentlyAbsent: boolean) => {
    if (!isExamCell) {
      Alert.alert('Restricted', 'Only EXAM_CELL can manage absentees');
      return;
    }
    if (!selectedPaperId) return;

    setSaving(true);
    try {
      if (currentlyAbsent) {
        await API.delete(`/ia/absentees/${selectedPaperId}`, {
          data: { studentProfileIds: [studentProfileId] },
        });
      } else {
        await API.post(`/ia/absentees/${selectedPaperId}`, {
          studentProfileIds: [studentProfileId],
        });
      }
      setStudents((prev) =>
        prev.map((s) =>
          s.studentProfileId === studentProfileId ? { ...s, isAbsent: !currentlyAbsent } : s
        )
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const selectedPaper = papers.find((p) => p.id === selectedPaperId);

  if (loading && papers.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Absentee Management
        </Text>
        <Text className="text-lg font-bold mt-1 mb-2" style={{ color: colors.text }}>
          {selectedPaper ? `${selectedPaper.subject.code} - IA${selectedPaper.iaNumber}` : 'Select a Paper'}
        </Text>

        {/* Paper Selector */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={papers}
          keyExtractor={(p) => String(p.id)}
          className="mb-3"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => fetchAbsentees(item.id)}
              className="px-4 py-2 rounded-xl mr-2"
              style={{
                backgroundColor: selectedPaperId === item.id ? '#3b82f6' : colors.bgCard,
                borderColor: selectedPaperId === item.id ? '#3b82f6' : colors.border,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: selectedPaperId === item.id ? '#fff' : colors.textSecondary }}>
                {item.subject.code} IA{item.iaNumber}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : selectedPaperId ? (
        <FlatList
          className="px-4"
          data={students}
          keyExtractor={(s) => String(s.studentProfileId)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleAbsent(item.studentProfileId, item.isAbsent)}
              disabled={saving}
              className="mb-2"
            >
              <Card
                style={{
                  backgroundColor: item.isAbsent ? '#450a0a' : colors.bgCard,
                  borderColor: item.isAbsent ? '#dc2626' : colors.border,
                  borderWidth: item.isAbsent ? 2 : 1,
                  opacity: !isExamCell && item.isAbsent ? 0.5 : 1,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-bold" style={{ color: item.isAbsent ? '#fca5a5' : colors.text }}>
                      {item.name}
                    </Text>
                    <Text className="text-xs font-mono" style={{ color: item.isAbsent ? '#fca5a5' : colors.textMuted }}>
                      {item.usn}
                    </Text>
                  </View>
                  <View
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: item.isAbsent ? '#dc2626' : '#166534',
                    }}
                  >
                    <Text className="text-white font-bold text-sm">
                      {item.isAbsent ? 'ABSENT' : 'PRESENT'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Card style={{ backgroundColor: colors.bgCard }}>
              <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
                No students found
              </Text>
            </Card>
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.textMuted }}>Select a paper above to manage absentees</Text>
        </View>
      )}
    </View>
  );
}
