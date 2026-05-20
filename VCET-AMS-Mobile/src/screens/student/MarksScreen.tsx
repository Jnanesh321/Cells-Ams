import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getVTUStudentCIEDisplay } from '../../mock/vtuIAMarks';
import { calcVTUBestTwo } from '../../utils/vtuRules';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import type { VTUCIEDisplay } from '../../types';

function coerceList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as any).data)) {
    return (value as any).data as T[];
  }
  return [];
}

function IABreakdownCard({
  iaData,
  iaLabel,
  colors,
  defaultExpanded,
}: {
  iaData: VTUCIEDisplay['ia1'];
  iaLabel: string;
  colors: any;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!iaData) {
    return (
      <View className="rounded-lg p-3 mb-2 border" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border }}>
        <Text className="text-sm font-semibold" style={{ color: colors.textMuted }}>{iaLabel}: Not yet entered</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      className="rounded-lg p-3 mb-2 border"
      style={{ backgroundColor: colors.bgTertiary, borderColor: iaData.total >= 25 ? '#10b981' : '#f59e0b' }}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-bold" style={{ color: colors.text }}>{iaLabel}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold" style={{ color: iaData.total >= 25 ? '#10b981' : '#f59e0b' }}>
            {iaData.total}/50
          </Text>
          <Text className="text-xs" style={{ color: colors.textMuted }}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>
      {expanded && (
        <View className="mt-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 items-center">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>Q1</Text>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{iaData.q1 ?? '-'}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>Q2</Text>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{iaData.q2 ?? '-'}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>Q3</Text>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{iaData.q3 ?? '-'}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>Q4</Text>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{iaData.q4 ?? '-'}</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 rounded p-2 items-center" style={{ backgroundColor: colors.bgCard }}>
              <Text className="text-[9px]" style={{ color: colors.textMuted }}>Section A</Text>
              <Text className="text-xs font-bold text-blue-400">{iaData.sectionA}</Text>
            </View>
            <View className="flex-1 rounded p-2 items-center" style={{ backgroundColor: colors.bgCard }}>
              <Text className="text-[9px]" style={{ color: colors.textMuted }}>Section B</Text>
              <Text className="text-xs font-bold text-purple-400">{iaData.sectionB}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function StudentMarksScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [records, setRecords] = useState<VTUCIEDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const usn = user?.usn;
    if (!usn) return;
    try {
      const res = await API.get(`/marks/student/${usn}`);
      setRecords(coerceList<VTUCIEDisplay>(res.data));
    } catch {
      setRecords(getVTUStudentCIEDisplay(usn));
    }
  }, [user?.usn]);

  useEffect(() => {
    setLoading(true);
    void fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const bestTwoAvg = useMemo(() => {
    if (records.length === 0) return 0;
    const allTotals = records.flatMap(r => [r.ia1?.total ?? 0, r.ia2?.total ?? 0, r.ia3?.total ?? 0].filter(t => t > 0));
    const sorted = [...allTotals].sort((a, b) => b - a);
    const bestTwo = sorted.slice(0, 2);
    return bestTwo.length > 0 ? bestTwo.reduce((s, v) => s + v, 0) / bestTwo.length : 0;
  }, [records]);

  const finalCIE = useMemo(() => {
    if (records.length === 0) return 0;
    const allTotals = records.flatMap(r => [r.ia1?.total ?? 0, r.ia2?.total ?? 0, r.ia3?.total ?? 0].filter(t => t > 0));
    const sorted = [...allTotals].sort((a, b) => b - a);
    return sorted.slice(0, 2).reduce((s, v) => s + v, 0);
  }, [records]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  if (loading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>VTU IA Marks</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{user?.name}</Text>

        {/* CIE Summary */}
        <View className="flex-row gap-2 mt-3">
          <Card className="flex-1" style={{ backgroundColor: '#1e3a5f' }}>
            <Text className="text-xs text-blue-200">Best 2 Avg</Text>
            <Text className="text-xl font-bold text-white mt-1">{bestTwoAvg.toFixed(1)}</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: '#064e3b' }}>
            <Text className="text-xs text-green-200">Final CIE</Text>
            <Text className="text-xl font-bold text-green-400 mt-1">{finalCIE}</Text>
          </Card>
        </View>
      </View>

      <FlatList
        className="px-4"
        data={records}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        renderItem={({ item }) => (
          <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="font-semibold text-base mb-3" style={{ color: colors.text }}>
              {item.subjectName ?? item.subjectCode}
            </Text>
            <Text className="text-xs mb-2" style={{ color: colors.textMuted }}>{item.subjectCode}</Text>

            {(() => {
              const totals = [item.ia1?.total ?? 0, item.ia2?.total ?? 0, item.ia3?.total ?? 0].filter(t => t > 0);
              const bt = calcVTUBestTwo(totals[0] ?? null, totals[1] ?? null, totals[2] ?? null);
              return (
                <View className="flex-row justify-between items-center mb-3 rounded-lg p-2" style={{ backgroundColor: colors.bgTertiary }}>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>Best 2 Total</Text>
                  <Text className="text-base font-bold" style={{ color: '#10b981' }}>{bt.bestTwoTotal}/100</Text>
                </View>
              );
            })()}

            <IABreakdownCard iaData={item.ia1} iaLabel="IA 1" colors={colors} defaultExpanded={true} />
            <IABreakdownCard iaData={item.ia2} iaLabel="IA 2" colors={colors} defaultExpanded={false} />
            <IABreakdownCard iaData={item.ia3} iaLabel="IA 3" colors={colors} defaultExpanded={false} />
          </Card>
        )}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No marks records found</Text>
          </Card>
        }
      />
    </View>
  );
}
