import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import HodDashboardScreen from '../screens/HodDashboardScreen';
import HodAnalyticsScreen from '../screens/hod/AnalyticsScreen';
import HodFacultyScreen from '../screens/hod/FacultyScreen';
import HodReportsScreen from '../screens/hod/ReportsScreen';
import HodProfileScreen from '../screens/hod/HodProfileScreen';
import SubjectAssignmentScreen from '../screens/hod/SubjectAssignmentScreen';
import HodCounsellingSummaryScreen from '../screens/hod/HodCounsellingSummaryScreen';
import CounsellorAssignmentScreen from '../screens/hod/CounsellorAssignmentScreen';
import CIEManagementScreen from '../screens/hod/CIEManagementScreen';
import DetentionScreen from '../screens/hod/DetentionScreen';

const CounsellingStack = createStackNavigator();

const CounsellingStackNavigator = () => (
  <CounsellingStack.Navigator screenOptions={{ headerShown: false }}>
    <CounsellingStack.Screen name="HodCounsellingSummary" component={HodCounsellingSummaryScreen} />
    <CounsellingStack.Screen name="CounsellorAssignment" component={CounsellorAssignmentScreen} />
  </CounsellingStack.Navigator>
);

const Tab = createBottomTabNavigator();

const HodNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Analytics: focused ? 'analytics' : 'analytics-outline',
            Assignments: focused ? 'checkbox' : 'checkbox-outline',
            Counselling: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Faculty: focused ? 'people' : 'people-outline',
            CIE: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
            Detention: focused ? 'warning' : 'warning-outline',
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
        tabBarActiveTintColor: colors.accentHod,
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
      <Tab.Screen name="Dashboard" component={HodDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Counselling" component={CounsellingStackNavigator} options={{ tabBarLabel: 'Counselling' }} />
      <Tab.Screen name="Analytics" component={HodAnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="CIE" component={CIEManagementScreen} options={{ tabBarLabel: 'CIE' }} />
      <Tab.Screen name="Detention" component={DetentionScreen} options={{ tabBarLabel: 'Detention' }} />
      <Tab.Screen name="Assignments" component={SubjectAssignmentScreen} options={{ tabBarLabel: 'Assignments' }} />
      <Tab.Screen name="Faculty" component={HodFacultyScreen} options={{ tabBarLabel: 'Faculty' }} />
      <Tab.Screen name="Reports" component={HodReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="Profile" component={HodProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default HodNavigator;
