import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

type Notice = {
  id: number;
  title: string;
  content: string;
  targetRole: string | null;
  createdAt: string;
};

export default function PrincipalNoticesScreen() {
  const { colors } = useAppTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      const { getNotices } = await import('../../mock/backend');
      const res = await getNotices();
      setNotices(res.data);
    } catch {
      setNotices([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchNotices().finally(() => setLoading(false));
  }, [fetchNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchNotices().finally(() => setRefreshing(false));
  }, [fetchNotices]);

  const handlePost = () => {
    Alert.alert('Post Notice', 'Notice posting will open a new form');
  };

  if (loading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Notices</Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>All Notices</Text>
        </View>
        <TouchableOpacity onPress={handlePost} className="bg-amber-600 px-4 py-2 rounded-lg">
          <Text className="text-white text-xs font-bold">+ Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        className="px-4"
        data={notices}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        renderItem={({ item }) => (
          <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="font-bold text-base" style={{ color: colors.text }}>{item.title}</Text>
                  {item.targetRole && (
                    <View className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(217,119,6,0.5)' }}>
                      <Text className="text-amber-300 text-[9px] uppercase tracking-wider">{item.targetRole}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm leading-5 mt-1" style={{ color: colors.textSecondary }}>{item.content}</Text>
                <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No notices posted yet</Text>
          </Card>
        }
      />
    </View>
  );
}
