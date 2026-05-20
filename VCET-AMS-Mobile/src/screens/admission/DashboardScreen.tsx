import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getAdmissionStats } from '../../mock/admission';
import Card from '../../components/Card';

export default function AdmissionDashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const s = await getAdmissionStats();
    setStats(s);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load().finally(() => setRefreshing(false));
  }, [load]);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      <View className="p-4">
        <Card className="border-0 mb-4">
          <Text className="text-orange-100 text-xs uppercase tracking-widest">Admission Cell</Text>
          <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          <Text className="text-orange-200 text-sm mt-1">VCET Puttur • Batch Management</Text>
        </Card>

        {!stats && !refreshing && (
          <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center py-4" style={{ color: colors.textMuted }}>Loading admission data...</Text>
          </Card>
        )}
        {stats && (
          <View className="flex-row flex-wrap gap-3 mb-4">
            <Card className="w-[48%]" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Batches</Text>
              <Text className="text-orange-400 text-3xl font-bold mt-1">{stats.totalBatches}</Text>
            </Card>
            <Card className="w-[48%]" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Students</Text>
              <Text className="text-3xl font-bold mt-1" style={{ color: colors.text }}>{stats.totalStudents}</Text>
            </Card>
            <Card className="w-[48%]" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Mapped</Text>
              <Text className="text-green-400 text-3xl font-bold mt-1">{stats.mappedStudents}</Text>
            </Card>
            <Card className="w-[48%]" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Pending</Text>
              <Text className="text-yellow-400 text-3xl font-bold mt-1">{stats.pendingMapping}</Text>
            </Card>
          </View>
        )}

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Quick Actions</Text>
          {[
            { label: 'Create New Batch', desc: 'Set up department, intake, section', color: 'bg-orange-600' },
            { label: 'Bulk Add Students', desc: 'Import student records into a batch', color: 'bg-blue-600' },
            { label: 'Map USNs', desc: 'Assign VTU USNs to roll numbers', color: 'bg-green-600' },
          ].map((action, i) => (
            <View key={i} className="flex-row items-center mb-2 rounded-xl p-4 border" style={{ backgroundColor: colors.bgInput, borderColor: colors.border }}>
              <View className={`w-10 h-10 ${action.color} rounded-lg items-center justify-center mr-3`}>
                <Text className="text-white text-lg">{['📦', '👥', '🔗'][i]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-sm" style={{ color: colors.text }}>{action.label}</Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{action.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card className="mb-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Admission Workflow</Text>
          <View className="flex-row items-center justify-between">
            {['Batch', 'Students', 'Map USN'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <View className="items-center">
                  <View className="w-10 h-10 rounded-full bg-orange-600 items-center justify-center">
                    <Text className="text-white font-bold">{i + 1}</Text>
                  </View>
                  <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>{step}</Text>
                </View>
                {i < arr.length - 1 && <View className="h-0.5 flex-1 mx-2" style={{ backgroundColor: colors.border }} />}
              </React.Fragment>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
