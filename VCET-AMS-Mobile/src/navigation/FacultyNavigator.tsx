import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import FacultyDashboardScreen from '../screens/FacultyDashboardScreen';
import SubjectPickerScreen from '../screens/SubjectPickerScreen';
import AttendanceSessionScreen from '../screens/AttendanceSessionScreen';
import EditAttendanceScreen from '../screens/EditAttendanceScreen';
import ReviewSubmitScreen from '../screens/ReviewSubmitScreen';
import SuccessConfirmationScreen from '../screens/SuccessConfirmationScreen';
import MarksSubjectPickerScreen from '../screens/faculty/MarksSubjectPickerScreen';
import VTUIAMarksEntryScreen from '../screens/faculty/VTUIAMarksEntryScreen';
import FacultyNotesScreen from '../screens/faculty/NotesScreen';
import FacultyProfileScreen from '../screens/faculty/FacultyProfileScreen';
import FacultyTimetableScreen from '../screens/faculty/TimetableScreen';
import CounsellingDashboardScreen from '../screens/faculty/CounsellingDashboardScreen';
import CounsellingStudentDetailScreen from '../screens/faculty/CounsellingStudentDetailScreen';
import CounsellingSessionFormScreen from '../screens/faculty/CounsellingSessionFormScreen';

const DashboardStack = createStackNavigator();
const MarksStack = createStackNavigator();
const CounsellingStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={FacultyDashboardScreen} />
    <DashboardStack.Screen name="SubjectPicker" component={SubjectPickerScreen} />
    <DashboardStack.Screen name="AttendanceSession" component={AttendanceSessionScreen} />
    <DashboardStack.Screen name="EditAttendance" component={EditAttendanceScreen} />
    <DashboardStack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
    <DashboardStack.Screen name="SuccessConfirmation" component={SuccessConfirmationScreen} />
  </DashboardStack.Navigator>
);

const MarksStackNavigator = () => (
  <MarksStack.Navigator screenOptions={{ headerShown: false }}>
    <MarksStack.Screen name="MarksSubjectPicker" component={MarksSubjectPickerScreen} />
    <MarksStack.Screen name="VTUIAMarksEntry" component={VTUIAMarksEntryScreen} />
  </MarksStack.Navigator>
);

const CounsellingStackNavigator = () => (
  <CounsellingStack.Navigator screenOptions={{ headerShown: false }}>
    <CounsellingStack.Screen name="CounsellingDashboard" component={CounsellingDashboardScreen} />
    <CounsellingStack.Screen name="CounsellingStudentDetail" component={CounsellingStudentDetailScreen} />
    <CounsellingStack.Screen name="CounsellingSessionForm" component={CounsellingSessionFormScreen} />
  </CounsellingStack.Navigator>
);

const FacultyNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            DashboardTab: focused ? 'grid' : 'grid-outline',
            Timetable: focused ? 'time' : 'time-outline',
            Notes: focused ? 'document-text' : 'document-text-outline',
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
        tabBarActiveTintColor: colors.accentFaculty,
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
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Timetable"
        component={FacultyTimetableScreen}
        options={{ title: 'Timetable', tabBarLabel: 'Timetable' }}
      />
      <Tab.Screen
        name="Marks"
        component={MarksStackNavigator}
        options={{ title: 'Marks', tabBarLabel: 'Marks' }}
      />
      <Tab.Screen
        name="Counselling"
        component={CounsellingStackNavigator}
        options={{ title: 'Counselling', tabBarLabel: 'Counselling' }}
      />
      <Tab.Screen
        name="Notes"
        component={FacultyNotesScreen}
        options={{ title: 'Notes', tabBarLabel: 'Notes' }}
      />
      <Tab.Screen
        name="Profile"
        component={FacultyProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default FacultyNavigator;
