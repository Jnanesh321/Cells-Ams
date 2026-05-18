import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Analytics: focused ? 'analytics' : 'analytics-outline',
            Faculty: focused ? 'people' : 'people-outline',
            Reports: focused ? 'document-text' : 'document-text-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] ?? 'ellipse-outline'}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        headerShown: false,
      })}
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
