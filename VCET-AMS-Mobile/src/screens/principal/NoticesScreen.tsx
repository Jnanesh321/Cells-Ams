import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-xs uppercase tracking-widest">Notices</Text>
          <Text className="text-white text-2xl font-bold mt-1">All Notices</Text>
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
          <Card className="bg-slate-900 border-slate-800 mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-white font-bold text-base">{item.title}</Text>
                  {item.targetRole && (
                    <View className="bg-amber-900/50 rounded px-2 py-0.5">
                      <Text className="text-amber-300 text-[9px] uppercase tracking-wider">{item.targetRole}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-slate-300 text-sm leading-5 mt-1">{item.content}</Text>
                <Text className="text-slate-500 text-xs mt-2">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No notices posted yet</Text>
          </Card>
        }
      />
    </View>
  );
}
