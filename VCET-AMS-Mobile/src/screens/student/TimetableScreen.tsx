import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getDayName, getFullWeekTimetable } from '../../mock/timetable';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import type { TimetableEntry } from '../../types';

const DAY_NUMBERS = [1, 2, 3, 4, 5, 6];

export default function StudentTimetableScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [weekData, setWeekData] = useState<Record<number, TimetableEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7); // Sun=0→7, Mon=1..Sat=6

  const displayDay = selectedDay <= 6 ? selectedDay : 1;

  const fetchTimetable = useCallback(async () => {
    try {
      const res = await API.get('/timetable/week', { params: { section: user?.section ?? 'A' } });
      setWeekData(res.data.data);
    } catch {
      setWeekData(getFullWeekTimetable(user?.section ?? 'A'));
    }
  }, [user?.section]);

  useEffect(() => {
    setLoading(true);
    void fetchTimetable().finally(() => setLoading(false));
  }, [fetchTimetable]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchTimetable().finally(() => setRefreshing(false));
  }, [fetchTimetable]);

  const currentEntries = weekData[displayDay] ?? [];

  const dayTabs = useMemo(() =>
    DAY_NUMBERS.map((d) => ({
      day: d,
      label: getDayName(d),
      hasClass: (weekData[d]?.length ?? 0) > 0,
    })), [weekData]);

  if (loading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Timetable</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>Weekly Schedule</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{user?.name} • Sec {user?.section}</Text>
      </View>

      {/* Day Picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
        <View className="flex-row gap-2">
          {dayTabs.map((tab) => (
            <TouchableOpacity
              key={tab.day}
              onPress={() => setSelectedDay(tab.day)}
              className={`px-5 py-2.5 rounded-full ${displayDay === tab.day ? 'bg-blue-600' : tab.hasClass ? 'bg-slate-800' : 'bg-slate-900'}`}
              style={displayDay !== tab.day ? { borderColor: colors.border, borderWidth: 1 } : {}}
            >
              <Text className={`text-sm font-semibold ${displayDay === tab.day ? 'text-white' : tab.hasClass ? 'text-slate-200' : 'text-slate-600'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentStudent} />}
      >
        <Text className="text-sm mb-3 font-semibold" style={{ color: colors.textMuted }}>
          {getDayName(displayDay)} — {currentEntries.length > 0 ? `${currentEntries.length} periods` : 'No classes'}
        </Text>

        {currentEntries.length > 0 ? (
          currentEntries.map((entry) => (
            <Card key={entry.id} className="mb-2.5" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <View className="flex-row items-center">
                <View className="items-center justify-center w-16 py-2 mr-3">
                  <Text className="text-xs font-bold text-blue-400">{entry.period.startTime}</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">{entry.period.endTime}</Text>
                </View>
                <View className="w-px h-12 mx-2" style={{ backgroundColor: colors.border }} />
                <View className="flex-1 py-2">
                  <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                    {entry.subject?.name ?? 'Free Period'}
                  </Text>
                  {entry.subject && (
                    <Text className="text-xs mt-0.5 font-mono" style={{ color: colors.textMuted }}>
                      {entry.subject.code} • {entry.subject.credits} credits
                    </Text>
                  )}
                </View>
                <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: colors.bgTertiary }}>
                  <Text className="text-[10px] font-medium" style={{ color: colors.textTertiary }}>
                    {entry.period.name}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No classes scheduled for this day</Text>
          </Card>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
