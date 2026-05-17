import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import ParentDashboardScreen from '../screens/parent/DashboardScreen';
import ParentAttendanceScreen from '../screens/parent/AttendanceScreen';
import ParentMarksScreen from '../screens/parent/MarksScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const Tab = createBottomTabNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">Parent</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const ParentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Attendance" component={ParentAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="Marks" component={ParentMarksScreen} options={{ tabBarLabel: 'Marks' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default ParentNavigator;
