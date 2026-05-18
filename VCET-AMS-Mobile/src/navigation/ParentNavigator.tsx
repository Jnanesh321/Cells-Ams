import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParentDashboardScreen from '../screens/parent/DashboardScreen';
import ParentAttendanceScreen from '../screens/parent/AttendanceScreen';
import ParentMarksScreen from '../screens/parent/MarksScreen';
import StudentNoticesScreen from '../screens/student/NoticesScreen';
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
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Attendance: focused ? 'calendar' : 'calendar-outline',
            Marks: focused ? 'bar-chart' : 'bar-chart-outline',
            Notices: focused ? 'notifications' : 'notifications-outline',
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
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Attendance" component={ParentAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="Marks" component={ParentMarksScreen} options={{ tabBarLabel: 'Marks' }} />
      <Tab.Screen name="Notices" component={StudentNoticesScreen} options={{ tabBarLabel: 'Notices' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default ParentNavigator;
