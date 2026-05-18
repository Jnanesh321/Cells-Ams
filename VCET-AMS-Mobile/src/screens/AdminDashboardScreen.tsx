import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { mockStudents } from '../mock';
import Card from '../components/Card';
import Button from '../components/Button';

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
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
      className="flex-1 bg-slate-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-red-600 to-red-800 border-0 mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
            <Text className="text-red-100 text-sm mt-1">System Administrator</Text>
            <Text className="text-red-200 text-xs">Full System Access</Text>
          </View>
        </Card>

        {/* System Health */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 bg-green-900 border border-green-700">
            <Text className="text-green-200 text-xs font-semibold">System Health</Text>
            <Text className="text-white text-2xl font-bold mt-2">{systemMetrics.systemHealth}%</Text>
          </Card>
          <Card className="flex-1 bg-blue-900 border border-blue-700">
            <Text className="text-blue-200 text-xs font-semibold">Active Sessions</Text>
            <Text className="text-white text-2xl font-bold mt-2">{systemMetrics.activeSessions}</Text>
          </Card>
        </View>

        {/* User Statistics */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-white font-bold text-lg mb-3">User Statistics</Text>
          <View className="bg-slate-700 rounded-lg p-3 mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-semibold">Total Users</Text>
              <Text className="text-white text-lg font-bold">{systemMetrics.totalUsers}</Text>
            </View>
          </View>
          <View className="bg-slate-700 rounded-lg p-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-300 text-sm">Students</Text>
              <Text className="text-white font-bold">{mockStudents.length}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-300 text-sm">Faculty</Text>
              <Text className="text-white font-bold">3</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-300 text-sm">HOD</Text>
              <Text className="text-white font-bold">1</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-300 text-sm">Principal</Text>
              <Text className="text-white font-bold">1</Text>
            </View>
          </View>
        </Card>

        {/* API Health */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-white font-bold text-lg mb-3">API Health</Text>
          <View className="bg-slate-700 rounded-lg p-3 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">Response Time</Text>
              <View className="bg-green-900 rounded-lg px-3 py-1">
                <Text className="text-green-300 font-bold">{systemMetrics.apiResponseTime}</Text>
              </View>
            </View>
          </View>
          <View className="bg-slate-700 rounded-lg p-3">
            <Text className="text-slate-300 text-sm mb-1">Status: <Text className="text-green-400 font-bold">Operational</Text></Text>
            <Text className="text-slate-300 text-sm">Uptime: <Text className="text-green-400 font-bold">99.9%</Text></Text>
          </View>
        </Card>

        {/* Backup Status */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Backup Status</Text>
          <View className="bg-slate-700 rounded-lg p-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">Last Backup</Text>
              <Text className="text-slate-300 text-sm">2 hours ago</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-semibold">Status</Text>
              <View className="bg-green-900 rounded-lg px-3 py-1">
                <Text className="text-green-300 font-bold">✓ Success</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Audit Logs (Mock) */}
        <Card className="bg-slate-800 border border-slate-700 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Recent Activity Logs</Text>
          <View className="bg-slate-700 rounded-lg p-3 mb-2 border-l-4 border-blue-500">
            <Text className="text-white text-sm">User login: 4VP21CS001</Text>
            <Text className="text-slate-400 text-xs mt-1">May 8, 2026 • 10:30 AM</Text>
          </View>
          <View className="bg-slate-700 rounded-lg p-3 mb-2 border-l-4 border-green-500">
            <Text className="text-white text-sm">Marks updated: FAC_CSE01</Text>
            <Text className="text-slate-400 text-xs mt-1">May 8, 2026 • 09:15 AM</Text>
          </View>
          <View className="bg-slate-700 rounded-lg p-3 border-l-4 border-orange-500">
            <Text className="text-white text-sm">Attendance marked: CS501</Text>
            <Text className="text-slate-400 text-xs mt-1">May 8, 2026 • 08:45 AM</Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border border-slate-700 mb-6">
          <Text className="text-white font-bold text-lg mb-3">Quick Actions</Text>
          <Button
            title="System Settings"
            onPress={() => navigation.navigate('Settings')}
            className="bg-purple-600 mb-2"
          />
          <Button
            title="Manage Users"
            onPress={() => navigation.navigate('Users')}
            className="bg-indigo-600 mb-2"
          />
          <Button
            title="View Audit Logs"
            onPress={() => navigation.navigate('Dashboard')}
            className="bg-slate-700 border border-slate-600"
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default AdminDashboardScreen;