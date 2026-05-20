import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, FlatList, Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth';
import API from '../../services/api';
import Card from '../../components/Card';
import NotificationBell from '../../components/NotificationBell';

type Subject = { id: number; code: string; name: string; semester: string };
type CIEData = {
  subjectId: number;
  totalStudents: number;
  eligible: number;
  notEligible: number;
  finalized: boolean;
  students: Array<{
    usn: string; name: string; iaBestTwo: number;
    cieFromIA: number; assignmentTotal: number;
    cieTotal: number; isEligible: boolean; finalized: boolean;
  }>;
};

export default function CIEManagementScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [cieData, setCieData] = useState<CIEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const deptCode = user?.department ?? 'CSE';

  useEffect(() => {
    API.get('/subjects', { params: { department: deptCode } }).then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setSubjects(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [deptCode]);

  const fetchCIE = useCallback(async (subjectId: number) => {
    setSelectedSubject(subjectId);
    setLoading(true);
    try {
      const res = await API.get(`/marks/cie/subject/${subjectId}`);
      const data = res.data?.data ?? res.data;
      setCieData(data);
    } catch {
      Alert.alert('Error', 'Failed to load CIE data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompute = async (subjectId: number) => {
    setComputing(true);
    try {
      const res = await API.post(`/marks/cie/compute/${subjectId}`);
      Alert.alert('Computed', `CIE computed: ${res.data?.data?.eligible ?? 0} eligible`);
      if (selectedSubject === subjectId) fetchCIE(subjectId);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Compute failed');
    } finally {
      setComputing(false);
    }
  };

  const handleFinalize = (subjectId: number) => {
    Alert.alert(
      'Finalize CIE',
      'This locks all marks. Faculty cannot edit after this. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.post(`/marks/cie/finalize/${subjectId}`);
              Alert.alert('Finalized', 'CIE has been locked.');
              if (selectedSubject === subjectId) fetchCIE(subjectId);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Finalize failed');
            }
          },
        },
      ]
    );
  };

  if (selectedSubject !== null && cieData) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <View className="p-4">
          <TouchableOpacity onPress={() => { setSelectedSubject(null); setCieData(null); }} className="mb-2">
            <Text className="text-sm text-blue-400">← Back to subjects</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>CIE Details</Text>
        </View>

        <FlatList
          className="px-4"
          data={cieData.students}
          keyExtractor={(s) => s.usn}
          ListHeaderComponent={
            <View className="flex-row gap-2 mb-3">
              <Card className="flex-1" style={{ backgroundColor: '#1e3a5f' }}>
                <Text className="text-xs text-blue-200">Eligible</Text>
                <Text className="text-lg font-bold text-white">{cieData.eligible}</Text>
              </Card>
              <Card className="flex-1" style={{ backgroundColor: '#450a0a' }}>
                <Text className="text-xs text-red-200">Not Eligible</Text>
                <Text className="text-lg font-bold text-red-400">{cieData.notEligible}</Text>
              </Card>
            </View>
          }
          renderItem={({ item }) => (
            <Card className="mb-2" style={{
              backgroundColor: item.isEligible ? colors.bgCard : '#1a0a0a',
              borderColor: item.finalized ? '#10b981' : colors.border,
              borderWidth: item.finalized ? 2 : 1,
            }}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.name}</Text>
                <Text className="text-xs font-mono" style={{ color: colors.textMuted }}>{item.usn}</Text>
              </View>
              <View className="flex-row gap-2 mt-1">
                <View className="flex-1">
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>IA Best 2</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.text }}>{item.iaBestTwo}/100</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>Assignment</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.text }}>{item.assignmentTotal}/10</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>CIE Total</Text>
                  <Text className="text-xs font-bold" style={{ color: item.isEligible ? '#10b981' : '#ef4444' }}>
                    {item.cieTotal}/50
                  </Text>
                </View>
              </View>
              {item.finalized && <Text className="text-[10px] text-green-400 mt-1">✓ FINALIZED</Text>}
            </Card>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
              CIE Management
            </Text>
            <Text className="text-lg font-bold mt-1" style={{ color: colors.text }}>
              Subjects — {deptCode}
            </Text>
          </View>
          <NotificationBell />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          className="px-4"
          data={subjects}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => (
            <Card className="mb-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <TouchableOpacity onPress={() => fetchCIE(item.id)}>
                <Text className="font-bold" style={{ color: colors.text }}>{item.name}</Text>
                <Text className="text-xs font-mono mt-0.5" style={{ color: colors.textMuted }}>
                  {item.code} • Sem {item.semester}
                </Text>
              </TouchableOpacity>
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => handleCompute(item.id)}
                  disabled={computing}
                  className="flex-1 py-2 rounded-lg bg-blue-600 items-center"
                >
                  <Text className="text-white text-xs font-bold">
                    {computing ? 'Computing...' : 'Compute CIE'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFinalize(item.id)}
                  className="flex-1 py-2 rounded-lg bg-red-600 items-center"
                >
                  <Text className="text-white text-xs font-bold">Finalize</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No subjects found</Text>
          }
        />
      )}
    </View>
  );
}
