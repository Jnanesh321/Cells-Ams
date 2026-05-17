import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HodDashboardScreen from '../screens/HodDashboardScreen';
import HodAnalyticsScreen from '../screens/hod/AnalyticsScreen';
import HodFacultyScreen from '../screens/hod/FacultyScreen';
import HodReportsScreen from '../screens/hod/ReportsScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const Tab = createBottomTabNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">HOD • {user?.department}</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const HodNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen name="Dashboard" component={HodDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Analytics" component={HodAnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="Faculty" component={HodFacultyScreen} options={{ tabBarLabel: 'Faculty' }} />
      <Tab.Screen name="Reports" component={HodReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default HodNavigator;
