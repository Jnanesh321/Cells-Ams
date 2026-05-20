import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { useAppTheme } from '../hooks/useAppTheme';
import { mockStudents } from '../mock';
import Card from '../components/Card';
import Button from '../components/Button';

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const systemMetrics = {
    totalUsers: 50,
    activeSessions: 12,
    systemHealth: 98,
    apiResponseTime: '125ms',
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentAdmin} />}
    >
      <View className="p-4">
        {/* Welcome Card */}
        <Card className="border-0 mb-4" style={{ backgroundColor: colors.accentAdmin }}>
          <View>
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
            <Text className="text-white/80 text-sm mt-1">System Administrator</Text>
            <Text className="text-white/60 text-xs">Full System Access</Text>
          </View>
        </Card>

        {/* System Health */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1" style={{ backgroundColor: '#064E3B', borderColor: '#047857', borderWidth: 1 }}>
            <Text className="text-green-200 text-xs font-semibold">System Health</Text>
            <Text className="text-white text-2xl font-bold mt-2">{systemMetrics.systemHealth}%</Text>
          </Card>
          <Card className="flex-1" style={{ backgroundColor: '#1E3A5F', borderColor: '#1D4ED8', borderWidth: 1 }}>
            <Text className="text-blue-200 text-xs font-semibold">Active Sessions</Text>
            <Text className="text-white text-2xl font-bold mt-2">{systemMetrics.activeSessions}</Text>
          </Card>
        </View>

        {/* User Statistics */}
        <Card className="mb-4">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>User Statistics</Text>
          <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary }}>
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold" style={{ color: colors.text }}>Total Users</Text>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>{systemMetrics.totalUsers}</Text>
            </View>
          </View>
          <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgTertiary }}>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Students</Text>
              <Text className="font-bold" style={{ color: colors.text }}>{mockStudents.length}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Faculty</Text>
              <Text className="font-bold" style={{ color: colors.text }}>3</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>HOD</Text>
              <Text className="font-bold" style={{ color: colors.text }}>1</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Principal</Text>
              <Text className="font-bold" style={{ color: colors.text }}>1</Text>
            </View>
          </View>
        </Card>

        {/* API Health */}
        <Card className="mb-4">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>API Health</Text>
          <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold" style={{ color: colors.text }}>Response Time</Text>
              <View className="rounded-lg px-3 py-1" style={{ backgroundColor: '#064E3B' }}>
                <Text className="text-green-300 font-bold">{systemMetrics.apiResponseTime}</Text>
              </View>
            </View>
          </View>
          <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgTertiary }}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Status: <Text className="font-bold text-green-400">Operational</Text></Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Uptime: <Text className="font-bold text-green-400">99.9%</Text></Text>
          </View>
        </Card>

        {/* Backup Status */}
        <Card className="mb-4">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Backup Status</Text>
          <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgTertiary }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold" style={{ color: colors.text }}>Last Backup</Text>
              <Text className="text-sm" style={{ color: colors.textTertiary }}>2 hours ago</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold" style={{ color: colors.text }}>Status</Text>
              <View className="rounded-lg px-3 py-1" style={{ backgroundColor: '#064E3B' }}>
                <Text className="text-green-300 font-bold">✓ Success</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Audit Logs (Mock) */}
        <Card className="mb-4">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Recent Activity Logs</Text>
          <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderLeftWidth: 4, borderLeftColor: colors.accentStudent }}>
            <Text className="text-sm" style={{ color: colors.text }}>User login: 4VP21CS001</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>May 8, 2026 • 10:30 AM</Text>
          </View>
          <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: colors.bgTertiary, borderLeftWidth: 4, borderLeftColor: colors.success }}>
            <Text className="text-sm" style={{ color: colors.text }}>Marks updated: FAC_CSE01</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>May 8, 2026 • 09:15 AM</Text>
          </View>
          <View className="rounded-lg p-3" style={{ backgroundColor: colors.bgTertiary, borderLeftWidth: 4, borderLeftColor: colors.warning }}>
            <Text className="text-sm" style={{ color: colors.text }}>Attendance marked: CS501</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>May 8, 2026 • 08:45 AM</Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Quick Actions</Text>
          <Button
            title="System Settings"
            onPress={() => navigation.navigate('Settings')}
            variant="primary"
            className="mb-2"
          />
          <Button
            title="Manage Users"
            onPress={() => navigation.navigate('Users')}
            variant="primary"
            className="mb-2"
          />
          <Button
            title="View Audit Logs"
            onPress={() => navigation.navigate('Settings')}
            variant="secondary"
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default AdminDashboardScreen;
