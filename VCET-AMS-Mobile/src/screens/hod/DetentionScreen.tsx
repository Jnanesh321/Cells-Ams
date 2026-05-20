import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth';
import API from '../../services/api';
import Card from '../../components/Card';
import NotificationBell from '../../components/NotificationBell';

type DetentionRecord = {
  id: number;
  studentProfileId: number;
  usn: string;
  name: string;
  academicYear: string;
  semester: string;
  isDetained: boolean;
  reasons: string[];
  attendancePercent: number;
  cieTotal: number;
  exempted: boolean;
  exemptedBy: { name: string; usn: string } | null;
};

export default function DetentionScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const [records, setRecords] = useState<DetentionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [stats, setStats] = useState({ total: 0, detained: 0, exempted: 0 });

  const [exemptModal, setExemptModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DetentionRecord | null>(null);
  const [exemptReason, setExemptReason] = useState('');

  const deptCode = user?.department ?? 'CSE';

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/detention/list/${deptCode}`);
      const data = res.data?.data ?? res.data ?? [];
      setRecords(Array.isArray(data) ? data : []);
      setStats({
        total: data.length ?? 0,
        detained: data.filter((r: DetentionRecord) => r.isDetained).length ?? 0,
        exempted: data.filter((r: DetentionRecord) => r.exempted).length ?? 0,
      });
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [deptCode]);

  useEffect(() => { void fetchRecords(); }, [fetchRecords]);

  const handleCompute = async () => {
    setComputing(true);
    try {
      const res = await API.post(`/detention/compute/${deptCode}`);
      Alert.alert('Computed', `${res.data?.data?.detained ?? 0} students detained`);
      void fetchRecords();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Compute failed');
    } finally {
      setComputing(false);
    }
  };

  const handleExempt = async () => {
    if (!selectedStudent || !exemptReason.trim()) {
      Alert.alert('Error', 'Reason is required');
      return;
    }
    try {
      await API.post('/detention/exempt', {
        studentProfileId: selectedStudent.studentProfileId,
        reason: exemptReason.trim(),
        academicYear: selectedStudent.academicYear,
        semester: selectedStudent.semester,
      });
      Alert.alert('Exempted', 'Exemption granted');
      setExemptModal(false);
      setExemptReason('');
      void fetchRecords();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Exemption failed');
    }
  };

  const handleRevoke = async (id: number) => {
    Alert.alert('Revoke Exemption', 'Remove exemption for this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.delete(`/detention/exempt/${id}`);
            Alert.alert('Revoked', 'Exemption removed');
            void fetchRecords();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Revoke failed');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Detention Management
            </Text>
            <Text className="text-lg font-bold mt-1" style={{ color: colors.text }}>
              {deptCode} Department
            </Text>
          </View>
          <NotificationBell />
        </View>

        {/* Compute Button */}
        <TouchableOpacity
          onPress={handleCompute}
          disabled={computing}
          className="bg-orange-600 rounded-xl py-3 items-center mt-3"
        >
          <Text className="text-white font-bold">
            {computing ? 'Computing...' : 'Compute Detention'}
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View className="flex-row gap-2 mt-3">
          <Card className="flex-1" style={{ backgroundColor: '#1e3a5f' }}>
            <Text className="text-xs text-blue-200">Total</Text>
            <Text className="text-lg font-bold text-white">{stats.total}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: '#450a0a' }}>
            <Text className="text-xs text-red-200">Detained</Text>
            <Text className="text-lg font-bold text-red-400">{stats.detained}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: '#451a03' }}>
            <Text className="text-xs text-amber-200">Exempted</Text>
            <Text className="text-lg font-bold text-amber-400">{stats.exempted}</Text>
          </Card>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          className="px-4"
          data={records.filter((r) => r.isDetained)}
          keyExtractor={(r) => String(r.id)}
          ListEmptyComponent={
            <Card style={{ backgroundColor: colors.bgCard }}>
              <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
                No detained students
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Card
              className="mb-2"
              style={{
                backgroundColor: item.exempted ? '#0a1a0a' : '#1a0a0a',
                borderColor: item.exempted ? '#10b981' : '#dc2626',
                borderWidth: item.exempted ? 2 : 1,
              }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold text-sm" style={{ color: colors.text }}>{item.name}</Text>
                  <Text className="text-xs font-mono" style={{ color: colors.textMuted }}>{item.usn}</Text>
                </View>
                {item.exempted ? (
                  <View className="px-3 py-1 rounded-lg bg-green-800">
                    <Text className="text-green-300 text-xs font-bold">EXEMPTED</Text>
                  </View>
                ) : (
                  <View className="px-3 py-1 rounded-lg bg-red-800">
                    <Text className="text-red-300 text-xs font-bold">DETAINED</Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-2 mt-2">
                <View className="flex-1">
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>Attendance</Text>
                  <Text className="text-xs font-bold" style={{ color: item.attendancePercent < 75 ? '#ef4444' : '#10b981' }}>
                    {item.attendancePercent}%
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>CIE Min</Text>
                  <Text className="text-xs font-bold" style={{ color: item.cieTotal < 20 ? '#ef4444' : '#10b981' }}>
                    {item.cieTotal}/50
                  </Text>
                </View>
              </View>

              {item.reasons.map((r, i) => (
                <Text key={i} className="text-[10px] mt-0.5" style={{ color: r.startsWith('EXEMPTED:') ? '#fbbf24' : '#fca5a5' }}>
                  • {r}
                </Text>
              ))}

              <View className="flex-row gap-2 mt-2">
                {!item.exempted ? (
                  <TouchableOpacity
                    onPress={() => { setSelectedStudent(item); setExemptModal(true); }}
                    className="flex-1 py-2 rounded-lg bg-green-700 items-center"
                  >
                    <Text className="text-white text-xs font-bold">Grant Exemption</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleRevoke(item.id)}
                    className="flex-1 py-2 rounded-lg bg-red-700 items-center"
                  >
                    <Text className="text-white text-xs font-bold">Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}
        />
      )}

      {/* Exemption Modal */}
      <Modal visible={exemptModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View
            className="w-full rounded-2xl p-6"
            style={{ backgroundColor: colors.bgCard }}
          >
            <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>
              Grant SEE Exemption
            </Text>
            <Text className="text-sm mb-4" style={{ color: colors.textMuted }}>
              {selectedStudent?.name}
            </Text>

            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Reason (required)</Text>
            <TextInput
              className="border rounded-xl px-4 py-3 mb-4 min-h-[80px]"
              style={{ backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border }}
              value={exemptReason}
              onChangeText={setExemptReason}
              placeholder="e.g. Medical condition certified by doctor"
              placeholderTextColor={colors.textTertiary}
              multiline
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setExemptModal(false); setExemptReason(''); }}
                className="flex-1 py-3 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExempt}
                className="flex-1 py-3 rounded-xl items-center bg-green-600"
              >
                <Text className="text-white font-bold">Grant Exemption</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
