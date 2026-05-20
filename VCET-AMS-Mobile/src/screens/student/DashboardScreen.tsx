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
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAcademicDay } from '../../hooks/useAcademicDay';
import { getStudentBirthday } from '../../mock/birthdays';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import NotificationBell from '../../components/NotificationBell';

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
  const { colors } = useAppTheme();
  const { academicDay } = useAcademicDay();
  const [attendance, setAttendance] = useState<AttendanceSummaryItem[]>([]);
  const [marks, setMarks] = useState<MarksItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [detention, setDetention] = useState<{
    isDetained: boolean; exempted: boolean; reasons: string[];
  } | null>(null);

  useEffect(() => {
    if (!user?.usn) return;
    API.get(`/detention/student/${user.usn}`).then((res) => {
      const data = res.data?.data ?? res.data;
      const records = Array.isArray(data) ? data : [];
      const current = records[0] ?? null;
      if (current?.isDetained) setDetention(current);
    }).catch(() => {});
  }, [user?.usn]);

  const MOCK_ATTENDANCE: AttendanceSummaryItem[] = [
    { subjectCode: 'CS501', subjectName: 'Advanced Data Structures', present: 28, total: 30, percentage: 93.3 },
    { subjectCode: 'CS502', subjectName: 'Database Management Systems', present: 26, total: 30, percentage: 86.7 },
    { subjectCode: 'CS503', subjectName: 'Software Engineering', present: 25, total: 28, percentage: 89.3 },
    { subjectCode: 'CS504', subjectName: 'Computer Networks', present: 24, total: 30, percentage: 80.0 },
    { subjectCode: 'CS505', subjectName: 'Machine Learning', present: 22, total: 24, percentage: 91.7 },
  ];

  const MOCK_MARKS: MarksItem[] = [
    { subjectCode: 'CS501', subjectName: 'Advanced Data Structures', cie1: 22, cie2: 25, cie3: null },
    { subjectCode: 'CS502', subjectName: 'Database Management Systems', cie1: 18, cie2: 20, cie3: null },
    { subjectCode: 'CS503', subjectName: 'Software Engineering', cie1: 15, cie2: 19, cie3: null },
    { subjectCode: 'CS504', subjectName: 'Computer Networks', cie1: 20, cie2: 22, cie3: null },
    { subjectCode: 'CS505', subjectName: 'Machine Learning', cie1: 24, cie2: 26, cie3: null },
  ];

  const MOCK_NOTICES: NoticeItem[] = [
    { id: '1', title: 'IA2 Examination Schedule', content: 'IA2 will be conducted from Dec 2-7, 2024.', targetRole: 'STUDENT', createdAt: '2024-11-25' },
    { id: '2', title: 'Hackathon Registration Open', content: 'Register for the annual hackathon by Nov 30.', targetRole: 'STUDENT', createdAt: '2024-11-20' },
  ];

  const MOCK_CALENDAR: CalendarItem[] = [
    { id: '1', title: 'IA2 Examinations', startDate: '2024-12-02', type: 'exam' },
    { id: '2', title: 'Technical Symposium', startDate: '2024-12-15', type: 'event' },
    { id: '3', title: 'Semester Ends', startDate: '2024-12-20', type: 'academic' },
  ];

  const fetchDashboardData = useCallback(async () => {
    if (!user?.usn) return;

    const [attendanceResult, marksResult, noticesResult, calendarResult] = await Promise.allSettled([
      API.get(`/attendance/student/${user.usn}/summary`),
      API.get(`/marks/student/${user.usn}`),
      API.get('/notices'),
      API.get('/calendar'),
    ]);

    const realAttendance = attendanceResult.status === 'fulfilled' ? coerceList<AttendanceSummaryItem>(attendanceResult.value.data) : [];
    const realMarks = marksResult.status === 'fulfilled' ? coerceList<MarksItem>(marksResult.value.data) : [];
    const realNotices = noticesResult.status === 'fulfilled' ? coerceList<NoticeItem>(noticesResult.value.data) : [];
    const realCalendar = calendarResult.status === 'fulfilled' ? coerceList<CalendarItem>(calendarResult.value.data) : [];

    setAttendance(realAttendance.length > 0 ? realAttendance : MOCK_ATTENDANCE);
    setMarks(realMarks.length > 0 ? realMarks : MOCK_MARKS);
    setNotices(realNotices.length > 0 ? realNotices : MOCK_NOTICES);
    setCalendarEvents(realCalendar.length > 0 ? realCalendar : MOCK_CALENDAR);
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

  const isBirthday = useMemo(() => {
    if (!user?.usn) return false;
    const bday = getStudentBirthday(user.usn);
    if (!bday) return false;
    const today = new Date();
    const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return bday.date === mmdd;
  }, [user?.usn]);

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
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.refreshControl} />}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
    >
      <View className="mb-4">
        <Text className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Student Dashboard</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>Welcome, {user?.name ?? 'Student'}</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>USN {user?.usn ?? 'N/A'}</Text>
        <NotificationBell />
      </View>

      {/* Detention Banner */}
      {detention?.isDetained && !detention.exempted && (
        <View className="mb-4 rounded-xl p-4 border-2" style={{ backgroundColor: '#450a0a', borderColor: '#dc2626' }}>
          <Text className="text-sm font-bold text-red-300">⚠ DETENTION NOTICE</Text>
          <Text className="text-xs mt-1 text-red-200">
            You are currently detained from SEE. Contact your HOD immediately.
          </Text>
          {detention.reasons.map((r, i) => (
            <Text key={i} className="text-xs mt-0.5 text-red-300">• {r}</Text>
          ))}
        </View>
      )}
      {detention?.exempted && (
        <View className="mb-4 rounded-xl p-4 border" style={{ backgroundColor: '#451a03', borderColor: '#d97706' }}>
          <Text className="text-sm font-bold text-amber-300">Exemption granted. You may appear for SEE.</Text>
          <Text className="text-xs mt-1 text-amber-200">Conditions apply — check with HOD.</Text>
        </View>
      )}

      {isBirthday && (
        <View className="bg-gradient-to-r from-pink-700 to-rose-700 rounded-xl px-4 py-4 mb-4">
          <View className="flex-row items-center gap-3">
            <Text className="text-3xl">🎂</Text>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Happy Birthday, {user?.name}! 🎉</Text>
              <Text className="text-pink-100 text-sm mt-0.5">Wishing you a fantastic day ahead!</Text>
            </View>
          </View>
        </View>
      )}

      {academicDay && (
        <View className="rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#1E1B4B', borderColor: '#3730A380', borderWidth: 1 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-indigo-200 text-xs uppercase tracking-wider">
                {academicDay.termLabel}
              </Text>
              <Text className="text-white text-lg font-bold mt-0.5">
                Day {academicDay.dayNumber} of {academicDay.totalDays}
              </Text>
              {academicDay.eventName ? (
                <Text className="text-amber-300 text-xs mt-1">
                  {academicDay.isHoliday ? '🎉 ' : ''}{academicDay.eventName}
                </Text>
              ) : null}
            </View>
            <View className="items-end">
              <Text className="text-indigo-300 text-sm font-semibold">
                Week {academicDay.weekNumber}
              </Text>
              <View className="h-1.5 w-20 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                <View
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(academicDay.progress * 100, 100)}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="flex-row gap-3 mb-4">
        <Card className="flex-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Overall Attendance</Text>
          <Text
            className="text-3xl font-bold mt-2"
            style={{ color: colorForAttendance(overallAttendance) }}
          >
            {overallAttendance.toFixed(1)}%
          </Text>
          <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>
            {overallAttendance < 75 ? 'Needs attention' : overallAttendance < 85 ? 'On track' : 'Good standing'}
          </Text>
        </Card>

        <Card className="flex-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Average IA Marks</Text>
          <Text className="text-3xl font-bold mt-2 text-cyan-400">
            {averageIaMarks.toFixed(1)}
          </Text>
          <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>Across available IA entries</Text>
        </Card>
      </View>

      <Card className="mb-4">
        <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Notices</Text>
        {notices.length > 0 ? (
          <FlatList
            data={notices}
            scrollEnabled={false}
            keyExtractor={(item, index) => String(item.id ?? `${item.title}-${index}`)}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="rounded-xl p-3" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border, borderWidth: 1 }}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.text }}>{item.title}</Text>
                    {item.content ? (
                      <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{item.content}</Text>
                    ) : null}
                  </View>
                  {item.createdAt ? (
                    <Text className="text-[11px] text-right" style={{ color: colors.textMuted }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={{ color: colors.textMuted }}>No notices available.</Text>
        )}
      </Card>

      <Card>
        <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Upcoming Calendar Events</Text>
        {calendarEvents.length > 0 ? (
          <FlatList
            data={calendarEvents}
            scrollEnabled={false}
            keyExtractor={(item, index) => String(item.id ?? `${item.title}-${index}`)}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="rounded-xl p-3" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border, borderWidth: 1 }}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.text }}>{item.title}</Text>
                    {item.description ? (
                      <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{item.description}</Text>
                    ) : null}
                    <Text className="text-xs mt-2 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                      {item.type ?? 'event'}
                    </Text>
                  </View>
                  {item.startDate ? (
                    <Text className="text-[11px] text-right text-cyan-300">
                      {new Date(item.startDate).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={{ color: colors.textMuted }}>No upcoming events.</Text>
        )}
      </Card>
    </ScrollView>
  );
};

export default DashboardScreen;
