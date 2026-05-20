import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

type Notice = {
  id: number;
  title: string;
  content: string;
  targetRole: string | null;
  isActive?: boolean;
  createdAt: string;
};

function coerceList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as any).data)) {
    return (value as any).data as T[];
  }
  return [];
}

export default function ParentNoticesScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await API.get('/notices');
      setNotices(coerceList<Notice>(res.data));
    } catch {
      try {
        const { getNotices } = await import('../../mock/backend');
        const res = await getNotices(user?.role ?? 'PARENT');
        setNotices(res.data);
      } catch {
        setNotices([]);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    setLoading(true);
    void fetchNotices().finally(() => setLoading(false));
  }, [fetchNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchNotices().finally(() => setRefreshing(false));
  }, [fetchNotices]);

  if (loading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Notices</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>Announcements</Text>
      </View>
      <FlatList
        className="px-4"
        data={notices}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentParent} />}
        renderItem={({ item }) => (
          <Card className="mb-3">
            <View className="border-l-4 pl-3" style={{ borderLeftColor: colors.accentParent }}>
              <Text className="font-bold text-base" style={{ color: colors.text }}>{item.title}</Text>
              {item.targetRole && (
                <View className="self-start rounded px-2 py-0.5 mt-1" style={{ backgroundColor: colors.accentParent + '30' }}>
                  <Text className="text-[10px] uppercase tracking-wider" style={{ color: colors.accentParent }}>{item.targetRole}</Text>
                </View>
              )}
            </View>
            <Text className="text-sm mt-3 leading-5" style={{ color: colors.textSecondary }}>{item.content}</Text>
            <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No notices available</Text>
          </Card>
        }
      />
    </View>
  );
}
