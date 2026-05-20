import React, { useEffect, useState } from 'react';
import {
  Modal, Text, TouchableOpacity, View, FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import API from '../services/api';
import Card from './Card';

type Notification = {
  id: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  attendance: 'calendar',
  marks: 'bar-chart',
  detention: 'warning',
  counselling: 'chatbubbles',
  notice: 'megaphone',
  absentee: 'person-remove',
  cie: 'checkmark-circle',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const { colors } = useAppTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      const res = await API.get('/notifications');
      const data = res.data?.data ?? res.data;
      setNotifications(data?.notifications ?? []);
      setUnreadCount(data?.unreadCount ?? 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: number) => {
    try {
      await API.post(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await API.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
    setLoading(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => { fetch(); setVisible(true); }} className="relative p-2">
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <TouchableOpacity className="flex-1" onPress={() => setVisible(false)} />
          <View
            className="rounded-t-3xl p-4 max-h-[70%]"
            style={{ backgroundColor: colors.bgCard }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>Notifications</Text>
              <View className="flex-row gap-3">
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllRead} disabled={loading}>
                    <Text className="text-sm" style={{ color: '#3b82f6' }}>
                      {loading ? '...' : 'Mark all read'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(n) => String(n.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => markRead(item.id)}
                  className="mb-2"
                >
                  <Card
                    style={{
                      backgroundColor: item.isRead ? colors.bgTertiary : colors.bgCard,
                      borderColor: item.isRead ? 'transparent' : '#3b82f6',
                      borderWidth: item.isRead ? 0 : 1,
                    }}
                  >
                    <View className="flex-row items-start gap-3">
                      <Ionicons
                        name={TYPE_ICONS[item.type] ?? 'ellipse-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.title}</Text>
                        <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.body}</Text>
                        <Text className="text-[10px] mt-1" style={{ color: colors.textTertiary }}>
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Ionicons name="notifications-off-outline" size={40} color={colors.textTertiary} />
                  <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>No new notifications</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
