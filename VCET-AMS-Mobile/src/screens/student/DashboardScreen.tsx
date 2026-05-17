import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

type AttendanceSummaryItem = {
  subjectCode: string;
  subjectName: string;
  present: number;
  total: number;
  percentage: number;
};

type MarksItem = {
  subjectCode: string;
  subjectName: string;
  cie1?: number | null;
  cie2?: number | null;
  cie3?: number | null;
};

type NoticeItem = {
  id?: string | number;
  title: string;
  content?: string;
  createdAt?: string;
  targetRole?: string | null;
};

type CalendarItem = {
  id?: string | number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
};

function coerceList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as any).data)) {
    return (value as any).data as T[];
  }
  return [];
}

function averageMarks(marks: MarksItem[]): number {
  const values = marks.flatMap((mark) => [mark.cie1, mark.cie2, mark.cie3])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function colorForAttendance(percentage: number): string {
  if (percentage < 75) return '#ef4444';
  if (percentage < 85) return '#f59e0b';
  return '#10b981';
}

const DashboardScreen = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceSummaryItem[]>([]);
  const [marks, setMarks] = useState<MarksItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.usn) return;

    const [attendanceResult, marksResult, noticesResult, calendarResult] = await Promise.allSettled([
      API.get(`/attendance/student/${user.usn}/summary`),
      API.get(`/marks/student/${user.usn}`),
      API.get('/notices'),
      API.get('/calendar'),
    ]);

    if (attendanceResult.status === 'fulfilled') {
      setAttendance(coerceList<AttendanceSummaryItem>(attendanceResult.value.data));
    } else {
      setAttendance([]);
    }

    if (marksResult.status === 'fulfilled') {
      setMarks(coerceList<MarksItem>(marksResult.value.data));
    } else {
      setMarks([]);
    }

    if (noticesResult.status === 'fulfilled') {
      setNotices(coerceList<NoticeItem>(noticesResult.value.data));
    } else {
      setNotices([]);
    }

    if (calendarResult.status === 'fulfilled') {
      setCalendarEvents(coerceList<CalendarItem>(calendarResult.value.data));
    } else {
      setCalendarEvents([]);
    }
  }, [user?.usn]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      if (!user?.usn) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await fetchDashboardData();
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData, user?.usn]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchDashboardData().finally(() => setRefreshing(false));
  }, [fetchDashboardData]);

  const overallAttendance = useMemo(() => {
    if (attendance.length === 0) return 0;
    return attendance.reduce((sum, item) => sum + item.percentage, 0) / attendance.length;
  }, [attendance]);

  const averageIaMarks = useMemo(() => averageMarks(marks), [marks]);

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
    >
      <View className="mb-4">
        <Text className="text-slate-400 text-xs uppercase tracking-[0.2em]">Student Dashboard</Text>
        <Text className="text-white text-2xl font-bold mt-1">Welcome, {user?.name ?? 'Student'}</Text>
        <Text className="text-slate-300 text-sm mt-1">USN {user?.usn ?? 'N/A'}</Text>
      </View>

      <View className="flex-row gap-3 mb-4">
        <Card className="flex-1 bg-slate-900 border-slate-800">
          <Text className="text-slate-400 text-xs uppercase tracking-wider">Overall Attendance</Text>
          <Text
            className="text-3xl font-bold mt-2"
            style={{ color: colorForAttendance(overallAttendance) }}
          >
            {overallAttendance.toFixed(1)}%
          </Text>
          <Text className="text-slate-500 text-xs mt-2">
            {overallAttendance < 75 ? 'Needs attention' : overallAttendance < 85 ? 'On track' : 'Good standing'}
          </Text>
        </Card>

        <Card className="flex-1 bg-slate-900 border-slate-800">
          <Text className="text-slate-400 text-xs uppercase tracking-wider">Average IA Marks</Text>
          <Text className="text-3xl font-bold mt-2 text-cyan-400">
            {averageIaMarks.toFixed(1)}
          </Text>
          <Text className="text-slate-500 text-xs mt-2">Across available IA entries</Text>
        </Card>
      </View>

      <Card className="bg-slate-900 border-slate-800 mb-4">
        <Text className="text-white text-lg font-bold mb-3">Notices</Text>
        {notices.length > 0 ? (
          <FlatList
            data={notices}
            scrollEnabled={false}
            keyExtractor={(item, index) => String(item.id ?? `${item.title}-${index}`)}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{item.title}</Text>
                    {item.content ? (
                      <Text className="text-slate-300 text-sm mt-1">{item.content}</Text>
                    ) : null}
                  </View>
                  {item.createdAt ? (
                    <Text className="text-slate-500 text-[11px] text-right">{new Date(item.createdAt).toLocaleDateString()}</Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        ) : (
          <Text className="text-slate-400">No notices available.</Text>
        )}
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <Text className="text-white text-lg font-bold mb-3">Upcoming Calendar Events</Text>
        {calendarEvents.length > 0 ? (
          <FlatList
            data={calendarEvents}
            scrollEnabled={false}
            keyExtractor={(item, index) => String(item.id ?? `${item.title}-${index}`)}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{item.title}</Text>
                    {item.description ? (
                      <Text className="text-slate-300 text-sm mt-1">{item.description}</Text>
                    ) : null}
                    <Text className="text-slate-500 text-xs mt-2 uppercase tracking-wider">
                      {item.type ?? 'event'}
                    </Text>
                  </View>
                  {item.startDate ? (
                    <Text className="text-cyan-300 text-[11px] text-right">
                      {new Date(item.startDate).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        ) : (
          <Text className="text-slate-400">No upcoming events.</Text>
        )}
      </Card>
    </ScrollView>
  );
};

export default DashboardScreen;