import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList, Text, View, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth';
import API from '../../services/api';
import Card from '../../components/Card';

type Slot = {
  day: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  section: string;
  room?: string;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyTimetableScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = useCallback(async () => {
    try {
      const res = await API.get(`/timetable/faculty/${user?.id ?? ''}`);
      const data = res.data?.data ?? res.data ?? [];
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    void fetchTimetable().finally(() => setLoading(false));
  }, [fetchTimetable]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchTimetable().finally(() => setRefreshing(false));
  }, [fetchTimetable]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Timetable</Text>
        <Text className="text-lg font-bold mt-1" style={{ color: colors.text }}>{user?.name}</Text>
      </View>

      <FlatList
        className="px-4"
        data={DAYS}
        keyExtractor={(d) => d}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        renderItem={({ item: day }) => {
          const daySlots = slots.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (daySlots.length === 0) return null;
          return (
            <View className="mb-4">
              <Text className="text-sm font-bold mb-2" style={{ color: colors.text }}>{day}</Text>
              {daySlots.map((slot, i) => (
                <Card key={i} className="mb-1" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="font-bold text-sm" style={{ color: colors.text }}>{slot.subjectName}</Text>
                      <Text className="text-xs" style={{ color: colors.textMuted }}>{slot.subjectCode} · {slot.section}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                        {slot.startTime}–{slot.endTime}
                      </Text>
                      {slot.room && (
                        <Text className="text-[10px]" style={{ color: colors.textMuted }}>{slot.room}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No timetable data</Text>
          </Card>
        }
      />
    </View>
  );
}
