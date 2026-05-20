import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import ParentDashboardScreen from '../screens/parent/DashboardScreen';
import ParentAttendanceScreen from '../screens/parent/AttendanceScreen';
import ParentMarksScreen from '../screens/parent/MarksScreen';
import ParentCounsellingScreen from '../screens/parent/ParentCounsellingScreen';
import ParentNoticesScreen from '../screens/parent/NoticesScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';

const Tab = createBottomTabNavigator();

const ParentNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'home' : 'home-outline',
            Attendance: focused ? 'calendar' : 'calendar-outline',
            Marks: focused ? 'bar-chart' : 'bar-chart-outline',
            Counselling: focused ? 'chatbubbles' : 'chatbubbles-outline',
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
        tabBarActiveTintColor: colors.accentParent,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
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
      <Tab.Screen name="Counselling" component={ParentCounsellingScreen} options={{ tabBarLabel: 'Counselling' }} />
      <Tab.Screen name="Notices" component={ParentNoticesScreen} options={{ tabBarLabel: 'Notices' }} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default ParentNavigator;
