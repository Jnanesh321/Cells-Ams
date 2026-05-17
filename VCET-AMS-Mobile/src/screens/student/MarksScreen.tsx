import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { mockMarks } from '../../mock';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

export default function StudentMarksScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    const usn = user?.usn;
    if (!usn) return;
    const data = (mockMarks as any)[usn];
    setRecords(data ?? []);
  }, [user?.usn]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, [fetchData]);

  const avg = useMemo(() => {
    if (records.length === 0) return 0;
    const vals = records.flatMap((m: any) => [m.cia1, m.cia2, m.cia3].filter((v: any) => v != null));
    return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
  }, [records]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 500);
  }, [fetchData]);

  if (loading) return <Loader />;

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">IA Marks</Text>
        <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
        <Text className="text-cyan-400 text-lg font-bold mt-1">Average: {avg.toFixed(1)}</Text>
      </View>
      <FlatList
        className="px-4"
        data={records}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        renderItem={({ item }: any) => (
          <Card className="bg-slate-900 border-slate-800 mb-2">
            <Text className="text-white font-semibold text-sm mb-3">{item.subject}</Text>
            <View className="flex-row gap-2">
              {[
                { label: 'IA1', value: item.cia1 },
                { label: 'IA2', value: item.cia2 },
                { label: 'IA3', value: item.cia3 },
              ].map((ia) => {
                const color = ia.value != null
                  ? ia.value >= 24 ? 'text-green-400'
                    : ia.value >= 18 ? 'text-yellow-400'
                    : 'text-red-400'
                  : 'text-slate-600';
                return (
                  <View key={ia.label} className="flex-1 bg-slate-800 rounded-lg p-3 items-center border border-slate-700">
                    <Text className="text-slate-400 text-xs mb-1">{ia.label}</Text>
                    <Text className={`text-lg font-bold ${color}`}>
                      {ia.value != null ? ia.value : '-'}
                    </Text>
                    <Text className="text-slate-600 text-xs mt-1">/ 30</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No marks records found</Text>
          </Card>
        }
      />
    </View>
  );
}
