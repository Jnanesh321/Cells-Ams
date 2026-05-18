import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
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

export default function StudentNoticesScreen() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await API.get('/notices');
      setNotices(coerceList<Notice>(res.data));
    } catch {
      // Fallback to mock backend adapter
      try {
        const { getNotices } = await import('../../mock/backend');
        const res = await getNotices(user?.role ?? 'STUDENT');
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
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">Notices</Text>
        <Text className="text-white text-2xl font-bold mt-1">Announcements</Text>
      </View>
      <FlatList
        className="px-4"
        data={notices}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        renderItem={({ item }) => (
          <Card className="bg-slate-900 border-slate-800 mb-3">
            <View className="border-l-4 border-blue-500 pl-3">
              <Text className="text-white font-bold text-base">{item.title}</Text>
              {item.targetRole && (
                <View className="bg-blue-900/50 self-start rounded px-2 py-0.5 mt-1">
                  <Text className="text-blue-300 text-[10px] uppercase tracking-wider">{item.targetRole}</Text>
                </View>
              )}
            </View>
            <Text className="text-slate-300 text-sm mt-3 leading-5">{item.content}</Text>
            <Text className="text-slate-500 text-xs mt-2">
              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No notices available</Text>
          </Card>
        }
      />
    </View>
  );
}
