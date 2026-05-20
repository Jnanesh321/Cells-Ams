import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import StudentDashboardScreen from '../screens/student/DashboardScreen';
import StudentAttendanceScreen from '../screens/student/AttendanceScreen';
import StudentMarksScreen from '../screens/student/MarksScreen';
import StudentNotesScreen from '../screens/student/NotesScreen';
import StudentTimetableScreen from '../screens/student/TimetableScreen';
import StudentCounsellingScreen from '../screens/student/StudentCounsellingScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();

const StudentNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'home' : 'home-outline',
            Attendance: focused ? 'calendar' : 'calendar-outline',
            Notes: focused ? 'document-text' : 'document-text-outline',
            Timetable: focused ? 'time' : 'time-outline',
            Marks: focused ? 'bar-chart' : 'bar-chart-outline',
            Counselling: focused ? 'chatbubbles' : 'chatbubbles-outline',
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
        tabBarActiveTintColor: colors.accentStudent,
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
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Attendance" component={StudentAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="Marks" component={StudentMarksScreen} options={{ tabBarLabel: 'Marks' }} />
      <Tab.Screen name="Counselling" component={StudentCounsellingScreen} options={{ tabBarLabel: 'Counselling' }} />
      <Tab.Screen name="Notes" component={StudentNotesScreen} options={{ tabBarLabel: 'Notes' }} />
      <Tab.Screen name="Timetable" component={StudentTimetableScreen} options={{ tabBarLabel: 'Timetable' }} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
