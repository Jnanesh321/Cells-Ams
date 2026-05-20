import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mockStudents } from '../../mock/students';
import { getVTUStudentCIEDisplay } from '../../mock/vtuIAMarks';
import { calcVTUBestTwo } from '../../utils/vtuRules';
import API from '../../services/api';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import type { VTUCIEDisplay } from '../../types';

function IABreakdownCard({
  iaData,
  iaLabel,
  colors,
}: {
  iaData: VTUCIEDisplay['ia1'];
  iaLabel: string;
  colors: any;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!iaData) {
    return (
      <View className="rounded-lg p-2 mb-1" style={{ backgroundColor: colors.bgTertiary }}>
        <Text className="text-xs" style={{ color: colors.textMuted }}>{iaLabel}: -</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} className="rounded-lg p-2 mb-1" style={{ backgroundColor: colors.bgTertiary }}>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs font-bold" style={{ color: colors.text }}>{iaLabel}</Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold" style={{ color: colors.text }}>{iaData.total}/50</Text>
          <Text className="text-[9px]" style={{ color: colors.textMuted }}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>
      {expanded && (
        <View className="mt-1 pt-1 border-t" style={{ borderTopColor: colors.border }}>
          <View className="flex-row gap-1">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
              const val = [iaData.q1, iaData.q2, iaData.q3, iaData.q4][i];
              return (
                <View key={q} className="flex-1 items-center">
                  <Text className="text-[9px]" style={{ color: colors.textMuted }}>{q}</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.text }}>{val ?? '-'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ParentMarksScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<VTUCIEDisplay[]>([]);

  const childUsn = user?.wardUsn ?? user?.usn;

  const child = useMemo(() => {
    if (!childUsn) return null;
    return mockStudents.find((s) => s.usn === childUsn) ?? null;
  }, [childUsn]);

  const fetchMarks = useCallback(async () => {
    if (!childUsn) return;
    try {
      const res = await API.get(`/marks/vtu/student/${childUsn}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setMarks(data);
    } catch {
      setMarks(getVTUStudentCIEDisplay(childUsn));
    }
  }, [childUsn]);

  useEffect(() => {
    setLoading(true);
    fetchMarks().finally(() => setLoading(false));
  }, [fetchMarks]);

  const bestTwoAvg = useMemo(() => {
    if (marks.length === 0) return 0;
    const allTotals = marks.flatMap(r => [r.ia1?.total ?? 0, r.ia2?.total ?? 0, r.ia3?.total ?? 0].filter(t => t > 0));
    const sorted = [...allTotals].sort((a, b) => b - a);
    const bestTwo = sorted.slice(0, 2);
    return bestTwo.length > 0 ? bestTwo.reduce((s, v) => s + v, 0) / bestTwo.length : 0;
  }, [marks]);

  const finalCIE = useMemo(() => {
    if (marks.length === 0) return 0;
    const allTotals = marks.flatMap(r => [r.ia1?.total ?? 0, r.ia2?.total ?? 0, r.ia3?.total ?? 0].filter(t => t > 0));
    const sorted = [...allTotals].sort((a, b) => b - a);
    return sorted.slice(0, 2).reduce((s, v) => s + v, 0);
  }, [marks]);

  if (loading) return <Loader />;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMarks();
    setRefreshing(false);
  }, [fetchMarks]);

  if (!child) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>No ward data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>VTU IA Marks</Text>
        <Text className="text-xl font-bold mt-1" style={{ color: colors.text }}>{child.name}</Text>

        <View className="flex-row gap-2 mt-3">
          <Card className="flex-1" style={{ backgroundColor: '#1e3a5f' }}>
            <Text className="text-xs text-blue-200">Best 2 Avg</Text>
            <Text className="text-lg font-bold text-white mt-1">{bestTwoAvg.toFixed(1)}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: '#064e3b' }}>
            <Text className="text-xs text-green-200">Final CIE</Text>
            <Text className="text-lg font-bold text-green-400 mt-1">{finalCIE}</Text>
          </Card>
        </View>
      </View>

      <FlatList
        className="px-4"
        data={marks}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
        renderItem={({ item }) => {
          const totals = [item.ia1?.total ?? 0, item.ia2?.total ?? 0, item.ia3?.total ?? 0].filter(t => t > 0);
          const bt = calcVTUBestTwo(totals[0] ?? null, totals[1] ?? null, totals[2] ?? null);
          return (
            <Card className="mb-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="font-semibold text-sm mb-2" style={{ color: colors.text }}>{item.subjectName ?? item.subjectCode}</Text>

              <View className="flex-row justify-between items-center mb-2 rounded-lg p-2" style={{ backgroundColor: colors.bgTertiary }}>
                <Text className="text-xs" style={{ color: colors.textMuted }}>Final</Text>
                <Text className="text-sm font-bold text-green-400">{bt.finalCIE}</Text>
              </View>

              <IABreakdownCard iaData={item.ia1} iaLabel="IA1" colors={colors} />
              <IABreakdownCard iaData={item.ia2} iaLabel="IA2" colors={colors} />
              <IABreakdownCard iaData={item.ia3} iaLabel="IA3" colors={colors} />
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No marks records found</Text>
          </Card>
        }
      />
    </View>
  );
}
