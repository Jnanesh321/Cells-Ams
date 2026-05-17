import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { mockStudents, mockMarks } from '../../mock';
import Card from '../../components/Card';

export default function ParentMarksScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const child = useMemo(() => {
    if (!user?.usn) return null;
    return mockStudents.find((s) => s.usn === user.usn) ?? null;
  }, [user]);

  const marks = useMemo(() => {
    if (!child) return [];
    return (mockMarks as any)[child.usn] ?? [];
  }, [child]);

  const avg = useMemo(() => {
    if (marks.length === 0) return 0;
    const vals = marks.flatMap((m: any) => [m.cia1, m.cia2, m.cia3].filter((v: any) => v != null));
    return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
  }, [marks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (!child) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-slate-400">No ward data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">IA Marks</Text>
        <Text className="text-white text-xl font-bold mt-1">{child.name}</Text>
        <Text className="text-cyan-400 text-sm mt-1">Average: {avg.toFixed(1)}</Text>
      </View>
      <FlatList
        className="px-4"
        data={marks}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
        renderItem={({ item }: any) => (
          <Card className="bg-slate-900 border-slate-800 mb-2">
            <Text className="text-white font-semibold text-sm mb-2">{item.subject}</Text>
            <View className="flex-row gap-2">
              {[
                { label: 'IA1', value: item.cia1 },
                { label: 'IA2', value: item.cia2 },
                { label: 'IA3', value: item.cia3 },
              ].map((ia) => (
                <View key={ia.label} className="flex-1 bg-slate-800 rounded-lg p-2 items-center">
                  <Text className="text-slate-400 text-xs">{ia.label}</Text>
                  <Text className={`text-sm font-bold mt-0.5 ${ia.value != null ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {ia.value != null ? ia.value : '-'}
                  </Text>
                </View>
              ))}
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
